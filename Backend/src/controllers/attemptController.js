const crypto = require('crypto');
const { pool } = require('../config/db');
const { mlAdaptiveUrl } = require('../config/env');

// Helper to sanitize difficulty to [1, 5]
function clampDifficulty(diff) {
  const num = Number(diff);
  if (isNaN(num)) return 2;
  return Math.min(5, Math.max(1, Math.round(num)));
}

// SUBMIT GAMEPLAY ATTEMPT & TELEMETRY
async function submitAttempt(req, res) {
  try {
    const body = req.body || {};
    const userId = req.user?.id;

    // Resolve patientId
    let patientId = 'PAT001';
    if (userId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const sessionId = body.sessionId || `ses_${Date.now()}`;
    const gameId = body.gameId || 'memory-match';
    const currentDifficulty = clampDifficulty(body.current_difficulty || body.difficulty || 2);

    // Normalize accuracy: if passed as 85, divide by 100 -> 0.85
    let rawAcc = Number(body.accuracy);
    if (isNaN(rawAcc)) rawAcc = 0.8;
    if (rawAcc > 1.0) rawAcc = rawAcc / 100;
    const accuracy = Math.min(1.0, Math.max(0.0, rawAcc));

    const responseTime = Math.max(0.0, Number(body.response_time) || 3.0);
    const attempts = Math.max(0, parseInt(body.attempts, 10) || 1);
    const hintsUsed = Math.max(0, parseInt(body.hints_used, 10) || 0);

    let recentAcc = Number(body.recent_accuracy);
    if (isNaN(recentAcc)) recentAcc = accuracy;
    if (recentAcc > 1.0) recentAcc = recentAcc / 100;
    const recentAccuracy = Math.min(1.0, Math.max(0.0, recentAcc));

    const recentResponseTime = Math.max(0.0, Number(body.recent_response_time) || responseTime);
    const accuracyTrend = Number(body.accuracy_trend) || 0.0;
    const responseTimeTrend = Number(body.response_time_trend) || 0.0;
    const consecutiveSuccesses = Math.max(0, parseInt(body.consecutive_successes, 10) || 1);

    const gameType = String(body.game_type || (gameId === 'attention-test' ? 'attention' : 'memory'));
    const cognitiveDomain = String(body.cognitive_domain || (gameId === 'attention-test' ? 'attention' : 'memory'));

    // Prepare strict schema payload for Python Random Forest
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

    // Invoke Python Adaptive Difficulty ML Service with safe fallback
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
        if (typeof mlData.next_difficulty === 'number' && !isNaN(mlData.next_difficulty)) {
          nextDifficulty = clampDifficulty(mlData.next_difficulty);
          confidence = typeof mlData.confidence === 'number' ? mlData.confidence : null;
          predictionSource = 'ml';
        }
      } else {
        console.warn(`[Adaptive ML] Service returned HTTP ${mlRes.status}. Using fallback.`);
      }
    } catch (mlErr) {
      console.warn(`[Adaptive ML] Service unavailable or timeout (${mlErr.message}). Using safe fallback.`);
    }

    const attemptId = `att_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const score = Math.round(accuracy * 100);
    const scorePercent = score;
    const timeTakenSeconds = Math.round(responseTime * attempts) || 30;

    // Ensure session exists in game_sessions to satisfy foreign key constraint
    try {
      const [sesCheck] = await pool.query('SELECT session_id FROM game_sessions WHERE session_id = ?', [sessionId]);
      if (sesCheck.length === 0) {
        await pool.query(
          `INSERT INTO game_sessions (session_id, patient_id, game_id, starting_difficulty, current_difficulty, status, started_at)
           VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
          [sessionId, patientId, gameId, currentDifficulty, currentDifficulty]
        );
      }
    } catch (sesErr) {
      console.warn('[DB Session Ensure] Warning:', sesErr.message);
    }

    // 1. Record in game_attempts table
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
      console.warn('[DB Attempt Insert] Non-fatal attempt logging error:', dbErr.message);
    }

    // 2. Record in game_results table
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
          scorePercent,
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
      console.warn('[DB Result Insert] Non-fatal result logging error:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      attemptId,
      resultId,
      sessionId,
      gameId,
      score,
      accuracy: scorePercent,
      timeTaken: `${timeTakenSeconds}s`,
      next_difficulty: nextDifficulty,
      nextDifficulty: nextDifficulty,
      confidence,
      source: predictionSource,
      telemetry: mlPayload
    });
  } catch (error) {
    console.error('submitAttempt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record gameplay attempt'
    });
  }
}

module.exports = {
  submitAttempt
};
