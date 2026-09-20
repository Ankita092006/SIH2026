const { z } = require("zod");

/**
 * Validator for starting a new game session
 */
const startGameSessionSchema = z.object({
  gameId: z.string({ required_error: "gameId is required" }).trim().min(1, "gameId cannot be empty"),
  startingDifficulty: z.coerce.number().int().min(1).max(5).optional().default(2)
});

/**
 * Validator for submitting a game attempt with ML telemetry features
 * Matches specifications in ML/adaptive_difficulty/api/schemas.py and API_CONTRACT.md
 */
const gameAttemptSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }).trim().min(1, "sessionId cannot be empty"),
  gameId: z.string({ required_error: "gameId is required" }).trim().min(1, "gameId cannot be empty"),
  game_type: z.string().optional().default("memory"),
  cognitive_domain: z.string().optional().default("memory"),
  current_difficulty: z.coerce.number().int().min(1, "Difficulty must be between 1 and 5").max(5, "Difficulty must be between 1 and 5"),
  accuracy: z.coerce.number().min(0, "Accuracy must be between 0 and 1").max(1, "Accuracy must be between 0 and 1"),
  response_time: z.coerce.number().min(0, "Response time must be non-negative"),
  attempts: z.coerce.number().int().min(0, "Attempts must be non-negative"),
  hints_used: z.coerce.number().int().min(0, "Hints used must be non-negative").default(0),
  recent_accuracy: z.coerce.number().min(0).max(1).optional(),
  recent_response_time: z.coerce.number().min(0).optional(),
  accuracy_trend: z.coerce.number().optional().default(0),
  response_time_trend: z.coerce.number().optional().default(0),
  consecutive_successes: z.coerce.number().int().min(0).optional().default(0),
  score: z.coerce.number().min(0).optional()
});

module.exports = {
  startGameSessionSchema,
  gameAttemptSchema
};
