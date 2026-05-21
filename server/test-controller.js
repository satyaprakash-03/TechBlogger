const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { getNotifications } = require('./controllers/notificationController');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techblogger';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB.');

    // Find Ragini Verma
    const ragini = await User.findOne({ email: 'nityatkd@gmail.com' });
    if (!ragini) {
      console.error('Ragini not found in DB');
      process.exit(1);
    }

    console.log(`Ragini ID: ${ragini._id}`);

    // Mock Express request and response
    const req = {
      user: {
        _id: ragini._id
      }
    };

    const res = {
      json: function(data) {
        console.log('\n--- Mock Response JSON ---');
        console.log(JSON.stringify(data, null, 2));
        mongoose.connection.close();
        process.exit(0);
      },
      status: function(code) {
        console.log(`Status Code: ${code}`);
        return this;
      }
    };

    console.log('Calling getNotifications controller...');
    await getNotifications(req, res);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
