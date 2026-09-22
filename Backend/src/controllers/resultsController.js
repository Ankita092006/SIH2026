const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

// GET GAMEPLAY RESULTS & HISTORY (SCOPED STRICTLY TO AUTHENTICATED USER)
async function getResults(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let targetPatientId = user.patientId;

    // If caregiver, allow viewing results for an assigned patient
    if (user.role === 'caregiver' && req.query.patientId) {
      const requestedId = req.query.patientId;
      const [assignment] = await pool.query(
        'SELECT id FROM caregiver_patient_assignments WHERE caregiver_id = ? AND patient_id = ?',
        [user.caregiverId, requestedId]
      );
      if (assignment.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Patient is not assigned to your caregiver account.'
        });
      }
      targetPatientId = requestedId;
    }

    if (!targetPatientId) {
      return res.status(200).json({
        success: true,
        results: []
      });
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
       WHERE r.patient_id = ?
       ORDER BY r.played_at DESC
       LIMIT 50`,
      [targetPatientId]
    );

    return res.status(200).json({
      success: true,
      results: rows
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getResults error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch results history'
    });
  }
}

module.exports = {
  getResults
};
