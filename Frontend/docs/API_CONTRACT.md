# SIH26003 Platform API Contract Specification

**Document Version:** 1.0.0  
**Architectural Scope:** Node.js Express Backend & ML Gateway Services for the SIH26003 Frontend.  
**Strict Isolation Rule:** The React frontend communicates **exclusively** with the Node.js API Gateway (`/api/*`). The frontend **NEVER** interacts directly with MySQL, Python ML services, Hugging Face spaces, SraVaani, or external model endpoints.

---

## 1. Classification & Status Legend

Every endpoint and contract in this document is labeled using the strict source-of-truth classifications:

| Status Tag | Description |
|---|---|
| `[CONFIRMED]` | Verified in existing code (`Backend/src/routes/authRoutes.js`, `ML/adaptive_difficulty/api/schemas.py`, or `ML/voice_assistant/actions/action_registry.py`). Reused exactly. |
| `[PROPOSED]` | Architected by frontend/ML specifications to satisfy SIH26003 platform goals. Awaiting backend implementation. |
| `[MOCK]` | Handled locally by `Frontend/src/api/mockAdapter.js` during isolated development and testing. |
| `[BACKEND-DEPENDENT]` | Requires backend database schema or routing logic to be developed by the Node.js team. |
| `[ML-DEPENDENT]` | Requires Python ML model service or inference pipeline to be deployed behind the Node.js gateway. |
| `[NOT IMPLEMENTED]` | Planned future capability not available in the current phase. |

---

## 2. Authentication API

### 2.1 Register User `[CONFIRMED]` `[BACKEND-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "password": "securePassword123",
    "role": "patient"
  }
  ```
- **Validation:** `name`, `email`, and `password` (min 6 chars) required. `role` in `["patient", "caregiver", "admin"]` (default `"patient"`).
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Ananya Sharma",
      "email": "ananya@example.com",
      "role": "patient"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "message": "Name, email and password are required"}`
  - `409 Conflict`: `{"success": false, "message": "User already exists"}`
  - `500 Server Error`: `{"success": false, "message": "Registration failed"}`

### 2.2 Login User `[CONFIRMED]` `[BACKEND-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "ananya@example.com",
    "password": "securePassword123"
  }
  ```
- **Validation:** `email` and `password` required.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Ananya Sharma",
      "email": "ananya@example.com",
      "role": "patient"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "message": "Email and password are required"}`
  - `401 Unauthorized`: `{"success": false, "message": "Invalid email or password"}`

