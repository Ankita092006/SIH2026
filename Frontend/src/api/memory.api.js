/**
 * Personal Memory Reconstruction API Service
 * Follows schema and activity contracts in ML/memory_engine/memory_schema.py and activity_generator.py
 */

import { apiClient } from './client';

export const memoryApi = {
  /**
   * Get all personal memories for patient
   * @param {Object} params { patientId, type, verified }
   */
  async getMemories(params = {}) {
    return apiClient('/api/memories', {
      method: 'GET'
    });
  },

  /**
   * Create a new personal memory item (Caregiver uploaded)
   * @param {Object} memoryData
   */
  async createMemory(memoryData) {
    return apiClient('/api/memories', {
      method: 'POST',
      body: memoryData
    });
  },

  /**
   * Generate an interactive recall activity from caregiver-verified memories
   * @param {string} patientId
   */
  async generateRecallActivity(patientId = 'PAT001') {
    return apiClient('/api/memories/generate-activity', {
      method: 'POST',
      body: { patient_id: patientId }
    });
  }
};

export default memoryApi;
