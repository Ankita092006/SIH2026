ALLOWED_ACTIONS = {
    "START_MEMORY_GAME": "start_memory_game",
    "START_ATTENTION_GAME": "start_attention_game",
    "START_RECALL_GAME": "start_recall_game",
    "STOP_GAME": "stop_game",
    "REPEAT": "repeat",
    "NEXT": "next",
    "HELP": "help",
    "SHOW_SCORE": "show_score",
    "SHOW_HISTORY": "show_history",
    "SET_REMINDER": "set_reminder",
    "SHOW_REMINDERS": "show_reminders",
    "GO_HOME": "go_home",
    "GO_BACK": "go_back",
    "CHANGE_LANGUAGE": "change_language",
}


def get_action(intent: str, similarity: float = 0.0):
    """
    Convert a recognized intent into an allowed application action.
    Unknown or unsupported intents are rejected.
    """
    if similarity < 0.47:
        return None

    return ALLOWED_ACTIONS.get(intent)

if __name__ == "__main__":
    test_intents = [
        "START_MEMORY_GAME",
        "SHOW_SCORE",
        "GO_BACK",
        "UNKNOWN",
        "OPEN_YOUTUBE"
    ]

    for intent in test_intents:
        action = get_action(intent)
        print(f"{intent} -> {action}")