const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 5000;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dementia_platform",
  port: Number(process.env.DB_PORT) || 3306
};

const jwtSecret = process.env.JWT_SECRET;

module.exports = {
  port,
  dbConfig,
  jwtSecret
};