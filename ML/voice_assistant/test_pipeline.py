from asr.asr import transcribe_audio
from intent.intent import predict_intent
from actions.action_registry import get_action


def process_audio(audio_path: str):
    text = transcribe_audio(audio_path)

    result = predict_intent(text)

    intent = result["intent"]
    action = get_action(intent, result["similarity"])

    print(f"Transcription: {text}")
    print(f"Intent: {intent}")
    print(f"Similarity: {result['similarity']}")
    print(f"Allowed Action: {action}")

    return {
        "intent": intent,
        "similarity": result["similarity"],
        "action": action
    }


if __name__ == "__main__":
    print("Voice pipeline ready.")