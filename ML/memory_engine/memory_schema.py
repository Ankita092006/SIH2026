from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class PersonalMemory:
    patient_id: str
    memory_id: str

    memory_type: str
    title: str

    person: Optional[str] = None
    relationship: Optional[str] = None

    description: Optional[str] = None
    image_url: Optional[str] = None

    date: Optional[str] = None
    location: Optional[str] = None

    tags: List[str] = field(default_factory=list)

    caregiver_verified: bool = False