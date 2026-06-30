const axios = require('axios');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────
// @desc    Extract data from Aadhaar image
// @route   POST /api/ocr/extract
// @access  Private
// ─────────────────────────────────────────
const extractAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Build multipart form to forward to Python
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `${AI_SERVICE_URL}/ocr/extract`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000
      }
    );

    res.status(200).json({
      success: true,
      data: response.data.data
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'OCR service is currently unavailable.'
      });
    }

    console.error('OCR error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.detail || 'Could not process the image. Please try again.'
    });
  }
};

module.exports = { extractAadhaar };