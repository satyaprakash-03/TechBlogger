const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // Vercel frontend URL (set in Render env vars)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techblogger')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB connection error:', err));

const path = require('path');

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/writers', require('./routes/writerRoutes'));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
