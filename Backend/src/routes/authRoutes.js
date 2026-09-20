const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { validate, registerSchema, loginSchema } = require("../validators");

// ==========================================
// PUBLIC AUTHENTICATION ROUTES
// ==========================================

// Register new user (rate limited + validated)
router.post("/register", authLimiter, validate(registerSchema), register);

// Login user (rate limited + validated)
router.post("/login", authLimiter, validate(loginSchema), login);

// ==========================================
// PROTECTED AUTHENTICATION ROUTES
// ==========================================

// Get current logged-in user profile
router.get("/me", protect, getMe);

// Logout user
router.post("/logout", protect, logout);

module.exports = router;