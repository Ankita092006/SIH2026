import { describe, it, expect } from 'vitest';
import { gameApi } from '../api/game.api';
import { attemptApi } from '../api/attempt.api';

describe('Game Session Lifecycle & Attempt Telemetry Reporting', () => {
  it('fetches cognitive games catalog', async () => {
    const res = await gameApi.getGames();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.games)).toBe(true);
    expect(res.games.length).toBe(5);
  });

  it('starts a new game session with unique session ID', async () => {
    const res = await gameApi.startSession('memory-match');
    expect(res.success).toBe(true);
    expect(res.sessionId).toBeDefined();
    expect(res.sessionId).toContain('memory-match');
  });

  it('submits gameplay attempt telemetry matching schemas.py without errors', async () => {
    const telemetryPayload = {
      sessionId: 'ses_test_01',
      gameId: 'memory-match',
      game_type: 'memory',
      cognitive_domain: 'memory',
      current_difficulty: 2,
      accuracy: 0.9,
      response_time: 2.5,
      attempts: 8,
      hints_used: 0,
      recent_accuracy: 0.85,
      recent_response_time: 2.8,
      accuracy_trend: 0.05,
      response_time_trend: -0.3,
      consecutive_successes: 4
    };

    const res = await attemptApi.submitAttempt(telemetryPayload);
    expect(res.success).toBe(true);
    expect(res.attemptId).toBeDefined();
    expect(res.score).toBe(90);
    expect(res.next_difficulty).toBeDefined();
    expect(res.confidence).toBeDefined();
  });
});
