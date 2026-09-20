const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { withTransaction, query } = require("../config/db");

/**
 * Generate a cryptographically signed JWT for the authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn
    }
  );
}

/**
 * Register a new user with secure password hashing and role enforcement
 */
async function registerUser({ name, email, password, role = "patient" }) {
  // 1. Validate required fields
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate password length
  if (typeof password !== "string" || password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  // 3. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    const error = new Error("Please provide a valid email address");
    error.statusCode = 400;
    throw error;
  }

  // 4. Enforce strict role authorization (prohibit public admin creation)
  const normalizedRole = (role || "patient").toLowerCase().trim();
  if (normalizedRole === "admin") {
    const error = new Error("Public registration of admin accounts is prohibited");
    error.statusCode = 403;
    throw error;
  }

  if (!["patient", "caregiver"].includes(normalizedRole)) {
    const error = new Error("Invalid role specified. Allowed roles: patient, caregiver");
    error.statusCode = 400;
    throw error;
  }

  // 5. Check duplicate email
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  // 6. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = crypto.randomUUID();

  // 7. Atomic transaction: create user and associated profile
  await withTransaction(async (conn) => {
    await conn.query(
      `INSERT INTO users (id, name, email, password, role, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [userId, name.trim(), normalizedEmail, hashedPassword, normalizedRole]
    );

    if (normalizedRole === "patient") {
      const patientId = "PAT_" + crypto.randomUUID().substring(0, 8).toUpperCase();
      await conn.query(
        `INSERT INTO patients (id, user_id, name, primary_language, condition_stage, avatar_url)
         VALUES (?, ?, ?, 'as', 'Mild Cognitive Impairment', '/ner_senior_avatar.png')`,
        [patientId, userId, name.trim()]
      );
    } else if (normalizedRole === "caregiver") {
      const caregiverId = "CG_" + crypto.randomUUID().substring(0, 8).toUpperCase();
      await conn.query(
        `INSERT INTO caregivers (id, user_id, name, specialization)
         VALUES (?, ?, ?, 'Family Caregiver')`,
        [caregiverId, userId, name.trim()]
      );
    }
  });

  const createdUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    role: normalizedRole
  };

  const token = generateToken(createdUser);

  return {
    user: createdUser,
    token
  };
}

/**
 * Authenticate existing user credentials and return a signed JWT
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (typeof email !== "string" || typeof password !== "string") {
    const error = new Error("Invalid email or password format");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Account has been deactivated. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp asynchronously
  await User.updateLastLogin(user.id);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = generateToken(safeUser);

  return {
    user: safeUser,
    token
  };
}

/**
 * Retrieve current user session and domain profile
 */
async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Fetch associated domain profile if available
  let profile = null;
  if (user.role === "patient") {
    const patients = await query("SELECT * FROM patients WHERE user_id = ? LIMIT 1", [user.id]);
    profile = patients[0] || null;
  } else if (user.role === "caregiver") {
    const caregivers = await query("SELECT * FROM caregivers WHERE user_id = ? LIMIT 1", [user.id]);
    profile = caregivers[0] || null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
    profile
  };
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  generateToken
};
