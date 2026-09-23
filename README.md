# SIH26003 — AI-Based Cognitive Gaming & Memory Assistance Platform

> Smart India Hackathon 2026  
> Problem Statement: **SIH26003**  
> Ministry: **Ministry of Development of North Eastern Region (MDoNER)**

## 📌 Overview

SIH26003 is an AI-powered cognitive support and memory assistance platform designed for elderly users, particularly in the North Eastern Region (NER) of India.

The platform combines:

- Cognitive games
- Adaptive difficulty using Machine Learning
- Personalized memory assistance
- Voice-based interaction
- Reminders
- Caregiver monitoring
- Performance tracking
- Regional-language support
- Offline/low-connectivity readiness

The goal is not to diagnose or treat dementia. Instead, the platform focuses on **personalized cognitive engagement, memory assistance, monitoring, and caregiver support**.

---

# 🎯 Problem

Elderly users experiencing memory and cognitive difficulties may face challenges with:

- Remembering people, places and routines
- Maintaining regular cognitive activity
- Using conventional digital applications
- Communicating through standard interfaces
- Accessing technology in low-connectivity environments

Caregivers also need a simple way to understand activity patterns and changes in performance.

The platform addresses these challenges through an elderly-friendly and personalized digital experience.

---

# 💡 Proposed Solution

The system provides a patient-facing application combined with a caregiver dashboard and an AI/ML intelligence layer.

### Patient

- Play cognitive games
- Receive personalized difficulty
- Practice memory and recall
- Use voice interaction
- Manage reminders
- Interact with familiar/personalized content

### Caregiver

- View patient profiles
- Monitor game history
- View performance trends
- Manage personal memories
- Monitor reminders
- Receive caregiver-support alerts

### Intelligence Layer

The ML system analyzes interaction data and helps personalize future activities.

---

# ✨ Key Features

## 🧠 Adaptive Cognitive Games

The platform supports multiple cognitive domains:

- Memory
- Attention
- Recall
- Recognition
- Pattern/language activities

The initial product target is approximately 4–5 cognitive games.

---

## 🤖 Adaptive Difficulty

The ML engine recommends the next difficulty level based on user performance.

Inputs include:

- Accuracy
- Response time
- Number of attempts
- Hints used
- Current difficulty
- Performance history
- Cognitive domain
- Recent performance trends

Difficulty levels range from **1 to 5**.

The backend validates the recommendation before returning it to the frontend.

---

## 🗣️ Voice Assistant

The voice pipeline provides voice-based interaction:

```text
User Speech
    ↓
Speech Recognition
    ↓
Intent Classification
    ↓
Safety Validation
    ↓
Allowed Action