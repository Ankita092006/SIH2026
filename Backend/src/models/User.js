const mongoose = require('mongoose');

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema(
  {
    // User full name
    name: {
      type: String,
      required: true,
      trim: true
    },

    // User email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // User password
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    // User role
    role: {
      type: String,
      enum: [
        'patient',
        'caregiver',
        'admin'
      ],
      default: 'patient'
    },

    // User age
    age: {
      type: Number,
      min: 1,
      max: 120
    },

    // User profile image
    profileImage: {
      type: String,
      default: null
    },

    // User phone number
    phone: {
      type: String,
      default: ''
    },

    // Account active status
    isActive: {
      type: Boolean,
      default: true
    },

    // Last login time
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// EXPORT MODEL
// ==========================================

const User = mongoose.model(
  'User',
  userSchema
);

module.exports = User;