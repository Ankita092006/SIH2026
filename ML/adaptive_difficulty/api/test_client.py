import requests

url = "http://127.0.0.1:8000/predict"

data = {
    "game_type": "memory",
    "cognitive_domain": "memory",
    "current_difficulty": 3,
    "accuracy": 85,
    "response_time": 4,
    "attempts": 1,
    "hints_used": 0,
    "recent_accuracy": 82,
    "recent_response_time": 4.2,
    "accuracy_trend": 0.03,
    "response_time_trend": -0.1,
    "consecutive_successes": 3
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.json())