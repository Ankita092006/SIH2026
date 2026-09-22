# SIH26003 — Cognitive Gaming & Memory Assistance Platform

> **Smart India Hackathon 2026** | **Problem ID:** SIH26003  
> **Ministry:** Ministry of Development of North Eastern Region (MDoNER)  
> **Target:** AI-powered cognitive engagement, personalized memory recall, and caregiver monitoring for elderly individuals.

---

## 🏛️ Architecture

```text
React (Vite + Tailored Senior UI)
        ↓  (HTTPS / REST + JWT)
Node.js + Express API Gateway (Helmet, Rate Limiter, Auth & IDOR Guards)
   ├── MySQL (Aiven Cloud Connection Pool)
   ├── Python ML Service (FastAPI + Random Forest Adaptive Difficulty)
   └── Hugging Face Voice Service (Gradio ASR + 0.47 Intent Safety Filter)
```

> **Security Rule**: The Frontend **never** directly accesses MySQL, Python ML, Hugging Face, or database credentials. All operations are mediated and authorized by the Node.js Gateway.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Lucide Icons, Vanilla CSS (Senior-accessible design, high-contrast & regional language support)
- **Backend**: Node.js, Express 5, MySQL2 (Prepared Statements), JWT, Bcrypt, Helmet, Express-Rate-Limit
- **Database**: MySQL on Aiven Cloud
- **ML / AI**: Python 3.11+, FastAPI, Scikit-learn (Random Forest Regressor/Classifier for adaptive difficulty levels 1–5)
- **Voice Assistant**: SraVaani / HF Gradio ASR with semantic intent classification and strict allowlist enforcement

---

## ✨ Core Features

1. **Adaptive Cognitive Games**: Memory Match, Number Recall, Word Recall, Pattern Recall, and Attention Test.
2. **Adaptive Difficulty Engine**: Real-time ML calculation of next difficulty (1–5) based on response time, accuracy, hints, and error trends.
3. **Personal Memory Vault**: Personalized reminiscence therapy cards and automated recall question generation.
4. **Caregiver Dashboard**: Cognitive adherence monitoring, alert feeds, and historical trend metrics.
5. **Safe Voice Assistant**: Hands-free voice navigation with a `>= 0.47` cosine-similarity safety gate rejecting unauthorized commands.
6. **Zero-Trust Security**: Strict server-side RBAC, IDOR protection across all records, and parameterized SQL queries.

---

## 🚀 Quick Start

### 1. Backend (API Gateway)
```bash
cd Backend
npm install
cp .env.example .env    # Configure your MySQL and JWT settings
npm start               # Runs on http://localhost:5000
npm test                # Runs 30 automated security & integration tests
```

### 2. ML Engine (Adaptive Difficulty)
```bash
cd ML/adaptive_difficulty/api
# Use Python virtual environment with scikit-learn==1.6.1
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend (React SPA)
```bash
cd Frontend
npm install
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev             # Runs on http://localhost:5173
npm test                # Runs 27 Vitest unit and integration tests
npm run build           # Validates production build
```

---

## 🔒 Security Hardening

- **Authentication**: Bcrypt password hashing + signed JWTs (24h expiry) with authoritative server-side role resolution.
- **Authorization**: Anti-IDOR guards across profile, results, reminders, memories, and caregiver rosters.
- **API Defense**: Helmet CSP headers, CORS origin whitelisting, 1MB body limits, and sensitive endpoint rate limiting.
- **Data Protection**: Zero raw SQL string interpolation and sanitized production error responses.