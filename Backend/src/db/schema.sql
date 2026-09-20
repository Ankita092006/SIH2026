-- ============================================================
-- SIH26003 Core MySQL Database Schema
-- Cognitive Gaming & Memory Assistance Platform for Dementia Care
-- Target Engine: MySQL 8.x / Aiven MySQL
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('patient', 'caregiver', 'admin') NOT NULL DEFAULT 'patient',
  phone VARCHAR(50) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL DEFAULT 70,
  gender VARCHAR(50) NOT NULL DEFAULT 'Not Specified',
  primary_language VARCHAR(10) NOT NULL DEFAULT 'as',
  condition_stage VARCHAR(100) NOT NULL DEFAULT 'Mild Cognitive Impairment',
  emergency_contact_name VARCHAR(255) DEFAULT NULL,
  emergency_contact_relation VARCHAR(100) DEFAULT NULL,
  emergency_contact_phone VARCHAR(50) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT '/ner_senior_avatar.png',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_patients_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CAREGIVERS TABLE
CREATE TABLE IF NOT EXISTS caregivers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  specialization VARCHAR(255) DEFAULT 'Family Caregiver',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_caregivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_caregivers_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CAREGIVER-PATIENT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS caregiver_patient_assignments (
  id VARCHAR(36) PRIMARY KEY,
  caregiver_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cpa_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE,
  CONSTRAINT fk_cpa_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  UNIQUE KEY uk_caregiver_patient (caregiver_id, patient_id),
  INDEX idx_cpa_caregiver (caregiver_id),
  INDEX idx_cpa_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. GAMES CATALOG TABLE
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  cognitive_domain VARCHAR(64) NOT NULL,
  difficulty INT NOT NULL DEFAULT 2,
  description TEXT,
  estimated_time VARCHAR(50) DEFAULT '2-3 mins',
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_games_domain (cognitive_domain),
  INDEX idx_games_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS game_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  game_id VARCHAR(64) NOT NULL,
  starting_difficulty INT NOT NULL DEFAULT 2,
  current_difficulty INT NOT NULL DEFAULT 2,
  status ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT NULL,
  CONSTRAINT fk_gs_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_gs_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_gs_patient_status (patient_id, status),
  INDEX idx_gs_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. GAME ATTEMPTS TABLE (Fine-grained in-session telemetry for Adaptive ML)
CREATE TABLE IF NOT EXISTS game_attempts (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  game_id VARCHAR(64) NOT NULL,
  round_number INT NOT NULL DEFAULT 1,
  difficulty INT NOT NULL DEFAULT 2,
  accuracy DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  response_time DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  hints_used INT NOT NULL DEFAULT 0,
  is_correct BOOLEAN NOT NULL DEFAULT TRUE,
  telemetry JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ga_session FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_ga_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_ga_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_ga_session (session_id),
  INDEX idx_ga_patient_game (patient_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. GAME RESULTS TABLE (Consolidated single source of truth for GameResult & Score)
CREATE TABLE IF NOT EXISTS game_results (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  game_id VARCHAR(64) NOT NULL,
  game_type VARCHAR(64) NOT NULL DEFAULT 'memory',
  cognitive_domain VARCHAR(64) NOT NULL DEFAULT 'memory',
  difficulty INT NOT NULL DEFAULT 2,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 100,
  accuracy DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  time_taken_seconds INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  next_difficulty INT NOT NULL DEFAULT 2,
  confidence DECIMAL(5, 2) DEFAULT NULL,
  prediction_source ENUM('ml', 'fallback', 'rule') NOT NULL DEFAULT 'rule',
  status ENUM('completed', 'incomplete', 'abandoned') NOT NULL DEFAULT 'completed',
  summary TEXT DEFAULT NULL,
  played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gr_session FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_gr_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_gr_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_gr_patient_played (patient_id, played_at DESC),
  INDEX idx_gr_game (game_id),
  INDEX idx_gr_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  reminder_type ENUM('medication', 'exercise', 'activity', 'hydration', 'appointment', 'other') NOT NULL DEFAULT 'other',
  time VARCHAR(20) NOT NULL,
  reminder_date DATE DEFAULT NULL,
  frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status ENUM('pending', 'completed', 'upcoming', 'missed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rem_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_rem_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_rem_patient_status (patient_id, status),
  INDEX idx_rem_type (reminder_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. MEMORIES TABLE (Personal Memory Vault)
CREATE TABLE IF NOT EXISTS memories (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  person_name VARCHAR(255) DEFAULT NULL,
  relationship VARCHAR(100) DEFAULT NULL,
  description TEXT NOT NULL,
  memory_type ENUM('person', 'place', 'event', 'family', 'other') NOT NULL DEFAULT 'other',
  photo_url VARCHAR(500) DEFAULT NULL,
  date_of_memory VARCHAR(50) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  tags JSON DEFAULT NULL,
  caregiver_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_important BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mem_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_mem_patient (patient_id),
  INDEX idx_mem_verified (caregiver_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. MEMORY RECALL ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS memory_recall_activities (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  memory_id VARCHAR(64) NOT NULL,
  activity_type VARCHAR(50) NOT NULL DEFAULT 'RECOGNITION',
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mra_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_mra_memory FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  INDEX idx_mra_patient (patient_id),
  INDEX idx_mra_memory (memory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. MEMORY RECALL ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS memory_recall_attempts (
  id VARCHAR(64) PRIMARY KEY,
  activity_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  selected_answer VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_seconds DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mrat_activity FOREIGN KEY (activity_id) REFERENCES memory_recall_activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_mrat_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_mrat_activity (activity_id),
  INDEX idx_mrat_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
