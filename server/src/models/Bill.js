// Bill.js
// Represents a utility bill for a citizen
// Types: electricity, water, property tax, gas

const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    // Which citizen this bill belongs to
    // ref: 'User' creates a relationship to the User collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bill must belong to a user']
    },

    // Type of utility bill
    billType: {
      type: String,
      enum: ['electricity', 'water', 'property_tax', 'gas'],
      required: [true, 'Bill type is required']
    },

    // Unique bill number — like a reference ID
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Amount in rupees
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least ₹1']
    },

    // Due date — after this, bill is overdue
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },

    // Bill status
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'overdue'],
      default: 'unpaid'
    },

    // Billing period — e.g. "January 2024"
    billingPeriod: {
      type: String,
      trim: true
    },

    // Consumption details — units used (for electricity/water)
    unitsConsumed: {
      type: Number,
      default: 0
    },

    // Payment details — filled after successful payment
    payment: {
      razorpayOrderId:   { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt:            { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// ─────────────────────────────────────────
// Virtual field — automatically determine
// if a bill is overdue based on dueDate
// Virtuals are not stored in DB — computed on the fly
// ─────────────────────────────────────────


const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;