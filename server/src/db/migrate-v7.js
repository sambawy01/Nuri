require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV7() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Running v7 migration (Study Duels)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS duels (
        id SERIAL PRIMARY KEY,
        code VARCHAR(6) UNIQUE NOT NULL,
        subject VARCHAR(50) NOT NULL,
        creator_profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        opponent_profile_id INT REFERENCES profiles(id) ON DELETE SET NULL,
        questions JSONB NOT NULL DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'complete')),
        winner_profile_id INT REFERENCES profiles(id) ON DELETE SET NULL,
        creator_score INT DEFAULT 0,
        opponent_score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_duels_code ON duels(code);
      CREATE INDEX IF NOT EXISTS idx_duels_creator ON duels(creator_profile_id);
      CREATE INDEX IF NOT EXISTS idx_duels_opponent ON duels(opponent_profile_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS duel_answers (
        id SERIAL PRIMARY KEY,
        duel_id INT REFERENCES duels(id) ON DELETE CASCADE,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        question_index INT NOT NULL,
        answer VARCHAR(10) NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT false,
        time_ms INT,
        answered_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (duel_id, profile_id, question_index)
      );
      CREATE INDEX IF NOT EXISTS idx_duel_answers_duel ON duel_answers(duel_id);
      CREATE INDEX IF NOT EXISTS idx_duel_answers_profile ON duel_answers(profile_id);
    `);

    console.log('v7 migration completed successfully.');
  } catch (err) {
    console.error('v7 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV7();
