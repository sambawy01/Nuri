const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function migrateV15() {
    try {
        console.log('Running v15 migration (voice biometrics)...');
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'v15-voice-biometrics.sql'), 'utf-8');
        await pool.query(sql);
        console.log('v15 migration completed.');
    } catch (err) {
        console.error('v15 migration failed:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    migrateV15().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrateV15;