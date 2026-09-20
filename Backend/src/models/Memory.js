const { query } = require("../config/db");

/**
 * MySQL-backed Memory model
 */
const Memory = {
  async findByPatientId(patientId) {
    return query(
      "SELECT * FROM memories WHERE patient_id = ? AND is_active = TRUE ORDER BY created_at DESC",
      [patientId]
    );
  },

  async findById(id) {
    const rows = await query("SELECT * FROM memories WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({
    id,
    patientId,
    title,
    personName = null,
    relationship = null,
    description,
    memoryType = "other",
    photoUrl = null,
    dateOfMemory = null,
    location = null,
    tags = null,
    caregiverVerified = false,
    isImportant = false
  }) {
    await query(
      `INSERT INTO memories (
        id, patient_id, title, person_name, relationship, description,
        memory_type, photo_url, date_of_memory, location, tags,
        caregiver_verified, is_important, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        id, patientId, title, personName, relationship, description,
        memoryType, photoUrl, dateOfMemory, location,
        tags ? JSON.stringify(tags) : null,
        caregiverVerified, isImportant
      ]
    );
    return this.findById(id);
  }
};

module.exports = Memory;