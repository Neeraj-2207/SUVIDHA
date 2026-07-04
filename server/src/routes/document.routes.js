const express = require('express');
const router  = express.Router();

const {
  uploadDocument,
  getMyDocuments,
  deleteDocument
} = require('../controllers/document.controller');

const { protect }         = require('../middleware/auth.middleware');
const { uploadDocument: uploadMiddleware } = require('../config/cloudinary');

router.use(protect);

router.get('/',    getMyDocuments);
router.post('/',   uploadMiddleware.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;