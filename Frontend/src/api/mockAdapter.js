/**
 * High-Fidelity Mock API Adapter for SIH26003
 * Follows exact Node.js and Python ML contracts defined in docs/API_CONTRACT.md and docs/ML_INTEGRATION.md
 * Completely isolated: zero network requests to real backend, databases, or ML services.
 */

// In-memory mock database store (initialized with realistic clinical sample data)
const mockStore = {
  users: [
    {
      id: "usr_pat_001",
      name: "Bhaben Barua",
      email: "bhaben@eldercare.in",
      role: "patient",
      patientId: "PAT001",
      createdAt: "2026-01-15T08:00:00Z"
    },
    {
      id: "usr_cg_001",
      name: "Anup Barua",
      email: "caregiver@eldercare.in",
      role: "caregiver",
      createdAt: "2026-01-10T08:00:00Z"
    }
  ],
  patientProfile: {
    id: "PAT001",
    name: "Bhaben Barua",
    age: 72,
    gender: "Male",
    primaryLanguage: "as",
    conditionStage: "Mild Cognitive Impairment",
    emergencyContact: {
      name: "Anup Barua",
      relation: "Son",
      phone: "+91 98765 43210"
    },
    avatarUrl: "/ner_senior_avatar.png"
  },
  games: [
    {
      id: "memory-match",
      title: "Northeast Memory Match",
      domain: "memory",
      difficulty: 2,
      description: "Flip and pair traditional North Eastern cultural motifs",
      estimatedTime: "2-3 mins"
    },
    {
      id: "number-recall",
      title: "Digit Span Recall",
      domain: "working-memory",
      difficulty: 2,
      description: "Remember sequences of numbers and repeat them in order",
      estimatedTime: "3 mins"
    },
    {
      id: "word-recall",
      title: "Word Association",
      domain: "verbal-memory",
      difficulty: 1,
      description: "Match regional words with their corresponding cultural contexts",
      estimatedTime: "2 mins"
    },
    {
      id: "pattern-recall",
      title: "Visual Pattern Recall",
      domain: "visuospatial",
      difficulty: 2,
      description: "Memorize active grid positions and recreate the pattern",
      estimatedTime: "3 mins"
    },
    {
      id: "attention-test",
      title: "Selective Attention",
      domain: "attention",
      difficulty: 2,
      description: "Quickly identify and tap matching cultural symbols",
      estimatedTime: "2 mins"
    }
  ],
  reminders: [
    {
      id: "1",
      title: "Morning Blood Pressure Medicine",
      time: "08:00 AM",
      type: "medication",
      completed: true,
      recurrence: "Daily"
    },
    {
      id: "2",
      title: "Gentle Morning Garden Walk",
      time: "09:30 AM",
      type: "exercise",
      completed: true,
      recurrence: "Daily"
    },
    {
      id: "3",
      title: "Afternoon Memory Activity",
      time: "02:00 PM",
      type: "activity",
      completed: false,
      recurrence: "Daily"
    },
    {
      id: "4",
      title: "Evening Family Call with Maya",
      time: "06:00 PM",
      type: "social",
      completed: false,
      recurrence: "Daily"
    }
  ],
  memories: [
    {
      memory_id: "mem_001",
      patient_id: "PAT001",
      memory_type: "PERSON",
      title: "Sister Maya at Rongali Bihu",
      person: "Maya Barua",
      relationship: "Sister",
      description: "Celebrated Bihu with traditional pitha and tea in Jorhat.",
      image_url: "/ner_senior_avatar.png",
      date: "2024-04-14",
      location: "Jorhat, Assam",
      tags: ["family", "sister", "bihu", "tea"],
      caregiver_verified: true
    },
    {
      memory_id: "mem_002",
      patient_id: "PAT001",
      memory_type: "LOCATION",
      title: "Tea Garden Residence",
      person: "Family",
      relationship: "Home",
      description: "Our historic tea estate bungalow where we lived for 30 years.",
      image_url: "/ner_senior_avatar.png",
      date: "1995-11-20",
      location: "Dibrugarh, Assam",
      tags: ["home", "tea garden", "heritage"],
      caregiver_verified: true
    }
  ],
  results: [
    {
      id: "res_001",
      gameId: "memory-match",
      gameTitle: "Northeast Memory Match",
      score: 90,
      accuracy: 90,
      timeTaken: "45s",
      averageResponseTime: "1.8s",
      timestamp: "2026-09-18T10:30:00Z",
      summary: "Excellent performance with quick pattern pairing."
    },
    {
      id: "res_002",
      gameId: "pattern-recall",
      gameTitle: "Visual Pattern Recall",
      score: 75,
      accuracy: 75,
      timeTaken: "60s",
      averageResponseTime: "2.4s",
      timestamp: "2026-09-17T15:15:00Z",
      summary: "Good effort on spatial memory."
    }
  ],
  activeSessions: new Map()
};

