// seedBills.js
// Run this once to populate test bills in the database
// Command: node src/scripts/seedBills.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
// Note: path goes up two levels because scripts/ is inside src/

const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const User = require('../models/User');

const seedBills = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the first citizen user to assign bills to
    const user = await User.findOne({ role: 'citizen' });

    if (!user) {
      console.log('❌ No citizen user found. Register first, then run this script.');
      process.exit(1);
    }

    console.log(`📋 Creating bills for: ${user.name} (${user.email})`);

    // Delete existing bills for this user (clean slate)
    await Bill.deleteMany({ user: user._id });

    // Create fake bills
    const bills = await Bill.insertMany([
      {
        user: user._id,
        billType: 'electricity',
        billNumber: 'ELEC-2024-001',
        amount: 1250,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'unpaid',
        billingPeriod: 'December 2024',
        unitsConsumed: 180
      },
      {
        user: user._id,
        billType: 'water',
        billNumber: 'WATR-2024-001',
        amount: 450,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'unpaid',
        billingPeriod: 'December 2024',
        unitsConsumed: 22
      },
      {
        user: user._id,
        billType: 'property_tax',
        billNumber: 'PROP-2024-001',
        amount: 3200,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days AGO = overdue
        status: 'overdue',
        billingPeriod: 'Q3 2024'
      },
      {
        user: user._id,
        billType: 'gas',
        billNumber: 'GAS-2024-001',
        amount: 680,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'unpaid',
        billingPeriod: 'December 2024',
        unitsConsumed: 12
      },
      {
        user: user._id,
        billType: 'electricity',
        billNumber: 'ELEC-2024-000',
        amount: 980,
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last month
        status: 'paid',
        billingPeriod: 'November 2024',
        unitsConsumed: 145,
        payment: {
          razorpayOrderId: 'order_test_001',
          razorpayPaymentId: 'pay_test_001',
          paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        }
      }
    ]);

    console.log(`✅ Created ${bills.length} bills successfully!`);
    console.log('Bills created:');
    bills.forEach(b => {
      console.log(`  ${b.billType.toUpperCase()} — ₹${b.amount} — ${b.status}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedBills();