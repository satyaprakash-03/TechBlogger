const User = require('../models/User');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      // Notify admin about new registration
      try {
        const Notification = require('../models/Notification');
        const adminUser = await User.findOne({ email: 'satyaprakash.in33@gmail.com' });
        if (adminUser && adminUser._id.toString() !== user._id.toString()) {
          await Notification.create({
            receiver: adminUser._id,
            sender: user._id,
            type: 'register',
            title: 'New User Registered',
            message: `A new user has registered: ${user.name} (${user.email})`,
            link: '/dashboard'
          });
        }
      } catch (notifyError) {
        console.error('Registration notification failed:', notifyError);
      }

      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        designation: user.designation,
        socialLinks: user.socialLinks,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        designation: user.designation,
        socialLinks: user.socialLinks,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
      
      if (req.body.socialLinks) {
        console.log('📥 socialLinks received:', JSON.stringify(req.body.socialLinks));
        user.socialLinks = {
          twitter:  req.body.socialLinks.twitter  !== undefined ? req.body.socialLinks.twitter  : user.socialLinks?.twitter,
          github:   req.body.socialLinks.github   !== undefined ? req.body.socialLinks.github   : user.socialLinks?.github,
          linkedin: req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks?.linkedin,
          website:  req.body.socialLinks.website  !== undefined ? req.body.socialLinks.website  : user.socialLinks?.website,
        };
        console.log('💾 socialLinks saved:', JSON.stringify(user.socialLinks));
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        designation: updatedUser.designation,
        socialLinks: updatedUser.socialLinks,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        designation: updatedUser.designation,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own admin account.' });
      }
      await Blog.deleteMany({ author: user._id });
      await user.deleteOne();
      res.json({ message: 'User and their blogs removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin
};
