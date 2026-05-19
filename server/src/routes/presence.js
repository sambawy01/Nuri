const express = require('express');
const router = express.Router();
const presence = require('../services/presence');

// POST /api/presence/start — open a new presence session
router.post('/start', async (req, res, next) => {
  try {
    const { profileId, context, contextRef, tier } = req.body || {};
    if (!profileId || !context || !tier) {
      return res.status(400).json({
        success: false,
        error: 'profileId, context, and tier are required',
      });
    }
    if (!['t1', 't2', 't3'].includes(tier)) {
      return res.status(400).json({ success: false, error: 'invalid tier' });
    }
    const data = await presence.startSession({ profileId, context, contextRef, tier });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// POST /api/presence/sample — flush a batch of aggregates (no frames)
router.post('/sample', async (req, res, next) => {
  try {
    const { sessionId, samplesTotal, samplesPresent, livenessEvents, pausedCount } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId required' });
    }
    await presence.recordBatch({
      sessionId,
      samplesTotal: samplesTotal | 0,
      samplesPresent: samplesPresent | 0,
      livenessEvents: livenessEvents | 0,
      pausedCount: pausedCount | 0,
    });
    res.json({ success: true, data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// POST /api/presence/end — finalize the session, compute streak integrity
router.post('/end', async (req, res, next) => {
  try {
    const { sessionId, autoEnded } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId required' });
    }
    const data = await presence.endSession({ sessionId, autoEnded: !!autoEnded });
    if (!data) {
      return res.status(404).json({ success: false, error: 'session not found' });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/presence/tier/:profileId
router.get('/tier/:profileId', async (req, res, next) => {
  try {
    const tier = await presence.getProfilePresenceTier(req.params.profileId);
    res.json({ success: true, data: { tier } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/presence/tier/:profileId — parent consent change
router.put('/tier/:profileId', async (req, res, next) => {
  try {
    const { tier } = req.body || {};
    if (!tier) {
      return res.status(400).json({ success: false, error: 'tier required' });
    }
    const data = await presence.setProfilePresenceTier(req.params.profileId, tier);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/presence/summary/:profileId?days=7
router.get('/summary/:profileId', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await presence.summarize(req.params.profileId, days);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/presence/class/:classId?days=7
router.get('/class/:classId', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await presence.classSummary(req.params.classId, days);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
