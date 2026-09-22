const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

// Import Swagger configuration
const swaggerSpec = require("./config/swagger");

// Import routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const gameRoutes = require("./routes/gameRoutes");
const resultsRoutes = require("./routes/resultsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const caregiverRoutes = require("./routes/caregiverRoutes");

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
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/caregiver", caregiverRoutes);

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
    success: true,
    status: "success",
    database: "MySQL",
    message: "Backend is healthy and running",
  });
});

// ===============================
// EXPORT APP
// ===============================

module.exports = app;