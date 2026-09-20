const { query } = require("../config/db");

/**
 * MySQL-backed GameResult model (Consolidates legacy GameResult and Score entities)
 */
const GameResult = {
  async create({
    id,
    sessionId,
    patientId,
    gameId,
    gameType = "memory",
    cognitiveDomain = "memory",
    difficulty = 2,
    score = 0,
    maxScore = 100,
    accuracy = 0,
    timeTakenSeconds = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    nextDifficulty = 2,
    confidence = null,
    predictionSource = "rule",
    status = "completed",
    summary = null
  }) {
    await query(
      `INSERT INTO game_results (
        id, session_id, patient_id, game_id, game_type, cognitive_domain,
        difficulty, score, max_score, accuracy, time_taken_seconds,
        total_questions, correct_answers, next_difficulty, confidence,
        prediction_source, status, summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, sessionId, patientId, gameId, gameType, cognitiveDomain,
        difficulty, score, maxScore, accuracy, timeTakenSeconds,
        totalQuestions, correctAnswers, nextDifficulty, confidence,
        predictionSource, status, summary
      ]
    );
    return this.findById(id);
  },

  async findById(id) {
    const rows = await query("SELECT * FROM game_results WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async findByPatientId(patientId, { limit = 20 } = {}) {
    return query(
      `SELECT gr.*, g.title AS game_title
       FROM game_results gr
       JOIN games g ON gr.game_id = g.id
       WHERE gr.patient_id = ?
       ORDER BY gr.played_at DESC
       LIMIT ?`,
      [patientId, limit]
    );
  }
};

module.exports = GameResult;