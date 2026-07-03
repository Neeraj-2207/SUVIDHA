// admin.controller.js
// All functions here require admin role
// The authorize('admin') middleware handles that check
// These controllers can freely access ALL data

const User = require('../models/User');
const Bill = require('../models/Bill');
const Complaint = require('../models/Complaint');
const ServiceRequest = require('../models/ServiceRequest');

// ─────────────────────────────────────────
// @desc    Get platform overview stats
// @route   GET /api/admin/stats
// @access  Admin
// ─────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    // Run all queries in PARALLEL using Promise.all
    // Much faster than running them one by one
    const [
      totalUsers,
      totalBills,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      paidBills,
      unpaidBills,
      overdueBills,
      totalServiceRequests,
      pendingServices
    ] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      Bill.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Bill.countDocuments({ status: 'paid' }),
      Bill.countDocuments({ status: 'unpaid' }),
      Bill.countDocuments({ status: 'overdue' })
    ]);

    // Calculate total revenue from paid bills
    const revenueResult = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent activity — last 5 complaints
    const recentComplaints = await Complaint
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email ward');
    // populate() = replace user ObjectId with actual user data

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers },
        bills: {
          total: totalBills, paid: paidBills,
          unpaid: unpaidBills, overdue: overdueBills,
          revenue: totalRevenue
        },
        complaints: {
          total: totalComplaints, pending: pendingComplaints,
          resolved: resolvedComplaints
        },
        services: {
          total: totalServiceRequests,
          pending: pendingServices
        }
      },
      recentComplaints
    });

  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch stats' });
  }
};

// ─────────────────────────────────────────
// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Admin
// ─────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User
      .find({ role: 'citizen' })
      .select('-password')           // exclude password
      .sort({ createdAt: -1 });      // newest first

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch users' });
  }
};

// ─────────────────────────────────────────
// @desc    Toggle user active/inactive status
// @route   PATCH /api/admin/users/:id/toggle
// @access  Admin
// ─────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Flip the boolean
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });

  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Could not update user' });
  }
};

// ─────────────────────────────────────────
// @desc    Get ALL complaints across all users
// @route   GET /api/admin/complaints
// @access  Admin
// ─────────────────────────────────────────
const getAllComplaints = async (req, res) => {
  try {
    // Query filters from URL params
    // e.g. GET /api/admin/complaints?status=pending&category=roads
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const complaints = await Complaint
      .find(filter)
      .populate('user', 'name email phone ward')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('getAllComplaints error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch complaints' });
  }
};

// ─────────────────────────────────────────
// @desc    Update complaint status (Admin)
// @route   PATCH /api/admin/complaints/:id/status
// @access  Admin
// ─────────────────────────────────────────
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update status and push to history
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      note: note || `Status updated to ${status} by admin`,
      updatedAt: new Date()
    });

    await complaint.save();

    // Return populated complaint
    const updated = await Complaint
      .findById(complaint._id)
      .populate('user', 'name email ward');

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });

  } catch (error) {
    console.error('updateComplaintStatus error:', error);
    res.status(500).json({ success: false, message: 'Could not update status' });
  }
};

// ─────────────────────────────────────────
// @desc    Create a bill for a specific user
// @route   POST /api/admin/bills/create
// @access  Admin
// ─────────────────────────────────────────
const createBillForUser = async (req, res) => {
  try {
    const {
      userId,
      billType,
      amount,
      dueDate,
      billingPeriod,
      unitsConsumed
    } = req.body;

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique bill number
    const year = new Date().getFullYear();
    const prefix = billType.toUpperCase().slice(0, 4);
    const random = Math.floor(1000 + Math.random() * 9000);
    const billNumber = `${prefix}-${year}-${random}`;

    const Bill = require('../models/Bill');
    const bill = await Bill.create({
      user: userId,
      billType,
      billNumber,
      amount,
      dueDate: new Date(dueDate),
      billingPeriod,
      unitsConsumed: unitsConsumed || 0,
      status: 'unpaid'
    });

    res.status(201).json({
      success: true,
      message: `${billType} bill of ₹${amount} created for ${user.name}`,
      bill
    });

  } catch (error) {
    console.error('createBillForUser error:', error);
    res.status(500).json({ success: false, message: 'Could not create bill' });
  }
};


// ─────────────────────────────────────────
// @desc    Create a new admin (Super Admin only)
// @route   POST /api/admin/create-admin
// @access  Super Admin
// ─────────────────────────────────────────
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create admin account
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'   // ← explicitly set as admin
    });

    res.status(201).json({
      success: true,
      message: `Admin account created for ${name}`,
      admin: {
        id:    admin._id,
        name:  admin.name,
        email: admin.email,
        role:  admin.role
      }
    });

  } catch (error) {
    console.error('createAdmin error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not create admin account'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get all admins (Super Admin only)
// @route   GET /api/admin/admins
// @access  Super Admin
// ─────────────────────────────────────────
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User
      .find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   admins.length,
      admins
    });

  } catch (error) {
    console.error('getAllAdmins error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch admins'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Deactivate an admin (Super Admin only)
// @route   PATCH /api/admin/admins/:id/toggle
// @access  Super Admin
// ─────────────────────────────────────────
const toggleAdminStatus = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id:  req.params.id,
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: admin.isActive
    });

  } catch (error) {
    console.error('toggleAdminStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update admin status'
    });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleUserStatus,
  getAllComplaints,
  updateComplaintStatus,
  createBillForUser,
  createAdmin,      
  getAllAdmins,    
  toggleAdminStatus
};