// Safe Voice Action Allow-list (matches ML/voice_assistant/actions/action_registry.py)
export const SAFE_VOICE_ACTIONS = {
  START_MEMORY_GAME: "start_memory_game",
  START_ATTENTION_GAME: "start_attention_game",
  START_RECALL_GAME: "start_recall_game",
  STOP_GAME: "stop_game",
  REPEAT: "repeat",
  NEXT: "next",
  HELP: "help",
  SHOW_SCORE: "show_score",
  SHOW_HISTORY: "show_history",
  SET_REMINDER: "set_reminder",
  SHOW_REMINDERS: "show_reminders",
  GO_HOME: "go_home",
  GO_BACK: "go_back",
  CHANGE_LANGUAGE: "change_language"
};

// Voice simulation phrase mappings for testing
const VOICE_PHRASE_MAPPINGS = [
  { phrase: "start memory game", intent: "START_MEMORY_GAME", similarity: 0.88, response: "Starting Memory Match game." },
  { phrase: "memory game", intent: "START_MEMORY_GAME", similarity: 0.85, response: "Starting Memory Match game." },
  { phrase: "attention game", intent: "START_ATTENTION_GAME", similarity: 0.86, response: "Starting Selective Attention game." },
  { phrase: "stop game", intent: "STOP_GAME", similarity: 0.92, response: "Stopping the game." },
  { phrase: "stop", intent: "STOP_GAME", similarity: 0.80, response: "Stopping the game." },
  { phrase: "show reminders", intent: "SHOW_REMINDERS", similarity: 0.90, response: "Opening your reminders." },
  { phrase: "go home", intent: "GO_HOME", similarity: 0.95, response: "Returning to home screen." },
  { phrase: "home", intent: "GO_HOME", similarity: 0.88, response: "Returning to home screen." },
  { phrase: "show history", intent: "SHOW_HISTORY", similarity: 0.87, response: "Opening your game history." },
  { phrase: "help", intent: "HELP", similarity: 0.94, response: "Opening assistance guide." },
  { phrase: "change language", intent: "CHANGE_LANGUAGE", similarity: 0.89, response: "Switching language." }
];

/**
 * Handle incoming API requests in mock mode
 */
