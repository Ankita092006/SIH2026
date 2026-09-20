const express = require("express");
const cors = require("cors");
const { clientUrl } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const { notFound, errorMiddleware } = require("./middleware/error.middleware");

const app = express();

// Standard middleware
app.use(cors({
  origin: clientUrl || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome & API health checks
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

// Mount application routes
app.use("/api/auth", authRoutes);

// Catch-all 404 and central error handling middleware
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;