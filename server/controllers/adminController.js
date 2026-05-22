const User = require('../models/User');
const Blog = require('../models/Blog');
const Subscriber = require('../models/Subscriber');
const mongoose = require('mongoose');

// @desc    Get database stats and collection counts
// @route   GET /api/admin/db/stats
// @access  Private/Admin
const getDbStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const blogsCount = await Blog.countDocuments();
    const subscribersCount = await Subscriber.countDocuments();
    
    // Attempt to fetch DB connection parameters and disk sizes if supported
    const isConnected = mongoose.connection.readyState === 1;
    let stats = {
      dbName: mongoose.connection.name || 'techblogger',
      connectionState: isConnected ? 'Connected' : 'Disconnected',
      host: mongoose.connection.host || 'N/A',
      collections: [
        { name: 'users', count: usersCount },
        { name: 'blogs', count: blogsCount },
        { name: 'subscribers', count: subscribersCount }
      ]
    };

    if (isConnected) {
      try {
        const dbStats = await mongoose.connection.db.stats();
        stats.dbSize = dbStats.dataSize; // size in bytes
        stats.storageSize = dbStats.storageSize;
        stats.avgObjSize = dbStats.avgObjSize;
      } catch (err) {
        // Fallback for custom environments where db.stats() is restricted
        stats.dbSize = null;
        stats.storageSize = null;
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Backup all collections (Users and Blogs)
// @route   GET /api/admin/db/backup
// @access  Private/Admin
const getDbBackup = async (req, res) => {
  try {
    const users = await User.find({});
    const blogs = await Blog.find({});
    const subscribers = await Subscriber.find({});
    res.json({ users, blogs, subscribers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore database from backup file
// @route   POST /api/admin/db/restore
// @access  Private/Admin
const restoreDb = async (req, res) => {
  const { users, blogs, subscribers } = req.body;
  try {
    if (!Array.isArray(users) || !Array.isArray(blogs)) {
      return res.status(400).json({ message: 'Backup JSON must contain "users" and "blogs" arrays.' });
    }

    // Safeguard: Verify that backup contains at least one admin user to prevent lockout.
    const hasAdmin = users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      return res.status(400).json({ message: 'Restore aborted: Backup data must contain at least one admin user to avoid platform lockout.' });
    }

    // Wipe collections
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Subscriber.deleteMany({});

    // Restore data. Note: User.insertMany bypasses pre-save hook, saving password hashes as they are.
    await User.insertMany(users);
    await Blog.insertMany(blogs);
    if (Array.isArray(subscribers) && subscribers.length > 0) {
      await Subscriber.insertMany(subscribers);
    }

    res.json({ message: 'Database restored successfully from backup.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get paginated and searchable list of documents for a collection
// @route   GET /api/admin/db/collections/:collectionName
// @access  Private/Admin
const getCollectionDocuments = async (req, res) => {
  const { collectionName } = req.params;
  const { search = '', page = 1, limit = 10 } = req.query;

  try {
    const model = collectionName === 'users' ? User : (collectionName === 'blogs' ? Blog : (collectionName === 'subscribers' ? Subscriber : null));
    if (!model) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    let query = {};
    if (search) {
      if (collectionName === 'users') {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      } else if (collectionName === 'blogs') {
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } }
          ]
        };
      } else if (collectionName === 'subscribers') {
        query = {
          email: { $regex: search, $options: 'i' }
        };
      }
    }

    const skip = (page - 1) * limit;
    const total = await model.countDocuments(query);
    const documents = await model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      documents,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new document in a collection
// @route   POST /api/admin/db/collections/:collectionName
// @access  Private/Admin
const createDocument = async (req, res) => {
  const { collectionName } = req.params;
  const data = req.body;

  try {
    const model = collectionName === 'users' ? User : (collectionName === 'blogs' ? Blog : (collectionName === 'subscribers' ? Subscriber : null));
    if (!model) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    // If password is plain text, let User pre-save hook hash it (User model uses schema pre('save'))
    const doc = new model(data);
    const savedDoc = await doc.save();
    res.status(201).json(savedDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing document in a collection
// @route   PUT /api/admin/db/collections/:collectionName/:id
// @access  Private/Admin
const updateDocument = async (req, res) => {
  const { collectionName, id } = req.params;
  const data = req.body;

  try {
    const model = collectionName === 'users' ? User : (collectionName === 'blogs' ? Blog : (collectionName === 'subscribers' ? Subscriber : null));
    if (!model) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    // We fetch document first so pre-save hooks can run (for passwords, if modified)
    const doc = await model.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const oldEmail = doc.email;

    // Assign data values
    Object.keys(data).forEach(key => {
      doc[key] = data[key];
    });

    const updatedDoc = await doc.save();

    // Sync subscriber email if it's a User model and email has changed
    if (collectionName === 'users' && oldEmail !== updatedDoc.email) {
      try {
        const Subscriber = require('../models/Subscriber');
        const oldSub = await Subscriber.findOne({ email: oldEmail });
        if (oldSub) {
          const newSubExists = await Subscriber.findOne({ email: updatedDoc.email });
          if (newSubExists) {
            await Subscriber.deleteOne({ email: oldEmail });
          } else {
            oldSub.email = updatedDoc.email;
            await oldSub.save();
          }
        }
      } catch (subError) {
        console.error('Subscriber sync error in updateDocument (admin):', subError);
      }
    }

    res.json(updatedDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a document from a collection
// @route   DELETE /api/admin/db/collections/:collectionName/:id
// @access  Private/Admin
const deleteDocument = async (req, res) => {
  const { collectionName, id } = req.params;

  try {
    const model = collectionName === 'users' ? User : (collectionName === 'blogs' ? Blog : (collectionName === 'subscribers' ? Subscriber : null));
    if (!model) {
      return res.status(400).json({ message: 'Invalid collection name' });
    }

    // Safeguard: Cannot delete self if collection is users
    if (collectionName === 'users' && id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Cascade delete: If deleting a user, also delete their blogs
    if (collectionName === 'users') {
      await Blog.deleteMany({ author: id });
    }

    const doc = await model.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDbStats,
  getDbBackup,
  restoreDb,
  getCollectionDocuments,
  createDocument,
  updateDocument,
  deleteDocument
};
