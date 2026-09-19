/**
 * Adaptive Difficulty API Service
 * Interacts with Node.js gateway which proxies to Python Random Forest microservice.
 * Enforces safe clamping (1-5) and transparent fallback on network or ML errors.
 */

import { attemptApi } from './attempt.api';

export const adaptiveDifficultyApi = {
  /**
   * Request next difficulty recommendation from gameplay telemetry
   * @param {Object} telemetry - full gameplay telemetry payload
   * @returns {Promise<{ nextDifficulty: number, confidence: number|null, source: 'ml'|'fallback', raw: Object }>}
   */
  async getNextDifficulty(telemetry) {
    const currentDifficulty = Number(telemetry.current_difficulty || 2);

    try {
      const response = await attemptApi.submitAttempt(telemetry);

      // Extract prediction from backend response
      const rawNext = response.next_difficulty ?? response.nextDifficulty;
      const confidence = response.confidence ?? null;

      if (typeof rawNext === 'number' && !isNaN(rawNext)) {
        // Enforce strict invariant clamping 1 to 5
        const clamped = Math.min(5, Math.max(1, Math.round(rawNext)));
        return {
          nextDifficulty: clamped,
          confidence,
          source: response.source === 'fallback' ? 'fallback' : 'ml',
          raw: response
        };
      }

      // If backend returned non-numeric next_difficulty, use fallback
      console.warn('[Adaptive Difficulty] Malformed response from ML service. Using fallback.', response);
      return {
        nextDifficulty: currentDifficulty,
        confidence: null,
        source: 'fallback',
        raw: response
      };
    } catch (err) {
      console.warn('[Adaptive Difficulty] ML prediction unavailable. Fallback to current difficulty.', err.message);
      return {
        nextDifficulty: currentDifficulty,
        confidence: null,
        source: 'fallback',
        error: err.message
      };
    }
  }
};

export default adaptiveDifficultyApi;
