const express = require("express");

const router = express.Router();

// Temporary user storage
// Note: Data will be lost when the server restarts.
const users = [];

// Temporary active login tokens
const activeTokens = new Set();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ankita
 *               email:
 *                 type: string
 *                 example: ankita@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already exists
 */

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Name, email and password are required",
    });
  }

  // Check whether email already exists
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      status: "error",
      message: "Email already registered",
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
  };

  users.push(newUser);

  return res.status(201).json({
    status: "success",
    message: "User registered successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ankita@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  // Find user
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  // Create temporary token
  const token = `token-${user.id}-${Date.now()}`;

  activeTokens.add(token);

  return res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Check logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Unauthorized
 */

// GET CURRENT USER
router.get("/me", (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      status: "error",
      message: "Authorization token is required",
    });
  }

  const token = authorization.replace("Bearer ", "");

  if (!activeTokens.has(token)) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "User is authenticated",
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */

// LOGOUT
router.post("/logout", (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      status: "error",
      message: "Authorization token is required",
    });
  }

  const token = authorization.replace("Bearer ", "");

  activeTokens.delete(token);

  return res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

// Export router
module.exports = router;