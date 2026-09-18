const mongoose = require('mongoose');

// ==========================================
// MEMORY SCHEMA
// ==========================================

const memorySchema = new mongoose.Schema(
  {
    // Patient who owns the memory
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Title of the memory
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Memory description
    description: {
      type: String,
      required: true,
      trim: true
    },

    // Type of memory
    memoryType: {
      type: String,
      enum: [
        'person',
        'place',
        'event',
        'family',
        'other'
      ],
      default: 'other'
    },

    // Optional image
    imageUrl: {
      type: String,
      default: null
    },

    // Important date related to the memory
    memoryDate: {
      type: Date,
      default: null
    },

    // Additional notes
    notes: {
      type: String,
      default: ''
    },

    // Whether the memory is marked as important
    isImportant: {
      type: Boolean,
      default: false
    },

    // Whether the memory is active
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

const Memory = mongoose.model(
  'Memory',
  memorySchema
);

module.exports = Memory;