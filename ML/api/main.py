from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(
    title="SIH26003 Adaptive Difficulty ML Service",
    version="1.0.0"
)


# -------------------------
# Load trained model
# -------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "models" / "sih26003_adaptive_difficulty_v2.pkl"

model = joblib.load(MODEL_PATH)


# -------------------------
# Request structure
# -------------------------

class PredictionRequest(BaseModel):
    game_type: str
    cognitive_domain: str

    current_difficulty: int = Field(ge=1, le=5)

    accuracy: float = Field(ge=0, le=100)
    response_time: float = Field(ge=0)

    attempts: int = Field(ge=0)
    hints_used: int = Field(ge=0)

    recent_accuracy: float = Field(ge=0, le=100)
    recent_response_time: float = Field(ge=0)

    accuracy_trend: float
    response_time_trend: float

    consecutive_successes: int = Field(ge=0)


# -------------------------
# Response structure
# -------------------------

class PredictionResponse(BaseModel):
    next_difficulty: int
    confidence: float


# -------------------------
# Health check
# -------------------------

@app.get("/")
def root():
    return {
        "service": "SIH26003 Adaptive Difficulty ML Service",
        "status": "running",
        "model_loaded": True
    }


# -------------------------
# Prediction endpoint
# -------------------------

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):

    data = pd.DataFrame([request.model_dump()])

    prediction = int(model.predict(data)[0])
    prediction = max(1, min(5, prediction))

    probabilities = model.predict_proba(data)[0]
    confidence = float(max(probabilities))

    return {
        "next_difficulty": int(prediction),
        "confidence": confidence
    }