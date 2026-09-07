from fastapi import FastAPI
from .schemas import VoiceTextRequest, VoiceIntentResponse
from ..intent.intent import predict_intent
from ..actions.executor import execute_intent


app = FastAPI(
    title="SIH26003 Voice Assistant API",
    version="1.0.0"
)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "voice-assistant"
    }


@app.post("/voice/process", response_model=VoiceIntentResponse)
def process_voice(request: VoiceTextRequest):

    result = predict_intent(request.text)

    action_result = execute_intent(
        result["intent"],
        result["similarity"]
    )

    return {
        "text": request.text,
        "intent": result["intent"],
        "similarity": result["similarity"],
        "action": action_result["action"],
        "allowed": action_result["allowed"]
    }