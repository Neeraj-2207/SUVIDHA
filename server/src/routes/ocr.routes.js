const express = require('express');
const router  = express.Router();
const multer  = require('multer');

const { extractAadhaar } = require('../controllers/ocr.controller');
const { protect } = require('../middleware/auth.middleware');

// Use memory storage — we just forward the file, don't save it
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/extract', protect, upload.single('file'), extractAadhaar);

module.exports = router;