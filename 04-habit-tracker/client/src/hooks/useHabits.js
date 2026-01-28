import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { getToday } from '../utils/dateUtils';
import toast from 'react-hot-toast';

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getHabits();
      if (response.success) {
        setHabits(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch habits');
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = async (habitData) => {
    try {
      const response = await api.createHabit(habitData);
      if (response.success) {
        await fetchHabits();
        toast.success('Habit created!');
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create habit');
      throw err;
    }
  };

  const updateHabit = async (habitId, habitData) => {
    try {
      const response = await api.updateHabit(habitId, habitData);
      if (response.success) {
        await fetchHabits();
        toast.success('Habit updated!');
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update habit');
      throw err;
    }
  };

  const removeHabit = async (habitId, permanent = false) => {
    try {
      const response = await api.deleteHabit(habitId, permanent);
      if (response.success) {
        await fetchHabits();
        toast.success(permanent ? 'Habit deleted!' : 'Habit archived!');
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete habit');
      throw err;
    }
  };

  const toggleCompletion = async (habitId, date = getToday()) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      // Optimistic update
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const newCompletedToday = !h.completedToday;
          return {
            ...h,
            completedToday: newCompletedToday,
            currentStreak: newCompletedToday ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1)
          };
        }
        return h;
      }));

      await api.toggleCompletion(habitId, date, habit.completedToday);

      // Refresh to get accurate streak count
      await fetchHabits();
    } catch (err) {
      // Revert on error
      await fetchHabits();
      toast.error('Failed to update completion');
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
    refresh: fetchHabits
  };
}
