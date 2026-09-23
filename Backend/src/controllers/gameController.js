const crypto = require('crypto');
const { pool } = require('../config/db');

// GET GAMES CATALOG
async function getGames(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, cognitive_domain as domain, difficulty, description, estimated_time as estimatedTime, instructions
       FROM games WHERE is_active = 1
       ORDER BY title ASC`
    );

    return res.status(200).json({
      success: true,
      games: rows
    });
  } catch (error) {
    console.error('getGames error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch games catalog'
    });
  }
}

// START GAMEPLAY SESSION
async function startSession(req, res) {
  try {
    const { gameId } = req.params;
    const userId = req.user?.id;

    // Resolve patientId
    let patientId = 'PAT001';
    if (userId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    // Check game existence
    const [gameRows] = await pool.query('SELECT id, difficulty FROM games WHERE id = ?', [gameId]);
    const startingDifficulty = gameRows.length > 0 ? (gameRows[0].difficulty || 2) : 2;

    const sessionId = `ses_${Date.now()}_${gameId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    await pool.query(
      `INSERT INTO game_sessions (session_id, patient_id, game_id, starting_difficulty, current_difficulty, status, started_at)
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [sessionId, patientId, gameId, startingDifficulty, startingDifficulty]
    );

    return res.status(201).json({
      success: true,
      sessionId,
      gameId,
      startingDifficulty,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('startSession error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start game session'
    });
  }
}

module.exports = {
  getGames,
  startSession
};
