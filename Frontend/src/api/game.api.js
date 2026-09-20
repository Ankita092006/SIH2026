/**
 * Cognitive Games API Service
 */

import { apiClient } from './client';

export const gameApi = {
  /**
   * Get cognitive games catalog
   */
  async getGames() {
    return apiClient('/api/games', {
      method: 'GET'
    });
  },

  /**
   * Start a new gameplay session
   * @param {string} gameId
   */
  async startSession(gameId) {
    return apiClient(`/api/games/${gameId}/sessions`, {
      method: 'POST'
    });
  }
};

export default gameApi;
