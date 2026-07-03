const express = require('express');
const router  = express.Router();

const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  getAllComplaints,
  updateComplaintStatus,
  createBillForUser,
  createAdmin,
  getAllAdmins,
  toggleAdminStatus
} = require('../controllers/admin.controller');

const {
  getAllServiceRequests,
  updateServiceRequestStatus
} = require('../controllers/service.controller');

const {
  protect,
  authorize,
  isSuperAdmin
} = require('../middleware/auth.middleware');

// All routes require login
router.use(protect);

// ─── ADMIN + SUPERADMIN ROUTES ───────────
router.use(authorize('admin', 'superadmin'));

router.get('/stats',                          getStats);
router.get('/users',                          getAllUsers);
router.patch('/users/:id/toggle',             toggleUserStatus);
router.get('/complaints',                     getAllComplaints);
router.patch('/complaints/:id/status',        updateComplaintStatus);
router.post('/bills/create',                  createBillForUser);
router.get('/services',                       getAllServiceRequests);
router.patch('/services/:id/status',          updateServiceRequestStatus);

// ─── SUPERADMIN ONLY ROUTES ──────────────
router.get('/admins',              isSuperAdmin, getAllAdmins);
router.post('/create-admin',       isSuperAdmin, createAdmin);
router.patch('/admins/:id/toggle', isSuperAdmin, toggleAdminStatus);

module.exports = router;