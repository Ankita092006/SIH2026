const mysql = require("mysql2/promise");
const { dbConfig } = require("./env");

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * Validates the MySQL connection pool by checking a leased connection.
 */
const connectDB = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1 AS health");
    console.log("✅ MySQL connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ MySQL connection validation failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Gracefully drains and closes the MySQL connection pool.
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log("🛑 MySQL connection pool closed gracefully");
  } catch (error) {
    console.error("❌ Error while closing MySQL pool:", error.message);
  }
};

/**
 * Helper to run queries with automatic connection handling from the pool.
 */
const query = async (sql, params = []) => {
  const [results] = await pool.query(sql, params);
  return results;
};

/**
 * Execute a transaction with automatic COMMIT and ROLLBACK.
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  connectDB,
  closePool,
  query,
  withTransaction
};