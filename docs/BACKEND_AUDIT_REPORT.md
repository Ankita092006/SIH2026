# SIH26003 Backend Audit Report

## 1. Executive Summary

**Overall State:** **NOT READY**

### Audit Verdict Rationale:
The backend in its current isolated state cannot be integrated, run end-to-end, or safely deployed. While certain baseline Express patterns and folder structures are present, the backend suffers from deep internal engineering defects, critical runtime bugs, architectural contradictions, and missing feature implementations:

1. **Catastrophic Database Architectural Incoherence:** The startup script and configuration initialize a **MySQL connection pool** via `mysql2/promise` in `src/config/db.js`, yet **all 6 domain models** in `src/models/` are written as **MongoDB Mongoose schemas**. `mongoose.connect()` is never called anywhere in the codebase. As a result, every database query either hangs indefinitely due to Mongoose connection buffering or crashes. Conversely, the MySQL connection pool contains zero queries, zero table schemas, and zero migrations.
2. **Server Startup Fails by Default:** `server.js` halts and exits immediately (`process.exit(1)`) on boot because it enforces an active MySQL connection. Because the database is isolated and local MySQL credentials fail, the server cannot start.
3. **Guaranteed Runtime Exception on Authentication:** In `authController.js` (lines 5–25), `jwtExpiresIn` is imported from `../config/env`, which does not define or export it (`undefined`). In `jsonwebtoken`, passing `{ expiresIn: undefined }` triggers an immediate unhandled exception (`"expiresIn" should be a number of seconds or string representing a timespan`), guaranteeing that `/api/auth/register` and `/api/auth/login` always crash on token generation.
4. **Massive Feature Absence (Over 85% Missing):** The platform problem statement (SIH26003) requires cognitive games, adaptive difficulty ML integration, voice assistance, patient management, caregiver monitoring, reminders, and memory assistance. Only 5 endpoints exist in total: `GET /api/health` and 4 authentication endpoints. None of the models for Games, Game Results, Reminders, Memories, or Scores are wired to any routes, controllers, or services.
5. **Orphaned Service Layer & Direct Controller-Model Coupling:** The only service file (`aiService.js`) is misplaced outside `src/` at `Backend/services/aiService.js` and is never imported or called. Controllers bypass the service layer completely and query Mongoose models directly.

---

## 2. Backend Architecture

### As-Is Discovered Architecture
```text
HTTP Client (Port 5000)
    │
    ▼
Express App (src/app.js)
    │
    ├── Global Middleware:
    │     ├── cors({ origin: CLIENT_URL || 'http://localhost:5173' })
    │     ├── express.json()
    │     └── express.urlencoded({ extended: true })
    │
    ├── Routes:
    │     ├── GET /api/health (Inline handler in app.js)
    │     └── /api/auth (src/routes/authRoutes.js)
    │           ├── POST /register ──► authController.register ──┐
    │           ├── POST /login    ──► authController.login    ──┤
    │           ├── GET  /me       ──► authController.getMe    ──┼──► Bypasses Service Layer
    │           └── POST /logout   ──► authController.logout   ──┘          │
    │                                                                       ▼
    ├── Middleware Guards:                                         src/models/User.js
    │     └── authMiddleware.protect ────────────────────────────► (Mongoose / MongoDB)
    │                                                                       ▲
    ├── Orphaned / Unreachable Components:                                  │
    │     ├── Backend/services/aiService.js (Never imported)                │ (No mongoose.connect)
    │     ├── src/config/logger.js (Never imported)                         ▼
    │     └── Models: Game, GameResult, Memory, Reminder, Score      [MongoDB Offline]
    │
    └── Startup Sequencer (src/server.js):
          └── connectDB() (src/config/db.js)
                └── mysql2 pool.getConnection() ──► [MySQL Required / Crashes on startup]
```

---

## 3. Project Structure

**Structure State:** **FAIL**

### Inventory of Existing Files (19 Total):
```text
Backend/
├── .gitignore
├── package-lock.json
├── package.json
├── services/
│   └── aiService.js                         <-- Misplaced outside src/, unreferenced
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── db.js                            <-- MySQL connection pool
    │   ├── env.js                           <-- Incomplete environment bindings
    │   └── logger.js                        <-- Unused logger utility
    ├── controllers/
    │   └── authController.js                <-- Direct DB access, missing services
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── error.middleware.js
    ├── models/
    │   ├── Game.js                          <-- Mongoose (No controller/route)
    │   ├── GameResult.js                    <-- Mongoose (No controller/route)
    │   ├── Memory.js                        <-- Mongoose (No controller/route)
    │   ├── Reminder.js                      <-- Mongoose (No controller/route)
    │   ├── Score.js                         <-- Mongoose (Duplicate of GameResult)
    │   └── User.js                          <-- Mongoose (MongoDB vs MySQL conflict)
    └── routes/
        └── authRoutes.js
```