### 2.3 Get Current User Session `[CONFIRMED]` `[BACKEND-DEPENDENT]`
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Auth:** Bearer Token required (`Authorization: Bearer <token>`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Ananya Sharma",
      "email": "ananya@example.com",
      "role": "patient",
      "createdAt": "2026-09-19T10:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"success": false, "message": "Not authorized to access this route"}`

### 2.4 Logout User `[CONFIRMED]` `[BACKEND-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Auth:** Bearer Token required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### 2.5 Forgot Password `[PROPOSED]` `[BACKEND-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/auth/forgot-password`
- **Auth:** Public
- **Request Body:** `{"email": "user@example.com"}`
- **Success Response (200 OK):** `{"success": true, "message": "Password reset instructions sent"}`
- **Error Response (404 Not Found):** `{"success": false, "message": "No account associated with that email"}`

### 2.6 Reset Password `[PROPOSED]` `[BACKEND-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/auth/reset-password`
- **Auth:** Public
- **Request Body:** `{"token": "reset_token_xyz", "newPassword": "newPassword123"}`
- **Success Response (200 OK):** `{"success": true, "message": "Password reset successfully"}`

---

## 3. Patient API `[PROPOSED]` `[BACKEND-DEPENDENT]`

### 3.1 Get Patient Profile
- **Method:** `GET`
- **Path:** `/api/patient/profile`
- **Auth:** Bearer Token (`role: patient | caregiver | admin`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "patient": {
      "id": "PAT001",
      "name": "Bhaben Barua",
      "age": 72,
      "language": "as",
      "stage": "Mild Cognitive Impairment",
      "emergencyContact": {
        "name": "Anup Barua",
        "relation": "Son",
        "phone": "+91 98765 43210"
      },
      "avatarUrl": "/ner_senior_avatar.png"
    }
  }
  ```

### 3.2 Update Patient Profile
- **Method:** `PUT`
- **Path:** `/api/patient/profile`
- **Auth:** Bearer Token
- **Request Body:**
  ```json
  {
    "name": "Bhaben Barua",
    "age": 72,
    "emergencyContact": {
      "name": "Anup Barua",
      "relation": "Son",
      "phone": "+91 98765 43210"
    }
  }
  ```
- **Success Response (200 OK):** `{"success": true, "message": "Profile updated", "patient": {...}}`

---

## 4. Game & Attempt API `[PROPOSED]` `[BACKEND-DEPENDENT]`

### 4.1 Get Games Catalog
- **Method:** `GET`
- **Path:** `/api/games`
- **Auth:** Bearer Token
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "games": [
      {
        "id": "memory-match",
        "title": "Northeast Memory Match",
        "cognitiveDomain": "memory",
        "difficulty": 2,
        "description": "Pair regional cultural symbols"
      },
      {
        "id": "number-recall",
        "title": "Digit Span Recall",
        "cognitiveDomain": "working-memory",
        "difficulty": 2,
        "description": "Remember and recall sequential numbers"
      },
      {
        "id": "word-recall",
        "title": "Word Association",
        "cognitiveDomain": "verbal-memory",
        "difficulty": 1,
        "description": "Identify related cultural and everyday concepts"
      },
      {
        "id": "pattern-recall",
        "title": "Visual Pattern Recall",
        "cognitiveDomain": "visuospatial",
        "difficulty": 2,
        "description": "Recall positions on grid layout"
      },
      {
        "id": "attention-test",
        "title": "Selective Attention",
        "cognitiveDomain": "attention",
        "difficulty": 2,
        "description": "Tap matching target icons"
      }
    ]
  }
  ```

### 4.2 Start Game Session
- **Method:** `POST`
- **Path:** `/api/games/:gameId/sessions`
- **Auth:** Bearer Token
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "sessionId": "ses_9921_mm",
    "gameId": "memory-match",
    "startingDifficulty": 2,
    "timestamp": "2026-09-19T10:30:00Z"
  }
  ```

### 4.3 Submit Attempt with Telemetry & Adaptive Prediction `[CONFIRMED ML CONTRACT]` `[ML-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/games/attempts`
- **Auth:** Bearer Token
- **Request Body (Derived strictly from `ML/adaptive_difficulty/api/schemas.py`):**
  ```json
  {
    "sessionId": "ses_9921_mm",
    "gameId": "memory-match",
    "game_type": "memory",
    "cognitive_domain": "memory",
    "current_difficulty": 3,
    "accuracy": 0.85,
    "response_time": 4.2,
    "attempts": 10,
    "hints_used": 1,
    "recent_accuracy": 0.82,
    "recent_response_time": 4.5,
    "accuracy_trend": 0.08,
    "response_time_trend": -0.3,
    "consecutive_successes": 3
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "attemptId": "att_001",
    "score": 85,
    "accuracy": 85,
    "timeTaken": "42s",
    "next_difficulty": 4,
    "confidence": 0.78,
    "source": "ml"
  }
  ```
- **Fallback on ML Failure (200 OK with Fallback Flag):**
  ```json
  {
    "success": true,
    "attemptId": "att_001",
    "score": 85,
    "accuracy": 85,
    "timeTaken": "42s",
    "next_difficulty": 3,
    "confidence": null,
    "source": "fallback"
  }
  ```

---

## 5. Voice Assistant API `[CONFIRMED ML CONTRACT]` `[ML-DEPENDENT]`

### 5.1 Process Voice Audio
- **Method:** `POST`
- **Path:** `/api/voice/process`
- **Auth:** Bearer Token
- **Request:** FormData with `audio` (Blob/File) or JSON with `audioBase64`, `language` ("en" | "as").
- **Success Response — Allowed Intent (200 OK):**
  ```json
  {
    "success": true,
    "transcription": "Stop the game",
    "intent": "STOP_GAME",
    "similarity": 0.82,
    "action": "stop_game",
    "allowed": true,
    "response": "Stopping the game."
  }
  ```
- **Success Response — Rejected / Below 0.47 Threshold (200 OK):**
  ```json
  {
    "success": true,
    "transcription": "Order groceries",
    "intent": "UNKNOWN",
    "similarity": 0.28,
    "action": null,
    "allowed": false,
    "response": "I didn't understand that command."
  }
  ```
- **Error Response (503 Service Unavailable):**
  ```json
  {
    "success": false,
    "message": "Voice assistance is temporarily unavailable."
  }
  ```

---

## 6. Personal Memory Vault & Recall API `[CONFIRMED ML SCHEMA]` `[BACKEND-DEPENDENT]`

Derived from `ML/memory_engine/memory_schema.py` and `activity_generator.py`.

### 6.1 Get Memories
- **Method:** `GET`
- **Path:** `/api/memories`
- **Auth:** Bearer Token
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "memories": [
      {
        "memory_id": "mem_001",
        "patient_id": "PAT001",
        "memory_type": "PERSON",
        "title": "Sister Maya's Visit",
        "person": "Maya",
        "relationship": "Sister",
        "description": "Family gathering at Kaziranga",
        "image_url": "/assets/memories/maya.jpg",
        "date": "2024-04-14",
        "location": "Kaziranga, Assam",
        "tags": ["family", "sister", "bihu"],
        "caregiver_verified": true
      }
    ]
  }
  ```

### 6.2 Create Memory
- **Method:** `POST`
- **Path:** `/api/memories`
- **Auth:** Bearer Token (`role: caregiver | admin`)
- **Success Response (201 Created):** `{"success": true, "memory": {...}}`

### 6.3 Generate Recall Activity `[ML-DEPENDENT]`
- **Method:** `POST`
- **Path:** `/api/memories/generate-activity`
- **Auth:** Bearer Token
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "activity": {
      "activityId": "act_rec_01",
      "type": "RECOGNITION",
      "question": "Who is this person in the photograph?",
      "answer": "Maya",
      "memory_id": "mem_001",
      "options": ["Maya", "Rina", "Protima", "Jonali"],
      "imageUrl": "/assets/memories/maya.jpg"
    }
  }
  ```

---

## 7. Caregiver Dashboard API `[PROPOSED]` `[BACKEND-DEPENDENT]`

### 7.1 Get Patients
- **Method:** `GET`
- **Path:** `/api/caregiver/patients`
- **Auth:** Bearer Token (`role: caregiver`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "patients": [
      {
        "id": "PAT001",
        "name": "Bhaben Barua",
        "age": 72,
        "recentCognitiveScore": 84,
        "adherenceRate": 92
      }
    ]
  }
  ```

### 7.2 Get Cognitive Trends & Alerts
- **Method:** `GET`
- **Path:** `/api/caregiver/patients/:patientId/trends`
- **Auth:** Bearer Token
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "metrics": {
      "cognitiveActivity": "Stable",
      "recentPerformance": "82% average accuracy over last 7 sessions",
      "performanceTrend": "Upward (+4% this week)",
      "activityChange": "Consistent daily practice",
      "alerts": [
        {
          "id": "alt_01",
          "severity": "info",
          "message": "Missed afternoon hydration reminder"
        }
      ]
    }
  }
  ```
