from .memory_schema import PersonalMemory
from .activity_generator import generate_activities
from .memory_selector import select_activity


memory = PersonalMemory(
    patient_id="P001",
    memory_id="M001",
    memory_type="PERSON",
    title="My Sister Maya",
    person="Maya",
    relationship="Sister",
    description="Maya visited me during Durga Puja.",
    date="2024",
    location="Kolkata",
    tags=["family", "durga puja"],
    caregiver_verified=True
)

activities = generate_activities(memory)

print("Generated activities:", len(activities))

# Simulate patient history
recent_results = [
    {
        "memory_id": "M001",
        "activity_type": "RECOGNITION",
        "correct": True
    },
    {
        "memory_id": "M001",
        "activity_type": "ASSOCIATION",
        "correct": False
    },
    {
        "memory_id": "M001",
        "activity_type": "RECALL",
        "correct": True
    }
]

selected = select_activity(
    activities,
    recent_results
)

print("\nPatient history:")
for result in recent_results:
    print(
        result["activity_type"],
        "→",
        "Correct" if result["correct"] else "Incorrect"
    )

print("\nNext selected activity:")
print("Type:", selected["type"])
print("Question:", selected["question"])
print("Answer:", selected["answer"])