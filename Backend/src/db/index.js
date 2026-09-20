const { pool, connectDB, closePool, query, withTransaction } = require("../config/db");
const { runMigrations, rollbackTables, EXPECTED_TABLES } = require("./migrate");
const { seedDatabase, DEFAULT_GAMES } = require("./seed");

/**
 * Initialize the database layer:
 * 1. Verify connection
 * 2. Run migrations (creates tables if not exists)
 * 3. Seed default games and test entities if games table is empty
 */
async function initDB() {
  await connectDB();
  const migrationResult = await runMigrations();

  // Check if games catalog needs initial seeding
  const [existingGames] = await pool.query("SELECT COUNT(*) AS count FROM games");
  if (existingGames[0].count === 0) {
    console.log("[DB Init] Empty catalog detected. Running initial database seed...");
    await seedDatabase();
  }

  return migrationResult;
}

module.exports = {
  pool,
  connectDB,
  closePool,
  query,
  withTransaction,
  runMigrations,
  rollbackTables,
  seedDatabase,
  initDB,
  EXPECTED_TABLES,
  DEFAULT_GAMES
};
