const http = require("http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mainApp = require("../app");
const { connectDB, closePool, query } = require("../config/db");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validate,
  gameAttemptSchema,
  createReminderSchema,
  createMemorySchema
} = require("../validators");
const { createCustomLimiter } = require("../middleware/rateLimit.middleware");
const { generateToken } = require("../services/auth.service");
const { notFound, errorMiddleware } = require("../middleware/error.middleware");

let server;
let baseUrl;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers
    };

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(resBody);
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, rawBody: resBody });
          }
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log("=== Running Security, Validation & RBAC Test Suite ===");
  await connectDB();

  // Create test application mirroring production middleware
  const testApp = express();
  testApp.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  testApp.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true
    })
  );
  testApp.use(express.json());

  testApp.get("/api/health", (req, res) => {
    res.json({ status: "success", database: "MySQL" });
  });

  // Rate-limited test route
  const testLimiter = createCustomLimiter(2, 60000);
  testApp.get("/api/test-security/rate-limit-probe", testLimiter, (req, res) => {
    res.json({ success: true, message: "Within limit" });
  });

  // Game attempt validator test route
  testApp.post(
    "/api/test-security/validate-game-attempt",
    validate(gameAttemptSchema),
    (req, res) => {
      res.json({ success: true, data: req.body });
    }
  );

  // Reminder validator test route
  testApp.post(
    "/api/test-security/validate-reminder",
    validate(createReminderSchema),
    (req, res) => {
      res.json({ success: true, data: req.body });
    }
  );

  // Memory validator test route
  testApp.post(
    "/api/test-security/validate-memory",
    validate(createMemorySchema),
    (req, res) => {
      res.json({ success: true, data: req.body });
    }
  );

  // RBAC test route: caregiver-only
  testApp.get(
    "/api/test-security/caregiver-only",
    protect,
    authorize("caregiver"),
    (req, res) => {
      res.json({ success: true, message: `Welcome Caregiver ${req.user.name}` });
    }
  );

  // RBAC test route: patient-only
  testApp.get(
    "/api/test-security/patient-only",
    protect,
    authorize("patient"),
    (req, res) => {
      res.json({ success: true, message: `Welcome Patient ${req.user.name}` });
    }
  );

  testApp.use(notFound);
  testApp.use(errorMiddleware);

  // Start test server
  await new Promise((resolve) => {
    server = testApp.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Security Test Server] Running on ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Verify Helmet Security Headers
    console.log("[Test 1] Verifying Helmet HTTP security headers on responses...");
    const res1 = await makeRequest("GET", "/api/health");
    if (res1.status !== 200) {
      throw new Error(`Expected 200 from health endpoint, got ${res1.status}`);
    }
    const headers = res1.headers;
    if (headers["x-content-type-options"] !== "nosniff") {
      throw new Error("Missing or invalid 'X-Content-Type-Options' header");
    }
    if (headers["x-frame-options"] !== "SAMEORIGIN") {
      throw new Error("Missing or invalid 'X-Frame-Options' header");
    }
    console.log("  -> PASS: Helmet security headers (nosniff, SAMEORIGIN) confirmed");

    // 2. Verify CORS Policy Whitelisting
    console.log("[Test 2] Verifying CORS policy for whitelisted origin...");
    const res2 = await makeRequest("GET", "/api/health", null, {
      Origin: "http://localhost:5173"
    });
    if (res2.headers["access-control-allow-origin"] !== "http://localhost:5173") {
      throw new Error("CORS did not reflect whitelisted origin http://localhost:5173");
    }
    console.log("  -> PASS: CORS origin reflected correctly for client frontend");

    // 3. Verify Rate Limiting Enforcement
    console.log("[Test 3] Verifying rate limiting enforcement...");
    const rl1 = await makeRequest("GET", "/api/test-security/rate-limit-probe");
    const rl2 = await makeRequest("GET", "/api/test-security/rate-limit-probe");
    const rl3 = await makeRequest("GET", "/api/test-security/rate-limit-probe");

    if (rl1.status !== 200 || rl2.status !== 200) {
      throw new Error(
        `First two requests should have succeeded, got ${rl1.status} and ${rl2.status}`
      );
    }
    if (rl3.status !== 429) {
      throw new Error(
        `Third request should have returned 429 Too Many Requests, got ${rl3.status}`
      );
    }
    console.log("  -> PASS: Exceeded rate limit successfully throttled with 429 Too Many Requests");

    // 4. Verify Game Attempt Schema Validation
    console.log("[Test 4] Verifying Zod validation on Game Attempt ML telemetry...");
    const badGameAttempt = {
      sessionId: "ses_001",
      gameId: "memory-match",
      current_difficulty: 9, // Invalid: must be 1-5
      accuracy: 1.5, // Invalid: must be 0-1
      response_time: -2 // Invalid: must be >= 0
    };
    const resGameBad = await makeRequest(
      "POST",
      "/api/test-security/validate-game-attempt",
      badGameAttempt
    );
    if (resGameBad.status !== 400 || !resGameBad.body.errors) {
      throw new Error(`Expected 400 with errors array, got status ${resGameBad.status}`);
    }
    const badFields = resGameBad.body.errors.map((e) => e.field);
    if (!badFields.includes("current_difficulty") || !badFields.includes("accuracy")) {
      throw new Error(
        `Expected errors for difficulty and accuracy, got: ${JSON.stringify(badFields)}`
      );
    }
    console.log("  -> PASS: Out-of-bound game telemetry rejected with structured 400 Bad Request");

    // 5. Verify Reminder Schema Validation
    console.log("[Test 5] Verifying Zod validation on Reminder creation...");
    const badReminder = {
      description: "No title or time provided"
    };
    const resReminderBad = await makeRequest(
      "POST",
      "/api/test-security/validate-reminder",
      badReminder
    );
    if (resReminderBad.status !== 400) {
      throw new Error(`Expected 400 for missing reminder fields, got ${resReminderBad.status}`);
    }
    console.log("  -> PASS: Missing required reminder fields rejected with 400 Bad Request");

    // 6. Verify Memory Schema Validation
    console.log("[Test 6] Verifying Zod validation on Memory creation...");
    const badMemory = {
      title: "Family Trip",
      memory_type: "INVALID_TYPE" // Valid are: PERSON, EVENT, OBJECT, PLACE
    };
    const resMemoryBad = await makeRequest(
      "POST",
      "/api/test-security/validate-memory",
      badMemory
    );
    if (resMemoryBad.status !== 400) {
      throw new Error(`Expected 400 for invalid memory_type, got ${resMemoryBad.status}`);
    }
    console.log("  -> PASS: Invalid memory type enum rejected with 400 Bad Request");

    // 7. Verify RBAC Access Control
    console.log("[Test 7] Verifying Role-Based Access Control (RBAC)...");
    // Find real patient and caregiver users from seeded DB
    const patientUsers = await query("SELECT * FROM users WHERE role = 'patient' LIMIT 1");
    const caregiverUsers = await query("SELECT * FROM users WHERE role = 'caregiver' LIMIT 1");

    if (patientUsers.length === 0 || caregiverUsers.length === 0) {
      throw new Error("Missing seeded test users in database");
    }

    const patientToken = generateToken(patientUsers[0]);
    const caregiverToken = generateToken(caregiverUsers[0]);

    // Patient tries to access caregiver-only route
    const resForbidden = await makeRequest("GET", "/api/test-security/caregiver-only", null, {
      Authorization: `Bearer ${patientToken}`
    });
    if (resForbidden.status !== 403) {
      throw new Error(
        `Expected 403 Forbidden for patient accessing caregiver route, got ${resForbidden.status}`
      );
    }
    console.log("  -> PASS: Patient forbidden (403) from accessing caregiver route");

    // Caregiver accesses caregiver-only route
    const resAllowed = await makeRequest("GET", "/api/test-security/caregiver-only", null, {
      Authorization: `Bearer ${caregiverToken}`
    });
    if (resAllowed.status !== 200 || !resAllowed.body.message.includes(caregiverUsers[0].name)) {
      throw new Error(
        `Expected 200 OK for caregiver accessing caregiver route, got ${resAllowed.status}`
      );
    }
    console.log("  -> PASS: Caregiver successfully authorized (200 OK) for caregiver route");

    // Unauthenticated access
    const resUnauth = await makeRequest("GET", "/api/test-security/caregiver-only");
    if (resUnauth.status !== 401) {
      throw new Error(
        `Expected 401 Unauthorized for unauthenticated request, got ${resUnauth.status}`
      );
    }
    console.log("  -> PASS: Unauthenticated request rejected with 401 Unauthorized");

    console.log("\n✅ ALL SECURITY, VALIDATION & RBAC TESTS PASSED!\n");
  } finally {
    if (server) {
      server.close();
    }
    await closePool();
  }
}

if (require.main === module) {
  runSecurityTests().catch((err) => {
    console.error("❌ Security test failure:", err);
    process.exit(1);
  });
}

module.exports = { runSecurityTests };
