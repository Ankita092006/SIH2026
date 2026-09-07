from pydantic import BaseModel


class VoiceTextRequest(BaseModel):
    text: str


class VoiceIntentResponse(BaseModel):
    text: str
    intent: str
    similarity: float
    action: str | None
    allowed: bool