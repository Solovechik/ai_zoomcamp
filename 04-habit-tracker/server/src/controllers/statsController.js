import * as Habit from '../models/Habit.js';
import * as Completion from '../models/Completion.js';

export async function getOverview(req, res) {
  try {
    const habits = await Habit.findAll(false);
    const today = new Date().toISOString().split('T')[0];

    let todayCompleted = 0;
    let todayTotal = 0;
    const todayDayNum = new Date().getDay();
    let bestStreak = { habitId: null, habitName: null, streak: 0 };

    for (const habit of habits) {
      if (habit.targetDays.includes(todayDayNum)) {
        todayTotal++;
        const isCompleted = await Completion.isCompletedOnDate(habit.id, today);
        if (isCompleted) todayCompleted++;
      }

      const currentStreak = await Completion.calculateCurrentStreak(habit.id, habit.targetDays);
      if (currentStreak > bestStreak.streak) {
        bestStreak = {
          habitId: habit.id,
          habitName: habit.name,
          streak: currentStreak
        };
      }
    }

    // Calculate weekly completion rate
    const weekStart = getWeekStart(new Date());
    const weeklyStats = await calculatePeriodStats(habits, weekStart, today);

    // Calculate monthly completion rate
    const monthStart = getMonthStart(new Date());
    const monthlyStats = await calculatePeriodStats(habits, monthStart, today);

    res.json({
      success: true,
      data: {
        totalHabits: habits.length,
        activeHabits: habits.filter(h => h.isActive).length,
        todayCompleted,
        todayTotal,
        weeklyCompletionRate: weeklyStats.rate,
        monthlyCompletionRate: monthlyStats.rate,
        currentBestStreak: bestStreak
      }
    });
  } catch (error) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get overview stats' });
  }
}

export async function getHabitStats(req, res) {
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

    // Calculate total possible days
    const startDate = new Date(habit.createdAt);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalPossibleDays = 0;
    const checkDate = new Date(startDate);
    while (checkDate <= today) {
      if (habit.targetDays.includes(checkDate.getDay())) {
        totalPossibleDays++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    // Weekly stats (last 4 weeks)
    const weeklyStats = await getWeeklyStats(habit);

    // Monthly stats (last 3 months)
    const monthlyStats = await getMonthlyStats(habit);

    res.json({
      success: true,
      data: {
        habitId: habit.id,
        habitName: habit.name,
        currentStreak,
        longestStreak,
        totalCompletions,
        totalPossibleDays,
        completionRate,
        weeklyStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error getting habit stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get habit stats' });
  }
}

async function calculatePeriodStats(habits, startDate, endDate) {
  let totalCompleted = 0;
  let totalPossible = 0;

  for (const habit of habits) {
    const completions = await Completion.findByHabitId(habit.id, startDate, endDate);
    totalCompleted += completions.length;

    // Calculate possible days in period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const checkDate = new Date(start);

    while (checkDate <= end) {
      if (habit.targetDays.includes(checkDate.getDay())) {
        totalPossible++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
  }

  const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 1000) / 10 : 0;
  return { completed: totalCompleted, total: totalPossible, rate };
}

async function getWeeklyStats(habit) {
  const stats = [];
  const today = new Date();

  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = getWeekStart(weekEnd);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const completions = await Completion.findByHabitId(habit.id, weekStartStr, weekEndStr);

    let totalPossible = 0;
    const checkDate = new Date(weekStart);
    while (checkDate <= weekEnd) {
      if (habit.targetDays.includes(checkDate.getDay())) {
        totalPossible++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    const rate = totalPossible > 0 ? Math.round((completions.length / totalPossible) * 1000) / 10 : 0;

    stats.unshift({
      week: getISOWeek(weekStart),
      completed: completions.length,
      total: totalPossible,
      rate
    });
  }

  return stats;
}

async function getMonthlyStats(habit) {
  const stats = [];
  const today = new Date();

  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = monthDate.toISOString().split('T')[0];
    const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const monthEnd = lastDay.toISOString().split('T')[0];

    const completions = await Completion.findByHabitId(habit.id, monthStart, monthEnd);

    let totalPossible = 0;
    const checkDate = new Date(monthDate);
    while (checkDate <= lastDay && checkDate <= today) {
      if (habit.targetDays.includes(checkDate.getDay())) {
        totalPossible++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    const rate = totalPossible > 0 ? Math.round((completions.length / totalPossible) * 1000) / 10 : 0;

    stats.unshift({
      month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      completed: completions.length,
      total: totalPossible,
      rate
    });
  }

  return stats;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
