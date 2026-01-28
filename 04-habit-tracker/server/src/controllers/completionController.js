import * as Completion from '../models/Completion.js';
import * as Habit from '../models/Habit.js';

export async function createCompletion(req, res) {
  try {
    const { habitId, date } = req.body;

    if (!habitId) {
      return res.status(400).json({ success: false, error: 'habitId is required' });
    }

    if (!date) {
      return res.status(400).json({ success: false, error: 'date is required' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const completion = await Completion.create(habitId, date);
    res.status(201).json({ success: true, data: completion });
  } catch (error) {
    console.error('Error creating completion:', error);
    res.status(500).json({ success: false, error: 'Failed to create completion' });
  }
}

export async function deleteCompletion(req, res) {
  try {
    const { habitId, date } = req.body;

    if (!habitId) {
      return res.status(400).json({ success: false, error: 'habitId is required' });
    }

    if (!date) {
      return res.status(400).json({ success: false, error: 'date is required' });
    }

    const deleted = await Completion.deleteCompletion(habitId, date);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Completion not found' });
    }

    res.json({ success: true, message: 'Completion removed' });
  } catch (error) {
    console.error('Error deleting completion:', error);
    res.status(500).json({ success: false, error: 'Failed to delete completion' });
  }
}

export async function getCompletions(req, res) {
  try {
    const { habitId } = req.params;
    const { startDate, endDate, month } = req.query;

    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    let start = startDate;
    let end = endDate;

    // If month is provided, calculate start and end dates
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      start = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      end = `${year}-${String(monthNum).padStart(2, '0')}-${lastDay}`;
    }

    const completions = await Completion.findByHabitId(habitId, start, end);

    res.json({
      success: true,
      data: {
        habitId: parseInt(habitId),
        completions
      }
    });
  } catch (error) {
    console.error('Error getting completions:', error);
    res.status(500).json({ success: false, error: 'Failed to get completions' });
  }
}
