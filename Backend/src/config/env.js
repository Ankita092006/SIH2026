require("dotenv").config();
const crypto = require("crypto");

const nodeEnv = process.env.NODE_ENV || 'development';
const port = parseInt(process.env.PORT, 10) || 5000;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sih26003_db'
};

// Fail fast in production if JWT secret is missing or insecure
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (nodeEnv === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production!');
  }
  // Generate an ephemeral random secret for local dev if unset, ensuring no predictable hardcoded secret
  console.warn('⚠️ [SECURITY WARNING] JWT_SECRET unset in development. Using secure random fallback.');
  jwtSecret = crypto.randomBytes(32).toString('hex');
} else if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('FATAL: JWT_SECRET must be at least 32 characters long in production!');
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
const mlAdaptiveUrl = (process.env.ML_ADAPTIVE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const voiceApiUrl = (process.env.VOICE_API_URL || 'https://soumya9679-sih26003-voice-asr.hf.space').replace(/\/$/, '');
const hfToken = process.env.HF_TOKEN || '';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = {
  nodeEnv,
  port,
  dbConfig,
  jwtSecret,
  jwtExpiresIn,
  mlAdaptiveUrl,
  voiceApiUrl,
  hfToken,
  clientUrl
};