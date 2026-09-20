const mysql = require("mysql2/promise");
const { dbConfig } = require("./env");

const pool = mysql.createPool({
  ...dbConfig,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query("SELECT 1");

    console.log("✅ MySQL connected successfully");

  } catch (error) {
    console.error("❌ MySQL connection failed:");
console.error(error);
console.error("Error Code:", error.code);
console.error("Error Message:", error.message);

    throw error;

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Export correctly
module.exports = {
  connectDB,
  pool
};