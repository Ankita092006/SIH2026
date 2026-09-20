const rateLimit = require("express-rate-limit");

/**
 * Strict rate limiter for sensitive authentication endpoints (login, register)
 * Prevents brute-force and credential stuffing attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 1000 : 50, // Permissive in testing, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes."
  }
});

/**
 * General API rate limiter to protect against DDoS and abuse
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});

/**
 * Factory for creating custom test rate limiters
 */
function createCustomLimiter(max, windowMs = 60000) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Rate limit exceeded."
    }
  });
}

module.exports = {
  authLimiter,
  apiLimiter,
  createCustomLimiter
};
