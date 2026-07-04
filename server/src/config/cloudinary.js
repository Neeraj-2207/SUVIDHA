const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ── Step 1: Define complaint storage
const complaintStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'suvidha/complaints',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1000, quality: 'auto' }]
  }
});

// ── Step 2: Define document storage
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'suvidha/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
    resource_type:   'auto'
  }
});

// ── Step 3: Create multer instances AFTER storage is defined
const upload = multer({
  storage: complaintStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }
});

const uploadDocument = multer({
  storage: documentStorage,
  limits:  { fileSize: 10 * 1024 * 1024 }
});

module.exports = { cloudinary, upload, uploadDocument };