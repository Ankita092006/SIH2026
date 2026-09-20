import { describe, it, expect, vi } from 'vitest';
import { adaptiveDifficultyApi } from '../api/adaptiveDifficulty.api';
import { attemptApi } from '../api/attempt.api';

describe('System A: Adaptive Difficulty ML Integration & Fallback Guard', () => {
  const baseTelemetry = {
    game_type: 'memory',
    cognitive_domain: 'memory',
    current_difficulty: 3,
    accuracy: 0.85,
    response_time: 3.2,
    attempts: 6,
    hints_used: 1,
    recent_accuracy: 0.80,
    recent_response_time: 3.5,
    accuracy_trend: 0.05,
    response_time_trend: -0.3,
    consecutive_successes: 2
  };

  it('correctly returns ML predicted difficulty within valid range [1, 5]', async () => {
    const result = await adaptiveDifficultyApi.getNextDifficulty(baseTelemetry);
    expect(result.nextDifficulty).toBeGreaterThanOrEqual(1);
    expect(result.nextDifficulty).toBeLessThanOrEqual(5);
    expect(result.source).toBe('ml');
  });

  it('strictly clamps ML difficulty below 1 to 1', async () => {
    // Mock backend returning difficulty 0
    vi.spyOn(attemptApi, 'submitAttempt').mockResolvedValueOnce({
      success: true,
      next_difficulty: 0,
      confidence: 0.9
    });

    const result = await adaptiveDifficultyApi.getNextDifficulty({
      ...baseTelemetry,
      current_difficulty: 1
    });

    expect(result.nextDifficulty).toBe(1);
    vi.restoreAllMocks();
  });

  it('strictly clamps ML difficulty above 5 to 5', async () => {
    // Mock backend returning difficulty 10
    vi.spyOn(attemptApi, 'submitAttempt').mockResolvedValueOnce({
      success: true,
      next_difficulty: 10,
      confidence: 0.85
    });

    const result = await adaptiveDifficultyApi.getNextDifficulty({
      ...baseTelemetry,
      current_difficulty: 5
    });

    expect(result.nextDifficulty).toBe(5);
    vi.restoreAllMocks();
  });

  it('falls back safely to currentDifficulty on ML 503 or network failure without crashing', async () => {
    // Simulate ML microservice crash or 503 error
    vi.spyOn(attemptApi, 'submitAttempt').mockRejectedValueOnce(
      new Error('Adaptive Difficulty ML service unavailable')
    );

    const result = await adaptiveDifficultyApi.getNextDifficulty({
      ...baseTelemetry,
      current_difficulty: 3
    });

    expect(result.nextDifficulty).toBe(3);
    expect(result.source).toBe('fallback');
    expect(result.confidence).toBeNull();
    vi.restoreAllMocks();
  });

  it('falls back safely when ML returns malformed or non-numeric response', async () => {
    vi.spyOn(attemptApi, 'submitAttempt').mockResolvedValueOnce({
      success: true,
      next_difficulty: 'invalid_number'
    });

    const result = await adaptiveDifficultyApi.getNextDifficulty({
      ...baseTelemetry,
      current_difficulty: 4
    });

    expect(result.nextDifficulty).toBe(4);
    expect(result.source).toBe('fallback');
    vi.restoreAllMocks();
  });
});
