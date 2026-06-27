// admin.routes.js
// ALL routes here require: logged in + admin role
// protect + authorize('admin') applied to every route

const express = require('express');
const router  = express.Router();

const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  getAllComplaints,
  updateComplaintStatus,
  createBillForUser
} = require('../controllers/admin.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Apply both middlewares to ALL admin routes at once
// Every route below this line requires admin role
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getStats);

// User management
router.get('/users',                 getAllUsers);
router.patch('/users/:id/toggle',    toggleUserStatus);

// Complaint management
router.get('/complaints',            getAllComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);

// Bill management
router.post('/bills/create',         createBillForUser);

module.exports = router;