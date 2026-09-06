import os
from transformers import AutoModel

MODEL_NAME = "ARTPARK-IISc/SraVaani-1.0"
HF_TOKEN = os.environ.get("HF_TOKEN")

print("Loading SraVaani...")

model = AutoModel.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True,
    token=HF_TOKEN
).to("cuda").eval()

print("SraVaani loaded successfully.")


def transcribe_audio(audio_path: str) -> str:
    result = model.transcribe(audio_path)

    if isinstance(result, list):
        return result[0]

    return str(result)