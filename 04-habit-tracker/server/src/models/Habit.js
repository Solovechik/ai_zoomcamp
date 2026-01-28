import { query } from '../config/database.js';

export async function findAll(includeInactive = false) {
  const whereClause = includeInactive ? '' : 'WHERE is_active = true';
  const result = await query(`
    SELECT id, name, description, color, icon, frequency, target_days, is_active, created_at, updated_at
    FROM habits
    ${whereClause}
    ORDER BY created_at DESC
  `);
  return result.rows.map(formatHabit);
}

export async function findById(id) {
  const result = await query(`
    SELECT id, name, description, color, icon, frequency, target_days, is_active, created_at, updated_at
    FROM habits
    WHERE id = $1
  `, [id]);
  return result.rows[0] ? formatHabit(result.rows[0]) : null;
}

export async function create(habitData) {
  const { name, description, color, icon, frequency, targetDays } = habitData;
  const result = await query(`
    INSERT INTO habits (name, description, color, icon, frequency, target_days)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, description, color, icon, frequency, target_days, is_active, created_at, updated_at
  `, [
    name,
    description || '',
    color || '#6366f1',
    icon || 'check',
    frequency || 'daily',
    targetDays || [0, 1, 2, 3, 4, 5, 6]
  ]);
  return formatHabit(result.rows[0]);
}

export async function update(id, habitData) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (habitData.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(habitData.name);
  }
  if (habitData.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(habitData.description);
  }
  if (habitData.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(habitData.color);
  }
  if (habitData.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(habitData.icon);
  }
  if (habitData.frequency !== undefined) {
    fields.push(`frequency = $${paramIndex++}`);
    values.push(habitData.frequency);
  }
  if (habitData.targetDays !== undefined) {
    fields.push(`target_days = $${paramIndex++}`);
    values.push(habitData.targetDays);
  }
  if (habitData.isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(habitData.isActive);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE habits
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, description, color, icon, frequency, target_days, is_active, created_at, updated_at
  `, values);

  return result.rows[0] ? formatHabit(result.rows[0]) : null;
}

export async function archive(id) {
  return update(id, { isActive: false });
}

export async function deleteById(id) {
  const result = await query('DELETE FROM habits WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

function formatHabit(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    frequency: row.frequency,
    targetDays: row.target_days,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
