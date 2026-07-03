const ServiceRequest = require('../models/ServiceRequest');

// ─────────────────────────────────────────
// @desc    Apply for a new service connection
// @route   POST /api/services
// @access  Private
// ─────────────────────────────────────────
const applyForService = async (req, res) => {
  try {
    const {
      serviceType,
      connectionType,
      propertyAddress,
      ward,
      remarks
    } = req.body;

    if (!serviceType || !propertyAddress) {
      return res.status(400).json({
        success: false,
        message: 'Service type and property address are required'
      });
    }

    // Collect uploaded document URLs
    const documents = req.files
      ? req.files.map(f => f.path)
      : [];

    const serviceRequest = await ServiceRequest.create({
      user:            req.user._id,
      serviceType,
      connectionType:  connectionType || 'domestic',
      propertyAddress,
      ward:            ward || req.user.ward,
      applicantName:   req.user.name,
      phone:           req.user.phone,
      remarks,
      documents,
      statusHistory: [{
        status: 'pending',
        note:   'Application submitted successfully'
      }]
    });

    res.status(201).json({
      success: true,
      message: `Service request submitted! Application number: ${serviceRequest.applicationNumber}`,
      serviceRequest
    });

  } catch (error) {
    console.error('applyForService error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not submit service request'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get all service requests for logged-in user
// @route   GET /api/services
// @access  Private
// ─────────────────────────────────────────
const getMyServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    const summary = {
      total:        requests.length,
      pending:      requests.filter(r => r.status === 'pending').length,
      under_review: requests.filter(r => r.status === 'under_review').length,
      approved:     requests.filter(r => r.status === 'approved').length,
      rejected:     requests.filter(r => r.status === 'rejected').length,
      completed:    requests.filter(r => r.status === 'completed').length
    };

    res.status(200).json({
      success: true,
      summary,
      requests
    });

  } catch (error) {
    console.error('getMyServiceRequests error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch service requests'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get single service request by ID
// @route   GET /api/services/:id
// @access  Private
// ─────────────────────────────────────────
const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({
      _id:  req.params.id,
      user: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.status(200).json({ success: true, request });

  } catch (error) {
    console.error('getServiceRequestById error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch service request'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get ALL service requests (Admin)
// @route   GET /api/admin/services
// @access  Admin
// ─────────────────────────────────────────
const getAllServiceRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)      filter.status      = req.query.status;
    if (req.query.serviceType) filter.serviceType = req.query.serviceType;

    const requests = await ServiceRequest
      .find(filter)
      .populate('user', 'name email phone ward')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('getAllServiceRequests error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not fetch service requests'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Update service request status (Admin)
// @route   PATCH /api/admin/services/:id/status
// @access  Admin
// ─────────────────────────────────────────
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      'pending', 'under_review', 'approved', 'rejected', 'completed'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    request.status = status;
    request.statusHistory.push({
      status,
      note:      note || `Status updated to ${status}`,
      updatedAt: new Date()
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: `Service request ${status}`,
      request
    });

  } catch (error) {
    console.error('updateServiceRequestStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update status'
    });
  }
};

module.exports = {
  applyForService,
  getMyServiceRequests,
  getServiceRequestById,
  getAllServiceRequests,
  updateServiceRequestStatus
};