export async function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
  const url = new URL(endpoint, "http://mock-api.local");
  const pathname = url.pathname;

  // Simulate network latency (20ms - 50ms)
  await new Promise(r => setTimeout(r, 30));

  // --- HEALTH CHECK ---
  if (pathname === '/api/health' && method === 'GET') {
    return {
      status: 200,
      data: { success: true, message: "NER Cognitive Platform Mock Gateway is operational" }
    };
  }

  // --- AUTH ROUTES ---
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    if (!email || !password) {
      return { status: 400, data: { success: false, message: "Email and password are required" } };
    }
    const user = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: "usr_mock_" + Date.now(),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: email.includes("caregiver") ? "caregiver" : "patient"
    };

    return {
      status: 200,
      data: {
        success: true,
        message: "Login successful",
        token: "mock_jwt_token_" + Buffer.from(JSON.stringify(user)).toString('base64'),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const { name, email, password, role } = body || {};
    if (!name || !email || !password) {
      return { status: 400, data: { success: false, message: "Name, email and password are required" } };
    }
    if (password.length < 6) {
      return { status: 400, data: { success: false, message: "Password must be at least 6 characters" } };
    }
    const newUser = {
      id: "usr_" + Date.now(),
      name,
      email: email.toLowerCase(),
      role: role || 'patient',
      createdAt: new Date().toISOString()
    };
    mockStore.users.push(newUser);

    return {
      status: 201,
      data: {
        success: true,
        message: "User registered successfully",
        token: "mock_jwt_token_" + Buffer.from(JSON.stringify(newUser)).toString('base64'),
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    };
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const defaultUser = mockStore.users[0];
    return {
      status: 200,
      data: {
        success: true,
        user: {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role,
          createdAt: defaultUser.createdAt
        }
      }
    };
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return {
      status: 200,
      data: { success: true, message: "Logged out successfully" }
    };
  }

  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    return {
      status: 200,
      data: { success: true, message: "Password reset instructions sent to your email" }
    };
  }

  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    return {
      status: 200,
      data: { success: true, message: "Password has been successfully reset" }
    };
  }

  // --- PATIENT PROFILE ---
  if (pathname === '/api/patient/profile') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, patient: mockStore.patientProfile } };
    }
    if (method === 'PUT') {
      mockStore.patientProfile = { ...mockStore.patientProfile, ...body };
      return { status: 200, data: { success: true, message: "Profile updated successfully", patient: mockStore.patientProfile } };
    }
  }

  // --- GAMES & SESSIONS ---
  if (pathname === '/api/games' && method === 'GET') {
    return { status: 200, data: { success: true, games: mockStore.games } };
  }

  if (pathname.startsWith('/api/games/') && pathname.endsWith('/sessions') && method === 'POST') {
    const gameId = pathname.split('/')[3];
    const sessionId = "ses_" + Date.now() + "_" + gameId;
    mockStore.activeSessions.set(sessionId, { gameId, startTime: Date.now(), attempts: [] });
    return {
      status: 201,
      data: {
        success: true,
        sessionId,
        gameId,
        startingDifficulty: 2,
        timestamp: new Date().toISOString()
      }
    };
  }

  // --- GAME ATTEMPT & ADAPTIVE DIFFICULTY PREDICTION ---
  // Follows Python ML Random Forest specification: schemas.py
  if (pathname === '/api/games/attempts' && method === 'POST') {
    const {
      sessionId,
      gameId,
      current_difficulty = 2,
      accuracy = 1.0,
      response_time = 3.0,
      attempts = 1,
      hints_used = 0,
      simulateFailure = false
    } = body || {};

    // ML Failure Simulation test case
    if (simulateFailure) {
      return {
        status: 503,
        data: {
          success: false,
          message: "Adaptive Difficulty ML service unavailable"
        }
      };
    }

    // Deterministic mock of Random Forest prediction logic:
    // High accuracy (>0.8) and low response time -> recommend increase
    // Low accuracy (<0.5) -> recommend decrease
    let nextDifficulty = current_difficulty;
    if (accuracy >= 0.8 && attempts <= 8) {
      nextDifficulty = current_difficulty + 1;
    } else if (accuracy < 0.5) {
      nextDifficulty = current_difficulty - 1;
    }

    // Invariant clamping 1-5
    const clampedDifficulty = Math.min(5, Math.max(1, nextDifficulty));

    const attemptResult = {
      attemptId: "att_" + Date.now(),
      sessionId,
      gameId,
      score: Math.round(accuracy * 100),
      accuracy: Math.round(accuracy * 100),
      timeTaken: `${Math.round(response_time * attempts)}s`,
      next_difficulty: clampedDifficulty,
      confidence: 0.82,
      source: "ml"
    };

    // Also record in results history
    mockStore.results.unshift({
      id: attemptResult.attemptId,
      gameId: gameId || "memory-match",
      gameTitle: mockStore.games.find(g => g.id === gameId)?.title || "Cognitive Game",
      score: attemptResult.score,
      accuracy: attemptResult.accuracy,
      timeTaken: attemptResult.timeTaken,
      averageResponseTime: `${response_time.toFixed(1)}s`,
      timestamp: new Date().toISOString(),
      summary: attemptResult.accuracy >= 80 ? "High accuracy recorded." : "Consistent practice recorded."
    });

    return {
      status: 200,
      data: {
        success: true,
        ...attemptResult
      }
    };
  }

  // --- VOICE ASSISTANT GATEWAY ---
  // Conforms strictly to SraVaani ASR + paraphrase-multilingual-MiniLM-L12-v2 classifier (ML/voice_assistant/)
  if (pathname === '/api/voice/process' && method === 'POST') {
    const { simulatedPhrase = "", simulateError = false } = body || {};

    if (simulateError) {
      return {
        status: 503,
        data: {
          success: false,
          message: "Voice assistance is temporarily unavailable."
        }
      };
    }

    const cleanInput = (simulatedPhrase || "").trim().toLowerCase();
    const match = VOICE_PHRASE_MAPPINGS.find(m => cleanInput.includes(m.phrase));

    if (match && match.similarity >= 0.47) {
      const allowedAction = SAFE_VOICE_ACTIONS[match.intent];
      if (allowedAction) {
        return {
          status: 200,
          data: {
            success: true,
            transcription: simulatedPhrase,
            intent: match.intent,
            similarity: match.similarity,
            action: allowedAction,
            allowed: true,
            response: match.response
          }
        };
      }
    }

    // If unrecognized or similarity < 0.47 threshold:
    return {
      status: 200,
      data: {
        success: true,
        transcription: simulatedPhrase || "...",
        intent: "UNKNOWN",
        similarity: 0.31,
        action: null,
        allowed: false,
        response: "I didn't understand that command."
      }
    };
  }

  // --- PERSONAL MEMORY VAULT ---
  if (pathname === '/api/memories') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, memories: mockStore.memories } };
    }
    if (method === 'POST') {
      const newMemory = {
        memory_id: "mem_" + Date.now(),
        patient_id: body.patient_id || "PAT001",
        memory_type: body.memory_type || "PERSON",
        title: body.title || "Family Memory",
        person: body.person || "",
        relationship: body.relationship || "",
        description: body.description || "",
        image_url: body.image_url || "/ner_senior_avatar.png",
        date: body.date || new Date().toISOString().split('T')[0],
        location: body.location || "Assam",
        tags: body.tags || [],
        caregiver_verified: true
      };
      mockStore.memories.unshift(newMemory);
      return { status: 201, data: { success: true, memory: newMemory } };
    }
  }

  if (pathname === '/api/memories/generate-activity' && method === 'POST') {
    const verifiedMemories = mockStore.memories.filter(m => m.caregiver_verified);
    const selected = verifiedMemories[0] || mockStore.memories[0];
    return {
      status: 200,
      data: {
        success: true,
        activity: {
          activityId: "act_" + Date.now(),
          type: "RECOGNITION",
          question: `Who is this special person from ${selected.location || "your memories"}?`,
          answer: selected.person || "Maya Barua",
          memory_id: selected.memory_id,
          options: [selected.person || "Maya Barua", "Protima", "Jonali", "Rina"],
          imageUrl: selected.image_url
        }
      }
    };
  }

  // --- REMINDERS ---
  if (pathname === '/api/reminders') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, reminders: mockStore.reminders } };
    }
    if (method === 'POST') {
      const newReminder = {
        id: String(Date.now()),
        title: body.title || "New Reminder",
        time: body.time || "10:00 AM",
        type: body.type || "activity",
        completed: false,
        recurrence: body.recurrence || "Daily"
      };
      mockStore.reminders.push(newReminder);
      return { status: 201, data: { success: true, reminder: newReminder } };
    }
  }

  if (pathname.startsWith('/api/reminders/') && pathname.endsWith('/toggle') && method === 'PATCH') {
    const id = pathname.split('/')[3];
    const rem = mockStore.reminders.find(r => r.id === id);
    if (rem) {
      rem.completed = !rem.completed;
      return { status: 200, data: { success: true, reminder: rem } };
    }
    return { status: 404, data: { success: false, message: "Reminder not found" } };
  }

  // --- RESULTS & DASHBOARD ---
  if (pathname === '/api/results' && method === 'GET') {
    return { status: 200, data: { success: true, results: mockStore.results } };
  }

  if (pathname === '/api/dashboard/summary' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        summary: {
          patientName: mockStore.patientProfile.name,
          recommendedGame: mockStore.games[0],
          pendingRemindersCount: mockStore.reminders.filter(r => !r.completed).length,
          recentGameResults: mockStore.results.slice(0, 3),
          cognitiveAdherenceRate: 88
        }
      }
    };
  }

  // --- CAREGIVER DASHBOARD ---
  if (pathname === '/api/caregiver/patients' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        patients: [
          {
            id: "PAT001",
            name: "Bhaben Barua",
            age: 72,
            language: "as",
            recentCognitiveScore: 84,
            adherenceRate: 92,
            activeReminders: mockStore.reminders.filter(r => !r.completed).length
          }
        ]
      }
    };
  }

  if (pathname.includes('/api/caregiver/patients/') && pathname.endsWith('/trends') && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        metrics: {
          cognitiveActivity: "Consistent",
          recentPerformance: "82% average accuracy across memory and recall exercises",
          performanceTrend: "Steady (+3% over 7 days)",
          activityChange: "Completed 5 cognitive sessions this week",
          alerts: [
            {
              id: "alt_01",
              severity: "info",
              message: "Completed morning cognitive match session"
            }
          ]
        }
      }
    };
  }

  // Unhandled endpoint fallback
  return {
    status: 404,
    data: { success: false, message: `Mock route not found: ${method} ${pathname}` }
  };
}
