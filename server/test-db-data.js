const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB.');

    const blogs = await Blog.find({});
    console.log(`Total blogs: ${blogs.length}`);
    blogs.forEach((b, idx) => {
      console.log(`${idx + 1}. Title: "${b.title}"`);
      console.log(`   ID: ${b._id}`);
      console.log(`   createdAt: ${b.createdAt} (${typeof b.createdAt})`);
      console.log(`   author: ${b.author}`);
      if (!b.createdAt) {
        console.log(`   ⚠️ WARNING: createdAt is missing or falsy!`);
      }
      if (b.createdAt && isNaN(new Date(b.createdAt).getTime())) {
        console.log(`   ⚠️ WARNING: createdAt is an invalid date!`);
      }
    });

    const users = await User.find({});
    console.log(`\nTotal users: ${users.length}`);
    users.forEach((u, idx) => {
      console.log(`${idx + 1}. Name: "${u.name}" | Email: "${u.email}" | Role: "${u.role}"`);
      console.log(`   createdAt: ${u.createdAt}`);
    });

    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
