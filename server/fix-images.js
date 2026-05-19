const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const BlogSchema = new mongoose.Schema({
  title: String,
  coverImage: String,
}, { strict: false });

const Blog = mongoose.model('Blog', BlogSchema);

const PLACEHOLDER = 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60';

const run = async () => {
  await mongoose.connect(uri);
  console.log('Connected to DB');

  // Find all blogs with relative coverImage paths
  const blogs = await Blog.find({ coverImage: { $regex: '^/uploads/' } });
  console.log(`Found ${blogs.length} blog(s) with relative /uploads/ paths`);

  for (const blog of blogs) {
    console.log(`Updating: "${blog.title}" -- old: ${blog.coverImage}`);
    blog.coverImage = PLACEHOLDER;
    await blog.save();
    console.log(`  --> Updated to placeholder`);
  }

  console.log('Done!');
  await mongoose.disconnect();
};

run().catch(console.error);
