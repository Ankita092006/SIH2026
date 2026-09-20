/**
 * Authentication API Service
 * Contract: Backend/src/routes/authRoutes.js
 */

import { apiClient } from './client';

export const authApi = {
  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  /**
   * Register new user
   * @param {Object} data { name, email, password, role }
   */
  async register(data) {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: data
    });
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    return apiClient('/api/auth/me', {
      method: 'GET'
    });
  },

  /**
   * Log out session
   */
  async logout() {
    return apiClient('/api/auth/logout', {
      method: 'POST'
    });
  },

  /**
   * Request password reset link
   * @param {string} email
   */
  async forgotPassword(email) {
    return apiClient('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    return apiClient('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword }
    });
  }
};

export default authApi;
