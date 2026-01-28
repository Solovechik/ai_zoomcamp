import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Habits
export async function getHabits(includeInactive = false) {
  const params = includeInactive ? { include_inactive: 'true' } : {};
  const response = await api.get('/habits', { params });
  return response.data;
}

export async function getHabit(habitId) {
  const response = await api.get(`/habits/${habitId}`);
  return response.data;
}

export async function createHabit(habitData) {
  const response = await api.post('/habits', habitData);
  return response.data;
}

export async function updateHabit(habitId, habitData) {
  const response = await api.put(`/habits/${habitId}`, habitData);
  return response.data;
}

export async function deleteHabit(habitId, permanent = false) {
  const params = permanent ? { permanent: 'true' } : {};
  const response = await api.delete(`/habits/${habitId}`, { params });
  return response.data;
}

// Completions
export async function toggleCompletion(habitId, date, isCompleted) {
  if (isCompleted) {
    const response = await api.delete('/completions', {
      data: { habitId, date }
    });
    return response.data;
  } else {
    const response = await api.post('/completions', { habitId, date });
    return response.data;
  }
}

export async function getCompletions(habitId, month = null) {
  const params = month ? { month } : {};
  const response = await api.get(`/completions/${habitId}`, { params });
  return response.data;
}

// Statistics
export async function getOverviewStats() {
  const response = await api.get('/stats/overview');
  return response.data;
}

export async function getHabitStats(habitId) {
  const response = await api.get(`/stats/habits/${habitId}`);
  return response.data;
}

export default api;
