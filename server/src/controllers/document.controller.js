const Document   = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');

// ─────────────────────────────────────────
// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
// ─────────────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload'
      });
    }

    const { category, description, fileName } = req.body;

    const document = await Document.create({
      user:          req.user._id,
      fileName:      fileName || req.file.originalname,
      category:      category || 'other',
      fileType:      req.file.mimetype,
      fileSize:      req.file.size,
      cloudinaryUrl: req.file.path,       // Cloudinary URL
      cloudinaryId:  req.file.filename,   // Cloudinary public_id
      description
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not upload document'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private
// ─────────────────────────────────────────
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Group by category for easy display
    const grouped = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count:   documents.length,
      documents,
      grouped
    });

  } catch (error) {
    console.error('getMyDocuments error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch documents'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
// ─────────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id:  req.params.id,
      user: req.user._id   // ensure user owns this document
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary first
    await cloudinary.uploader.destroy(document.cloudinaryId, {
      resource_type: document.fileType === 'application/pdf'
        ? 'raw' : 'image'
    });

    // Then delete from MongoDB
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not delete document'
    });
  }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument };