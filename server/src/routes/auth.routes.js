// auth.routes.js
// Defines the URL structure for authentication
// Thin layer — just maps URLs to controller functions

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser
} = require('../controllers/auth.controller');

// Import middleware
const { protect } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// No token required
// ─────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// ─────────────────────────────────────────
// PRIVATE ROUTES
// 'protect' middleware runs BEFORE getMe
// If token is invalid → protect rejects the request
// If token is valid   → protect attaches user → getMe runs
// ─────────────────────────────────────────

// GET /api/auth/me
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser); 

module.exports = router;