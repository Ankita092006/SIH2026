const express = require('express');

const router = express.Router();

// Import controller functions
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');

// Import authentication middleware
const {
  protect
} = require('../middleware/authMiddleware');


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);


// ==========================================
// PROTECTED ROUTES
// ==========================================

// Get current logged-in user
router.get('/me', protect, getMe);

// Logout user
router.post('/logout', protect, logout);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;