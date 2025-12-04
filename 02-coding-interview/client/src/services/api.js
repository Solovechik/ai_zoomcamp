import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Create a new session
 * @param {string} initialCode - Optional initial code
 * @returns {Promise<Object>} Session data
 */
export async function createSession(initialCode) {
  const response = await api.post('/sessions', { initialCode });
  return response.data;
}

/**
 * Get a session by ID
 * @param {string} sessionId
 * @returns {Promise<Object>} Session data
 */
export async function getSession(sessionId) {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
}

/**
 * Update session code
 * @param {string} sessionId
 * @param {string} code
 * @returns {Promise<Object>} Updated session data
 */
export async function updateSessionCode(sessionId, code) {
  const response = await api.put(`/sessions/${sessionId}/code`, { code });
  return response.data;
}

/**
 * Get all sessions
 * @param {number} limit
 * @returns {Promise<Array>} Array of sessions
 */
export async function getAllSessions(limit = 50) {
  const response = await api.get('/sessions', { params: { limit } });
  return response.data;
}

/**
 * Delete a session
 * @param {string} sessionId
 * @returns {Promise<Object>} Response
 */
export async function deleteSession(sessionId) {
  const response = await api.delete(`/sessions/${sessionId}`);
  return response.data;
}

export default api;
