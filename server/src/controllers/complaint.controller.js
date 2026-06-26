// complaint.controller.js

const Complaint = require('../models/Complaint');

// ─────────────────────────────────────────
// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Private
// ─────────────────────────────────────────
const fileComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      address,
      ward,
      pincode
    } = req.body;

    // Collect uploaded image URLs from Cloudinary
    // req.files is set by multer middleware
    const images = req.files
      ? req.files.map(file => file.path)
      : [];

    // Create complaint
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description,
      category,
      priority:  priority || 'medium',
      location:  { address, ward: ward || req.user.ward, pincode },
      images,
      // Initial status history entry
      statusHistory: [{
        status: 'pending',
        note:   'Complaint registered successfully'
      }]
    });

    res.status(201).json({
      success: true,
      message: `Complaint filed successfully! Your reference number is ${complaint.complaintNumber}`,
      complaint
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('fileComplaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not file complaint'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get all complaints for logged-in user
// @route   GET /api/complaints
// @access  Private
// ─────────────────────────────────────────
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Newest first

    // Summary
    const summary = {
      total:       complaints.length,
      pending:     complaints.filter(c => c.status === 'pending').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      resolved:    complaints.filter(c => c.status === 'resolved').length,
      closed:      complaints.filter(c => c.status === 'closed').length
    };

    res.status(200).json({
      success: true,
      summary,
      complaints
    });

  } catch (error) {
    console.error('getMyComplaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch complaints'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get single complaint with timeline
// @route   GET /api/complaints/:id
// @access  Private
// ─────────────────────────────────────────
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id:  req.params.id,
      user: req.user._id
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    console.error('getComplaintById error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch complaint'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Update complaint status (Admin only)
// @route   PATCH /api/complaints/:id/status
// @access  Private + Admin
// ─────────────────────────────────────────
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update status
    complaint.status = status;

    // Add to status history timeline
    complaint.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedAt: new Date()
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint
    });

  } catch (error) {
    console.error('updateComplaintStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update complaint status'
    });
  }
};

module.exports = {
  fileComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus
};