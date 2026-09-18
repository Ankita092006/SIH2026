const mongoose = require('mongoose');

// ==========================================
// GAME RESULT SCHEMA
// ==========================================

const gameResultSchema = new mongoose.Schema(
  {
    // Patient who played the game
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Game that was played
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },

    // Score achieved
    score: {
      type: Number,
      required: true,
      min: 0
    },

    // Total questions
    totalQuestions: {
      type: Number,
      required: true,
      min: 0
    },

    // Correct answers
    correctAnswers: {
      type: Number,
      required: true,
      min: 0
    },

    // Accuracy percentage
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Time taken in seconds
    timeTaken: {
      type: Number,
      required: true,
      min: 0
    },

    // Game completion status
    status: {
      type: String,
      enum: [
        'completed',
        'incomplete',
        'abandoned'
      ],
      default: 'completed'
    },

    // Game session date
    playedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODEL
// ==========================================

const GameResult = mongoose.model(
  'GameResult',
  gameResultSchema
);

module.exports = GameResult;