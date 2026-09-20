/**
 * Medication & Activity Reminders API Service
 */

import { apiClient } from './client';

export const reminderApi = {
  /**
   * Fetch all reminders
   */
  async getReminders() {
    return apiClient('/api/reminders', {
      method: 'GET'
    });
  },

  /**
   * Create new reminder
   * @param {Object} data { title, time, type, recurrence }
   */
  async createReminder(data) {
    return apiClient('/api/reminders', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Toggle completed status of reminder
   * @param {string} id
   */
  async toggleReminder(id) {
    return apiClient(`/api/reminders/${id}/toggle`, {
      method: 'PATCH'
    });
  }
};

export default reminderApi;
