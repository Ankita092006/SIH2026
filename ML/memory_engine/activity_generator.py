from typing import Dict, List
from .memory_schema import PersonalMemory


def _activity(activity_type: str, question: str, answer: str, memory_id: str):
    return {
        "type": activity_type,
        "question": question,
        "answer": answer,
        "memory_id": memory_id
    }


def generate_activities(memory: PersonalMemory) -> List[Dict]:
    """
    Generate personalized recall activities from a caregiver-approved memory.
    """

    if not memory.caregiver_verified:
        return []

    activities = []

    # -------------------------
    # PERSON
    # -------------------------
    if memory.memory_type == "PERSON":

        if memory.person:
            activities.append(
                _activity(
                    "RECOGNITION",
                    "Who is this person?",
                    memory.person,
                    memory.memory_id
                )
            )

        if memory.person and memory.relationship:
            activities.append(
                _activity(
                    "ASSOCIATION",
                    f"What is {memory.person}'s relationship with you?",
                    memory.relationship,
                    memory.memory_id
                )
            )

        if memory.person and memory.description:
            activities.append(
                _activity(
                    "RECALL",
                    "Who is connected to this special memory?",
                    memory.person,
                    memory.memory_id
                )
            )

        if memory.location:
            activities.append(
                _activity(
                    "LOCATION_RECALL",
                    "Where did this memory take place?",
                    memory.location,
                    memory.memory_id
                )
            )

        if memory.date:
            activities.append(
                _activity(
                    "DATE_RECALL",
                    "Do you remember when this memory happened?",
                    memory.date,
                    memory.memory_id
                )
            )

    # -------------------------
    # EVENT
    # -------------------------
    elif memory.memory_type == "EVENT":

        if memory.title:
            activities.append(
                _activity(
                    "EVENT_RECALL",
                    "What event or occasion is this memory about?",
                    memory.title,
                    memory.memory_id
                )
            )

        if memory.location:
            activities.append(
                _activity(
                    "LOCATION_RECALL",
                    "Where did this event take place?",
                    memory.location,
                    memory.memory_id
                )
            )

        if memory.date:
            activities.append(
                _activity(
                    "DATE_RECALL",
                    "When did this event happen?",
                    memory.date,
                    memory.memory_id
                )
            )

        if memory.description:
            activities.append(
                _activity(
                    "DESCRIPTION_RECALL",
                    "What do you remember about this event?",
                    memory.description,
                    memory.memory_id
                )
            )

    # -------------------------
    # PLACE
    # -------------------------
    elif memory.memory_type == "PLACE":

        if memory.title:
            activities.append(
                _activity(
                    "PLACE_RECOGNITION",
                    "What place is this?",
                    memory.title,
                    memory.memory_id
                )
            )

        if memory.location:
            activities.append(
                _activity(
                    "LOCATION_RECALL",
                    "Where is this place?",
                    memory.location,
                    memory.memory_id
                )
            )

        if memory.description:
            activities.append(
                _activity(
                    "DESCRIPTION_RECALL",
                    "What do you remember about this place?",
                    memory.description,
                    memory.memory_id
                )
            )

    # -------------------------
    # OBJECT
    # -------------------------
    elif memory.memory_type == "OBJECT":

        if memory.title:
            activities.append(
                _activity(
                    "OBJECT_RECOGNITION",
                    "What is this object?",
                    memory.title,
                    memory.memory_id
                )
            )

        if memory.description:
            activities.append(
                _activity(
                    "OBJECT_RECALL",
                    "What do you remember about this object?",
                    memory.description,
                    memory.memory_id
                )
            )

        if memory.person:
            activities.append(
                _activity(
                    "OWNERSHIP_RECALL",
                    "Who did this object belong to?",
                    memory.person,
                    memory.memory_id
                )
            )

    return activities