// Complaint.js
// Represents a civic complaint filed by a citizen

const mongoose = require('mongoose');

// ─────────────────────────────────────────
// Status history subdocument schema
// Each entry records a status change
// ─────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // _id: false = no auto ID for subdocuments

// ─────────────────────────────────────────
// Main complaint schema
// ─────────────────────────────────────────
const complaintSchema = new mongoose.Schema(
  {
    // Which citizen filed this
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Complaint title — short description
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5,  'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // Detailed description
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10,  'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // Category of the complaint
    category: {
      type: String,
      enum: [
        'roads',
        'water_supply',
        'electricity',
        'sanitation',
        'streetlights',
        'drainage',
        'parks',
        'noise',
        'other'
      ],
      required: [true, 'Category is required']
    },

    // Location details
    location: {
      address: { type: String, trim: true },
      ward:    { type: String, trim: true },
      pincode: { type: String, trim: true }
    },

    // Priority — citizen sets this
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    // Current status
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending'
    },

    // Status change history — embedded array
    statusHistory: [statusHistorySchema],

    // Attached photo URLs (stored in Cloudinary)
    images: [{
      type: String  // Cloudinary URL
    }],

    // Unique complaint reference number
    // e.g. COMP-2024-001 — shown to citizen for tracking
    complaintNumber: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// ─────────────────────────────────────────
// Auto-generate complaint number before save
// Format: COMP-YYYY-XXXXX (random 5 digits)
// ─────────────────────────────────────────
complaintSchema.pre('save', function (next) {
  if (!this.complaintNumber) {
    const year   = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.complaintNumber = `COMP-${year}-${random}`;
  } 
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;