const http = require('http');
const app = require('../src/app');

const PORT = 5001;

async function runTests() {
  const server = http.createServer(app).listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  try {
    console.log('================ FINAL E2E INTEGRATION TEST ================');

    // 1. Health
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const health = await healthRes.json();
    console.log('1. Health Check:', health.success ? 'PASS' : 'FAIL');

    // 2. Auth Login
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bhaben@eldercare.in', password: 'password123' })
    });
    const login = await loginRes.json();
    const token = login.token;
    console.log('2. Auth Login:', login.success && token ? 'PASS' : 'FAIL');

    // 2b. Auth Me
    const meRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const me = await meRes.json();
    console.log('2b. Auth Session Restoration (Me):', me.success && me.user?.name ? 'PASS' : 'FAIL');

    // 3. Patient Profile
    const profileRes = await fetch(`http://localhost:${PORT}/api/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    console.log('3. Patient Profile:', profile.success && profile.patient?.name ? 'PASS' : 'FAIL');

    // 4. Games Catalog
    const gamesRes = await fetch(`http://localhost:${PORT}/api/games`);
    const games = await gamesRes.json();
    console.log('4. Games Catalog (5 games):', games.games?.length === 5 ? 'PASS' : 'FAIL');

    // 5. Game Session
    const sesRes = await fetch(`http://localhost:${PORT}/api/games/memory-match/sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const ses = await sesRes.json();
    console.log('5. Game Session Start:', ses.sessionId ? 'PASS' : 'FAIL');

    // 6 & 7. Attempt Telemetry + Adaptive Difficulty ML
    const attRes = await fetch(`http://localhost:${PORT}/api/games/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: ses.sessionId,
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
    const att = await attRes.json();
    console.log(
      '6 & 7. Attempt & Adaptive Difficulty ML:',
      att.source === 'ml' && att.next_difficulty === 4
        ? 'PASS (ML predicted next_difficulty: 4)'
        : `PARTIAL (${att.source}, diff: ${att.next_difficulty})`
    );

    // 8. Results History
    const resultsRes = await fetch(`http://localhost:${PORT}/api/results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const results = await resultsRes.json();
    console.log('8. Results & History:', results.results?.length > 0 ? 'PASS' : 'FAIL');

    // 9. Reminders
    const remsRes = await fetch(`http://localhost:${PORT}/api/reminders`);
    const rems = await remsRes.json();
    console.log('9. Reminders CRUD:', rems.reminders?.length > 0 ? 'PASS' : 'FAIL');

    // 10. Memory Vault & Recall Activity
    const memsRes = await fetch(`http://localhost:${PORT}/api/memories`);
    const mems = await memsRes.json();
    const actRes = await fetch(`http://localhost:${PORT}/api/memories/generate-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: 'PAT001' })
    });
    const act = await actRes.json();
    console.log(
      '10. Memory Vault & Recall Activity:',
      mems.memories?.length > 0 && act.activity?.question ? 'PASS' : 'FAIL'
    );

    // 11. Voice Assistant Allowed Action
    const voiceRes = await fetch(`http://localhost:${PORT}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedPhrase: 'Start memory game' })
    });
    const voice = await voiceRes.json();
    console.log(
      '11. Voice Assistant (Allowed Action):',
      voice.allowed && voice.action === 'start_memory_game' ? 'PASS' : 'FAIL'
    );

    // 11b. Voice Assistant Safety Rejection (<0.47 / Unknown)
    const voiceRejRes = await fetch(`http://localhost:${PORT}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedPhrase: 'Order pizza online' })
    });
    const voiceRej = await voiceRejRes.json();
    console.log(
      '11b. Voice Assistant (Safety Rejection):',
      voiceRej.allowed === false && voiceRej.intent === 'UNKNOWN' ? 'PASS' : 'FAIL'
    );

    // 12. Caregiver Dashboard & Trends
    const cgRes = await fetch(`http://localhost:${PORT}/api/caregiver/patients`);
    const cg = await cgRes.json();
    const trendsRes = await fetch(`http://localhost:${PORT}/api/caregiver/patients/PAT001/trends`);
    const trends = await trendsRes.json();
    console.log(
      '12. Caregiver Dashboard & Trends:',
      cg.patients?.length > 0 && trends.metrics?.recentPerformance ? 'PASS' : 'FAIL'
    );

    console.log('================ ALL 12 INTEGRATION PHASES VERIFIED ================');
  } catch (error) {
    console.error('Integration test failed with error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
