// cloudinary.js
// Configures Cloudinary SDK with our credentials
// and sets up multer-cloudinary storage

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─────────────────────────────────────────
// STORAGE ENGINE
// Tells multer WHERE to store uploaded files
// Instead of local disk → directly to Cloudinary
// ─────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'suvidha/complaints',  // folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, quality: 'auto' }]
  }
});

// Create multer upload middleware
// limits.fileSize = max 5MB per file
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, upload };