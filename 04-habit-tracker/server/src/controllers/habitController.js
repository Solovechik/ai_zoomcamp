import * as Habit from '../models/Habit.js';
import * as Completion from '../models/Completion.js';

export async function getAllHabits(req, res) {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const habits = await Habit.findAll(includeInactive);

    // Add today's completion status and current streak for each habit
    const today = new Date().toISOString().split('T')[0];
    const enrichedHabits = await Promise.all(
      habits.map(async (habit) => {
        const completedToday = await Completion.isCompletedOnDate(habit.id, today);
        const currentStreak = await Completion.calculateCurrentStreak(habit.id, habit.targetDays);
        return {
          ...habit,
          completedToday,
          currentStreak
        };
      })
    );

    res.json({ success: true, data: enrichedHabits });
  } catch (error) {
    console.error('Error getting habits:', error);
    res.status(500).json({ success: false, error: 'Failed to get habits' });
  }
}

export async function getHabitById(req, res) {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const currentStreak = await Completion.calculateCurrentStreak(habit.id, habit.targetDays);
    const longestStreak = await Completion.calculateLongestStreak(habit.id, habit.targetDays);
    const totalCompletions = await Completion.getTotalCompletions(habit.id);
    const completionRate = await Completion.getCompletionRate(habit.id, habit.targetDays, habit.createdAt);
    const today = new Date().toISOString().split('T')[0];
    const completedToday = await Completion.isCompletedOnDate(habit.id, today);

    res.json({
      success: true,
      data: {
        ...habit,
        completedToday,
        currentStreak,
        longestStreak,
        totalCompletions,
        completionRate
      }
    });
  } catch (error) {
    console.error('Error getting habit:', error);
    res.status(500).json({ success: false, error: 'Failed to get habit' });
  }
}

export async function createHabit(req, res) {
  try {
    const { name, description, color, icon, frequency, targetDays } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be 100 characters or less' });
    }

    const habit = await Habit.create({ name, description, color, icon, frequency, targetDays });
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ success: false, error: 'Failed to create habit' });
  }
}

export async function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const habitData = req.body;

    if (habitData.name !== undefined && habitData.name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name cannot be empty' });
    }

    const habit = await Habit.update(id, habitData);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    res.json({ success: true, data: habit });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ success: false, error: 'Failed to update habit' });
  }
}

export async function deleteHabit(req, res) {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    if (permanent) {
      const deleted = await Habit.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Habit not found' });
      }
      res.json({ success: true, message: 'Habit deleted permanently' });
    } else {
      const habit = await Habit.archive(id);
      if (!habit) {
        return res.status(404).json({ success: false, error: 'Habit not found' });
      }
      res.json({ success: true, message: 'Habit archived successfully' });
    }
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ success: false, error: 'Failed to delete habit' });
  }
}
