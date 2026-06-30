// auth.controller.js
// Contains the actual business logic for authentication
// Each function handles one specific API action

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (no token needed)
// ─────────────────────────────────────────

const registerUser = async (req, res) => {
  try {
    // STEP 1: Extract data from request body
    // req.body contains what the client sent
    const { name, email, password, phone, ward } = req.body;

    // STEP 2: Validate - Already happening in registerValidator


    // STEP 3: Check if user already exists
    // We don't want two accounts with same email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // STEP 4: Create the user
    // Note: we pass plain password here
    // The pre-save hook in User.js will hash it automatically
    const user = await User.create({
      name,
      email,
      password,      // Will be hashed by pre-save hook
      phone,
      ward,
      role: 'citizen' // Always citizen on self-registration
                      // Admins are created manually in DB
    });

    // STEP 5: Generate JWT token
    const token = generateToken(user._id, user.role);

    // STEP 6: Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // STEP 7: Send response
    // We never send the password back - even hashed
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SUVIDHA.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ward: user.ward,
        aadhaarVerified: user.aadhaarVerified
      }
    });

  } catch (error) {
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key error (race condition on email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────

const loginUser = async (req, res) => {
  try {
    // STEP 1: Extract credentials
    const { email, password } = req.body;

    // STEP 2: Validate input  Already Done in the Login Validator


    // STEP 3: Find user by email
    // Remember: password has select:false in schema
    // So we must EXPLICITLY ask for it here
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // SECURITY: Don't say "email not found"
      // Always use a vague message to prevent email enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // STEP 4: Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // STEP 5: Compare passwords
    // This calls the instance method we defined in User.js
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // STEP 6: Generate token
    const token = generateToken(user._id, user.role);

    // STEP 7: Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // STEP 8: Send response
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ward: user.ward,
        aadhaarVerified: user.aadhaarVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private (requires token)
// ─────────────────────────────────────────

const getMe = async (req, res) => {
  try {
    // req.user was attached by the protect middleware
    // We already have the user — no need to query DB again
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ward: user.ward,
        address: user.address,
        aadhaarVerified: user.aadhaarVerified,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────

const logoutUser = async (req, res) => {
  try {
    // ─────────────────────────────────────────
    // WHY JWT LOGOUT IS DIFFERENT FROM SESSION LOGOUT:
    //
    // Session logout: server deletes the session from DB/memory.
    // The session ID cookie becomes useless immediately.
    //
    // JWT logout: the server has NO record of issued tokens.
    // The token lives entirely on the client side.
    // Even if we "logout" here, the token is still mathematically
    // valid until it expires (3 days in our case).
    //
    // REAL logout with JWT happens on the FRONTEND:
    // → Delete the token from localStorage/memory
    // → The client simply stops sending the token
    //
    // For true server-side JWT invalidation, you'd need a
    // "token blacklist" stored in Redis/DB — an advanced pattern
    // we can add later in the project.
    // ─────────────────────────────────────────

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please delete your token on the client.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// ─────────────────────────────────────────
// @desc    Verify Aadhaar after OCR extraction
// @route   PATCH /api/auth/verify-aadhaar
// @access  Private
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// Helper — normalize a name for comparison
// Removes extra spaces, lowercases, strips punctuation
// ─────────────────────────────────────────
const normalizeName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')   // remove anything that isn't a letter or space
    .replace(/\s+/g, ' ')        // collapse multiple spaces into one
    .trim();
};

// ─────────────────────────────────────────
// Helper — calculate similarity between two strings
// Uses Levenshtein distance (edit distance) converted to a 0-1 score
// ─────────────────────────────────────────
const calculateSimilarity = (str1, str2) => {
  const longer  = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

// ─────────────────────────────────────────
// @desc    Verify Aadhaar after OCR extraction
// @route   PATCH /api/auth/verify-aadhaar
// @access  Private
// ─────────────────────────────────────────
const verifyAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber, name, dob } = req.body;

    if (!aadhaarNumber || !name) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract sufficient details. Please try a clearer photo.'
      });
    }

    const user = await User.findById(req.user._id);

    // ─────────────────────────────────────────
    // IDENTITY CHECK
    // Compare extracted name against registered name
    // ─────────────────────────────────────────
    const normalizedRegistered = normalizeName(user.name);
    const normalizedExtracted  = normalizeName(name);

    const similarity = calculateSimilarity(normalizedRegistered, normalizedExtracted);

    const SIMILARITY_THRESHOLD = 0.7;  // 70% similarity required

    if (similarity < SIMILARITY_THRESHOLD) {
      return res.status(400).json({
        success: false,
        message: `The name on this Aadhaar card ("${name}") does not match your registered name ("${user.name}"). You can only verify your own Aadhaar card.`,
        mismatch: true
      });
    }

    // ─────────────────────────────────────────
    // CHECK: Has this Aadhaar number already been
    // used to verify a DIFFERENT account?
    // ─────────────────────────────────────────
    const existingVerifiedUser = await User.findOne({
      aadhaarNumber: aadhaarNumber,
      _id: { $ne: user._id }   // exclude current user
    });

    if (existingVerifiedUser) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhaar number is already linked to another account.'
      });
    }

    // All checks passed — verify the user
    user.aadhaarVerified = true;
    user.aadhaarNumber   = aadhaarNumber;  // store for future duplicate checks

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully!',
      user: {
        id: user._id,
        aadhaarVerified: user.aadhaarVerified
      }
    });

  } catch (error) {
    console.error('verifyAadhaar error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not verify Aadhaar. Please try again.'
    });
  }
};

module.exports = { registerUser, loginUser, getMe , logoutUser,verifyAadhaar};