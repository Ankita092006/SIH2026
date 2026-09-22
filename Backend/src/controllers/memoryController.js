const crypto = require('crypto');
const { pool } = require('../config/db');

// GET MEMORIES
async function getMemories(req, res) {
  try {
    const userId = req.user?.id;
    let patientId = req.query.patientId || 'PAT001';

    if (userId && !req.query.patientId) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const [rows] = await pool.query(
      `SELECT id as memory_id, patient_id, title, person_name as person, relationship,
              description, memory_type, photo_url as image_url, date_of_memory as date,
              location, tags, caregiver_verified, is_important
       FROM memories
       WHERE (patient_id = ? OR patient_id = 'PAT001') AND is_active = 1
       ORDER BY created_at DESC`,
      [patientId]
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
    console.error('getMemories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memories'
    });
  }
}

// CREATE MEMORY
async function createMemory(req, res) {
  try {
    const body = req.body || {};
    const userId = req.user?.id;
    let patientId = body.patient_id || 'PAT001';

    if (userId && !body.patient_id) {
      const [patRows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
      if (patRows.length > 0) {
        patientId = patRows[0].id;
      }
    }

    const memoryId = `mem_${Date.now()}_${crypto.randomUUID().slice(0, 4)}`;
    const title = body.title || 'Special Memory';
    const person = body.person || body.person_name || '';
    const relationship = body.relationship || '';
    const description = body.description || '';
    const memoryType = (body.memory_type || 'family').toLowerCase();
    const photoUrl = body.image_url || body.photo_url || '/ner_senior_avatar.png';
    const dateOfMemory = body.date || body.date_of_memory || new Date().toISOString().split('T')[0];
    const location = body.location || 'Assam';
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const verified = body.caregiver_verified !== undefined ? (body.caregiver_verified ? 1 : 0) : 1;

    // Allowed enum in MySQL: 'person','place','event','family','other'
    const allowedTypes = ['person', 'place', 'event', 'family', 'other'];
    const finalType = allowedTypes.includes(memoryType) ? memoryType : 'family';

    await pool.query(
      `INSERT INTO memories (id, patient_id, title, person_name, relationship, description, memory_type, photo_url, date_of_memory, location, tags, caregiver_verified, is_important, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
      [memoryId, patientId, title, person, relationship, description, finalType, photoUrl, dateOfMemory, location, JSON.stringify(tags), verified]
    );

    const newMem = {
      memory_id: memoryId,
      patient_id: patientId,
      title,
      person,
      relationship,
      description,
      memory_type: finalType,
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
    console.error('createMemory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create memory'
    });
  }
}

// GENERATE RECALL ACTIVITY
async function generateRecallActivity(req, res) {
  try {
    const patientId = req.body?.patient_id || 'PAT001';

    // Find verified memories
    const [rows] = await pool.query(
      `SELECT id, title, person_name, relationship, location, photo_url, date_of_memory
       FROM memories
       WHERE (patient_id = ? OR patient_id = 'PAT001') AND caregiver_verified = 1 AND is_active = 1
       LIMIT 5`,
      [patientId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        activity: {
          activityId: `act_${Date.now()}`,
          type: 'RECOGNITION',
          question: 'Who is your beloved sister who lives in Jorhat?',
          answer: 'Maya Barua',
          memory_id: 'mem_default',
          options: ['Maya Barua', 'Protima', 'Jonali', 'Rina'],
          imageUrl: '/ner_senior_avatar.png'
        }
      });
    }

    const selected = rows[Math.floor(Math.random() * rows.length)];
    const distractorBank = ['Maya Barua', 'Protima Das', 'Jonali', 'Rina Hazarika', 'Bhaben Barua', 'Anup Barua'];
    const correctAnswer = selected.person_name || 'Family';

    const distractors = distractorBank.filter(d => d.toLowerCase() !== correctAnswer.toLowerCase()).slice(0, 3);
    const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

    const activityId = `act_${Date.now()}_${crypto.randomUUID().slice(0, 4)}`;
    const question = `Who is this special person from your memory in ${selected.location || 'Assam'}?`;

    // Record in memory_recall_activities
    try {
      await pool.query(
        `INSERT INTO memory_recall_activities (id, patient_id, memory_id, activity_type, question, options, correct_answer, image_url, created_at)
         VALUES (?, ?, ?, 'RECOGNITION', ?, ?, ?, ?, NOW())`,
        [activityId, patientId, selected.id, question, JSON.stringify(options), correctAnswer, selected.photo_url || '/ner_senior_avatar.png']
      );
    } catch (err) {
      console.warn('[Activity Insert] Warning:', err.message);
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
    console.error('generateRecallActivity error:', error);
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
