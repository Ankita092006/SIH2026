const { spawnSync } = require("child_process");
const path = require("path");

const testSuites = [
  { name: "Database Foundation", file: path.join(__dirname, "../db/test_db_foundation.js") },
  { name: "Server Lifecycle & Shutdown", file: path.join(__dirname, "../test_server_lifecycle.js") },
  { name: "Authentication & JWT API", file: path.join(__dirname, "auth.test.js") },
  { name: "Security, Validation & RBAC", file: path.join(__dirname, "security.test.js") }
];


console.log("============================================================");
console.log("🚀 EXECUTING COMPLETE BACKEND TEST SUITE");
console.log("============================================================\n");

let allPassed = true;

for (const suite of testSuites) {
  console.log(`▶ Running [${suite.name}]...`);
  const result = spawnSync("node", [suite.file], {
    cwd: path.join(__dirname, "../.."),
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    console.error(`\n❌ [${suite.name}] FAILED with exit code ${result.status}\n`);
    allPassed = false;
    break;
  }
  console.log(`✔ [${suite.name}] PASSED\n`);
}

if (!allPassed) {
  console.error("❌ TEST RUN TERMINATED WITH FAILURES.");
  process.exit(1);
} else {
  console.log("============================================================");
  console.log("✅ ALL TEST SUITES PASSED SUCCESSFULLY");
  console.log("============================================================\n");
  process.exit(0);
}
