const http = require("http");
const app = require("../app");
const { query, closePool, connectDB } = require("../config/db");

let server;
let baseUrl;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let resBody = "";
        res.on("data", chunk => resBody += chunk);
        res.on("end", () => {
          try {
            const data = JSON.parse(resBody);
            resolve({ status: res.statusCode, body: data });
          } catch {
            resolve({ status: res.statusCode, rawBody: resBody });
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

async function runAuthTests() {
  console.log("=== Running Comprehensive Authentication Test Suite ===");
  await connectDB();

  // Start temporary test server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}`);
      resolve();
    });
  });

  try {
    const timestamp = Date.now();
    const testEmail = `test_patient_${timestamp}@eldercare.in`;
    const testPassword = "securePassword123";

    // 1. Missing fields validation
    console.log("[Test 1] Missing fields in register...");
    const res1 = await makeRequest("POST", "/api/auth/register", {});
    if (res1.status !== 400 || res1.body.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res1.status}`);
    }
    console.log("  -> PASS: Empty registration rejected with 400");

    // 2. Short password validation
    console.log("[Test 2] Short password (< 6 chars) in register...");
    const res2 = await makeRequest("POST", "/api/auth/register", {
      name: "Short Pass",
      email: `short_${timestamp}@test.com`,
      password: "123"
    });
    if (res2.status !== 400) {
      throw new Error(`Expected 400 for short password, got ${res2.status}`);
    }
    console.log("  -> PASS: Short password rejected with 400");

    // 3. Invalid email format validation
    console.log("[Test 3] Invalid email format...");
    const res3 = await makeRequest("POST", "/api/auth/register", {
      name: "Bad Email",
      email: "not-an-email",
      password: "validPassword123"
    });
    if (res3.status !== 400) {
      throw new Error(`Expected 400 for invalid email, got ${res3.status}`);
    }
    console.log("  -> PASS: Malformed email rejected with 400");

    // 4. Privilege Escalation Prevention (Admin registration blocked)
    console.log("[Test 4] Attempting to register as 'admin' role...");
    const res4 = await makeRequest("POST", "/api/auth/register", {
      name: "Hacker Admin",
      email: `admin_${timestamp}@hack.com`,
      password: "password123",
      role: "admin"
    });
    if (res4.status !== 403) {
      throw new Error(`Expected 403 Forbidden for admin registration attempt, got ${res4.status}`);
    }
    console.log("  -> PASS: Privilege escalation blocked with 403 Forbidden");

    // 5. Successful User Registration
    console.log("[Test 5] Valid user registration...");
    const res5 = await makeRequest("POST", "/api/auth/register", {
      name: "Anita Das",
      email: testEmail,
      password: testPassword,
      role: "patient"
    });
    if (res5.status !== 201 || !res5.body.token || res5.body.user.role !== "patient") {
      throw new Error(`Registration failed: ${JSON.stringify(res5.body)}`);
    }
    const authToken = res5.body.token;
    const authUserId = res5.body.user.id;
    console.log("  -> PASS: Registration succeeded (201 Created) with JWT token");

    // Verify patient profile was created in database
    const patientRows = await query("SELECT * FROM patients WHERE user_id = ?", [authUserId]);
    if (patientRows.length === 0) {
      throw new Error("Patient profile was not created in database!");
    }
    console.log("  -> PASS: Patient domain profile verified in MySQL");

    // 6. Duplicate Email Conflict
    console.log("[Test 6] Registering duplicate email...");
    const res6 = await makeRequest("POST", "/api/auth/register", {
      name: "Anita Duplicate",
      email: testEmail,
      password: "anotherPassword"
    });
    if (res6.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${res6.status}`);
    }
    console.log("  -> PASS: Duplicate email rejected with 409 Conflict");

    // 7. Successful Login
    console.log("[Test 7] Valid user login...");
    const res7 = await makeRequest("POST", "/api/auth/login", {
      email: testEmail,
      password: testPassword
    });
    if (res7.status !== 200 || !res7.body.token || res7.body.user.email !== testEmail.toLowerCase()) {
      throw new Error(`Login failed: ${JSON.stringify(res7.body)}`);
    }
    console.log("  -> PASS: Login succeeded (200 OK) with verified JWT");

    // 8. Incorrect Password Login
    console.log("[Test 8] Invalid password login...");
    const res8 = await makeRequest("POST", "/api/auth/login", {
      email: testEmail,
      password: "wrongPassword"
    });
    if (res8.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for wrong password, got ${res8.status}`);
    }
    console.log("  -> PASS: Invalid password rejected with 401 Unauthorized");

    // 9. Protected Route GET /api/auth/me
    console.log("[Test 9] Accessing GET /api/auth/me with Bearer token...");
    const res9 = await makeRequest("GET", "/api/auth/me", null, authToken);
    if (res9.status !== 200 || res9.body.user.email !== testEmail.toLowerCase()) {
      throw new Error(`GET /me failed: ${JSON.stringify(res9.body)}`);
    }
    console.log(`  -> PASS: Session identity verified: ${res9.body.user.name} (${res9.body.user.role})`);

    // 10. Missing Token on Protected Route
    console.log("[Test 10] Accessing GET /api/auth/me without token...");
    const res10 = await makeRequest("GET", "/api/auth/me");
    if (res10.status !== 401) {
      throw new Error(`Expected 401 for missing token, got ${res10.status}`);
    }
    console.log("  -> PASS: Missing token rejected with 401 Unauthorized");

    // 11. Malformed/Invalid Token
    console.log("[Test 11] Accessing with malformed token...");
    const res11 = await makeRequest("GET", "/api/auth/me", null, "invalid.token.here");
    if (res11.status !== 401) {
      throw new Error(`Expected 401 for malformed token, got ${res11.status}`);
    }
    console.log("  -> PASS: Tampered token rejected with 401 Unauthorized");

    // 12. POST /api/auth/logout
    console.log("[Test 12] Calling POST /api/auth/logout with token...");
    const res12 = await makeRequest("POST", "/api/auth/logout", null, authToken);
    if (res12.status !== 200) {
      throw new Error(`Expected 200 for logout, got ${res12.status}`);
    }
    console.log("  -> PASS: Logout succeeded with 200 OK");

    console.log("\n✅ ALL AUTHENTICATION TESTS PASSED!\n");
  } finally {
    if (server) {
      server.close();
    }
    await closePool();
  }
}

if (require.main === module) {
  runAuthTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Auth test failure:", err);
      process.exit(1);
    });
}

module.exports = { runAuthTests };
