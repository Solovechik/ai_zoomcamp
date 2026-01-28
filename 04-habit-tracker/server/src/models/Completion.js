import { query } from '../config/database.js';

export async function create(habitId, date) {
  const result = await query(`
    INSERT INTO completions (habit_id, completed_date)
    VALUES ($1, $2)
    ON CONFLICT (habit_id, completed_date) DO NOTHING
    RETURNING id, habit_id, completed_date, created_at
  `, [habitId, date]);

  if (result.rows[0]) {
    return formatCompletion(result.rows[0]);
  }

  // Return existing completion if conflict
  const existing = await query(`
    SELECT id, habit_id, completed_date, created_at
    FROM completions
    WHERE habit_id = $1 AND completed_date = $2
  `, [habitId, date]);

  return existing.rows[0] ? formatCompletion(existing.rows[0]) : null;
}

export async function deleteCompletion(habitId, date) {
  const result = await query(`
    DELETE FROM completions
    WHERE habit_id = $1 AND completed_date = $2
    RETURNING id
  `, [habitId, date]);
  return result.rowCount > 0;
}

export async function findByHabitId(habitId, startDate = null, endDate = null) {
  let whereClause = 'WHERE habit_id = $1';
  const params = [habitId];
  let paramIndex = 2;

  if (startDate) {
    whereClause += ` AND completed_date >= $${paramIndex++}`;
    params.push(startDate);
  }
  if (endDate) {
    whereClause += ` AND completed_date <= $${paramIndex++}`;
    params.push(endDate);
  }

  const result = await query(`
    SELECT completed_date
    FROM completions
    ${whereClause}
    ORDER BY completed_date DESC
  `, params);

  return result.rows.map(r => r.completed_date.toISOString().split('T')[0]);
}

export async function isCompletedOnDate(habitId, date) {
  const result = await query(`
    SELECT id FROM completions
    WHERE habit_id = $1 AND completed_date = $2
  `, [habitId, date]);
  return result.rowCount > 0;
}

export async function calculateCurrentStreak(habitId, targetDays = [0, 1, 2, 3, 4, 5, 6]) {
  const result = await query(`
    SELECT completed_date
    FROM completions
    WHERE habit_id = $1
    ORDER BY completed_date DESC
  `, [habitId]);

  if (result.rows.length === 0) return 0;

  const completions = new Set(
    result.rows.map(r => r.completed_date.toISOString().split('T')[0])
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentDate = new Date(today);

  const todayStr = formatDateStr(currentDate);
  const todayDayNum = currentDate.getDay();

  // Check if today is a target day
  if (targetDays.includes(todayDayNum)) {
    if (completions.has(todayStr)) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Today is target day but not completed - start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }
  } else {
    // Today is not a target day, start from yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Walk backwards
  let safetyCounter = 0;
  while (safetyCounter < 400) {
    const dateStr = formatDateStr(currentDate);
    const dayNum = currentDate.getDay();

    if (targetDays.includes(dayNum)) {
      if (completions.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    currentDate.setDate(currentDate.getDate() - 1);
    safetyCounter++;
  }

  return streak;
}

export async function calculateLongestStreak(habitId, targetDays = [0, 1, 2, 3, 4, 5, 6]) {
  const result = await query(`
    SELECT completed_date
    FROM completions
    WHERE habit_id = $1
    ORDER BY completed_date ASC
  `, [habitId]);

  if (result.rows.length === 0) return 0;

  const completions = result.rows.map(r =>
    r.completed_date.toISOString().split('T')[0]
  );

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < completions.length; i++) {
    const prevDate = new Date(completions[i - 1]);
    const currDate = new Date(completions[i]);

    // Count missed target days between dates
    let missedTargetDays = 0;
    const checkDate = new Date(prevDate);
    checkDate.setDate(checkDate.getDate() + 1);

    while (checkDate < currDate) {
      if (targetDays.includes(checkDate.getDay())) {
        missedTargetDays++;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    if (missedTargetDays === 0) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return longestStreak;
}

export async function getTotalCompletions(habitId) {
  const result = await query(`
    SELECT COUNT(*) as count FROM completions WHERE habit_id = $1
  `, [habitId]);
  return parseInt(result.rows[0].count);
}

export async function getCompletionRate(habitId, targetDays = [0, 1, 2, 3, 4, 5, 6], createdAt) {
  const completions = await getTotalCompletions(habitId);

  // Calculate total possible days since creation
  const startDate = new Date(createdAt);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalPossibleDays = 0;
  const checkDate = new Date(startDate);

  while (checkDate <= today) {
    if (targetDays.includes(checkDate.getDay())) {
      totalPossibleDays++;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  if (totalPossibleDays === 0) return 0;
  return Math.round((completions / totalPossibleDays) * 1000) / 10;
}

function formatCompletion(row) {
  return {
    id: row.id,
    habitId: row.habit_id,
    completedDate: row.completed_date.toISOString().split('T')[0],
    createdAt: row.created_at
  };
}

function formatDateStr(date) {
  return date.toISOString().split('T')[0];
}
