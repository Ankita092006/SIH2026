const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import error middleware
const {
  notFound,
  errorMiddleware
} = require('./middleware/error.middleware');


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));


// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NER Cognitive Platform Backend is running'
  });
});


// ==========================================
// API ROUTES
// ==========================================

// Authentication routes
app.use('/api/auth', authRoutes);


// ==========================================
// ERROR HANDLING
// ==========================================

// Handle unknown routes
app.use(notFound);

// Handle application errors
app.use(errorMiddleware);


// ==========================================
// EXPORT APP
// ==========================================

module.exports = app;