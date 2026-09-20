const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const DEFAULT_GAMES = [
  {
    id: "memory-match",
    title: "Northeast Memory Match",
    cognitive_domain: "memory",
    difficulty: 2,
    description: "Flip and pair traditional North Eastern cultural motifs and symbols.",
    estimated_time: "2-3 mins",
    instructions: "Tap cards to flip them and find matching pairs with minimum moves."
  },
  {
    id: "number-recall",
    title: "Digit Span Recall",
    cognitive_domain: "working-memory",
    difficulty: 2,
    description: "Remember sequences of numbers and repeat them in order.",
    estimated_time: "3 mins",
    instructions: "Watch the number sequence carefully, then enter the numbers in the same order."
  },
  {
    id: "word-recall",
    title: "Word Association",
    cognitive_domain: "verbal-memory",
    difficulty: 1,
    description: "Match regional words with their corresponding cultural and daily life contexts.",
    estimated_time: "2 mins",
    instructions: "Select the word that best matches the cue or context provided."
  },
  {
    id: "pattern-recall",
    title: "Visual Pattern Recall",
    cognitive_domain: "visuospatial",
    difficulty: 2,
    description: "Memorize active grid positions and recreate the pattern accurately.",
    estimated_time: "3 mins",
    instructions: "Observe the lit tiles in the grid, wait for them to hide, and click the correct positions."
  },
  {
    id: "attention-test",
    title: "Selective Attention",
    cognitive_domain: "attention",
    difficulty: 2,
    description: "Quickly identify and tap matching cultural symbols under time pressure.",
    estimated_time: "2 mins",
    instructions: "Tap the target symbol as quickly as possible whenever it appears on screen."
  }
];

async function seedDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log("[DB Seed] Seeding default games catalog...");
    for (const game of DEFAULT_GAMES) {
      await connection.query(
        `INSERT INTO games (id, title, cognitive_domain, difficulty, description, estimated_time, instructions, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           cognitive_domain = VALUES(cognitive_domain),
           description = VALUES(description),
           instructions = VALUES(instructions)`,
        [game.id, game.title, game.cognitive_domain, game.difficulty, game.description, game.estimated_time, game.instructions]
      );
    }

    console.log("[DB Seed] Seeding baseline test users and profiles...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // Patient User
    await connection.query(
      `INSERT INTO users (id, name, email, password, role, is_active)
       VALUES (?, ?, ?, ?, 'patient', TRUE)
       ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)`,
      ["usr_pat_001", "Bhaben Barua", "bhaben@eldercare.in", passwordHash]
    );

    // Patient Profile
    await connection.query(
      `INSERT INTO patients (id, user_id, name, age, gender, primary_language, condition_stage, emergency_contact_name, emergency_contact_relation, emergency_contact_phone, avatar_url)
       VALUES (?, ?, ?, 72, 'Male', 'as', 'Mild Cognitive Impairment', 'Anup Barua', 'Son', '+91 98765 43210', '/ner_senior_avatar.png')
       ON DUPLICATE KEY UPDATE name = VALUES(name), age = VALUES(age), emergency_contact_phone = VALUES(emergency_contact_phone)`,
      ["PAT001", "usr_pat_001", "Bhaben Barua"]
    );

    // Caregiver User
    await connection.query(
      `INSERT INTO users (id, name, email, password, role, is_active)
       VALUES (?, ?, ?, ?, 'caregiver', TRUE)
       ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role)`,
      ["usr_cg_001", "Anup Barua", "caregiver@eldercare.in", passwordHash]
    );

    // Caregiver Profile
    await connection.query(
      `INSERT INTO caregivers (id, user_id, name, phone, specialization)
       VALUES (?, ?, ?, '+91 98765 43210', 'Primary Family Caregiver')
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
      ["CG001", "usr_cg_001", "Anup Barua"]
    );

    // Caregiver-Patient Assignment
    await connection.query(
      `INSERT INTO caregiver_patient_assignments (id, caregiver_id, patient_id, status)
       VALUES (?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active'`,
      ["cpa_001", "CG001", "PAT001"]
    );

    // Sample Reminders
    const reminders = [
      { id: "rem_001", title: "Morning Blood Pressure Medicine", type: "medication", time: "08:00 AM", status: "completed" },
      { id: "rem_002", title: "Gentle Morning Garden Walk", type: "exercise", time: "09:30 AM", status: "completed" },
      { id: "rem_003", title: "Hydration & Coconut Water", type: "hydration", time: "02:00 PM", status: "pending" },
      { id: "rem_004", title: "Evening Word Association Game", type: "activity", time: "05:00 PM", status: "pending" }
    ];

    for (const rem of reminders) {
      await connection.query(
        `INSERT INTO reminders (id, patient_id, created_by, title, reminder_type, time, frequency, is_enabled, status)
         VALUES (?, 'PAT001', 'usr_cg_001', ?, ?, ?, 'daily', TRUE, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), status = VALUES(status)`,
        [rem.id, rem.title, rem.type, rem.time, rem.status]
      );
    }

    // Sample Memory
    await connection.query(
      `INSERT INTO memories (id, patient_id, title, person_name, relationship, description, memory_type, photo_url, date_of_memory, location, tags, caregiver_verified, is_important)
       VALUES (?, 'PAT001', ?, ?, ?, ?, 'family', ?, ?, ?, ?, TRUE, TRUE)
       ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description)`,
      [
        "mem_001",
        "Bihu Celebration with Grandchildren",
        "Jonali & Aarav",
        "Grandchildren",
        "Celebrated Rongali Bihu together under the courtyard mango tree with traditional pitha.",
        "/assets/memories/bihu_celebration.jpg",
        "2024-04-14",
        "Guwahati, Assam",
        JSON.stringify(["family", "bihu", "grandchildren", "assam"])
      ]
    );

    console.log("[DB Seed] ✅ Database seed completed successfully.");
    return { success: true };
  } catch (error) {
    console.error("[DB Seed] ❌ Seeding failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  seedDatabase,
  DEFAULT_GAMES
};
