require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV5() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Running v5 migration (Homework Helper)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_sessions (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50),
        topic VARCHAR(100),
        source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('camera', 'upload_image', 'upload_pdf', 'typed')),
        questions_detected INT DEFAULT 0,
        questions_completed INT DEFAULT 0,
        questions_correct INT DEFAULT 0,
        total_xp_earned INT DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_sessions_profile ON homework_sessions(profile_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_questions (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES homework_sessions(id) ON DELETE CASCADE,
        question_number INT NOT NULL,
        question_text TEXT NOT NULL,
        correct_answer TEXT,
        child_answer TEXT,
        verification_result VARCHAR(20) CHECK (verification_result IN ('correct', 'incorrect', 'partial', 'skipped')),
        error_type VARCHAR(30),
        messages JSONB DEFAULT '[]',
        time_spent_seconds INT DEFAULT 0,
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_questions_session ON homework_questions(session_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_topics_tracker (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        homework_date DATE NOT NULL,
        question_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_tracker_profile ON homework_topics_tracker(profile_id, subject);
      CREATE INDEX IF NOT EXISTS idx_homework_tracker_recent ON homework_topics_tracker(profile_id, homework_date);
    `);

    console.log('v5 migration completed successfully.');
  } catch (err) {
    console.error('v5 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV5();