### Structural Issues:

#### Issue 1: Misplaced and Orphaned Services Directory
- **FILE:** `Backend/services/aiService.js`
- **LINE:** 1–16
- **PROBLEM:** The `services/` directory is located in the backend root directory rather than within `Backend/src/services/`. Furthermore, `aiService.js` is never imported anywhere in the backend.
- **EXPECTED:** Domain business logic should reside inside `src/services/` (e.g., `src/services/auth.service.js`, `src/services/game.service.js`, `src/services/ai.service.js`) and be invoked by controllers.
- **ACTUAL:** Services folder is outside `src/`, contains only 1 file, and is completely unreferenced.
- **SEVERITY:** HIGH
- **RECOMMENDATION:** Move `services/` into `src/services/`, implement services for all domain models, and wire them to their respective controllers.

#### Issue 2: Complete Absence of Service Layer in Core Flows
- **FILE:** `src/controllers/authController.js`
- **LINE:** 4, 58, 73, 127, 184
- **PROBLEM:** Controllers communicate directly with data models (`User.findOne`, `User.create`, `User.findById`), completely bypassing any service layer abstraction.
- **EXPECTED:** Clear separation of concerns: Route -> Controller -> Service -> Model/Repository -> Response.
- **ACTUAL:** Controller contains inline database queries, hashing logic, and token generation.
- **SEVERITY:** MEDIUM
- **RECOMMENDATION:** Introduce an `auth.service.js` to encapsulate credential validation, password hashing, and user creation.

#### Issue 3: Missing Validation Layer
- **FILE:** `src/controllers/authController.js`
- **LINE:** 42–55, 119–124
- **PROBLEM:** There is no dedicated `validators/` directory, no middleware validation schemas, and no validation library (`joi`, `zod`, or `express-validator`). Validation is handled via rudimentary inline `if` checks in controllers.
- **EXPECTED:** Dedicated validation middleware that validates request headers, params, query, and body before reaching the controller.
- **ACTUAL:** Validation logic is scattered, incomplete, and missing key rules (e.g., email format, role whitelist).
- **SEVERITY:** HIGH
- **RECOMMENDATION:** Add a `src/validators/` directory using a schema validation library and mount validators as route middleware.

#### Issue 4: Missing Test Suite
- **FILE:** `package.json`
- **LINE:** 7
- **PROBLEM:** No `tests/` directory exists. No unit, integration, or contract tests exist.
- **EXPECTED:** Automated test suites in `tests/` or `__tests__/` with test runners like Jest, Mocha, or Supertest.
- **ACTUAL:** Script is `"test": "echo \"Error: no test specified\" && exit 1"`.
- **SEVERITY:** HIGH
- **RECOMMENDATION:** Add test scaffolding with Jest and Supertest to verify routes and business logic in isolation.

#### Issue 5: Unused Logger Utility
- **FILE:** `src/config/logger.js`
- **LINE:** 1–21
- **PROBLEM:** `logger.js` is implemented but never imported or used. The entire application uses raw `console.log` and `console.error`.
- **EXPECTED:** Consistent application-wide logging using a centralized logger utility or middleware.
- **ACTUAL:** The file is dead code.
- **SEVERITY:** LOW
- **RECOMMENDATION:** Import `logger.js` across all controllers, middleware, and startup scripts, or integrate a production logger like Winston/Pino.

---

## 4. Startup Verification

**Command Tested:**
```powershell
node src/server.js
```

**Result:** **FAIL**

### Exact Execution Output:
```text
❌ MySQL connection failed:
Code: ER_ACCESS_DENIED_ERROR
Message: Access denied for user 'root'@'localhost' (using password: NO)
Process exited with code: 1
```

### Root Cause Analysis:
1. In `src/server.js` (lines 2–7), the server executes `await connectDB()` before `app.listen()`.
2. In `src/config/db.js` (lines 15–29), `connectDB` calls `await pool.getConnection()`.
3. Because no valid credentials exist in the environment and MySQL is not configured for unauthenticated `root` access, the driver throws `ER_ACCESS_DENIED_ERROR` (or `ECONNREFUSED` if the daemon is stopped).
4. `src/config/db.js` (line 27) catches the error and executes `process.exit(1)`.
5. The application exits immediately. `app.listen()` is never called.

---

## 5. Endpoint Inventory

