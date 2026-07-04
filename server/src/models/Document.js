const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    // Which citizen owns this document
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true
    },

    // Display name for the document
    fileName: {
      type:     String,
      required: true,
      trim:     true
    },

    // Document category
    category: {
      type: String,
      enum: [
        'aadhaar',
        'property_tax',
        'water_bill',
        'electricity_bill',
        'birth_certificate',
        'income_certificate',
        'caste_certificate',
        'other'
      ],
      default: 'other'
    },

    // File details
    fileType: {
      type: String,
      required: true
    },

    fileSize: {
      type: Number,   // in bytes
      required: true
    },

    // Cloudinary details
    cloudinaryUrl: {
      type:     String,
      required: true
    },

    cloudinaryId: {
      type:     String,
      required: true   // needed for deletion
    },

    // Optional description
    description: {
      type:      String,
      trim:      true,
      maxlength: 200
    }
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;