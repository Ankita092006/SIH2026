const { pool } = require('../config/db');

// GET GAMEPLAY RESULTS & HISTORY
async function getResults(req, res) {
  try {
    const userId = req.user?.id;
    let patientId = 'PAT001';

    if (userId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const [rows] = await pool.query(
      `SELECT r.id, r.game_id as gameId, g.title as gameTitle, r.score, r.accuracy,
              CONCAT(r.time_taken_seconds, 's') as timeTaken,
              CONCAT(ROUND(r.time_taken_seconds / GREATEST(r.total_questions, 1), 1), 's') as averageResponseTime,
              r.next_difficulty as nextDifficulty,
              r.confidence,
              r.prediction_source as predictionSource,
              r.summary,
              r.played_at as completedAt
       FROM game_results r
       LEFT JOIN games g ON r.game_id = g.id
       WHERE r.patient_id = ? OR r.patient_id = 'PAT001'
       ORDER BY r.played_at DESC
       LIMIT 50`,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      results: rows
    });
  } catch (error) {
    console.error('getResults error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch results history'
    });
  }
}

module.exports = {
  getResults
};
