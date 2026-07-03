const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});
console.log(process.env.MONGODB_URI);
const mongoose = require('mongoose');
const User     = require('../models/User');

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if superadmin already exists
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('⚠️  Super admin already exists:', existing.email);
      process.exit(0);
    }

    const superAdmin = await User.create({
      name:     'Super Admin',
      email:    'superadmin@suvidha.com',
      password: 'SuperAdmin@123',   // will be hashed by pre-save hook
      role:     'superadmin',
      isActive: true
    });

    console.log('✅ Super Admin created!');
    console.log('   Email:   ', superAdmin.email);
    console.log('   Password: SuperAdmin@123');
    console.log('   Role:    ', superAdmin.role);
    console.log('\n⚠️  Change this password after first login!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();