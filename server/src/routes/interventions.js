const express = require('express');
const router = express.Router();
const {
  recordIntervention,
  getInterventions,
  getUnresolvedInterventions,
  resolveIntervention,
  getInterventionSummary,
} = require('../services/intervention');

// POST /api/interventions/record
router.post('/record', async (req, res, next) => {
  try {
    const { profileId, sessionId, interventionType, context, details, triggeredBy } = req.body;
    if (!profileId || !interventionType) {
      return res.status(400).json({ success: false, error: 'profileId and interventionType required' });
    }
    const data = await recordIntervention({ profileId, sessionId, interventionType, context, details, triggeredBy });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/interventions/:profileId?type=&days=&limit=
router.get('/:profileId', async (req, res, next) => {
  try {
    const options = {
      type: req.query.type,
      days: parseInt(req.query.days, 10) || 30,
      limit: parseInt(req.query.limit, 10) || 50,
    };
    const data = await getInterventions(req.params.profileId, options);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/interventions/:profileId/summary?days=
router.get('/:profileId/summary', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await getInterventionSummary(req.params.profileId, days);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/interventions/:profileId/unresolved
router.get('/:profileId/unresolved', async (req, res, next) => {
  try {
    const data = await getUnresolvedInterventions(req.params.profileId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/interventions/:id/resolve
router.post('/:id/resolve', async (req, res, next) => {
  try {
    await resolveIntervention(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
