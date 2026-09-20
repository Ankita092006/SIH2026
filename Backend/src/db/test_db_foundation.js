const { pool, connectDB, closePool, query, withTransaction } = require("../config/db");
const { runMigrations, EXPECTED_TABLES } = require("./migrate");

async function testDatabaseFoundation() {
  console.log("=== Testing MySQL Database Foundation ===");

  // 1. Verify Connection
  console.log("[Test 1] Testing connectDB()...");
  await connectDB();
  console.log("  -> PASS: connectDB() succeeded");

  // 2. Verify Idempotent Migrations
  console.log("[Test 2] Testing runMigrations() idempotency...");
  const migrationRes = await runMigrations();
  if (!migrationRes.success || migrationRes.tables.length < EXPECTED_TABLES.length) {
    throw new Error("Migration verification failed");
  }
  console.log("  -> PASS: runMigrations() is safe to rerun idempotently");

  // 3. Verify Foreign Keys and Seeded Data
  console.log("[Test 3] Verifying seeded games and relational records...");
  const games = await query("SELECT id, title, cognitive_domain FROM games ORDER BY id");
  if (games.length !== 5) {
    throw new Error(`Expected 5 games, got ${games.length}`);
  }
  console.log(`  -> PASS: Found ${games.length} games in catalog`);

  const patients = await query("SELECT p.id, p.name, u.email, u.role FROM patients p JOIN users u ON p.user_id = u.id");
  if (patients.length < 1) {
    throw new Error("Expected at least 1 patient joined with user");
  }
  console.log(`  -> PASS: Relational JOIN patients-users verified: ${patients[0].name} (${patients[0].email})`);

  // 4. Verify Transaction Manager (Commit & Rollback)
  console.log("[Test 4] Testing withTransaction() rollback on error...");
  let rollbackCaught = false;
  try {
    await withTransaction(async (conn) => {
      await conn.query("INSERT INTO games (id, title, cognitive_domain) VALUES ('test-tx-game', 'Tx Test', 'memory')");
      throw new Error("Intentional rollback trigger");
    });
  } catch (err) {
    if (err.message === "Intentional rollback trigger") {
      rollbackCaught = true;
    }
  }

  const [testGame] = await query("SELECT id FROM games WHERE id = 'test-tx-game'");
  if (testGame || !rollbackCaught) {
    throw new Error("Transaction rollback failed: record was persisted despite error");
  }
  console.log("  -> PASS: Transaction rollback properly reverted temporary changes");

  // 5. Verify Consolidated game_results Table
  console.log("[Test 5] Verifying consolidated game_results schema...");
  const columns = await query("DESCRIBE game_results");
  const colNames = columns.map(c => c.Field);
  const requiredCols = ["id", "session_id", "patient_id", "game_id", "score", "max_score", "accuracy", "time_taken_seconds", "next_difficulty", "prediction_source"];
  for (const col of requiredCols) {
    if (!colNames.includes(col)) {
      throw new Error(`Missing expected column '${col}' in consolidated game_results table`);
    }
  }
  console.log("  -> PASS: game_results has all consolidated metrics from GameResult and Score");

  console.log("\n✅ ALL DATABASE FOUNDATION TESTS PASSED!\n");
}

if (require.main === module) {
  testDatabaseFoundation()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("❌ Test failed:", err);
      await closePool();
      process.exit(1);
    });
}

module.exports = { testDatabaseFoundation };
