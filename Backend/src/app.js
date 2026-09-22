const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

// Import Swagger configuration
const swaggerSpec = require("./config/swagger");
const { clientUrl, nodeEnv } = require("./config/env");
const { errorMiddleware, notFound } = require("./middleware/error.middleware");

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
// SECURITY HEADERS (HELMET)
// ===============================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
        upgradeInsecureRequests: nodeEnv === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// ===============================
// CORS HARDENING
// ===============================
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || nodeEnv === 'test') {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// ===============================
// REQUEST BODY LIMITS
// ===============================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ===============================
// RATE LIMITING
// ===============================
// Sensitive Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: nodeEnv === 'test' ? 1000 : 30, // 30 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes."
  }
});

// Voice API Rate Limiter
const voiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: nodeEnv === 'test' ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Voice processing rate limit reached. Please wait a moment."
  }
});

// ===============================
// REQUEST LOGGING (Sanitized)
// ===============================
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (nodeEnv !== 'test') {
      console.log(`📡 [${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ===============================
// SWAGGER DOCUMENTATION
// ===============================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ===============================
// MOUNT ROUTES
// ===============================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/voice", voiceLimiter, voiceRoutes);
app.use("/api/caregiver", caregiverRoutes);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Dementia Cognitive Gaming API Gateway is active",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "success",
    database: "MySQL",
    message: "Backend is healthy and running",
  });
});

// ===============================
// ERROR HANDLING MIDDLEWARE
// ===============================
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;