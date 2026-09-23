const jwt = require('jsonwebtoken');

const {
  jwtSecret
} = require('../config/env');

const User = require('../models/User');


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

async function protect(req, res, next) {
  try {

    // 1. Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token missing.'
      });
    }


    // 2. Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token missing.'
      });
    }


    // 3. Verify token
    const decoded = jwt.verify(token, jwtSecret);


    // 4. Find user in database
    const user = await User.findById(decoded.id)
      .select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }


    // 5. Attach user to request
    req.user = user;


    // 6. Continue to next middleware/controller
    next();

  } catch (error) {

    console.error('Authentication error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });

  }
}


// ==========================================
// EXPORT MIDDLEWARE
// ==========================================

module.exports = {
  protect
};