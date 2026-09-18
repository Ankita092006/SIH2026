// ==========================================
// ERROR MIDDLEWARE
// ==========================================

function errorMiddleware(err, req, res, next) {

  // Display error in terminal
  console.error('Error:', err.message);

  // Set default status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}


// ==========================================
// NOT FOUND MIDDLEWARE
// ==========================================

function notFound(req, res, next) {

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  errorMiddleware,
  notFound
};