export const patientProfile = {
  id: "PT-8472",
  name: "Robert Smith",
  age: 72,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
  lastLogin: "2026-09-02T10:30:00Z"
};

export const cognitiveGames = [
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Find matching pairs of cards to exercise your short-term memory.",
    duration: "3-5 mins",
    difficulty: "Easy",
    iconName: "Brain" // We will map this to Lucide icon in component
  },
  {
    id: "pattern-recall",
    title: "Pattern Recall",
    description: "Remember and repeat the sequence of lights. Good for focus.",
    duration: "2-4 mins",
    difficulty: "Medium",
    iconName: "LayoutGrid"
  },
  {
    id: "number-recall",
    title: "Number Recall",
    description: "Listen to a sequence of numbers and type them back.",
    duration: "3 mins",
    difficulty: "Hard",
    iconName: "Hash"
  },
  {
    id: "word-recall",
    title: "Word Recall",
    description: "Memorize a list of words and recall them after a delay.",
    duration: "5 mins",
    difficulty: "Medium",
    iconName: "Type"
  },
  {
    id: "attention-test",
    title: "Attention Test",
    description: "Tap the screen quickly when you see the target shape.",
    duration: "2 mins",
    difficulty: "Easy",
    iconName: "Focus"
  }
];

export const patientResults = [
  {
    id: 1,
    gameId: "memory-match",
    date: "Today",
    score: 85,
    accuracy: 90,
    timeTaken: "2m 15s",
    summary: "Great job maintaining focus!"
  },
  {
    id: 2,
    gameId: "pattern-recall",
    date: "Yesterday",
    score: 92,
    accuracy: 95,
    timeTaken: "1m 45s",
    summary: "Excellent pattern recognition."
  },
  {
    id: 3,
    gameId: "memory-match",
    date: "2026-08-28",
    score: 70,
    accuracy: 75,
    timeTaken: "3m 10s",
    summary: "Good effort, keep practicing."
  }
];

export const remindersData = [
  {
    id: 1,
    text: "Take evening blood pressure medication",
    time: "6:00 PM",
    date: "Today",
    status: "pending"
  },
  {
    id: 2,
    text: "Drink a glass of water",
    time: "2:00 PM",
    date: "Today",
    status: "completed"
  },
  {
    id: 3,
    text: "Morning walk (15 mins)",
    time: "8:00 AM",
    date: "Today",
    status: "completed"
  },
  {
    id: 4,
    text: "Upcoming Doctor Appointment",
    time: "10:00 AM",
    date: "Tomorrow",
    status: "upcoming"
  }
];
