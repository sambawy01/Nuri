require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

async function migrateV2() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Running v2 migration (review_items table)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_items (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100),
        question_text TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        memory_score INT DEFAULT 0,
        next_review_date DATE DEFAULT CURRENT_DATE,
        times_reviewed INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_review_items_profile ON review_items(profile_id);
      CREATE INDEX IF NOT EXISTS idx_review_items_due ON review_items(profile_id, next_review_date) WHERE memory_score < 5;
    `);

    console.log('v2 migration completed successfully.');
  } catch (err) {
    console.error('v2 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV2();
