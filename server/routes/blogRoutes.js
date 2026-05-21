const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, likeBlog } = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

router.route('/:id/like')
  .post(protect, likeBlog);

module.exports = router;
