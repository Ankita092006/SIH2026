import joblib

from config import MODEL_PATH


def load_model():
    return joblib.load(MODEL_PATH)