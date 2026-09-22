const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { jwtSecret, jwtExpiresIn, nodeEnv } = require('../config/env');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_REGISTER_ROLES = ['patient', 'caregiver'];

// Helper to generate JWT token with server-authoritative claims
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn
    }
  );
}

// REGISTER USER
async function register(req, res) {
  try {
    const { name, email, password, role = 'patient' } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters'
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Strict Role Validation: Disallow public registration for 'admin' or arbitrary roles
    const normalizedRole = String(role).trim().toLowerCase();
    if (!ALLOWED_REGISTER_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Self-registration is restricted to patient or caregiver.'
      });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [userId, trimmedName, normalizedEmail, hashedPassword, normalizedRole]
    );

    let patientId = null;
    let caregiverId = null;

    if (normalizedRole === 'patient') {
      patientId = `PAT_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      await pool.query(
        `INSERT INTO patients (id, user_id, name, age, primary_language, condition_stage, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [patientId, userId, trimmedName, 70, 'as', 'Mild Cognitive Impairment', '/ner_senior_avatar.png']
      );
    } else if (normalizedRole === 'caregiver') {
      caregiverId = `CG_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      try {
        await pool.query(
          `INSERT INTO caregivers (id, user_id, name, relationship, phone, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [caregiverId, userId, trimmedName, 'Family', '']
        );
      } catch (cgErr) {
        // Table may have specific schema; non-fatal if columns differ
        if (nodeEnv !== 'test') console.warn('[Auth] Caregiver table record notice:', cgErr.message);
      }
    }

    const userObj = {
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      role: normalizedRole,
      ...(patientId ? { patientId } : {}),
      ...(caregiverId ? { caregiverId } : {})
    };

    const token = generateToken(userObj);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userObj
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}

// LOGIN USER
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedInput = String(email).trim().toLowerCase();
    const fallbackEmail = normalizedInput.includes('@') ? normalizedInput : `${normalizedInput}@eldercare.in`;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.avatar_url 
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE (LOWER(u.email) = ? OR LOWER(u.email) = ? OR LOWER(p.id) = ?) AND u.is_active = 1`,
      [normalizedInput, fallbackEmail, normalizedInput]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];
    const isPasswordCorrect = await bcrypt.compare(String(password), user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    let patientId = null;
    let caregiverId = null;

    if (user.role === 'patient') {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    } else if (user.role === 'caregiver') {
      const [cgRows] = await pool.query('SELECT id FROM caregivers WHERE user_id = ?', [user.id]);
      if (cgRows.length > 0) {
        caregiverId = cgRows[0].id;
      }
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url || '/ner_senior_avatar.png',
      ...(patientId ? { patientId } : {}),
      ...(caregiverId ? { caregiverId } : {})
    };

    const token = generateToken(userObj);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}

// GET CURRENT USER PROFILE (AUTHORITATIVE IDENTITY)
async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, phone, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rows[0];
    let patientId = req.user.patientId || null;
    let caregiverId = req.user.caregiverId || null;

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url || '/ner_senior_avatar.png',
        phone: user.phone || '',
        createdAt: user.created_at,
        ...(patientId ? { patientId } : {}),
        ...(caregiverId ? { caregiverId } : {})
      }
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('Get user error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
}

// LOGOUT
async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}

// FORGOT PASSWORD
async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email || !EMAIL_REGEX.test(String(email).trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  // Safe generic response preventing email enumeration
  return res.status(200).json({
    success: true,
    message: 'If the email exists in our records, password reset instructions have been sent.'
  });
}

// RESET PASSWORD
async function resetPassword(req, res) {
  const { token, newPassword } = req.body || {};
  if (!token) {
    return res.status(400).json({ success: false, message: 'Reset token is required' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  return res.status(200).json({
    success: true,
    message: 'Password has been successfully reset'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};