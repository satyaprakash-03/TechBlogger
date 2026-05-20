const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  coverImage: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

blogSchema.index({ isPublished: 1, createdAt: -1 });
blogSchema.index({ author: 1 });

module.exports = mongoose.model('Blog', blogSchema);
