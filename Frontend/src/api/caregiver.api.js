/**
 * Caregiver API Service
 * Non-medical terminology: "Cognitive Activity", "Recent Performance", "Performance Trend", "Activity Change"
 */

import { apiClient } from './client';

export const caregiverApi = {
  /**
   * Get list of assigned patients under care
   */
  async getPatients() {
    return apiClient('/api/caregiver/patients', {
      method: 'GET'
    });
  },

  /**
   * Get cognitive trends, activity changes, and alerts for a patient
   * @param {string} patientId
   */
  async getTrends(patientId) {
    return apiClient(`/api/caregiver/patients/${patientId}/trends`, {
      method: 'GET'
    });
  }
};

export default caregiverApi;
