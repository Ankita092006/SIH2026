require("dotenv").config();

/**
 * Validates the presence and format of required configuration variables.
 * Fails fast with descriptive error messages to prevent runtime crashes.
 */
function validateConfig() {
  const errors = [];

  // 1. MySQL / Aiven Connection Parameters
  if (!process.env.DB_HOST) {
    errors.push("Missing required environment variable: DB_HOST (MySQL database hostname)");
  }
  if (!process.env.DB_USER) {
    errors.push("Missing required environment variable: DB_USER (MySQL database username)");
  }
  if (!process.env.DB_NAME) {
    errors.push("Missing required environment variable: DB_NAME (MySQL database name)");
  }

  // 2. JWT Configuration
  if (!process.env.JWT_SECRET) {
    errors.push("Missing required environment variable: JWT_SECRET (Signing secret for JWTs)");
  } else if (process.env.JWT_SECRET.length < 16) {
    errors.push("Insecure JWT_SECRET: Must be at least 16 characters in length");
  }

  if (errors.length > 0) {
    console.error("\n============================================================");
    console.error("❌ CRITICAL BACKEND CONFIGURATION ERROR");
    console.error("============================================================");
    errors.forEach(err => console.error(` - ${err}`));
    console.error("\nPlease check your .env file or copy from .env.example.\n");
    throw new Error(`Configuration validation failed (${errors.length} error(s)).`);
  }
}

// Perform initial validation
validateConfig();

const port = parseInt(process.env.PORT, 10) || 5000;
const nodeEnv = process.env.NODE_ENV || "development";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME
};

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

const mlAdaptiveUrl = process.env.ML_ADAPTIVE_URL || "http://localhost:8000";
const mlVoiceUrl = process.env.ML_VOICE_URL || "http://localhost:8001";

module.exports = {
  port,
  nodeEnv,
  clientUrl,
  dbConfig,
  jwtSecret,
  jwtExpiresIn,
  mlAdaptiveUrl,
  mlVoiceUrl,
  validateConfig
};