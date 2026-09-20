const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { clientUrl } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const { notFound, errorMiddleware } = require("./middleware/error.middleware");

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Hardened CORS configuration
const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, tests) or allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Request body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root welcome & API health checks (unmetered for health probes)
app.get("/", (req, res) => {
  res.json({
    message: "Dementia Cognitive Gaming API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    database: "MySQL"
  });
});

// General rate limiter for all API endpoints
app.use("/api", apiLimiter);

// Mount application routes
app.use("/api/auth", authRoutes);

// Catch-all 404 and central error handling middleware
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;