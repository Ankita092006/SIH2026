const { pool } = require('../config/db');

// GET AGGREGATED DASHBOARD SUMMARY
async function getSummary(req, res) {
  try {
    const userId = req.user?.id;
    let patientId = 'PAT001';
    let patientName = 'Bhaben Barua';

    if (userId) {
      const [patRows] = await pool.query('SELECT id, name FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
        patientName = patRows[0].name;
      }
    }

    // 1. Fetch recommended game
    const [gameRows] = await pool.query(
      `SELECT id, title, cognitive_domain as domain, difficulty, description, estimated_time as estimatedTime
       FROM games WHERE is_active = 1 LIMIT 1`
    );
    const recommendedGame = gameRows.length > 0 ? gameRows[0] : null;

    // 2. Fetch pending reminders count
    const [remRows] = await pool.query(
      `SELECT COUNT(*) as count FROM reminders
       WHERE (patient_id = ? OR patient_id = 'PAT001') AND (is_enabled = 1 AND status != 'completed')`,
      [patientId]
    );
    const pendingRemindersCount = remRows[0]?.count || 0;

    // 3. Fetch recent results
    const [resultsRows] = await pool.query(
      `SELECT r.id, r.game_id as gameId, g.title as gameTitle, r.score, r.accuracy,
              CONCAT(r.time_taken_seconds, 's') as timeTaken,
              CONCAT(ROUND(r.time_taken_seconds / GREATEST(r.total_questions, 1), 1), 's') as averageResponseTime,
              r.played_at as completedAt
       FROM game_results r
       LEFT JOIN games g ON r.game_id = g.id
       WHERE r.patient_id = ? OR r.patient_id = 'PAT001'
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
        cognitiveAdherenceRate: 88
      }
    });
  } catch (error) {
    console.error('getSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary'
    });
  }
}

module.exports = {
  getSummary
};
