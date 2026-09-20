/**
 * Gameplay Results & Cognitive Performance API Service
 */

import { apiClient } from './client';

export const resultsApi = {
  /**
   * Get all past gameplay results
   */
  async getResults() {
    return apiClient('/api/results', {
      method: 'GET'
    });
  }
};

export default resultsApi;
