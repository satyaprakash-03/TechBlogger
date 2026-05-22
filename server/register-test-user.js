const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB.');

    let user = await User.findOne({ email: 'testuser@gmail.com' });
    if (user) {
      console.log('Test user already exists.');
    } else {
      user = new User({
        name: 'Test User',
        email: 'testuser@gmail.com',
        password: 'password123',
        role: 'user'
      });
      await user.save();
      console.log('Created test user.');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
    });

    console.log('Test user details:');
    console.log(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      designation: user.designation,
      socialLinks: user.socialLinks,
      token,
    }, null, 2));

    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
