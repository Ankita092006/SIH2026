from fastapi import FastAPI

from model_loader import load_model
from predictor import Predictor
from schemas import PredictionRequest, PredictionResponse


app = FastAPI(
    title="SIH26003 Adaptive Difficulty ML Service",
    version="1.0.0"
)


# Load model once when the service starts
model = load_model()
predictor = Predictor(model)


@app.get("/")
def root():
    return {
        "service": "SIH26003 Adaptive Difficulty ML Service",
        "status": "running",
        "model_loaded": True
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    return predictor.predict(request.model_dump())