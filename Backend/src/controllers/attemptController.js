const crypto = require('crypto');
const { pool } = require('../config/db');
const { mlAdaptiveUrl, nodeEnv } = require('../config/env');

// Helper to sanitize difficulty strictly within [1, 5]
function clampDifficulty(diff) {
  const num = Number(diff);
  if (isNaN(num) || !Number.isFinite(num)) return 2;
  return Math.min(5, Math.max(1, Math.round(num)));
}

// SUBMIT GAMEPLAY ATTEMPT & TELEMETRY
async function submitAttempt(req, res) {
  try {
    const body = req.body || {};
    const user = req.user;

    const sessionId = String(body.sessionId || `ses_${Date.now()}`).trim().slice(0, 100);
    const gameId = String(body.gameId || 'memory-match').trim().slice(0, 50);

    // Authoritative patient resolution
    let patientId = user?.patientId || 'GUEST';

    // Verify session in database if it exists
    const [sesCheck] = await pool.query(
      'SELECT session_id, patient_id, current_difficulty FROM game_sessions WHERE session_id = ?',
      [sessionId]
    );

    if (sesCheck.length > 0) {
      const sessionRecord = sesCheck[0];
      // Anti-impersonation: if session belongs to a real patient, verify the caller matches
      if (sessionRecord.patient_id !== 'GUEST' && user?.patientId && sessionRecord.patient_id !== user.patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot submit telemetry for another patient session.'
        });
      }
      patientId = sessionRecord.patient_id;
    }

    const currentDifficulty = clampDifficulty(body.current_difficulty || body.difficulty || 2);

    // Normalize accuracy: scale to 0.0 - 1.0
    let rawAcc = Number(body.accuracy);
    if (isNaN(rawAcc) || !Number.isFinite(rawAcc)) rawAcc = 0.8;
    if (rawAcc > 1.0) rawAcc = rawAcc / 100;
    const accuracy = Math.min(1.0, Math.max(0.0, rawAcc));

    const responseTime = Math.max(0.1, Number(body.response_time) || 3.0);
    const attempts = Math.max(1, parseInt(body.attempts, 10) || 1);
    const hintsUsed = Math.max(0, parseInt(body.hints_used, 10) || 0);

    let recentAcc = Number(body.recent_accuracy);
    if (isNaN(recentAcc) || !Number.isFinite(recentAcc)) recentAcc = accuracy;
    if (recentAcc > 1.0) recentAcc = recentAcc / 100;
    const recentAccuracy = Math.min(1.0, Math.max(0.0, recentAcc));

    const recentResponseTime = Math.max(0.1, Number(body.recent_response_time) || responseTime);
    const accuracyTrend = Number.isFinite(Number(body.accuracy_trend)) ? Number(body.accuracy_trend) : 0.0;
    const responseTimeTrend = Number.isFinite(Number(body.response_time_trend)) ? Number(body.response_time_trend) : 0.0;
    const consecutiveSuccesses = Math.max(0, parseInt(body.consecutive_successes, 10) || 1);

    const gameType = String(body.game_type || (gameId === 'attention-test' ? 'attention' : 'memory')).slice(0, 50);
    const cognitiveDomain = String(body.cognitive_domain || (gameId === 'attention-test' ? 'attention' : 'memory')).slice(0, 50);

    // Prepare strictly validated payload for Python Random Forest
    const mlPayload = {
      game_type: gameType,
      cognitive_domain: cognitiveDomain,
      current_difficulty: currentDifficulty,
      accuracy: accuracy,
      response_time: responseTime,
      attempts: attempts,
      hints_used: hintsUsed,
      recent_accuracy: recentAccuracy,
      recent_response_time: recentResponseTime,
      accuracy_trend: accuracyTrend,
      response_time_trend: responseTimeTrend,
      consecutive_successes: consecutiveSuccesses
    };

    // Invoke Python ML Service with timeout and safe fallback
    let nextDifficulty = currentDifficulty;
    let confidence = null;
    let predictionSource = 'fallback';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const mlRes = await fetch(`${mlAdaptiveUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (mlRes.ok) {
        const mlData = await mlRes.json();
        if (typeof mlData.next_difficulty === 'number' && Number.isFinite(mlData.next_difficulty)) {
          nextDifficulty = clampDifficulty(mlData.next_difficulty);
          confidence = typeof mlData.confidence === 'number' ? mlData.confidence : null;
          predictionSource = 'ml';
        }
      } else {
        if (nodeEnv !== 'test') console.warn(`[Adaptive ML] Returned HTTP ${mlRes.status}. Using fallback.`);
      }
    } catch (mlErr) {
      if (nodeEnv !== 'test') console.warn(`[Adaptive ML] Service unavailable (${mlErr.message}). Fallback to current difficulty.`);
    }

    const attemptId = `att_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const score = Math.round(accuracy * 100);
    const timeTakenSeconds = Math.round(responseTime * attempts) || 30;

    // Ensure session exists in game_sessions
    try {
      if (sesCheck.length === 0) {
        await pool.query(
          `INSERT INTO game_sessions (session_id, patient_id, game_id, starting_difficulty, current_difficulty, status, started_at)
           VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
          [sessionId, patientId, gameId, currentDifficulty, currentDifficulty]
        );
      }
    } catch (sesErr) {
      if (nodeEnv !== 'test') console.warn('[DB Session Ensure] Warning:', sesErr.message);
    }

    // Record in game_attempts table
    try {
      await pool.query(
        `INSERT INTO game_attempts (id, session_id, patient_id, game_id, round_number, difficulty, accuracy, response_time, hints_used, is_correct, telemetry, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          attemptId,
          sessionId,
          patientId,
          gameId,
          1,
          currentDifficulty,
          accuracy,
          responseTime,
          hintsUsed,
          accuracy >= 0.5 ? 1 : 0,
          JSON.stringify(mlPayload)
        ]
      );
    } catch (dbErr) {
      if (nodeEnv !== 'test') console.warn('[DB Attempt Insert] Non-fatal logging error:', dbErr.message);
    }

    // Record in game_results table
    const resultId = `res_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    try {
      const summaryText = score >= 80 ? 'High accuracy recorded.' : 'Consistent practice recorded.';
      await pool.query(
        `INSERT INTO game_results (id, session_id, patient_id, game_id, game_type, cognitive_domain, difficulty, score, max_score, accuracy, time_taken_seconds, total_questions, correct_answers, next_difficulty, confidence, prediction_source, status, summary, played_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 100, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, NOW())`,
        [
          resultId,
          sessionId,
          patientId,
          gameId,
          gameType,
          cognitiveDomain,
          currentDifficulty,
          score,
          score,
          timeTakenSeconds,
          attempts,
          Math.round(accuracy * attempts),
          nextDifficulty,
          confidence,
          predictionSource,
          summaryText
        ]
      );

      // Update session status
      await pool.query(
        `UPDATE game_sessions SET status = 'completed', current_difficulty = ?, completed_at = NOW() WHERE session_id = ?`,
        [nextDifficulty, sessionId]
      );
    } catch (dbErr) {
      if (nodeEnv !== 'test') console.warn('[DB Result Insert] Non-fatal logging error:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      attemptId,
      resultId,
      sessionId,
      gameId,
      score,
      accuracy: score,
      timeTaken: `${timeTakenSeconds}s`,
      next_difficulty: nextDifficulty,
      nextDifficulty: nextDifficulty,
      confidence,
      source: predictionSource,
      telemetry: mlPayload
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('submitAttempt error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to record gameplay attempt'
    });
  }
}

module.exports = {
  submitAttempt
};
