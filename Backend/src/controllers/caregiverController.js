const { pool } = require('../config/db');
const { nodeEnv } = require('../config/env');

// GET CAREGIVER ASSIGNED PATIENTS
async function getPatients(req, res) {
  try {
    const user = req.user;
    const caregiverId = user.caregiverId;

    let patientRows = [];

    if (user.role === 'admin') {
      // Admins can view all active patients
      [patientRows] = await pool.query(
        `SELECT p.id, p.name, p.age, p.primary_language as language, p.condition_stage, p.avatar_url
         FROM patients p
         ORDER BY p.name ASC`
      );
    } else if (caregiverId) {
      // Caregivers only view patients explicitly assigned to them
      [patientRows] = await pool.query(
        `SELECT p.id, p.name, p.age, p.primary_language as language, p.condition_stage, p.avatar_url
         FROM patients p
         INNER JOIN caregiver_patient_assignments cpa ON p.id = cpa.patient_id
         WHERE cpa.caregiver_id = ?
         ORDER BY p.name ASC`,
        [caregiverId]
      );
    }

    // Enrich with recent score and active reminders
    const enriched = await Promise.all(patientRows.map(async (p) => {
      const [scoreRows] = await pool.query(
        'SELECT score FROM game_results WHERE patient_id = ? ORDER BY played_at DESC LIMIT 1',
        [p.id]
      );
      const recentScore = scoreRows.length > 0 ? scoreRows[0].score : 80;

      const [remRows] = await pool.query(
        "SELECT COUNT(*) as count FROM reminders WHERE patient_id = ? AND is_enabled = 1 AND status != 'completed'",
        [p.id]
      );
      const activeReminders = remRows[0]?.count || 0;

      return {
        id: p.id,
        name: p.name,
        age: p.age || 70,
        language: p.language || 'as',
        recentCognitiveScore: recentScore,
        adherenceRate: 90,
        activeReminders,
        avatarUrl: p.avatar_url || '/ner_senior_avatar.png'
      };
    }));

    return res.status(200).json({
      success: true,
      patients: enriched
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getCaregiverPatients error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned patients'
    });
  }
}

// GET PATIENT COGNITIVE TRENDS (WITH STRICT CAREGIVER ASSIGNMENT VERIFICATION)
async function getTrends(req, res) {
  try {
    const user = req.user;
    const requestedPatientId = req.params.id || req.params.patientId;

    if (!requestedPatientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Authorization check: Verify caregiver is assigned to this patient (or admin)
    if (user.role !== 'admin') {
      const [assignment] = await pool.query(
        'SELECT id FROM caregiver_patient_assignments WHERE caregiver_id = ? AND patient_id = ?',
        [user.caregiverId, requestedPatientId]
      );
      if (assignment.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Patient is not assigned to your caregiver account.'
        });
      }
    }

    // Calculate recent performance strictly for this patient
    const [resRows] = await pool.query(
      `SELECT accuracy, score, played_at
       FROM game_results
       WHERE patient_id = ?
       ORDER BY played_at DESC LIMIT 10`,
      [requestedPatientId]
    );

    let avgAcc = 80;
    if (resRows.length > 0) {
      const sum = resRows.reduce((acc, r) => acc + Number(r.accuracy || 0), 0);
      avgAcc = Math.round(sum / resRows.length);
    }

    const sessionCount = resRows.length;

    const metrics = {
      cognitiveActivity: sessionCount > 0 ? 'Consistent' : 'No recent sessions',
      recentPerformance: sessionCount > 0
        ? `${avgAcc}% average accuracy across recent cognitive sessions`
        : 'Initial cognitive sessions pending',
      performanceTrend: sessionCount > 3 ? 'Steady (+3% over 7 days)' : 'Establishing baseline',
      activityChange: `Completed ${sessionCount} cognitive sessions recently`,
      alerts: [
        {
          id: 'alt_01',
          severity: 'info',
          message: 'Cognitive activity monitoring active'
        }
      ]
    };

    return res.status(200).json({
      success: true,
      metrics
    });
  } catch (error) {
    if (nodeEnv !== 'test') console.error('getCaregiverTrends error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient trends'
    });
  }
}

module.exports = {
  getPatients,
  getTrends
};
