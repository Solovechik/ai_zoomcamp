import axios from 'axios';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  validateStatus: () => true
});

describe('Habit Tracker API Integration Tests', () => {
  let createdHabitId;

  describe('Health Check', () => {
    test('should return ok status', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ok');
      expect(response.data.timestamp).toBeDefined();
    });
  });

  describe('Habits CRUD', () => {
    test('should create a new habit', async () => {
      const habitData = {
        name: 'Test Habit',
        description: 'A test habit for integration testing',
        color: '#22c55e',
        icon: 'fire',
        frequency: 'daily',
        targetDays: [0, 1, 2, 3, 4, 5, 6]
      };

      const response = await api.post('/habits', habitData);

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe(habitData.name);
      expect(response.data.data.description).toBe(habitData.description);
      expect(response.data.data.color).toBe(habitData.color);
      expect(response.data.data.id).toBeDefined();

      createdHabitId = response.data.data.id;
    });

    test('should require name for habit creation', async () => {
      const response = await api.post('/habits', {
        description: 'Missing name'
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toContain('Name is required');
    });

    test('should reject empty name', async () => {
      const response = await api.post('/habits', {
        name: '   '
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    test('should list all active habits', async () => {
      const response = await api.get('/habits');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);

      const habit = response.data.data.find(h => h.id === createdHabitId);
      expect(habit).toBeDefined();
      expect(habit.completedToday).toBeDefined();
      expect(habit.currentStreak).toBeDefined();
    });

    test('should get habit by ID with stats', async () => {
      const response = await api.get(`/habits/${createdHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(createdHabitId);
      expect(response.data.data.currentStreak).toBeDefined();
      expect(response.data.data.longestStreak).toBeDefined();
      expect(response.data.data.totalCompletions).toBeDefined();
      expect(response.data.data.completionRate).toBeDefined();
    });

    test('should return 404 for non-existent habit', async () => {
      const response = await api.get('/habits/99999');

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });

    test('should update a habit', async () => {
      const updateData = {
        name: 'Updated Test Habit',
        description: 'Updated description',
        color: '#3b82f6'
      };

      const response = await api.put(`/habits/${createdHabitId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe(updateData.name);
      expect(response.data.data.color).toBe(updateData.color);
    });

    test('should not allow empty name on update', async () => {
      const response = await api.put(`/habits/${createdHabitId}`, {
        name: ''
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Completions', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    test('should mark habit as completed for today', async () => {
      const response = await api.post('/completions', {
        habitId: createdHabitId,
        date: today
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.habitId).toBe(createdHabitId);
      expect(response.data.data.completedDate).toBe(today);
    });

    test('should handle duplicate completion gracefully', async () => {
      const response = await api.post('/completions', {
        habitId: createdHabitId,
        date: today
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
    });

    test('should mark habit as completed for past date', async () => {
      const response = await api.post('/completions', {
        habitId: createdHabitId,
        date: yesterday
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
    });

    test('should require habitId for completion', async () => {
      const response = await api.post('/completions', {
        date: today
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('habitId is required');
    });

    test('should require date for completion', async () => {
      const response = await api.post('/completions', {
        habitId: createdHabitId
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('date is required');
    });

    test('should validate date format', async () => {
      const response = await api.post('/completions', {
        habitId: createdHabitId,
        date: 'invalid-date'
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Invalid date format');
    });

    test('should return 404 for completion of non-existent habit', async () => {
      const response = await api.post('/completions', {
        habitId: 99999,
        date: today
      });

      expect(response.status).toBe(404);
    });

    test('should get completion history for habit', async () => {
      const response = await api.get(`/completions/${createdHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.habitId).toBe(createdHabitId);
      expect(Array.isArray(response.data.data.completions)).toBe(true);
      expect(response.data.data.completions).toContain(today);
      expect(response.data.data.completions).toContain(yesterday);
    });

    test('should filter completions by month', async () => {
      const currentMonth = today.substring(0, 7);
      const response = await api.get(`/completions/${createdHabitId}?month=${currentMonth}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    test('should unmark a completion', async () => {
      const response = await api.delete('/completions', {
        data: {
          habitId: createdHabitId,
          date: yesterday
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Verify it's removed
      const checkResponse = await api.get(`/completions/${createdHabitId}`);
      expect(checkResponse.data.data.completions).not.toContain(yesterday);
    });

    test('should return 404 when removing non-existent completion', async () => {
      const response = await api.delete('/completions', {
        data: {
          habitId: createdHabitId,
          date: '2020-01-01'
        }
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Statistics', () => {
    test('should get overview stats', async () => {
      const response = await api.get('/stats/overview');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.totalHabits).toBeDefined();
      expect(response.data.data.activeHabits).toBeDefined();
      expect(response.data.data.todayCompleted).toBeDefined();
      expect(response.data.data.todayTotal).toBeDefined();
      expect(response.data.data.weeklyCompletionRate).toBeDefined();
      expect(response.data.data.monthlyCompletionRate).toBeDefined();
      expect(response.data.data.currentBestStreak).toBeDefined();
    });

    test('should get habit-specific stats', async () => {
      const response = await api.get(`/stats/habits/${createdHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.habitId).toBe(createdHabitId);
      expect(response.data.data.currentStreak).toBeDefined();
      expect(response.data.data.longestStreak).toBeDefined();
      expect(response.data.data.totalCompletions).toBeDefined();
      expect(response.data.data.completionRate).toBeDefined();
      expect(Array.isArray(response.data.data.weeklyStats)).toBe(true);
      expect(Array.isArray(response.data.data.monthlyStats)).toBe(true);
    });

    test('should return 404 for stats of non-existent habit', async () => {
      const response = await api.get('/stats/habits/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Streak Calculations', () => {
    let streakHabitId;
    const dates = [];

    beforeAll(async () => {
      // Create a habit for streak testing
      const response = await api.post('/habits', {
        name: 'Streak Test Habit',
        targetDays: [0, 1, 2, 3, 4, 5, 6]
      });
      streakHabitId = response.data.data.id;

      // Create completions for the past 5 days
      for (let i = 0; i < 5; i++) {
        const date = new Date(Date.now() - i * 86400000);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        await api.post('/completions', {
          habitId: streakHabitId,
          date: dateStr
        });
      }
    });

    afterAll(async () => {
      if (streakHabitId) {
        await api.delete(`/habits/${streakHabitId}?permanent=true`);
      }
    });

    test('should calculate current streak correctly', async () => {
      const response = await api.get(`/habits/${streakHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.data.currentStreak).toBe(5);
    });

    test('should calculate longest streak correctly', async () => {
      const response = await api.get(`/stats/habits/${streakHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.data.longestStreak).toBe(5);
    });

    test('should break streak when day is missed', async () => {
      // Remove middle completion to break streak
      const middleDate = dates[2];
      await api.delete('/completions', {
        data: {
          habitId: streakHabitId,
          date: middleDate
        }
      });

      const response = await api.get(`/habits/${streakHabitId}`);

      // Streak should now be 2 (today + yesterday)
      expect(response.data.data.currentStreak).toBe(2);
    });
  });

  describe('Habit Deletion', () => {
    test('should archive habit by default', async () => {
      const response = await api.delete(`/habits/${createdHabitId}`);

      expect(response.status).toBe(200);
      expect(response.data.message).toContain('archived');

      // Should not appear in active habits
      const listResponse = await api.get('/habits');
      const habit = listResponse.data.data.find(h => h.id === createdHabitId);
      expect(habit).toBeUndefined();

      // Should appear when including inactive
      const allResponse = await api.get('/habits?include_inactive=true');
      const archivedHabit = allResponse.data.data.find(h => h.id === createdHabitId);
      expect(archivedHabit).toBeDefined();
      expect(archivedHabit.isActive).toBe(false);
    });

    test('should permanently delete habit when requested', async () => {
      const response = await api.delete(`/habits/${createdHabitId}?permanent=true`);

      expect(response.status).toBe(200);
      expect(response.data.message).toContain('permanently');

      // Should not appear even with include_inactive
      const allResponse = await api.get('/habits?include_inactive=true');
      const habit = allResponse.data.data.find(h => h.id === createdHabitId);
      expect(habit).toBeUndefined();
    });
  });
});
