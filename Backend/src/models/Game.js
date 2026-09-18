const mongoose = require('mongoose');

// ==========================================
// GAME SCHEMA
// ==========================================

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    gameType: {
      type: String,
      enum: [
        'memory',
        'puzzle',
        'matching',
        'recall',
        'quiz'
      ],
      required: true
    },

    difficulty: {
      type: String,
      enum: [
        'easy',
        'medium',
        'hard'
      ],
      default: 'easy'
    },

    instructions: {
      type: String,
      required: true
    },

    questions: [
      {
        question: {
          type: String,
          required: true
        },

        options: {
          type: [String],
          default: []
        },

        correctAnswer: {
          type: String,
          required: true
        },

        points: {
          type: Number,
          default: 10
        }
      }
    ],

    timeLimit: {
      type: Number,
      default: 60
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODEL
// ==========================================

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;