/**
 * Patient API Service
 */

import { apiClient } from './client';

export const patientApi = {
  /**
   * Get elderly patient profile
   */
  async getProfile() {
    return apiClient('/api/patient/profile', {
      method: 'GET'
    });
  },

  /**
   * Update elderly patient profile
   * @param {Object} profileData
   */
  async updateProfile(profileData) {
    return apiClient('/api/patient/profile', {
      method: 'PUT',
      body: profileData
    });
  }
};

export default patientApi;
