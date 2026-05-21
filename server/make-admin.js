const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const email = process.argv[2];

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techblogger';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');

    if (!email) {
      console.log('\n--- Registered Users List ---');
      const users = await User.find({}, 'name email role');
      if (users.length === 0) {
        console.log('No users found in the database.');
      } else {
        users.forEach((user, idx) => {
          console.log(`${idx + 1}. Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
        });
        console.log('\nTo promote a user to admin, run:');
        console.log('node make-admin.js <email>');
      }
      mongoose.connection.close();
      process.exit(0);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email "${email}" not found.`);
      mongoose.connection.close();
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`\nSuccess: Promoted ${user.name} (${email}) to admin role.`);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
  });
