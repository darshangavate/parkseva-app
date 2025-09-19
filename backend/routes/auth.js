// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/* ------------------------ helpers / middleware ------------------------ */

// Generate JWT Token
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Extract token from Authorization header in a tolerant way
function getTokenFromHeader(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (!h) return null;

  // Accept "Bearer <token>" (case-insensitive), tolerate extra spaces
  const parts = h.trim().split(/\s+/);
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];

  // Fallback: some clients send only the raw token
  if (parts.length === 1 && parts[0].split('.').length === 3) return parts[0];

  return null;
}

// Require-auth middleware (verifies token and attaches req.userId)
function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    // Normalize auth errors to a consistent response
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/* ------------------------------- routes ------------------------------- */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number',
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user',
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar,
          address: user.address,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error retrieving profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Server error updating profile' });
  }
});

module.exports = router;
