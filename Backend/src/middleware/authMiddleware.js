const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { pool } = require('../config/db');

// AUTHENTICATION MIDDLEWARE
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token missing.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

// ROLE AUTHORIZATION MIDDLEWARE
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions.'
      });
    }
    next();
  };
}

module.exports = {
  protect,
  authorize
};