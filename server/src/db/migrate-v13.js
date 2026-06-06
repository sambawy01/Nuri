const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function migrateV13() {
    try {
        console.log('Running v13 migration (FSRS BKT)...');
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'v13-fsrs-bkt.sql'), 'utf-8');
        await pool.query(sql);
        console.log('v13 migration completed.');
    } catch (err) {
        console.error('v13 migration failed:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    migrateV13().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrateV13;