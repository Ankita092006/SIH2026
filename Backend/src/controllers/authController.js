const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const {
  jwtSecret,
  jwtExpiresIn
} = require('../config/env');


// ==========================================
// Generate JWT Token
// ==========================================

function generateToken(userId) {
  return jwt.sign(
    {
      id: userId
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn
    }
  );
}


// ==========================================
// REGISTER USER
// ==========================================

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient'
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Send response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}


// ==========================================
// LOGIN USER
// ==========================================

async function login(req, res) {
  try {
    const {
      email,
      password
    } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Send response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
}


// ==========================================
// LOGOUT USER
// ==========================================

async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logout successful. Remove the token from the client.'
  });
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  register,
  login,
  getMe,
  logout
};