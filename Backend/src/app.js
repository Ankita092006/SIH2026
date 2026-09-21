const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

// Import Swagger configuration
const swaggerSpec = require("./config/swagger");

// Import authentication routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

// Enable CORS
app.use(cors());

// Read JSON data from requests
app.use(express.json());

// ===============================
// SWAGGER DOCUMENTATION
// ===============================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ===============================
// AUTHENTICATION ROUTES
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Dementia Cognitive Gaming API is running",
  });
});

// ===============================
// HEALTH CHECK ROUTE
// ===============================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Backend is running successfully
 */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    database: "MySQL",
    message: "Backend is healthy and running",
  });
});

// ===============================
// EXPORT APP
// ===============================

module.exports = app;