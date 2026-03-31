require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

async function migrateV3() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Running v3 migration (Phase 2 remaining features)...');

    // Confidence responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS confidence_responses (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        quiz_history_id INT REFERENCES quiz_history(id) ON DELETE CASCADE,
        confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('guessed', 'unsure', 'pretty_sure', 'knew_it')),
        was_correct BOOLEAN NOT NULL,
        subject VARCHAR(50),
        topic VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_confidence_profile ON confidence_responses(profile_id);
      CREATE INDEX IF NOT EXISTS idx_confidence_blindspots ON confidence_responses(profile_id, confidence_level, was_correct);
    `);

    // Learning style profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_style_profiles (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
        visual FLOAT DEFAULT 0,
        analogy FLOAT DEFAULT 0,
        example_first FLOAT DEFAULT 0,
        auditory FLOAT DEFAULT 0,
        try_first FLOAT DEFAULT 0,
        total_interactions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_learning_style_profile ON learning_style_profiles(profile_id);
    `);

    // Explain-back sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS explain_back_sessions (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        messages JSONB DEFAULT '[]',
        understanding_score INT CHECK (understanding_score BETWEEN 1 AND 5),
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_explain_back_profile ON explain_back_sessions(profile_id);
    `);

    console.log('v3 migration completed successfully.');
  } catch (err) {
    console.error('v3 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV3();
