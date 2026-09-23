const { pool } = require('../config/db');

// GET PATIENT PROFILE
async function getProfile(req, res) {
  try {
    const userId = req.user?.id;

    let [rows] = await pool.query(
      `SELECT id, user_id, name, age, gender, primary_language, condition_stage,
              emergency_contact_name, emergency_contact_relation, emergency_contact_phone, avatar_url
       FROM patients WHERE user_id = ?`,
      [userId]
    );

    // Fallback to primary patient PAT001 if no user_id mapping
    if (rows.length === 0) {
      [rows] = await pool.query(
        `SELECT id, user_id, name, age, gender, primary_language, condition_stage,
                emergency_contact_name, emergency_contact_relation, emergency_contact_phone, avatar_url
         FROM patients WHERE id = 'PAT001' LIMIT 1`
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const p = rows[0];
    const patientObj = {
      id: p.id,
      name: p.name,
      age: p.age || 72,
      gender: p.gender || 'Male',
      primaryLanguage: p.primary_language || 'as',
      conditionStage: p.condition_stage || 'Mild Cognitive Impairment',
      emergencyContact: {
        name: p.emergency_contact_name || 'Anup Barua',
        relation: p.emergency_contact_relation || 'Son',
        phone: p.emergency_contact_phone || '+91 98765 43210'
      },
      avatarUrl: p.avatar_url || '/ner_senior_avatar.png'
    };

    return res.status(200).json({
      success: true,
      patient: patientObj
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient profile'
    });
  }
}

// UPDATE PATIENT PROFILE
async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    const { name, age, gender, primaryLanguage, conditionStage, emergencyContact, avatarUrl } = req.body;

    const [existing] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    const targetPatientId = existing.length > 0 ? existing[0].id : 'PAT001';

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (age !== undefined) { updates.push('age = ?'); values.push(Number(age)); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (primaryLanguage !== undefined) { updates.push('primary_language = ?'); values.push(primaryLanguage); }
    if (conditionStage !== undefined) { updates.push('condition_stage = ?'); values.push(conditionStage); }
    if (avatarUrl !== undefined) { updates.push('avatar_url = ?'); values.push(avatarUrl); }
    if (emergencyContact?.name !== undefined) { updates.push('emergency_contact_name = ?'); values.push(emergencyContact.name); }
    if (emergencyContact?.relation !== undefined) { updates.push('emergency_contact_relation = ?'); values.push(emergencyContact.relation); }
    if (emergencyContact?.phone !== undefined) { updates.push('emergency_contact_phone = ?'); values.push(emergencyContact.phone); }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(targetPatientId);
      await pool.query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Also update users.name if name changed
    if (name && userId) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    // Return updated profile
    return getProfile(req, res);
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update patient profile'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};
