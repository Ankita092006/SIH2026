from .memory_schema import PersonalMemory
from .activity_generator import generate_activities


memories = [

    # 1. PERSON
    PersonalMemory(
        patient_id="P001",
        memory_id="M001",
        memory_type="PERSON",
        title="My Sister Maya",
        person="Maya",
        relationship="Sister",
        description="Maya visited me during Durga Puja.",
        image_url="maya.jpg",
        date="2024",
        location="Kolkata",
        tags=["family", "durga puja"],
        caregiver_verified=True
    ),

    # 2. EVENT
    PersonalMemory(
        patient_id="P001",
        memory_id="M002",
        memory_type="EVENT",
        title="Kaziranga Trip",
        person=None,
        relationship=None,
        description="We visited Kaziranga National Park with the family.",
        date="2023",
        location="Kaziranga",
        tags=["family", "travel"],
        caregiver_verified=True
    ),

    # 3. PLACE
    PersonalMemory(
        patient_id="P001",
        memory_id="M003",
        memory_type="PLACE",
        title="Old House",
        description="This was our old family home.",
        location="Guwahati",
        tags=["home", "family"],
        caregiver_verified=True
    ),

    # 4. OBJECT
    PersonalMemory(
        patient_id="P001",
        memory_id="M004",
        memory_type="OBJECT",
        title="Grandfather's Radio",
        description="This radio belonged to grandfather.",
        tags=["grandfather", "family"],
        caregiver_verified=True
    )
]


for memory in memories:

    print("\n" + "=" * 50)
    print("MEMORY TYPE:", memory.memory_type)
    print("TITLE:", memory.title)
    print("=" * 50)

    activities = generate_activities(memory)

    for activity in activities:
        print(f"\nType: {activity['type']}")
        print(f"Question: {activity['question']}")
        print(f"Answer: {activity['answer']}")