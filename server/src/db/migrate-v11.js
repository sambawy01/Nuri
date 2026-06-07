require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrateV11() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(isProduction && { ssl: { rejectUnauthorized: false } }),
  });
  try {
    console.log('Running v11 migration (Bedaya)...');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'v11-bedaya.sql'), 'utf-8');
    await pool.query(sql);
    console.log('v11 migration completed.');
  } catch (err) {
    console.error('v11 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) migrateV11();
module.exports = migrateV11;
