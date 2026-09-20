const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

const EXPECTED_TABLES = [
  "users",
  "patients",
  "caregivers",
  "caregiver_patient_assignments",
  "games",
  "game_sessions",
  "game_attempts",
  "game_results",
  "reminders",
  "memories",
  "memory_recall_activities",
  "memory_recall_attempts"
];

/**
 * Execute schema migrations to create all database tables.
 */
async function runMigrations() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  // Remove comment lines and split statements by semicolon
  const statements = schemaSql
    .split(/;\s*$/m)
    .map(stmt => stmt.replace(/--.*$/gm, "").trim())
    .filter(stmt => stmt.length > 0);

  console.log(`[DB Migrate] Executing ${statements.length} DDL statements...`);

  const connection = await pool.getConnection();
  try {
    for (const sql of statements) {
      await connection.query(sql);
    }
    console.log("[DB Migrate] ✅ All schema DDL statements executed successfully.");

    // Verify all expected tables exist in database
    const [rows] = await connection.query("SHOW TABLES");
    const existingTables = rows.map(r => Object.values(r)[0].toLowerCase());

    const missingTables = EXPECTED_TABLES.filter(t => !existingTables.includes(t.toLowerCase()));
    if (missingTables.length > 0) {
      throw new Error(`Migration incomplete! Missing tables: ${missingTables.join(", ")}`);
    }

    console.log(`[DB Migrate] ✅ Verified all ${EXPECTED_TABLES.length} tables present in database.`);
    return { success: true, tableCount: existingTables.length, tables: existingTables };
  } catch (error) {
    console.error("[DB Migrate] ❌ Migration failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Safe rollback/drop for testing environments.
 */
async function rollbackTables() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of [...EXPECTED_TABLES].reverse()) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("[DB Migrate] ✅ All application tables dropped cleanly.");
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("[DB Migrate] Migration completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[DB Migrate] Migration script error:", err);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  rollbackTables,
  EXPECTED_TABLES
};
