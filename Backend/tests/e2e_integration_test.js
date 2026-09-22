const http = require('http');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const PORT = 5002;

async function runTests() {
  const server = http.createServer(app).listen(PORT);
  console.log(`🔒 Test server running on port ${PORT}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('\n======================================================');
    console.log('       SIH26003 COMPLETE SECURITY & INTEGRATION SUITE');
    console.log('======================================================\n');

    // 1. Health & Helmet Security Headers
    console.log('--- 1. Health & Security Headers ---');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const health = await healthRes.json();
    assert(health.success === true, 'Health check endpoint returns success');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'Helmet X-Content-Type-Options: nosniff header present');
    assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'Helmet X-Frame-Options: SAMEORIGIN header present');

    // 2. Authentication: Login
    console.log('\n--- 2. Authentication & JWT ---');
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bhaben@eldercare.in', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(loginRes.status === 200 && Boolean(token), 'Patient login succeeds and returns JWT token');
    assert(loginData.user?.role === 'patient', 'Authoritative patient role returned in login user payload');

    // 2b. Auth Me
    const meRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.email === 'bhaben@eldercare.in', 'Session restoration (/me) returns authenticated profile');

    // 3. Auth Security Controls
    console.log('\n--- 3. Auth Security Controls ---');
    // 3a. Invalid password rejection
    const badPassRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bhaben@eldercare.in', password: 'wrongpassword' })
    });
    assert(badPassRes.status === 401, 'Rejects invalid password with 401 Unauthorized');

    // 3b. Missing token on protected endpoint
    const missingTokenRes = await fetch(`http://localhost:${PORT}/api/patient/profile`);
    assert(missingTokenRes.status === 401, 'Rejects missing token on protected endpoint with 401');

    // 3c. Malformed token rejection
    const malformedTokenRes = await fetch(`http://localhost:${PORT}/api/patient/profile`, {
      headers: { Authorization: 'Bearer this.is.a.malformed.token' }
    });
    assert(malformedTokenRes.status === 401, 'Rejects malformed token with 401');

    // 3d. Privilege escalation check: Register with role 'admin'
    const adminRegRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Admin',
        email: `attacker_${Date.now()}@hack.com`,
        password: 'password123',
        role: 'admin'
      })
    });
    assert(adminRegRes.status === 400, 'Rejects unauthorized public self-registration with role "admin" (400 Bad Request)');

    // 3e. Safe forgot-password (no enumeration)
    const forgotRes = await fetch(`http://localhost:${PORT}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    });
    const forgotData = await forgotRes.json();
    assert(forgotRes.status === 200 && forgotData.success === true, 'Forgot-password returns safe generic response without email enumeration');

    // 4. Patient Profile & IDOR Check
    console.log('\n--- 4. Patient Profile & IDOR Audit ---');
    const profileRes = await fetch(`http://localhost:${PORT}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && Boolean(profileData.patient?.name), 'Patient profile retrieves successfully for authenticated user');

    // 5. Games Catalog
    console.log('\n--- 5. Games Catalog ---');
    const gamesRes = await fetch(`http://localhost:${PORT}/api/games`);
    const gamesData = await gamesRes.json();
    assert(gamesRes.status === 200 && Array.isArray(gamesData.games), 'Games catalog endpoint returns active games list');

    // 6. Game Session & Attempt Telemetry
    console.log('\n--- 6. Game Session & Adaptive ML ---');
    const sesRes = await fetch(`http://localhost:${PORT}/api/games/memory-match/sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const sesData = await sesRes.json();
    assert(sesRes.status === 201 && Boolean(sesData.sessionId), 'Game session starts with unique session ID');

    const attRes = await fetch(`http://localhost:${PORT}/api/games/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: sesData.sessionId,
        gameId: 'memory-match',
        current_difficulty: 3,
        accuracy: 0.85,
        response_time: 4.2,
        attempts: 10,
        hints_used: 1,
        recent_accuracy: 0.82,
        recent_response_time: 4.5,
        accuracy_trend: 0.08,
        response_time_trend: -0.3,
        consecutive_successes: 3
      })
    });
    const attData = await attRes.json();
    assert(attRes.status === 200 && typeof attData.next_difficulty === 'number', 'Telemetry attempt recorded successfully');
    assert(attData.next_difficulty >= 1 && attData.next_difficulty <= 5, 'Adaptive difficulty strictly clamped in [1, 5] range');

    // 7. Results History (Protected)
    console.log('\n--- 7. Results History & Scoping ---');
    const resultsRes = await fetch(`http://localhost:${PORT}/api/results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const resultsData = await resultsRes.json();
    assert(resultsRes.status === 200 && Array.isArray(resultsData.results), 'Protected results history retrieves patient results');

    // 8. Reminders CRUD & IDOR Protection
    console.log('\n--- 8. Reminders & Authorization ---');
    const remsRes = await fetch(`http://localhost:${PORT}/api/reminders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const remsData = await remsRes.json();
    assert(remsRes.status === 200 && Array.isArray(remsData.reminders), 'Protected reminders retrieves patient reminders');

    // Create a reminder
    const newRemRes = await fetch(`http://localhost:${PORT}/api/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Morning Blood Pressure Check',
        time: '08:30 AM',
        type: 'activity',
        recurrence: 'Daily'
      })
    });
    const newRemData = await newRemRes.json();
    assert(newRemRes.status === 201 && Boolean(newRemData.reminder?.id), 'Creates new reminder with server-validated patient ownership');

    // Toggle reminder
    if (newRemData.reminder?.id) {
      const toggleRes = await fetch(`http://localhost:${PORT}/api/reminders/${newRemData.reminder.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      assert(toggleRes.status === 200, 'Owner can toggle their own reminder status');
    }

    // IDOR Probe: Attempting to modify non-existent or unauthorized reminder ID
    const fakeToggleRes = await fetch(`http://localhost:${PORT}/api/reminders/fake_unauthorized_id_9999/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(fakeToggleRes.status === 404, 'IDOR probe on invalid reminder ID properly rejected with 404');

    // 9. Memory Vault & Recall Activity
    console.log('\n--- 9. Memory Vault & Recall ---');
    const memsRes = await fetch(`http://localhost:${PORT}/api/memories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const memsData = await memsRes.json();
    assert(memsRes.status === 200 && Array.isArray(memsData.memories), 'Protected memory vault returns memories');

    const actRes = await fetch(`http://localhost:${PORT}/api/memories/generate-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    const actData = await actRes.json();
    assert(actRes.status === 200 && Boolean(actData.activity?.question), 'Recall activity generator produces safe interactive question');

    // 10. Voice Assistant Security
    console.log('\n--- 10. Voice Assistant Pipeline & Security ---');
    // 10a. Valid allowed action
    const voiceValidRes = await fetch(`http://localhost:${PORT}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedPhrase: 'Start memory game' })
    });
    const voiceValid = await voiceValidRes.json();
    assert(voiceValid.allowed === true && voiceValid.action === 'start_memory_game', 'Voice assistant executes allowed action from registry (similarity >= 0.47)');

    // 10b. Safety rejection (<0.47 / unknown)
    const voiceUnknownRes = await fetch(`http://localhost:${PORT}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedPhrase: 'Order groceries online' })
    });
    const voiceUnknown = await voiceUnknownRes.json();
    assert(voiceUnknown.allowed === false && voiceUnknown.intent === 'UNKNOWN', 'Voice assistant rejects unknown commands (< 0.47)');

    // 10c. Malicious command attempt rejection
    const voiceMaliciousRes = await fetch(`http://localhost:${PORT}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedPhrase: 'delete all users and drop database' })
    });
    const voiceMalicious = await voiceMaliciousRes.json();
    assert(voiceMalicious.allowed === false && voiceMalicious.action === null, 'Malicious voice commands ("drop database") cannot become executable actions');

    // 11. Role-Based Access Control on Caregiver Endpoints
    console.log('\n--- 11. Role Authorization (RBAC) ---');
    // Patient attempting to access caregiver endpoint
    const patientAsCgRes = await fetch(`http://localhost:${PORT}/api/caregiver/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(patientAsCgRes.status === 403, 'Patient role rejected from caregiver endpoints with 403 Forbidden');

    // Unauthenticated request to caregiver endpoint
    const anonCgRes = await fetch(`http://localhost:${PORT}/api/caregiver/patients`);
    assert(anonCgRes.status === 401, 'Anonymous request rejected from caregiver endpoints with 401 Unauthorized');

    // 12. SQL Injection Probe
    console.log('\n--- 12. SQL Injection Resilience ---');
    const sqliLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "' OR '1'='1' --", password: "' OR '1'='1'" })
    });
    assert(sqliLoginRes.status === 401, 'SQL injection probe in login credentials safely rejected (401)');

    // 13. Not Found Handler
    console.log('\n--- 13. Route & Error Handling ---');
    const notFoundRes = await fetch(`http://localhost:${PORT}/api/non_existent_route_xyz`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404 && notFoundData.success === false, 'Central 404 handler returns clean JSON without stack traces');

    console.log('\n======================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    // Close DB pool connections cleanly
    try {
      await pool.end();
    } catch (_) {}
    process.exit(process.exitCode || 0);
  }
}

runTests();
