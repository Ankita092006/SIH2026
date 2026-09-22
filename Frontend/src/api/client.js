/**
 * Central API Client for SIH26003
 * Connects frontend to the Node.js API Gateway or falls back to the high-fidelity mock adapter.
 * NEVER communicates directly with Python ML, MySQL, or third-party AI services.
 */

import { handleMockRequest } from './mockAdapter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Respect VITE_USE_MOCK_API flag; default to test mode or fallback when true
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || (import.meta.env.MODE === 'test' && import.meta.env.VITE_USE_MOCK_API !== 'false');

/**
 * Custom API Error class with normalized HTTP status codes
 */
export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Central request dispatcher
 * @param {string} endpoint - e.g. '/api/auth/login' or '/api/games/attempts'
 * @param {Object} options - fetch options (method, headers, body, timeoutMs, etc.)
 */
export async function apiClient(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeoutMs = 15000,
    forceMock = false,
    token = null
  } = options;

  // Normalize endpoint URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. If mock mode is explicitly active or forced
  if (USE_MOCK_API || forceMock) {
    const mockRes = await handleMockRequest(normalizedEndpoint, { method, headers, body });
    if (mockRes.status >= 200 && mockRes.status < 300) {
      return mockRes.data;
    }
    throw new ApiError(
      mockRes.data?.message || `Mock API Error (${mockRes.status})`,
      mockRes.status,
      mockRes.data
    );
  }

  // 2. Real Backend Gateway Request
  const fullUrl = `${API_BASE_URL.replace(/\/api$/, '')}${normalizedEndpoint}`;
  const resolvedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(resolvedToken ? { 'Authorization': `Bearer ${resolvedToken}` } : {}),
    ...headers
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse JSON safely
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Handle session expiry
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
      }

      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }

    // Network error or backend offline: fallback to mock adapter if offline
    console.warn(`[API Client] Network call to ${fullUrl} failed. Using mock adapter fallback.`);
    const fallbackRes = await handleMockRequest(normalizedEndpoint, { method, headers, body });
    if (fallbackRes.status >= 200 && fallbackRes.status < 300) {
      return fallbackRes.data;
    }

    throw new ApiError(
      err.message || 'Unable to connect to server. Please check your network.',
      503
    );
  }
}

export default apiClient;
