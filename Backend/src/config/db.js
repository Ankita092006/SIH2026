const mysql = require("mysql2/promise");
const { dbConfig } = require("./env");

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MySQL connected successfully");

    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB
};