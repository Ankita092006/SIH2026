const crypto = require('crypto');
const { pool } = require('../config/db');

// GET REMINDERS
async function getReminders(req, res) {
  try {
    const userId = req.user?.id;
    let patientId = 'PAT001';

    if (userId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const [rows] = await pool.query(
      `SELECT id, title, time, reminder_type as type,
              (status = 'completed') as completed,
              frequency as recurrence,
              is_enabled as isEnabled,
              created_at as createdAt
       FROM reminders
       WHERE (patient_id = ? OR patient_id = 'PAT001') AND is_enabled = 1
       ORDER BY time ASC`,
      [patientId]
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
    console.error('getReminders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
}

// CREATE REMINDER
async function createReminder(req, res) {
  try {
    const userId = req.user?.id || 'usr_cg_001';
    let patientId = 'PAT001';

    if (userId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const { title, text, time = '10:00 AM', type = 'activity', recurrence = 'Daily' } = req.body;
    const finalTitle = title || text || 'New Reminder';

    const reminderId = `rem_${Date.now()}_${crypto.randomUUID().slice(0, 4)}`;

    // Normalize type to enum: 'medication','exercise','activity','hydration','appointment','other'
    const allowedTypes = ['medication', 'exercise', 'activity', 'hydration', 'appointment', 'other'];
    const reminderType = allowedTypes.includes(type?.toLowerCase()) ? type.toLowerCase() : 'activity';

    await pool.query(
      `INSERT INTO reminders (id, patient_id, created_by, title, reminder_type, time, frequency, is_enabled, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending', NOW(), NOW())`,
      [reminderId, patientId, userId, finalTitle, reminderType, time, recurrence]
    );

    const newReminder = {
      id: reminderId,
      title: finalTitle,
      text: finalTitle,
      time,
      type: reminderType,
      completed: false,
      recurrence
    };

    return res.status(201).json({
      success: true,
      reminder: newReminder
    });
  } catch (error) {
    console.error('createReminder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reminder'
    });
  }
}

// TOGGLE REMINDER STATUS
async function toggleReminder(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT id, status, title, time, reminder_type, frequency FROM reminders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    await pool.query('UPDATE reminders SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      reminder: {
        id: rows[0].id,
        title: rows[0].title,
        text: rows[0].title,
        time: rows[0].time,
        type: rows[0].reminder_type,
        completed: newStatus === 'completed',
        recurrence: rows[0].frequency
      }
    });
  } catch (error) {
    console.error('toggleReminder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle reminder'
    });
  }
}

// DELETE REMINDER
async function deleteReminder(req, res) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE reminders SET is_enabled = 0, updated_at = NOW() WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Reminder deleted'
    });
  } catch (error) {
    console.error('deleteReminder error:', error);
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
