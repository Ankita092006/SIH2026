# SIH26003 ML Integration Architecture & Specification

This document details the interfaces, machine learning model specifications, safety boundaries, and exact integration contracts between the React Frontend, Node.js API Gateway, and Python ML Services for the SIH26003 platform.

---

## 1. System A: Adaptive Cognitive Game Difficulty ML

### 1.1 Model Specification
- **Algorithm:** Random Forest Classifier (`scikit-learn`)
- **Location:** `ML/adaptive_difficulty/`
- **Purpose:** Analyzes patient gameplay telemetry (response times, error rates, trends) to prescribe an optimal, engaging difficulty level (1 to 5) that balances cognitive challenge without inducing frustration.
- **Difficulty Range:** `1` (Simplest) to `5` (Most challenging).

### 1.2 Input Features (Contract Derived from `ML/adaptive_difficulty/api/schemas.py`)

| Feature Name | Type | Range / Constraints | Description |
|---|---|---|---|
| `game_type` | `string` | e.g. `"memory"`, `"attention"` | Category identifier of the cognitive game. |
| `cognitive_domain` | `string` | e.g. `"memory"`, `"visuospatial"` | Target neurological domain. |
| `current_difficulty`| `integer`| `1 <= current_difficulty <= 5` | Difficulty level of the attempt just completed. |
| `accuracy` | `float` | `0.0 <= accuracy <= 1.0` | Proportion of correct responses in this round. |
| `response_time` | `float` | `>= 0.0` (seconds) | Average time taken per round/card/question. |
| `attempts` | `integer`| `>= 0` | Total tries made in the session. |
| `hints_used` | `integer`| `>= 0` | Number of assistive hints triggered. |
| `recent_accuracy` | `float` | `0.0 <= recent_accuracy <= 1.0` | Running average accuracy across recent sessions. |
| `recent_response_time`| `float` | `>= 0.0` (seconds) | Running average response time across recent sessions.|
| `accuracy_trend` | `float` | Arbitrary float (`+` or `-`) | Linear delta indicating improvement or fatigue. |
| `response_time_trend`| `float`| Arbitrary float (`+` or `-`) | Delta indicating quickening or slowing down. |
| `consecutive_successes`| `integer`| `>= 0` | Consecutive error-free rounds. |

### 1.3 Output Prediction
```json
{
  "next_difficulty": 4,
  "confidence": 0.78
}
```

### 1.4 Frontend Invariant Clamping & Fallback Guard
Regardless of what Python ML or Node.js returns, the React frontend strictly enforces:
```javascript
const safeDifficulty = Math.min(5, Math.max(1, response.next_difficulty || currentDifficulty));
```
If the ML service encounters a network error, timeout, or invalid output, the frontend **never crashes**. It executes:
```javascript
nextDifficulty = currentDifficulty;
source = "fallback";
```
Confidence is **NEVER** displayed as a medical prognosis or diagnostic certainty.

---

## 2. System B: Voice Assistant & Speech Processing

### 2.1 Model Specifications
- **ASR Engine:** `ARTPARK-IISc/SraVaani-1.0`
  - Purpose: High-accuracy Automatic Speech Recognition supporting Indian languages and North Eastern Region accents.
- **Intent Classifier:** `paraphrase-multilingual-MiniLM-L12-v2`
  - Purpose: Semantic prototype-based classification across multilingual speech transcripts.
- **Safety Confidence Threshold:** `0.47`
  - Cosine similarity below `0.47` is strictly classified as `UNKNOWN`.

### 2.2 Safe Action Registry (`ML/voice_assistant/actions/action_registry.py`)

The frontend guarantees that **no dynamic strings or arbitrary commands** are executed. Only actions registered in this explicit allow-list are processed:

| Recognized Intent | Allowed Action Name | Permitted Frontend Operation |
|---|---|---|
| `START_MEMORY_GAME` | `start_memory_game` | `navigate('/games/memory-match/play')` |
| `START_ATTENTION_GAME` | `start_attention_game` | `navigate('/games/attention-test/play')` |
| `START_RECALL_GAME` | `start_recall_game` | `navigate('/games/number-recall/play')` |
| `STOP_GAME` | `stop_game` | Triggers game pause / quit modal |
| `REPEAT` | `repeat` | Replays auditory question / hint |
| `NEXT` | `next` | Advances to next question/card |
| `HELP` | `help` | Displays accessible guidance modal |
| `SHOW_SCORE` | `show_score` | Reads current score / navigates to results |
| `SHOW_HISTORY` | `show_history` | `navigate('/results')` |
| `SET_REMINDER` | `set_reminder` | Opens add-reminder dialog |
| `SHOW_REMINDERS` | `show_reminders` | `navigate('/reminders')` |
| `GO_HOME` | `go_home` | `navigate('/home')` |
| `GO_BACK` | `go_back` | `navigate(-1)` |
| `CHANGE_LANGUAGE` | `change_language` | Toggles between English & Assamese |

### 2.3 Voice UI States
The interactive voice interface manages 6 discrete states:
1. `IDLE` ("Tap microphone to speak")
2. `LISTENING` ("I'm listening...")
3. `PROCESSING` ("Understanding your request...")
4. `SUCCESS` (Speaks/displays confirmation and executes action)
5. `REJECTED` ("I didn't understand that command")
6. `ERROR` ("Voice assistance is temporarily unavailable")

---

## 3. System C: Personal Memory Reconstruction

### 3.1 Status
- **ML Status:** Architecture & Schema Defined. No finalized ML model exists yet.
- **Frontend Status:** API-ready data models and interactive recall UI implemented.

### 3.2 Schema (`ML/memory_engine/memory_schema.py`)
```json
{
  "patient_id": "PAT001",
  "memory_id": "mem_001",
  "memory_type": "PERSON",
  "title": "Family Trip to Kaziranga",
  "person": "Maya",
  "relationship": "Sister",
  "description": "Visiting Kaziranga National Park during Bihu holidays.",
  "image_url": "/assets/memories/maya.jpg",
  "date": "2024-04-14",
  "location": "Kaziranga, Assam",
  "tags": ["family", "sister", "bihu"],
  "caregiver_verified": true
}
```

### 3.3 Activity Generation (`ML/memory_engine/activity_generator.py`)
Generates personalized recall activities:
- `RECOGNITION`: "Who is this person?" -> `Maya`
- `ASSOCIATION`: "What is Maya's relationship with you?" -> `Sister`
- `RECALL`: "Who is connected to this special memory?" -> `Maya`
- `LOCATION`: "Where was this photo taken?" -> `Kaziranga, Assam`
