const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

// GET /api/writers/top — Top writers with FRESH socialLinks directly from User collection
router.get('/top', async (req, res) => {
  try {
    // Aggregate: count blogs & total views per author
    const stats = await Blog.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$author',
          posts: { $sum: 1 },
          totalViews: { $sum: '$views' },
          tags: { $push: '$tags' },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 4 },
    ]);

    // Fetch FRESH user data directly from User collection
    const writerIds = stats.map(s => s._id);
    const users = await User.find({ _id: { $in: writerIds } })
      .select('name avatar bio socialLinks');

    // Merge stats with fresh user data
    const topWriters = stats.map(stat => {
      const user = users.find(u => u._id.toString() === stat._id.toString());
      if (!user) return null;
      // Flatten tags array of arrays
      const allTags = stat.tags.flat().filter(Boolean);
      const uniqueTags = [...new Set(allTags)].slice(0, 2);
      return {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        socialLinks: user.socialLinks,   // ← FRESH from User collection, always up-to-date
        posts: stat.posts,
        totalViews: stat.totalViews,
        tags: uniqueTags,
      };
    }).filter(Boolean);

    res.json(topWriters);
  } catch (error) {
    console.error('Top writers error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
