const mongoose = require('mongoose');

// ==========================================
// REMINDER SCHEMA
// ==========================================

const reminderSchema = new mongoose.Schema(
  {
    // Patient who owns the reminder
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Person who created the reminder
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Reminder title
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Reminder description
    description: {
      type: String,
      default: '',
      trim: true
    },

    // Reminder type
    reminderType: {
      type: String,
      enum: [
        'medication',
        'appointment',
        'activity',
        'meal',
        'other'
      ],
      default: 'other'
    },

    // Date and time for reminder
    reminderDate: {
      type: Date,
      required: true
    },

    // Whether reminder is completed
    isCompleted: {
      type: Boolean,
      default: false
    },

    // Whether reminder is active
    isActive: {
      type: Boolean,
      default: true
    },

    // Whether reminder repeats
    isRecurring: {
      type: Boolean,
      default: false
    },

    // Repeat frequency
    repeatFrequency: {
      type: String,
      enum: [
        'daily',
        'weekly',
        'monthly',
        'none'
      ],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODEL
// ==========================================

const Reminder = mongoose.model(
  'Reminder',
  reminderSchema
);

module.exports = Reminder;