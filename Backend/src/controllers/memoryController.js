const crypto = require('crypto');
const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

const ALLOWED_MEMORY_TYPES = ['person', 'place', 'event', 'family', 'other'];

// Helper to verify caregiver/patient authorization
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

// GET MEMORIES (SCOPED STRICTLY TO AUTHORIZED PATIENT)
async function getMemories(req, res) {
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
        memories: []
      });
    }

    const [rows] = await pool.query(
      `SELECT id as memory_id, patient_id, title, person_name as person, relationship,
              description, memory_type, photo_url as image_url, date_of_memory as date,
              location, tags, caregiver_verified, is_important
       FROM memories
       WHERE patient_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
      [targetPatientId]
    );

    const formatted = rows.map(r => ({
      ...r,
      caregiver_verified: Boolean(r.caregiver_verified),
      is_important: Boolean(r.is_important),
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || [])
    }));

    return res.status(200).json({
      success: true,
      memories: formatted
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getMemories error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memories'
    });
  }
}

// CREATE MEMORY (AUTHORITATIVE OWNERSHIP VALIDATION)
async function createMemory(req, res) {
  try {
    const user = req.user;
    const body = req.body || {};
    let targetPatientId = user.patientId;

    if (user.role === 'caregiver' && body.patient_id) {
      const hasAccess = await verifyPatientAccess(user, body.patient_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot create memories for an unassigned patient.'
        });
      }
      targetPatientId = body.patient_id;
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'No patient record linked to create a memory for'
      });
    }

    const title = String(body.title || 'Special Memory').trim().slice(0, 150);
    const person = String(body.person || body.person_name || '').trim().slice(0, 100);
    const relationship = String(body.relationship || '').trim().slice(0, 50);
    const description = String(body.description || '').trim().slice(0, 1000);
    const location = String(body.location || 'Assam').trim().slice(0, 100);

    const rawType = String(body.memory_type || 'family').toLowerCase();
    const memoryType = ALLOWED_MEMORY_TYPES.includes(rawType) ? rawType : 'family';

    let photoUrl = '/ner_senior_avatar.png';
    const rawPhoto = body.image_url || body.photo_url;
    if (typeof rawPhoto === 'string' && (rawPhoto.startsWith('/') || rawPhoto.startsWith('https://'))) {
      photoUrl = rawPhoto.slice(0, 500);
    }

    const dateOfMemory = body.date || body.date_of_memory || new Date().toISOString().split('T')[0];
    const tags = Array.isArray(body.tags) ? body.tags.slice(0, 10).map(t => String(t).slice(0, 30)) : [];
    const verified = user.role === 'caregiver' ? 1 : (body.caregiver_verified ? 1 : 0);

    const memoryId = `mem_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;

    await pool.query(
      `INSERT INTO memories (id, patient_id, title, person_name, relationship, description, memory_type, photo_url, date_of_memory, location, tags, caregiver_verified, is_important, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
      [memoryId, targetPatientId, title, person, relationship, description, memoryType, photoUrl, String(dateOfMemory).slice(0, 20), location, JSON.stringify(tags), verified]
    );

    const newMem = {
      memory_id: memoryId,
      patient_id: targetPatientId,
      title,
      person,
      relationship,
      description,
      memory_type: memoryType,
      image_url: photoUrl,
      date: dateOfMemory,
      location,
      tags,
      caregiver_verified: Boolean(verified),
      is_important: true
    };

    return res.status(201).json({
      success: true,
      memory: newMem
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('createMemory error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create memory'
    });
  }
}

// GENERATE RECALL ACTIVITY (STRICTLY SCOPED TO AUTHENTICATED PATIENT'S VERIFIED MEMORIES)
async function generateRecallActivity(req, res) {
  try {
    const user = req.user;
    let targetPatientId = user.patientId;

    if (user.role === 'caregiver' && req.body?.patient_id) {
      const hasAccess = await verifyPatientAccess(user, req.body.patient_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Patient is not assigned to your caregiver account.'
        });
      }
      targetPatientId = req.body.patient_id;
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'No patient record linked for recall activity'
      });
    }

    // Find verified memories for this patient only
    const [rows] = await pool.query(
      `SELECT id, title, person_name, relationship, location, photo_url, date_of_memory
       FROM memories
       WHERE patient_id = ? AND caregiver_verified = 1 AND is_active = 1
       LIMIT 10`,
      [targetPatientId]
    );

    if (rows.length === 0) {
      // Fallback safe generic activity without cross-patient leakage
      return res.status(200).json({
        success: true,
        activity: {
          activityId: `act_${Date.now()}`,
          type: 'RECOGNITION',
          question: 'Can you recognize this lovely family memory from your homeland?',
          answer: 'Family Moment',
          memory_id: 'mem_generic',
          options: ['Family Moment', 'Market Visit', 'Garden Walk', 'Festival'],
          imageUrl: '/ner_senior_avatar.png'
        }
      });
    }

    const selected = rows[Math.floor(Math.random() * rows.length)];
    const distractorBank = ['Maya Barua', 'Protima Das', 'Jonali', 'Rina Hazarika', 'Bhaben Barua', 'Anup Barua', 'Deven'];
    const correctAnswer = selected.person_name || selected.relationship || 'Family Member';

    const distractors = distractorBank.filter(d => d.toLowerCase() !== correctAnswer.toLowerCase()).slice(0, 3);
    const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

    const activityId = `act_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const question = `Who is this special person from your memory in ${selected.location || 'Assam'}?`;

    // Record in memory_recall_activities
    try {
      await pool.query(
        `INSERT INTO memory_recall_activities (id, patient_id, memory_id, activity_type, question, options, correct_answer, image_url, created_at)
         VALUES (?, ?, ?, 'RECOGNITION', ?, ?, ?, ?, NOW())`,
        [activityId, targetPatientId, selected.id, question, JSON.stringify(options), correctAnswer, selected.photo_url || '/ner_senior_avatar.png']
      );
    } catch (err) {
      if (nodeEnv !== 'test') console.warn('[Activity Insert] Warning:', err.message);
    }

    return res.status(200).json({
      success: true,
      activity: {
        activityId,
        type: 'RECOGNITION',
        question,
        answer: correctAnswer,
        memory_id: selected.id,
        options,
        imageUrl: selected.photo_url || '/ner_senior_avatar.png'
      }
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('generateRecallActivity error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recall activity'
    });
  }
}

module.exports = {
  getMemories,
  createMemory,
  generateRecallActivity
};
