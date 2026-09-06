import pandas as pd


class Predictor:
    def __init__(self, model):
        self.model = model

    def predict(self, data):
        features = pd.DataFrame([data])

        prediction = int(self.model.predict(features)[0])

        # Safety bound: difficulty must always be 1–5
        prediction = max(1, min(5, prediction))

        probabilities = self.model.predict_proba(features)[0]
        confidence = float(max(probabilities))

        return {
            "next_difficulty": prediction,
            "confidence": confidence
        }