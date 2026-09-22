const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

// GET AGGREGATED DASHBOARD SUMMARY (SCOPED AUTHORITATIVELY TO AUTHENTICATED USER)
async function getSummary(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const patientId = user.patientId;
    const patientName = user.name || 'Senior Participant';

    if (!patientId) {
      return res.status(200).json({
        success: true,
        summary: {
          patientName,
          recommendedGame: null,
          pendingRemindersCount: 0,
          recentGameResults: [],
          cognitiveAdherenceRate: 100
        }
      });
    }

    // 1. Fetch recommended game
    const [gameRows] = await pool.query(
      `SELECT id, title, cognitive_domain as domain, difficulty, description, estimated_time as estimatedTime
       FROM games WHERE is_active = 1 LIMIT 1`
    );
    const recommendedGame = gameRows.length > 0 ? gameRows[0] : null;

    // 2. Fetch pending reminders count scoped to this patient
    const [remRows] = await pool.query(
      `SELECT COUNT(*) as count FROM reminders
       WHERE patient_id = ? AND is_enabled = 1 AND status != 'completed'`,
      [patientId]
    );
    const pendingRemindersCount = remRows[0]?.count || 0;

    // 3. Fetch recent results scoped to this patient
    const [resultsRows] = await pool.query(
      `SELECT r.id, r.game_id as gameId, g.title as gameTitle, r.score, r.accuracy,
              CONCAT(r.time_taken_seconds, 's') as timeTaken,
              CONCAT(ROUND(r.time_taken_seconds / GREATEST(r.total_questions, 1), 1), 's') as averageResponseTime,
              r.played_at as completedAt
       FROM game_results r
       LEFT JOIN games g ON r.game_id = g.id
       WHERE r.patient_id = ?
       ORDER BY r.played_at DESC
       LIMIT 3`,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      summary: {
        patientName,
        recommendedGame,
        pendingRemindersCount,
        recentGameResults: resultsRows,
        cognitiveAdherenceRate: 90
      }
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getSummary error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary'
    });
  }
}

module.exports = {
  getSummary
};
