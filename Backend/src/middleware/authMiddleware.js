const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { pool } = require('../config/db');

// STRICT AUTHENTICATION MIDDLEWARE
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

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Malformed token payload.'
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

    const user = rows[0];

    // Resolve authoritative server-side patient/caregiver associations
    if (user.role === 'patient') {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      user.patientId = patRows.length > 0 ? patRows[0].id : null;
    } else if (user.role === 'caregiver') {
      const [cgRows] = await pool.query('SELECT id FROM caregivers WHERE user_id = ?', [user.id]);
      user.caregiverId = cgRows.length > 0 ? cgRows[0].id : null;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

// OPTIONAL AUTHENTICATION MIDDLEWARE (e.g. for guest / public game play)
async function optionalProtect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded && decoded.id) {
      const [rows] = await pool.query(
        'SELECT id, name, email, role, avatar_url FROM users WHERE id = ? AND is_active = 1',
        [decoded.id]
      );
      if (rows.length > 0) {
        const user = rows[0];
        if (user.role === 'patient') {
          const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
          user.patientId = patRows.length > 0 ? patRows[0].id : null;
        } else if (user.role === 'caregiver') {
          const [cgRows] = await pool.query('SELECT id FROM caregivers WHERE user_id = ?', [user.id]);
          user.caregiverId = cgRows.length > 0 ? cgRows[0].id : null;
        }
        req.user = user;
      }
    }
  } catch (err) {
    // In optional auth, invalid token is treated as unauthenticated
    req.user = null;
  }
  next();
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
  optionalProtect,
  authorize
};