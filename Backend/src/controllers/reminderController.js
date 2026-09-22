const crypto = require('crypto');
const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

const ALLOWED_REMINDER_TYPES = ['medication', 'exercise', 'activity', 'hydration', 'appointment', 'other'];

// Helper to verify if user owns or is authorized for a patient's data
async function verifyPatientAccess(user, targetPatientId) {
  if (!targetPatientId) return false;
  if (user.role === 'patient') {
    return user.patientId === targetPatientId;
  }
  if (user.role === 'caregiver' && user.caregiverId) {
    const [rows] = await pool.query(
      'SELECT id FROM caregiver_patient_assignments WHERE caregiver_id = ? AND patient_id = ?',
      [user.caregiverId, targetPatientId]
    );
    return rows.length > 0;
  }
  if (user.role === 'admin') {
    return true;
  }
  return false;
}

// GET REMINDERS
async function getReminders(req, res) {
  try {
    const user = req.user;
    let targetPatientId = user.patientId;

    if (user.role === 'caregiver' && req.query.patientId) {
      const hasAccess = await verifyPatientAccess(user, req.query.patientId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Patient is not assigned to your caregiver account.'
        });
      }
      targetPatientId = req.query.patientId;
    }

    if (!targetPatientId) {
      return res.status(200).json({
        success: true,
        reminders: []
      });
    }

    const [rows] = await pool.query(
      `SELECT id, title, time, reminder_type as type,
              (status = 'completed') as completed,
              frequency as recurrence,
              is_enabled as isEnabled,
              created_at as createdAt
       FROM reminders
       WHERE patient_id = ? AND is_enabled = 1
       ORDER BY time ASC`,
      [targetPatientId]
    );

    const formatted = rows.map(r => ({
      ...r,
      completed: Boolean(r.completed),
      text: r.title
    }));

    return res.status(200).json({
      success: true,
      reminders: formatted
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getReminders error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
}

// CREATE REMINDER
async function createReminder(req, res) {
  try {
    const user = req.user;
    let targetPatientId = user.patientId;

    if (user.role === 'caregiver' && req.body.patient_id) {
      const hasAccess = await verifyPatientAccess(user, req.body.patient_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot create reminders for unassigned patients.'
        });
      }
      targetPatientId = req.body.patient_id;
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'No patient record linked to create a reminder for'
      });
    }

    const { title, text, time = '10:00 AM', type = 'activity', recurrence = 'Daily' } = req.body || {};
    const rawTitle = title || text;
    if (!rawTitle || typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reminder title or text is required'
      });
    }

    const sanitizedTitle = rawTitle.trim().slice(0, 200);
    const sanitizedTime = String(time).trim().slice(0, 50);
    const sanitizedRecurrence = String(recurrence).trim().slice(0, 50);

    const reminderType = ALLOWED_REMINDER_TYPES.includes(String(type).toLowerCase())
      ? String(type).toLowerCase()
      : 'activity';

    const reminderId = `rem_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;

    await pool.query(
      `INSERT INTO reminders (id, patient_id, created_by, title, reminder_type, time, frequency, is_enabled, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending', NOW(), NOW())`,
      [reminderId, targetPatientId, user.id, sanitizedTitle, reminderType, sanitizedTime, sanitizedRecurrence]
    );

    const newReminder = {
      id: reminderId,
      title: sanitizedTitle,
      text: sanitizedTitle,
      time: sanitizedTime,
      type: reminderType,
      completed: false,
      recurrence: sanitizedRecurrence
    };

    return res.status(201).json({
      success: true,
      reminder: newReminder
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('createReminder error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reminder'
    });
  }
}

// TOGGLE REMINDER STATUS (WITH STRICT OWNERSHIP VERIFICATION)
async function toggleReminder(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.query(
      'SELECT id, patient_id, status, title, time, reminder_type, frequency FROM reminders WHERE id = ? AND is_enabled = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const reminder = rows[0];

    // Authorization check: User must own this reminder or be assigned caregiver
    const hasAccess = await verifyPatientAccess(user, reminder.patient_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to modify this reminder.'
      });
    }

    const currentStatus = reminder.status;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    await pool.query('UPDATE reminders SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      reminder: {
        id: reminder.id,
        title: reminder.title,
        text: reminder.title,
        time: reminder.time,
        type: reminder.reminder_type,
        completed: newStatus === 'completed',
        recurrence: reminder.frequency
      }
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('toggleReminder error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle reminder'
    });
  }
}

// DELETE REMINDER (WITH STRICT OWNERSHIP VERIFICATION)
async function deleteReminder(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await pool.query(
      'SELECT id, patient_id FROM reminders WHERE id = ? AND is_enabled = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const reminder = rows[0];
    const hasAccess = await verifyPatientAccess(user, reminder.patient_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to delete this reminder.'
      });
    }

    await pool.query('UPDATE reminders SET is_enabled = 0, updated_at = NOW() WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted'
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('deleteReminder error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete reminder'
    });
  }
}

module.exports = {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder
};
