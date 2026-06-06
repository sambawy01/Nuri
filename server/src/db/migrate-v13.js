require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrateV13() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && { ssl: { rejectUnauthorized: false } }),
  });
  try {
    console.log('Running v13 migration (FSRS + BKT + skill_memory)...');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'v13-fsrs-bkt.sql'), 'utf-8');
    await pool.query(sql);
    console.log('v13 migration completed.');
  } catch (err) {
    console.error('v13 migration failed:', err.message);
    throw err;  // Let caller handle exit — don't process.exit() here
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrateV13().then(() => process.exit(0)).catch(() => process.exit(1));
}
module.exports = migrateV13;