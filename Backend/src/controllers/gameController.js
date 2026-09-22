const crypto = require('crypto');
const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

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
    if (nodeEnv !== 'test') console.error('getGames error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch games catalog'
    });
  }
}

// START GAMEPLAY SESSION (STRICT PATIENT IDENTITY ASSIGNMENT)
async function startSession(req, res) {
  try {
    const { gameId } = req.params;
    const user = req.user;

    // Check game existence
    const [gameRows] = await pool.query(
      'SELECT id, difficulty FROM games WHERE id = ? AND is_active = 1',
      [gameId]
    );

    if (gameRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found or inactive'
      });
    }

    const startingDifficulty = gameRows[0].difficulty || 2;

    // Authoritative patient identification: Never allow client to impersonate
    let patientId = null;
    if (user && user.patientId) {
      patientId = user.patientId;
    } else {
      // Unauthenticated guest session: isolated guest ID
      patientId = 'GUEST';
    }

    const sanitizedGameId = gameId.replace(/[^a-zA-Z0-9_-]/g, '');
    const sessionId = `ses_${Date.now()}_${sanitizedGameId}_${crypto.randomUUID().slice(0, 4)}`;

    await pool.query(
      `INSERT INTO game_sessions (session_id, patient_id, game_id, starting_difficulty, current_difficulty, status, started_at)
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [sessionId, patientId, sanitizedGameId, startingDifficulty, startingDifficulty]
    );

    return res.status(201).json({
      success: true,
      sessionId,
      gameId: sanitizedGameId,
      startingDifficulty,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('startSession error:', error.message);
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
