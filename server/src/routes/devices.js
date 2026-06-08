const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { registerDevice, getDevices, getActiveDevice, updateDeviceLastSeen, removeDevice } = require('../services/cross-device');

// POST /api/devices/register
router.post('/register', async (req, res, next) => {
  try {
    const { profileId, fingerprint, platform, name } = req.body;
    if (!profileId || !fingerprint) {
      return res.status(400).json({ success: false, error: 'profileId and fingerprint required' });
    }
    await registerDevice(profileId, fingerprint, platform, name);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/devices/:profileId
router.get('/:profileId', async (req, res, next) => {
  try {
    const devices = await getDevices(req.params.profileId);
    res.json({ success: true, data: devices });
  } catch (err) { next(err); }
});

// GET /api/devices/:profileId/active
router.get('/:profileId/active', async (req, res, next) => {
  try {
    const device = await getActiveDevice(req.params.profileId);
    res.json({ success: true, data: device });
  } catch (err) { next(err); }
});

// POST /api/devices/heartbeat
router.post('/heartbeat', async (req, res, next) => {
  try {
    const { profileId, fingerprint } = req.body;
    if (!profileId || !fingerprint) {
      return res.status(400).json({ success: false, error: 'profileId and fingerprint required' });
    }
    await updateDeviceLastSeen(profileId, fingerprint);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/devices/:profileId/:fingerprint
router.delete('/:profileId/:fingerprint', async (req, res, next) => {
  try {
    await removeDevice(req.params.profileId, req.params.fingerprint);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
