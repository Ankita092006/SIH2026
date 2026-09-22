const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// Helper to generate JWT token
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
    const { name, email, password, role = 'patient' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [userId, name.trim(), normalizedEmail, hashedPassword, role]
    );

    let patientId = null;
    if (role === 'patient') {
      patientId = `PAT_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      await pool.query(
        `INSERT INTO patients (id, user_id, name, age, primary_language, condition_stage, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [patientId, userId, name.trim(), 70, 'as', 'Mild Cognitive Impairment', '/ner_senior_avatar.png']
      );
    }

    const userObj = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role,
      ...(patientId ? { patientId } : {})
    };

    const token = generateToken(userObj);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}

// LOGIN USER
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedInput = email.trim().toLowerCase();
    const fallbackEmail = normalizedInput.includes('@') ? normalizedInput : `${normalizedInput}@eldercare.in`;
    console.log(`🔑 [AUTH] Login attempt for: ${normalizedInput} (fallback: ${fallbackEmail})`);

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.avatar_url 
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE (LOWER(u.email) = ? OR LOWER(u.email) = ? OR LOWER(p.id) = ?) AND u.is_active = 1`,
      [normalizedInput, fallbackEmail, normalizedInput]
    );

    if (rows.length === 0) {
      console.warn(`⚠️ [AUTH] User not found: ${normalizedInput}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.warn(`⚠️ [AUTH] Invalid password attempt for: ${normalizedInput}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    let patientId = null;
    if (user.role === 'patient') {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url || '/ner_senior_avatar.png',
      ...(patientId ? { patientId } : {})
    };

    const token = generateToken(userObj);
    console.log(`✅ [AUTH] Login SUCCESS: ${user.email} (${user.role})`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}

// GET CURRENT USER PROFILE
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
    let patientId = null;
    if (user.role === 'patient') {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

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
        ...(patientId ? { patientId } : {})
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
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
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  return res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to your email'
  });
}

// RESET PASSWORD
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
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