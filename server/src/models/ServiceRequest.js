const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed']
  },
  note:      { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const serviceRequestSchema = new mongoose.Schema(
  {
    // Which citizen made this request
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true
    },

    // Type of service requested
    serviceType: {
      type: String,
      enum: ['water_connection', 'electricity_connection', 'gas_connection'],
      required: [true, 'Service type is required']
    },

    // Connection type
    connectionType: {
      type: String,
      enum: ['domestic', 'commercial'],
      default: 'domestic'
    },

    // Property details
    propertyAddress: {
      type: String,
      required: [true, 'Property address is required'],
      trim: true
    },

    ward: {
      type: String,
      trim: true
    },

    // Applicant details
    applicantName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    // Additional info
    remarks: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Current status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },

    // Status history — same pattern as complaints
    statusHistory: [statusHistorySchema],

    // Uploaded documents (Cloudinary URLs)
    documents: [{ type: String }],

    // Unique application number — e.g. WC-2024-12345
    applicationNumber: {
      type: String,
      unique: true
    },

    // Fee amount based on service type and connection type
    fee: {
      type: Number,
      default: 0
    },

    // Fee payment status
    feePaid: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Auto-generate application number + set fee
// before saving
// ─────────────────────────────────────────
serviceRequestSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    const prefixes = {
      water_connection:       'WC',
      electricity_connection: 'EC',
      gas_connection:         'GC'
    };

    const prefix = prefixes[this.serviceType] || 'SR';
    const year   = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.applicationNumber = `${prefix}-${year}-${random}`;
  }

  // Set fee based on service + connection type
  if (!this.fee) {
    const fees = {
      water_connection: {
        domestic:   500,
        commercial: 2000
      },
      electricity_connection: {
        domestic:   1500,
        commercial: 5000
      },
      gas_connection: {
        domestic:   1000,
        commercial: 3000
      }
    };
    this.fee = fees[this.serviceType]?.[this.connectionType] || 500;
  }

});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;