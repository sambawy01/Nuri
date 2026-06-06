const { pool } = require('../connection');
const fs = require('fs');
const path = require('path');

async function migrateV15() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // V15: Parent Dashboard + Story Mode + Learning Needs tables
    const v15sql = fs.readFileSync(path.join(__dirname, 'v15-phase4-parent-story.sql'), 'utf8');
    await client.query(v15sql);
    console.log('✅ V15: parent_pins, parent_notes, learning_needs, behavioral_observations, specialist_reports, story_progress');

    await client.query('COMMIT');
    console.log('🎉 V15 migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ V15 migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  migrateV15().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrateV15;