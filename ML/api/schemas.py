from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    game_type: str
    cognitive_domain: str

    current_difficulty: int = Field(ge=1, le=5)

    accuracy: float = Field(ge=0, le=1)
    response_time: float = Field(ge=0)

    attempts: int = Field(ge=0)
    hints_used: int = Field(ge=0)

    recent_accuracy: float = Field(ge=0, le=1)
    recent_response_time: float = Field(ge=0)

    accuracy_trend: float
    response_time_trend: float

    consecutive_successes: int = Field(ge=0)


class PredictionResponse(BaseModel):
    next_difficulty: int
    confidence: float