Only **5 endpoints** exist in the entire backend code.

### 1. `GET /api/health`
- **Method:** `GET`
- **Path:** `/api/health`
- **Route File:** `src/app.js` (lines 43–48)
- **Controller:** Inline anonymous handler `(req, res) => { res.status(200).json(...) }`
- **Service:** None
- **Database/Model Used:** None
- **Auth Required:** No
- **Validation:** None
- **Expected Request Body:** None
- **Expected Parameters:** None
- **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "NER Cognitive Platform Backend is running"
  }
  ```
- **Error Handling:** None needed (purely in-memory synchronous)
- **Status:** **PASS** (Locally tested and verified)

---

### 2. `POST /api/auth/register`
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Route File:** `src/routes/authRoutes.js` (line 24)
- **Controller:** `src/controllers/authController.js` (lines 32–104) (`register`)
- **Service:** None (Bypassed)
- **Database/Model Used:** `User` (`src/models/User.js` - Mongoose)
- **Auth Required:** No
- **Validation:** Manual inline checks for presence of `name`, `email`, `password`, and `password.length >= 6`.
- **Expected Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string (min 6 chars)",
    "role": "string (optional: patient|caregiver|admin)"
  }
  ```
- **Expected Parameters:** None
- **Expected Response:** `201 Created`
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "string",
    "user": {
      "id": "ObjectId",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **Error Handling:** `try/catch` in controller returns `500` `{ success: false, message: "Registration failed" }`. Does NOT call `next(error)`.
- **Status:** **FAIL**
  - Fails on `jwtExpiresIn` being `undefined` in `generateToken()`.
  - Fails on uninitialized Mongoose database (`User.findOne` buffering timeout).
  - Security flaw: allows arbitrary public `role: "admin"` assignment.

---

### 3. `POST /api/auth/login`
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Route File:** `src/routes/authRoutes.js` (line 27)
- **Controller:** `src/controllers/authController.js` (lines 111–175) (`login`)
- **Service:** None (Bypassed)
- **Database/Model Used:** `User` (`src/models/User.js` - Mongoose)
- **Auth Required:** No
- **Validation:** Manual inline checks for `email` and `password`.
- **Expected Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Expected Parameters:** None
- **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "string",
    "user": {
      "id": "ObjectId",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **Error Handling:** `try/catch` returns `500` `{ success: false, message: "Login failed" }`. Does NOT call `next(error)`.
- **Status:** **FAIL**
  - Fails on `jwtExpiresIn` being `undefined`.
  - Fails on uninitialized Mongoose database.

---

### 4. `GET /api/auth/me`
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Route File:** `src/routes/authRoutes.js` (line 35)
- **Controller:** `src/controllers/authController.js` (lines 182–207) (`getMe`)
- **Service:** None (Bypassed)
- **Database/Model Used:** `User` (`src/models/User.js` - Mongoose)
- **Auth Required:** Yes (`Bearer <token>`)
- **Validation:** Token extracted in `authMiddleware.protect` (lines 14–72).
- **Expected Request Body:** None
- **Expected Parameters:** Header `Authorization: Bearer <token>`
- **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "user": {
      "_id": "ObjectId",
      "name": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Error Handling:** Handled in `protect` (401) and controller `try/catch` (500).
- **Status:** **FAIL**
  - Blocked because token creation is broken.
  - Double database lookup: `protect` (line 44) fetches `User.findById()`, and `getMe` (line 184) queries `User.findById()` a second time.
  - Fails on uninitialized Mongoose database.

---

### 5. `POST /api/auth/logout`
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Route File:** `src/routes/authRoutes.js` (line 38)
- **Controller:** `src/controllers/authController.js` (lines 214–219) (`logout`)
- **Service:** None
- **Database/Model Used:** `User` (inside `protect` middleware)
- **Auth Required:** Yes (`Bearer <token>`)
- **Validation:** None
- **Expected Request Body:** None
- **Expected Parameters:** Header `Authorization: Bearer <token>`
- **Expected Response:** `200 OK`
  ```json
  {
    "success": true,
    "message": "Logout successful. Remove the token from the client."
  }
  ```
- **Error Handling:** Controller returns synchronously. Guarded by `protect`.
- **Status:** **PARTIAL**
  - Route guard functions properly (returns 401 if token is missing).
  - No server-side token revocation or invalidation logic exists.

---

## 6. Authentication Audit

### 1. Registration Flow
- Password hashing is implemented via `bcryptjs.hash(password, 10)` in `authController.js` (line 70) (standard salt rounds).
- Duplicate emails are checked using `User.findOne({ email: email.toLowerCase() })`.
- **Critical Vulnerability:** Privilege Escalation. Line 77: `role: role || 'patient'`. Any client can supply `role: "admin"` in the request body to create an admin user with no authorization checks.

### 2. Login Flow
- User is found by email with password explicitly selected (`.select('+password')`).
- Password comparison uses `bcryptjs.compare(password, user.password)`.
- Valid credentials trigger `generateToken(user._id.toString())`.

### 3. JWT Implementation & Critical Bug
- Token generation function in `authController.js` (lines 15–25):
  ```javascript
  function generateToken(userId) {
    return jwt.sign(
      { id: userId },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  }
  ```
- **Critical Defect:** Line 7 of `authController.js` imports `jwtExpiresIn` from `../config/env`. However, `env.js` **never defines or exports `jwtExpiresIn`**.
- Under `jsonwebtoken` v9, executing `jwt.sign(payload, secret, { expiresIn: undefined })` throws an immediate exception:
  `TypeError: "expiresIn" should be a number of seconds or string representing a timespan`
- This completely breaks both `/register` and `/login`.
- In addition, if `JWT_SECRET` is omitted from the environment, `jwtSecret` is `undefined`, causing another immediate crash.
- Token payload contains only `{ id: userId }`. It does not include the user's role, requiring a database query on every authenticated request.

### 4. Authentication Middleware (`protect`)
- Located in `src/middleware/authMiddleware.js`.
- Correctly inspects `req.headers.authorization` for `Bearer <token>`.
- Returns `401 Unauthorized` `{ success: false, message: 'Not authorized. Token missing.' }` when absent.
- Verifies token via `jwt.verify(token, jwtSecret)`.
- Queries database `User.findById(decoded.id).select('-password')`.
- Attaches the record to `req.user`.

### 5. Authorization & Role Handling (RBAC)
- **Completely Missing:** There is zero role-based access control (RBAC) middleware in the application.
- While the `User` schema defines roles `['patient', 'caregiver', 'admin']`, there are no middleware guards (such as `authorize('admin')` or `requireRole('caregiver')`) to restrict routes to specific roles.

---

## 7. Database Audit

**Status:** **Database integration NOT statically verified.**
*(Actual database connectivity was NOT tested per isolation constraints.)*

### 1. Architectural Technology Contradiction
The backend exhibits an irreconcilable split between two database engines:

| Layer | Technology Configured | File |
|---|---|---|
| Connection Pool | **MySQL** (`mysql2/promise`) | `src/config/db.js` |
| Environment Config | **MySQL** (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`) | `src/config/env.js` |
| Entity Models | **MongoDB / Mongoose** (`mongoose.Schema`, `mongoose.model`) | `src/models/*.js` |
| Controller Queries | **Mongoose ODM Methods** (`User.findOne`, `User.create`) | `src/controllers/authController.js` |

### 2. Missing Mongoose Connection
- All models (`User`, `Game`, `GameResult`, `Memory`, `Reminder`, `Score`) require an active Mongoose connection to MongoDB.
- `mongoose.connect()` is **never called anywhere in the entire codebase**.
- Under Mongoose's default configuration (`bufferCommands: true`), any database call buffers for 10,000ms and then crashes with a timeout:
  `MongooseError: Operation users.findOne() buffering timed out after 10000ms`.

### 3. Orphaned MySQL Connection Pool
- `src/config/db.js` creates a MySQL pool and verifies it on startup via `connectDB()`.
- The exported `pool` is **never imported, referenced, or queried anywhere else in the entire repository**.
- No SQL schema files, table creation scripts, migrations, or seeders exist.

### 4. Schema Duplication
- `src/models/GameResult.js` and `src/models/Score.js` represent the exact same entity (game performance tracking) with slight field variations (`accuracy` vs `maxScore`). This reflects duplicated schema definitions with no clear source of truth.

---

## 8. Controller Audit

### `src/controllers/authController.js`

1. **Line 7:** Imports `jwtExpiresIn` which is `undefined` in `env.js`.
2. **Line 38, 77:** Reads `role` from `req.body` directly:
   ```javascript
   role: role || 'patient'
   ```
   Allows unauthorized elevation to `"admin"`.
3. **Line 58, 128:** Calls `email.toLowerCase()` directly without verifying `email` is a string. If a client submits `{ email: {} }`, it throws an unhandled `TypeError`.
4. **Line 97–103, 167–174, 200–206:** Catch blocks swallow errors and return generic 500 JSON. They do **not** call `next(error)`, preventing the central error middleware from receiving or logging the error.
5. **Line 184:** In `getMe`, calls `await User.findById(req.user.id)` despite `req.user` already being populated by the `protect` middleware. This performs an identical database query twice in a single request.
6. **Line 214–219:** In `logout`, no token invalidation or session termination is performed.
7. **Missing Controllers:** No controllers exist for Games, Game Results, Memories, Reminders, Scores, or Patients.

---

## 9. Service Audit

### `Backend/services/aiService.js`
1. **Misplaced File:** Located in root directory `services/` instead of `src/services/`.
2. **Dead Code:** Never imported, mounted, or called anywhere in the backend.
3. **Trivial Logic:** Contains a mock helper with two naive conditions (`score < 50` and `score >= 80`). It completely omits the required AI/ML features outlined in the project README:
   - Accuracy calculation
   - Response time analysis
   - Hints used
   - Domain-specific scaling (Memory, Attention, Recall)
   - Difficulty level progression (levels 1–5)
4. **Missing Services:** There are zero service files for Auth, Games, Patients, Reminders, Memories, Scores, or Caregiver monitoring.

---

## 10. Validation Audit

### Missing & Deficient Validation:
1. **No Validation Library:** No schema validator (`joi`, `zod`, `express-validator`) is configured.
2. **Missing Email Format Validation:** `authController.js` (line 42) only tests `if (!email)`. Strings such as `"abc"`, `"not-an-email"`, and `"@@@"` pass validation.
3. **Weak Password Rules:** Only validates `password.length >= 6`. Accepts trivial passwords like `"123456"`.
4. **Missing Role Whitelist:** Does not check whether the provided role is in `['patient', 'caregiver']`. Accepts any string, including `"admin"`.
5. **No Input Sanitization:** No trimming, XSS escaping, or type coercion. Non-string inputs can trigger runtime exceptions.
6. **No Validation on Other Models:** Because no routes exist for Games, Reminders, or Memories, none of the fields defined in their schemas have API validation.

---

## 11. Error Handling Audit

### Discovered Setup:
- Centralized error handlers are defined in `src/middleware/error.middleware.js`:
  - `notFound` returns 404 `{ success: false, message: 'Route not found: <url>' }`.
  - `errorMiddleware` returns `statusCode` (default 500) `{ success: false, message: err.message || 'Internal Server Error' }`.
- Mounted in `src/app.js` (lines 64–67) at the bottom of the middleware stack.

### Broken Flow:
1. **Central Error Middleware Is Bypassed:** In `authController.js` (line 97), all errors are trapped in local `catch` blocks and resolved with `res.status(500).json(...)`. The controller never calls `next(error)`. Therefore, the central error middleware is never reached during application errors.
2. **Uncaught Rejection Vulnerability:** In `src/server.js`, there are no process-level event listeners for `unhandledRejection` or `uncaughtException`.
3. **Hard Process Termination on Startup:** In `src/config/db.js` (line 27), database connection errors call `process.exit(1)` immediately, bypassing graceful shutdown.

---

## 12. Security Audit

| Severity | Vulnerability / Finding | Location |
|---|---|---|
| **CRITICAL** | **Privilege Escalation on User Registration**<br>Registration endpoint directly binds `role: role \|\| 'patient'` from `req.body`. Any external user can register as `"admin"`. | `src/controllers/authController.js` (line 77) |
| **CRITICAL** | **Architectural Database Mismatch Denial of Service**<br>The application initializes MySQL on boot but executes queries against an uninitialized MongoDB/Mongoose instance, causing requests to hang and time out. | `src/config/db.js` vs `src/models/User.js` |
| **HIGH** | **Token Generation Crash (`jwtExpiresIn` Undefined)**<br>`jwtExpiresIn` is imported from `env.js` where it is undefined, causing `jwt.sign()` to throw an exception on all login/register attempts. | `src/controllers/authController.js` (line 7) |
| **HIGH** | **Missing Rate Limiting**<br>No rate limiter (`express-rate-limit`) is configured on `/api/auth/login` or `/api/auth/register`, leaving authentication vulnerable to brute force and credential stuffing. | `src/app.js` |
| **HIGH** | **Missing HTTP Security Headers**<br>No security headers middleware (`helmet`) is installed or mounted in `app.js`. | `src/app.js` |
| **HIGH** | **Missing Role-Based Access Control (RBAC)**<br>No authorization middleware exists to restrict routes by role (`patient`, `caregiver`, `admin`). | `src/middleware/authMiddleware.js` |
| **MEDIUM** | **Permissive CORS Configuration**<br>CORS origin defaults to `http://localhost:5173` without credentials validation, allowed headers, or HTTP method restrictions. | `src/app.js` (lines 26–30) |
| **MEDIUM** | **Stateless Logout Without Invalidation**<br>The logout endpoint does not blacklist, revoke, or track issued JWTs. | `src/controllers/authController.js` (line 214) |
| **MEDIUM** | **Type Confusion & Missing Input Validation**<br>Missing email format validation; submitting non-string values causes runtime `TypeErrors`. | `src/controllers/authController.js` (line 58) |
| **LOW** | **Internal Error Leakage in Startup Script**<br>MySQL error codes and messages are logged directly to standard output during startup. | `src/config/db.js` (lines 23–26) |

---

## 13. Environment Configuration

### Status of Environment Files:
- `.env`: Excluded by `.gitignore` (Correct practice; no secrets committed).
- `.env.example`: **MISSING** (No template file provided).

### Environment Variables Audit:

| Variable | Defined in Code? | Documented in Repo? | Used in Code? | Status | Fallback / Default |
|---|---|---|---|---|---|
| `PORT` | Yes (`env.js:5`) | No | Yes (`server.js:9`) | Optional | `5000` |
| `DB_HOST` | Yes (`env.js:8`) | No | Yes (`db.js:5`) | Optional | `"localhost"` |
| `DB_USER` | Yes (`env.js:9`) | No | Yes (`db.js:6`) | Optional | `"root"` |
| `DB_PASSWORD` | Yes (`env.js:10`) | No | Yes (`db.js:7`) | Optional | `""` |
| `DB_NAME` | Yes (`env.js:11`) | No | Yes (`db.js:8`) | Optional | `"dementia_platform"` |
| `DB_PORT` | Yes (`env.js:12`) | No | Yes (`db.js:9`) | Optional | `3306` |
| `JWT_SECRET` | Yes (`env.js:15`) | No | Yes (`authController.js:20`, `authMiddleware.js:40`) | **REQUIRED** | None (Crashes if missing) |
| `CLIENT_URL` | Yes (`app.js:28`) | No | Yes (`app.js:28`) | Optional | `"http://localhost:5173"` |
| `JWT_EXPIRES_IN` | **NO** (Missing in `env.js`) | No | Imported in `authController.js:7` | **MISSING** | None (Causes crash) |
| `MONGO_URI` | **NO** (Not defined anywhere) | No | Required by all models | **MISSING** | None |

---

## 14. Local Test Results

All local tests were executed safely without modifying any source files or connecting to any external services.

| Command Executed | Directory | Exit Code | Observed Output / Behavior |
|---|---|---|---|
| `node -v; npm -v` | Root | 0 | `v24.12.0`, `11.6.2` |
| `Test-Path "node_modules"` | `Backend/` | 0 | `False` (node_modules was initially not installed) |
| `npm install` | `Backend/` | 0 | Added 139 packages, audited 140 packages in 15s. 0 vulnerabilities. |
| `npm test` | `Backend/` | 1 | `"Error: no test specified"` (Script fails by default) |
| `npm start` | `Backend/` | 1 | `npm error Missing script: "start"` |
| `node src/server.js` | `Backend/` | 1 | `❌ MySQL connection failed: Code: ER_ACCESS_DENIED_ERROR, Message: Access denied for user 'root'@'localhost' (using password: NO)`. Process terminated. |
| Isolated Health Check test (`GET /api/health`) | `Backend/` | 0 | `HEALTH_STATUS: 200 {"success":true,"message":"NER Cognitive Platform Backend is running"}` |
| Isolated 404 handler test (`GET /api/nonexistent`) | `Backend/` | 0 | `404_STATUS: 404 {"success":false,"message":"Route not found: /api/nonexistent"}` |
| Isolated Auth Validation test (`POST /api/auth/register` with `{}`) | `Backend/` | 0 | `REGISTER_EMPTY: 400 {"success":false,"message":"Name, email and password are required"}` |
| Isolated Auth Validation test (`POST /api/auth/register` with short password) | `Backend/` | 0 | `REGISTER_SHORT_PASS: 400 {"success":false,"message":"Password must be at least 6 characters"}` |
| Isolated Auth Validation test (`POST /api/auth/login` with `{}`) | `Backend/` | 0 | `LOGIN_EMPTY: 400 {"success":false,"message":"Email and password are required"}` |
| Isolated Auth Guard test (`GET /api/auth/me` with no token) | `Backend/` | 0 | `ME_NO_TOKEN: 401 {"success":false,"message":"Not authorized. Token missing."}` |
| Isolated Auth Guard test (`POST /api/auth/logout` with no token) | `Backend/` | 0 | `LOGOUT_NO_TOKEN: 401 {"success":false,"message":"Not authorized. Token missing."}` |
| Isolated Token Sign test (`jwt.sign(..., { expiresIn: undefined })`) | `Backend/` | 0 | `SIGN_ERROR: "expiresIn" should be a number of seconds or string representing a timespan`. Confirmed fatal crash on token generation. |

---

## 15. Endpoint Test Matrix

| Method | Endpoint | Exists | Route Works | Controller Works | Validation | Auth Guard | Service Layer | DB Layer | Local Test Result | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET` | `/api/health` | Yes | PASS | PASS | N/A | N/A | None | None | 200 OK | **PASS** |
| `POST` | `/api/auth/register` | Yes | PASS | FAIL | PARTIAL | N/A | None (Bypassed) | FAIL (Mongoose disconnected) | 400 on empty body; crashes on JWT/DB | **FAIL** |
| `POST` | `/api/auth/login` | Yes | PASS | FAIL | PARTIAL | N/A | None (Bypassed) | FAIL (Mongoose disconnected) | 400 on empty body; crashes on JWT/DB | **FAIL** |
| `GET` | `/api/auth/me` | Yes | PASS | PARTIAL | PASS | FAIL (DB verification hangs) | None (Bypassed) | FAIL (Mongoose disconnected) | 401 on missing token; blocked by DB | **FAIL** |
| `POST` | `/api/auth/logout` | Yes | PASS | PASS | PASS | FAIL (DB verification hangs) | None (Bypassed) | FAIL (Mongoose disconnected) | 401 on missing token | **PARTIAL** |
| `GET/POST` | `/api/games/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/game-results/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/memories/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/reminders/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/scores/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/patients/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/caregivers/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/voice/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |
| `GET/POST` | `/api/ai/*` | **No** | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | Endpoint does not exist | **FAIL (Missing)** |

---

## 16. Broken Dependency Chains

1. **Broken Startup Sequence:**
   `server.js` ➔ `connectDB()` (`src/config/db.js`) ➔ `mysql2 pool.getConnection()` ➔ **FATAL: Unauthenticated connection fails and triggers `process.exit(1)`**.
2. **Broken Token Signing Chain:**
   `authController.js` (lines 15–25) ➔ `generateToken()` ➔ requires `jwtExpiresIn` from `src/config/env.js` ➔ **FATAL: Export missing; `undefined` passed to `jwt.sign()` crashes runtime**.
3. **Broken Database Integration Chain:**
   `authController.js` ➔ calls `User.findOne()` (`src/models/User.js`) ➔ **FATAL: Mongoose connection was never initialized via `mongoose.connect()`; query hangs and times out**.
4. **Bypassed Error Middleware Chain:**
   `authController.js` (lines 97–103) ➔ `catch (error)` returns `res.status(500)` directly ➔ **BROKEN: Never calls `next(error)`; `error.middleware.js` is dead code**.
5. **Orphaned Service Chain:**
   `Backend/services/aiService.js` ➔ exports `generateRecommendation` ➔ **BROKEN: Zero controllers or routes import this service**.
6. **Orphaned Models Chain:**
   Models `Game.js`, `GameResult.js`, `Memory.js`, `Reminder.js`, `Score.js` ➔ **BROKEN: Zero routes or controllers reference these models**.

---

## 17. Critical Findings

1. **Conflicting Database Engines:** The code mixes a MySQL driver (`mysql2`) on startup with MongoDB ORM models (`mongoose`) in controllers, with no active connection to MongoDB and no SQL queries for MySQL.
2. **Missing `jwtExpiresIn` Export:** Breaks all token generation in `register` and `login`, causing unhandled 500 errors.
3. **Privilege Escalation on Registration:** Directly setting `role: req.body.role || 'patient'` allows public users to create admin accounts.
4. **Missing Features (85%+):** Only authentication and health routes exist. None of the core hackathon requirements (Games, Scores, Reminders, Memories, Adaptive Difficulty, Voice) are implemented in the API layer.
5. **No `start` or `dev` Scripts in `package.json`:** Standard npm startup commands (`npm start`, `npm run dev`) fail immediately. `package.json` points to a non-existent `index.js`.
6. **Hard Crash on Boot:** Without an active MySQL instance matching the hardcoded default credentials, the backend cannot boot.

---

## 18. Recommended Fix Order

When development begins, fixes should be executed in this exact sequence:

1. **Resolve Database Engine Decision:**
   - Decide definitively between **MySQL** or **MongoDB**.
   - If **MongoDB**: Replace `src/config/db.js` with `mongoose.connect(process.env.MONGO_URI)`, remove `mysql2` from `package.json`, and retain Mongoose models.
   - If **MySQL**: Replace Mongoose models in `src/models/` with an SQL ORM (Sequelize, Prisma) or write SQL table schemas/migrations, and remove `mongoose`.
2. **Fix `package.json` Scripts & Entry Point:**
   - Update `"main": "src/server.js"`.
   - Add scripts: `"start": "node src/server.js"`, `"dev": "nodemon src/server.js"`.
3. **Fix Environment Export & JWT Bug:**
   - In `src/config/env.js`, define and export `jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'`.
   - Provide a safe fallback or error check for `jwtSecret`.
   - Add `.env.example` documenting all required variables.
4. **Fix Privilege Escalation & Validation:**
   - In `src/controllers/authController.js` (line 77), sanitize `role`: force default to `'patient'` or allow only `['patient', 'caregiver']`, prohibiting public `'admin'` registration.
   - Implement regex/library validation for email format and password strength.
5. **Connect Error Middleware:**
   - Update controller `catch` blocks to forward unexpected errors via `next(error)` so that `error.middleware.js` can log and format them consistently.
6. **Restructure and Implement Services:**
   - Move `services/` into `src/services/`.
   - Implement `auth.service.js` and extract business logic from `authController.js`.
7. **Implement Missing Domain Routes & Controllers:**
   - Build routes and controllers for `Game`, `GameResult`, `Memory`, and `Reminder` using the existing schemas in `src/models/`.
   - Consolidate `Score.js` and `GameResult.js` to eliminate schema duplication.
8. **Add Security Middleware:**
   - Install and mount `helmet` for security headers.
   - Install and mount `express-rate-limit` on auth endpoints.
   - Implement role-based authorization middleware (e.g., `protect`, `authorize('caregiver', 'admin')`).
9. **Clean Up Dead Code:**
   - Integrate `src/config/logger.js` or remove it.
   - Remove redundant `User.findById` query inside `getMe`.
10. **Documentation & Testing:**
    - Create a dedicated `Backend/README.md` documenting installation, setup, and endpoints.
    - Set up Jest + Supertest for automated API testing.

---

## 19. What Is Confirmed Working

The following behaviors were verified through isolated local execution:
- `npm install` installs all declared dependencies cleanly with 0 npm audit vulnerabilities.
- `src/app.js` can be imported and initialized by Express 5 in memory without throwing syntax or import errors.
- `GET /api/health` returns `200 OK` with `{ "success": true, "message": "NER Cognitive Platform Backend is running" }`.
- Unknown endpoints trigger the `notFound` middleware and return `404 Not Found` with `{ "success": false, "message": "Route not found: ..." }`.
- Missing fields in `POST /api/auth/register` correctly trigger `400 Bad Request` `{ "success": false, "message": "Name, email and password are required" }`.
- Passwords shorter than 6 characters in `POST /api/auth/register` correctly trigger `400 Bad Request` `{ "success": false, "message": "Password must be at least 6 characters" }`.
- Missing fields in `POST /api/auth/login` correctly trigger `400 Bad Request` `{ "success": false, "message": "Email and password are required" }`.
- Requests to `GET /api/auth/me` and `POST /api/auth/logout` without an `Authorization: Bearer <token>` header are rejected by `authMiddleware.protect` with `401 Unauthorized` `{ "success": false, "message": "Not authorized. Token missing." }`.
- CORS middleware is active and correctly accepts headers.

---

## 20. What Could NOT Be Verified

The following components could not be verified because external services and dependencies are intentionally isolated per audit guidelines:

- **MySQL Database Connectivity & Performance:** Live connection to local or remote MySQL/Aiven instances was not attempted; credentials and network connections were not tested.
- **MongoDB / Database Queries:** End-to-end user creation, password verification, and user lookup could not be executed because no MongoDB database instance was connected.
- **Adaptive Difficulty / ML Engine:** Python ML models, difficulty calculation algorithms, and recommendation services are not connected or integrated into this backend.
- **Voice Assistant API:** Speech-to-text, intent recognition, and audio stream handling have no backend implementations or external integrations to test.
- **Frontend / Client Integration:** Interaction with the Vite/React frontend dashboard was not executed.

---

## Conclusion

The backend is **internally incoherent and not ready for integration**. The foundational Express app shell and auth validation guards work in isolation, but the application cannot boot due to mandatory MySQL checks on startup, cannot issue tokens due to a missing environment export bug, cannot query data due to uninitialized Mongoose models, and lacks over 85% of the endpoints required by the SIH26003 specification. Following the [Recommended Fix Order](#18-recommended-fix-order) will resolve these architectural defects and prepare the backend for eventual integration.
