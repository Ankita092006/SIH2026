const mongoose = require('mongoose');

// ==========================================
// SCORE SCHEMA
// ==========================================

const scoreSchema = new mongoose.Schema(
  {
    // Patient who achieved the score
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

    // Total possible score
    maxScore: {
      type: Number,
      required: true,
      min: 0
    },

    // Correct answers
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0
    },

    // Total questions
    totalQuestions: {
      type: Number,
      default: 0,
      min: 0
    },

    // Time taken in seconds
    timeTaken: {
      type: Number,
      default: 0,
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

    // Date of playing
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

const Score = mongoose.model(
  'Score',
  scoreSchema
);

module.exports = Score;