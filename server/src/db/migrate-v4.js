require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV4() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Running v4 migration (Phase 3 gamification)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL,
        category VARCHAR(30) NOT NULL,
        rarity VARCHAR(20) NOT NULL DEFAULT 'common',
        condition_type VARCHAR(50) NOT NULL,
        condition_value INT NOT NULL DEFAULT 1,
        condition_extra VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS earned_badges (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        badge_id VARCHAR(50) REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(profile_id, badge_id)
      );
      CREATE INDEX IF NOT EXISTS idx_earned_badges_profile ON earned_badges(profile_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id SERIAL PRIMARY KEY,
        challenge_date DATE UNIQUE NOT NULL,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        question_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        challenge_date DATE NOT NULL,
        answer TEXT,
        was_correct BOOLEAN,
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(profile_id, challenge_date)
      );
      CREATE INDEX IF NOT EXISTS idx_daily_attempts_profile ON daily_challenge_attempts(profile_id);
    `);

    // Seed badge definitions
    const { seedBadges } = require('../services/badges');
    await seedBadges();
    console.log('Badge definitions seeded.');

    console.log('v4 migration completed successfully.');
  } catch (err) {
    console.error('v4 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV4();
