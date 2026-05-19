require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrateV10() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && { ssl: { rejectUnauthorized: false } }),
  });

  try {
    console.log('Running v10 migration (AI Presence Layer)...');
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'v10-presence.sql'),
      'utf-8'
    );
    await pool.query(sql);
    console.log('v10 migration completed.');
  } catch (err) {
    console.error('v10 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrateV10();
}

module.exports = migrateV10;
