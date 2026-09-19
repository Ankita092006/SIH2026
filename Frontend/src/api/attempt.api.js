/**
 * Gameplay Attempt API Service
 * Telemetry adheres directly to Python Random Forest ML schema in ML/adaptive_difficulty/api/schemas.py
 */

import { apiClient } from './client';

export const attemptApi = {
  /**
   * Submit attempt telemetry for a completed game or round
   * @param {Object} telemetry
   */
  async submitAttempt(telemetry) {
    return apiClient('/api/games/attempts', {
      method: 'POST',
      body: telemetry
    });
  }
};

export default attemptApi;
