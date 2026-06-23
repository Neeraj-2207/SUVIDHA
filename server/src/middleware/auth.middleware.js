// auth.middleware.js
// This is the GATEKEEPER of our application
// Every protected route passes through this function first

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // ─────────────────────────────────────────
  // STEP 1: Extract token from request header
  // Clients send tokens like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  // ─────────────────────────────────────────
  
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Split "Bearer eyJhbG..." into ["Bearer", "eyJhbG..."]
    // Take index [1] which is the actual token
    token = authHeader.split(' ')[1];
  }

  // If no token found, reject immediately
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please log in.'
    });
  }

  // ─────────────────────────────────────────
  // STEP 2: Verify the token is valid
  // jwt.verify() will throw an error if:
  //   - Token was tampered with
  //   - Token has expired
  //   - Token was signed with a different secret
  // ─────────────────────────────────────────
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "64f3ab...", role: "citizen", iat: ..., exp: ... }

    // ─────────────────────────────────────────
    // STEP 3: Find the user in DB using decoded ID
    // Why fetch from DB again? Because:
    //   - User might have been deleted since token was issued
    //   - User might have been deactivated by admin
    // ─────────────────────────────────────────
    
    const user = await User.findById(decoded.id).select('-password');
    // .select('-password') = exclude password field

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.'
      });
    }

    // ─────────────────────────────────────────
    // STEP 4: Attach user to request object
    // Now every subsequent route handler can access
    // req.user and know WHO is making the request
    // ─────────────────────────────────────────
    
    req.user = user;
    next(); // Pass control to the next function (the route handler)

  } catch (error) {
    // jwt.verify() threw an error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }
};

// ─────────────────────────────────────────
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// Use AFTER protect middleware
// Example: router.get('/admin', protect, authorize('admin'), handler)
// ─────────────────────────────────────────

const authorize = (...roles) => {
  // This returns a middleware function
  // ...roles means we can pass multiple: authorize('admin', 'superadmin')
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };