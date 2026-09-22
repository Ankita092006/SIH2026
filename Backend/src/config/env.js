require("dotenv").config();

const port = process.env.PORT || 5000;

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const jwtSecret = process.env.JWT_SECRET || 'sih26003_dev_secret_key_change_in_prod';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const mlAdaptiveUrl = process.env.ML_ADAPTIVE_URL || 'http://127.0.0.1:8000';
const voiceApiUrl = process.env.VOICE_API_URL || 'https://soumya9679-sih26003-voice-asr.hf.space';
const hfToken = process.env.HF_TOKEN || '';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = {
  port,
  dbConfig,
  jwtSecret,
  jwtExpiresIn,
  mlAdaptiveUrl,
  voiceApiUrl,
  hfToken,
  clientUrl
};