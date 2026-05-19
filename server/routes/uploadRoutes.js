const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const router = express.Router();

// ── Cloudinary Configuration ──────────────────────────────────────────────────
// Add these 3 vars to your Render environment variables:
//   CLOUDINARY_CLOUD_NAME  →  your cloud name
//   CLOUDINARY_API_KEY     →  your API key
//   CLOUDINARY_API_SECRET  →  your API secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer — memory storage (no temp files needed) ────────────────────────────
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Images only!'));
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

// ── Upload route ──────────────────────────────────────────────────────────────
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Stream the buffer directly to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'techblogger',          // images go into techblogger/ folder in Cloudinary
      resource_type: 'image',
      transformation: [
        { width: 800, crop: 'limit' }, // resize large images to max 800px wide
        { quality: 'auto' },           // auto-compress
        { fetch_format: 'auto' },      // serve WebP/AVIF to modern browsers
      ],
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Image upload failed.', error: error.message });
      }
      res.json({
        message: 'Image Uploaded',
        image: result.secure_url,   // permanent HTTPS URL — never expires
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = router;
