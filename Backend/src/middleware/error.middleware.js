const { nodeEnv } = require('../config/env');

// ==========================================
// CENTRAL ERROR HANDLING MIDDLEWARE
// ==========================================

function errorMiddleware(err, req, res, next) {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : (typeof err.status === 'number' ? err.status : 500);

  // Secure server-side error logging
  if (nodeEnv !== 'test') {
    console.error(`[ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Prevent internal error details, SQL queries, or stack traces from reaching clients
  let clientMessage = err.message || 'Internal Server Error';
  if (nodeEnv === 'production' && statusCode >= 500) {
    clientMessage = 'An unexpected server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
}

// ==========================================
// 404 NOT FOUND MIDDLEWARE
// ==========================================

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorMiddleware,
  notFound
};