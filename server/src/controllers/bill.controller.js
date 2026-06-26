// bill.controller.js
// Handles all bill-related business logic

const Bill     = require('../models/Bill');
const Razorpay = require('razorpay');
const crypto   = require('crypto'); // Built into Node.js — no install needed

// Initialize Razorpay with our keys
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys missing in .env file');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};


// ─────────────────────────────────────────
// @desc    Get all bills for logged-in user
// @route   GET /api/bills
// @access  Private
// ─────────────────────────────────────────
const getMyBills = async (req, res) => {
  try {
    // Before fetching, update any overdue bills
    // If dueDate has passed and bill is still unpaid → mark overdue
    await Bill.updateMany(
      {
        user: req.user._id,
        status: 'unpaid',
        dueDate: { $lt: new Date() }   // $lt = less than (before today)
      },
      { status: 'overdue' }
    );

    // Now fetch all bills for this user
    // Sort by dueDate ascending — most urgent first
    const bills = await Bill.find({ user: req.user._id })
      .sort({ dueDate: 1 });

    // Calculate summary stats
    const summary = {
      total:   bills.length,
      unpaid:  bills.filter(b => b.status === 'unpaid').length,
      overdue: bills.filter(b => b.status === 'overdue').length,
      paid:    bills.filter(b => b.status === 'paid').length,
      totalDue: bills
        .filter(b => b.status !== 'paid')
        .reduce((sum, b) => sum + b.amount, 0)
    };

    res.status(200).json({
      success: true,
      summary,
      bills
    });

  } catch (error) {
    console.error('getMyBills error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch bills'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Create Razorpay order for a bill
// @route   POST /api/bills/pay/:billId
// @access  Private
// ─────────────────────────────────────────
const createPaymentOrder = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id:  req.params.billId,
      user: req.user._id        // Security: ensure bill belongs to this user
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been paid'
      });
    }

    const razorpay = getRazorpay();
    // Razorpay amount is in PAISE (1 rupee = 100 paise)
    const order = await razorpay.orders.create({
      amount:   bill.amount * 100,
      currency: 'INR',
      receipt:  bill.billNumber,
      notes: {
        billId:   bill._id.toString(),
        billType: bill.billType,
        userId:   req.user._id.toString()
      }
    });

    // Save order ID to bill for verification later
    bill.payment = { razorpayOrderId: order.id };
    await bill.save();

    res.status(200).json({
      success: true,
      order,
      bill: {
        id:         bill._id,
        billNumber: bill.billNumber,
        billType:   bill.billType,
        amount:     bill.amount
      },
      // Send key to frontend — needed to open Razorpay popup
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('createPaymentOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not create payment order'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Verify payment after Razorpay callback
// @route   POST /api/bills/verify
// @access  Private
// ─────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId
    } = req.body;

    // ─────────────────────────────────────────
    // VERIFY SIGNATURE
    // Razorpay signs: order_id + "|" + payment_id
    // using your KEY_SECRET
    // We recreate this signature and compare
    // If they match → payment is genuine
    // If not → someone tampered with the data
    // ─────────────────────────────────────────
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Signature matches — payment is genuine
    // Update the bill to paid status
    const bill = await Bill.findOneAndUpdate(
      { _id: billId, user: req.user._id },
      {
        status: 'paid',
        payment: {
          razorpayOrderId:   razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt:            new Date()
        }
      },
      { returnDocument: "after" }  // Return the updated document
    );

    res.status(200).json({
      success: true,
      message: `Bill paid successfully! Payment ID: ${razorpay_payment_id}`,
      bill
    });

  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

module.exports = { getMyBills, createPaymentOrder, verifyPayment };