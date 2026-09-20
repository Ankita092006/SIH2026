/**
 * Home & Patient Dashboard API Service
 */

import { apiClient } from './client';

export const dashboardApi = {
  /**
   * Get home summary (recommended game, reminder count, recent results)
   */
  async getSummary() {
    return apiClient('/api/dashboard/summary', {
      method: 'GET'
    });
  }
};

export default dashboardApi;
