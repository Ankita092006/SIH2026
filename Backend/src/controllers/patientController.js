const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

const ALLOWED_LANGUAGES = ['as', 'bn', 'hi', 'en', 'bodo', 'mni'];
const ALLOWED_STAGES = [
  'Normal',
  'Mild Cognitive Impairment',
  'Moderate Dementia',
  'Advanced Dementia'
];

// GET PATIENT PROFILE (SCOPED AUTHORITATIVELY TO AUTHENTICATED USER)
async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, name, age, gender, primary_language, condition_stage,
              emergency_contact_name, emergency_contact_relation, emergency_contact_phone, avatar_url
       FROM patients WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found for this account'
      });
    }

    const p = rows[0];
    const patientObj = {
      id: p.id,
      name: p.name,
      age: p.age || 70,
      gender: p.gender || 'Other',
      primaryLanguage: p.primary_language || 'as',
      conditionStage: p.condition_stage || 'Mild Cognitive Impairment',
      emergencyContact: {
        name: p.emergency_contact_name || '',
        relation: p.emergency_contact_relation || '',
        phone: p.emergency_contact_phone || ''
      },
      avatarUrl: p.avatar_url || '/ner_senior_avatar.png'
    };

    return res.status(200).json({
      success: true,
      patient: patientObj
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getProfile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient profile'
    });
  }
}

// UPDATE PATIENT PROFILE (AUTHORITATIVE OWNERSHIP CHECK)
async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [existing] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No patient record associated with this account to update'
      });
    }

    const targetPatientId = existing[0].id;
    const { name, age, gender, primaryLanguage, conditionStage, emergencyContact, avatarUrl } = req.body || {};

    const updates = [];
    const values = [];

    if (typeof name === 'string' && name.trim().length > 0) {
      const sanitizedName = name.trim().slice(0, 100);
      updates.push('name = ?');
      values.push(sanitizedName);
    }

    if (age !== undefined && age !== null) {
      const numAge = parseInt(age, 10);
      if (!isNaN(numAge) && numAge >= 1 && numAge <= 130) {
        updates.push('age = ?');
        values.push(numAge);
      }
    }

    if (typeof gender === 'string' && ['Male', 'Female', 'Other'].includes(gender.trim())) {
      updates.push('gender = ?');
      values.push(gender.trim());
    }

    if (typeof primaryLanguage === 'string' && ALLOWED_LANGUAGES.includes(primaryLanguage.toLowerCase())) {
      updates.push('primary_language = ?');
      values.push(primaryLanguage.toLowerCase());
    }

    if (typeof conditionStage === 'string' && ALLOWED_STAGES.includes(conditionStage.trim())) {
      updates.push('condition_stage = ?');
      values.push(conditionStage.trim());
    }

    if (typeof avatarUrl === 'string') {
      const trimmedUrl = avatarUrl.trim();
      // Allow relative paths starting with / or secure https://
      if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('https://')) {
        updates.push('avatar_url = ?');
        values.push(trimmedUrl.slice(0, 500));
      }
    }

    if (emergencyContact && typeof emergencyContact === 'object') {
      if (typeof emergencyContact.name === 'string') {
        updates.push('emergency_contact_name = ?');
        values.push(emergencyContact.name.trim().slice(0, 100));
      }
      if (typeof emergencyContact.relation === 'string') {
        updates.push('emergency_contact_relation = ?');
        values.push(emergencyContact.relation.trim().slice(50));
      }
      if (typeof emergencyContact.phone === 'string') {
        updates.push('emergency_contact_phone = ?');
        values.push(emergencyContact.phone.trim().slice(30));
      }
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(targetPatientId);
      await pool.query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Also update users.name if name changed
    if (typeof name === 'string' && name.trim().length > 0) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim().slice(0, 100), userId]);
    }

    return getProfile(req, res);
  } catch (error) {
    if (nodeEnv !== 'test') console.error('updateProfile error:', error.message);
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
