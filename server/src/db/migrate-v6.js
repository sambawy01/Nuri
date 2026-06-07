require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV6() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Running v6 migration (Pre-Test Predictor)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_plans (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topics JSONB NOT NULL DEFAULT '[]',
        test_date DATE NOT NULL,
        total_days INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_test_plans_profile ON test_plans(profile_id);
      CREATE INDEX IF NOT EXISTS idx_test_plans_date ON test_plans(profile_id, test_date);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_plan_days (
        id SERIAL PRIMARY KEY,
        plan_id INT REFERENCES test_plans(id) ON DELETE CASCADE,
        day_number INT NOT NULL,
        day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('review', 'practice', 'mock_test', 'confidence')),
        topic VARCHAR(200),
        label TEXT NOT NULL,
        scheduled_date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_test_plan_days_plan ON test_plan_days(plan_id);
    `);

    console.log('v6 migration completed successfully.');
  } catch (err) {
    console.error('v6 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV6();
