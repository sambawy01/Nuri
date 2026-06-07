const express = require('express');
const router = express.Router();
const { getRecentReports, getPerformanceSummary } = require('../services/session-reports');

// GET /api/reports/:profileId — recent session reports (for parent dashboard)
router.get('/:profileId', async (req, res, next) => {
  try {
    const reports = await getRecentReports(req.params.profileId);
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:profileId/summary — performance summary (last 7 days)
router.get('/:profileId/summary', async (req, res, next) => {
  try {
    const summary = await getPerformanceSummary(req.params.profileId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
