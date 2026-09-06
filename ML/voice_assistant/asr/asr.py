from transformers import AutoModel


MODEL_NAME = "ARTPARK-IISc/SraVaani-1.0"


print("Loading SraVaani ASR model...")
model = AutoModel.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True
)

print("SraVaani loaded successfully.")


def transcribe_audio(audio_path: str) -> str:
    """
    Convert an audio file into text.
    """
    result = model.transcribe(audio_path)

    if isinstance(result, list):
        return result[0]

    return str(result)


if __name__ == "__main__":
    print("ASR module ready.")