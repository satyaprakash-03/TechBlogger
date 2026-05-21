const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techblogger';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB.');

    console.log('\n--- Blogs List ---');
    const blogs = await Blog.find({}).populate('author', 'name email');
    if (blogs.length === 0) {
      console.log('No blogs found.');
    } else {
      blogs.forEach((blog) => {
        console.log(`Title: ${blog.title}`);
        console.log(`Author: ${blog.author?.name} (${blog.author?.email})`);
        console.log(`Likes count: ${blog.likes?.length || 0}`);
        console.log(`Likes array: ${JSON.stringify(blog.likes)}`);
        console.log('---');
      });
    }

    console.log('\n--- Notifications List ---');
    const notifications = await Notification.find({})
      .populate('receiver', 'name email')
      .populate('sender', 'name email');
    if (notifications.length === 0) {
      console.log('No notifications found.');
    } else {
      notifications.forEach((n) => {
        console.log(`Receiver: ${n.receiver?.name} (${n.receiver?.email})`);
        console.log(`Sender: ${n.sender?.name} (${n.sender?.email})`);
        console.log(`Type: ${n.type}`);
        console.log(`Title: ${n.title}`);
        console.log(`Message: ${n.message}`);
        console.log(`Link: ${n.link}`);
        console.log(`isRead: ${n.isRead}`);
        console.log('---');
      });
    }

    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
  });
