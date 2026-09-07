import json
import os

import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
CLASSIFIER_FILE = os.path.join(
    BASE_DIR,
    "voice_intent_classifier.json"
)
PROTOTYPES_FILE = os.path.join(
    BASE_DIR,
    "voice_intent_prototypes.json"
)


# Load configuration
with open(CLASSIFIER_FILE, "r", encoding="utf-8") as f:
    config = json.load(f)

SAFETY_THRESHOLD = config["safety_threshold"]


# Load prototypes
with open(PROTOTYPES_FILE, "r", encoding="utf-8") as f:
    train_prototypes = json.load(f)


print("Loading intent embedding model...")

embedding_model = SentenceTransformer(
    MODEL_NAME,
    device="cpu"
)

print("Intent model loaded successfully.")


def predict_intent(text: str):
    """
    Convert transcribed text into a safe application intent.

    Returns:
        {
            "intent": str,
            "similarity": float
        }
    """

    if not text or not text.strip():
        return {
            "intent": "UNKNOWN",
            "similarity": 0.0
        }

    embedding = embedding_model.encode(
        [text],
        normalize_embeddings=True,
        show_progress_bar=False
    )[0]

    scores = {}

    for intent, prototype in train_prototypes.items():

        prototype = np.asarray(
            prototype,
            dtype=np.float32
        )

        scores[intent] = float(
            np.dot(embedding, prototype)
        )

    predicted_intent = max(
        scores,
        key=scores.get
    )

    similarity = scores[predicted_intent]

    # Safety rejection
    if similarity < SAFETY_THRESHOLD:
        predicted_intent = "UNKNOWN"

    return {
        "intent": predicted_intent,
        "similarity": round(similarity, 4)
    }


if __name__ == "__main__":

    test_commands = [
        "start the memory game",
        "show my previous results",
        "what is my score",
        "go back",
        "please repeat that",
        "call my son",
        "open YouTube"
    ]

    for command in test_commands:

        result = predict_intent(command)

        print(
            f"{command!r} -> "
            f"{result['intent']} "
            f"({result['similarity']})"
        )