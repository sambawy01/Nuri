require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrateV12() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && { ssl: { rejectUnauthorized: false } }),
  });
  try {
    console.log('Running v12 migration (levels + diagnostic)...');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'v12-levels-diagnostic.sql'), 'utf-8');
    await pool.query(sql);
    console.log('v12 migration completed.');
  } catch (err) {
    console.error('v12 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) migrateV12();
module.exports = migrateV12;
