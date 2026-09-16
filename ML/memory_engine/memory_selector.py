from typing import Dict, List


def _score_activity(
    activity: Dict,
    recent_results: List[Dict]
) -> float:
    """
    Calculate a priority score for an activity.

    Higher score = higher priority.
    """

    activity_type = activity["type"]
    memory_id = activity["memory_id"]

    score = 1.0

    # Get history for this specific activity
    history = [
        result for result in recent_results
        if result.get("memory_id") == memory_id
        and result.get("activity_type") == activity_type
    ]

    # Never attempted → encourage exploration
    if not history:
        score += 1.5
        return score

    # Count performance
    attempts = len(history)
    correct = sum(
        1 for result in history
        if result.get("correct") is True
    )

    accuracy = correct / attempts

    # Incorrect activities get higher priority
    if accuracy < 0.5:
        score += 3.0
    elif accuracy < 0.8:
        score += 1.5
    else:
        score += 0.5

    # Repeatedly attempted activities get lower priority
    score -= min(attempts * 0.5, 2.0)

    return max(score, 0.1)


def select_activity(
    activities: List[Dict],
    recent_results: List[Dict] | None = None
) -> Dict | None:
    """
    Select the next activity based on previous performance.
    """

    if not activities:
        return None

    recent_results = recent_results or []

    scored_activities = []

    for activity in activities:
        score = _score_activity(
            activity,
            recent_results
        )

        scored_activities.append(
            (score, activity)
        )

    # Highest scoring activity gets selected
    scored_activities.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return scored_activities[0][1]