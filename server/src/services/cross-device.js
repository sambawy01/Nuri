const pool = require('../db/connection');

/**
 * Cross-Device Session Sync
 *
 * Tracks devices per profile, enables session resumption
 * across tablets/phones. Lightweight — just device registry.
 */

async function registerDevice(profileId, fingerprint, platform, name) {
  await pool.query(
    `INSERT INTO devices (profile_id, device_fingerprint, platform, name, last_seen_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (profile_id, device_fingerprint)
     DO UPDATE SET last_seen_at = NOW(), platform = EXCLUDED.platform, name = EXCLUDED.name`,
    [profileId, fingerprint, platform || null, name || null]
  );
}

async function getDevices(profileId) {
  const result = await pool.query(
    `SELECT id, device_fingerprint, platform, name, last_seen_at, created_at
     FROM devices WHERE profile_id = $1 ORDER BY last_seen_at DESC`,
    [profileId]
  );
  return result.rows;
}

async function getActiveDevice(profileId) {
  const result = await pool.query(
    `SELECT id, device_fingerprint, platform, name, last_seen_at
     FROM devices WHERE profile_id = $1 ORDER BY last_seen_at DESC LIMIT 1`,
    [profileId]
  );
  return result.rows[0] || null;
}

async function updateDeviceLastSeen(profileId, fingerprint) {
  await pool.query(
    `UPDATE devices SET last_seen_at = NOW()
     WHERE profile_id = $1 AND device_fingerprint = $2`,
    [profileId, fingerprint]
  );
}

async function removeDevice(profileId, fingerprint) {
  await pool.query(
    `DELETE FROM devices WHERE profile_id = $1 AND device_fingerprint = $2`,
    [profileId, fingerprint]
  );
}

module.exports = {
  registerDevice,
  getDevices,
  getActiveDevice,
  updateDeviceLastSeen,
  removeDevice,
};
