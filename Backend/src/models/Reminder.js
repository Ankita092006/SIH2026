const { query } = require("../config/db");

/**
 * MySQL-backed Reminder model
 */
const Reminder = {
  async findByPatientId(patientId) {
    return query(
      "SELECT * FROM reminders WHERE patient_id = ? ORDER BY time ASC",
      [patientId]
    );
  },

  async findById(id) {
    const rows = await query("SELECT * FROM reminders WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({
    id,
    patientId,
    createdBy = null,
    title,
    description = null,
    reminderType = "other",
    time,
    reminderDate = null,
    frequency = "daily",
    isEnabled = true,
    status = "pending"
  }) {
    await query(
      `INSERT INTO reminders (
        id, patient_id, created_by, title, description,
        reminder_type, time, reminder_date, frequency, is_enabled, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, createdBy, title, description, reminderType, time, reminderDate, frequency, isEnabled, status]
    );
    return this.findById(id);
  },

  async updateStatus(id, status) {
    await query("UPDATE reminders SET status = ? WHERE id = ?", [status, id]);
    return this.findById(id);
  },

  async delete(id) {
    await query("DELETE FROM reminders WHERE id = ?", [id]);
    return true;
  }
};

module.exports = Reminder;