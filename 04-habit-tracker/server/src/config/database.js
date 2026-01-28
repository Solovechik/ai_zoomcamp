import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5434,
  database: process.env.DB_NAME || 'habit_tracker',
  user: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpass',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
  }
  return result;
}

export async function getClient() {
  return pool.connect();
}

export async function initializeDatabase() {
  try {
    // Create habits table
    await query(`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        color VARCHAR(7) DEFAULT '#6366f1',
        icon VARCHAR(50) DEFAULT 'check',
        frequency VARCHAR(20) DEFAULT 'daily',
        target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create completions table
    await query(`
      CREATE TABLE IF NOT EXISTS completions (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completed_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completed_date)
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_completions_completed_date ON completions(completed_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, completed_date)`);

    // Create trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger (drop first if exists to avoid errors)
    await query(`DROP TRIGGER IF EXISTS update_habits_updated_at ON habits`);
    await query(`
      CREATE TRIGGER update_habits_updated_at
        BEFORE UPDATE ON habits
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    return false;
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

export default pool;
