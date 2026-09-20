const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

/**
 * Middleware to protect routes and verify JWT bearer tokens
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing."
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing."
      });
    }

    // Verify token validity
    const decoded = jwt.verify(token, jwtSecret);

    // Look up user in MySQL
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or session expired."
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated."
      });
    }

    // Attach user identity to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again."
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or malformed token."
    });
  }
}

const { authorize } = require("./rbac.middleware");

module.exports = {
  protect,
  authorize
};