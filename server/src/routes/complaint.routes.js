// complaint.routes.js

const express  = require('express');
const router   = express.Router();

const {
  fileComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus
} = require('../controllers/complaint.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const { upload }             = require('../config/cloudinary');

// All routes require login
router.use(protect);

// Citizen routes
router.get('/',     getMyComplaints);
router.post('/',    upload.array('images', 3), fileComplaint);
router.get('/:id',  getComplaintById);

// Admin only route
router.patch(
  '/:id/status',
  authorize('admin'),
  updateComplaintStatus
);

module.exports = router;