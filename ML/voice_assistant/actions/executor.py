from .action_registry import get_action


def execute_intent(intent: str, similarity: float):
    """
    Validate an intent and convert it into a safe action payload.
    """

    action = get_action(intent, similarity)

    if action is None:
        return {
            "intent": intent,
            "action": None,
            "allowed": False
        }

    return {
        "intent": intent,
        "action": action,
        "allowed": True
    }

if __name__ == "__main__":
    tests = [
        ("START_MEMORY_GAME", 0.92),
        ("SHOW_SCORE", 0.81),
        ("UNKNOWN", 0.90),
        ("START_MEMORY_GAME", 0.32),
    ]

    for intent, similarity in tests:
        result = execute_intent(intent, similarity)
        print(result)