const express = require('express');
const router = express.Router();
const { startDiagnostic, answerDiagnostic } = require('../services/diagnostic');
const { getAllLevels } = require('../services/levels');

// POST /api/diagnostic/start — { profileId, subject }
router.post('/start', async (req, res, next) => {
  try {
    const { profileId, subject } = req.body || {};
    if (!profileId || !subject) {
      return res.status(400).json({ success: false, error: 'profileId and subject required' });
    }
    const data = await startDiagnostic(profileId, subject);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/diagnostic/answer — { sessionId, answer }
router.post('/answer', async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body || {};
    if (!sessionId || !answer) {
      return res.status(400).json({ success: false, error: 'sessionId and answer required' });
    }
    const data = await answerDiagnostic(sessionId, answer);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/diagnostic/levels/:profileId — all per-subject levels
router.get('/levels/:profileId', async (req, res, next) => {
  try {
    const data = await getAllLevels(req.params.profileId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
