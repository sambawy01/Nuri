// server/src/routes/badges.js
const express = require('express');
const router = express.Router();
const { getEarnedBadges, BADGE_DEFINITIONS, seedBadges, awardBadgeByHint } = require('../services/badges');

// GET /api/badges/all — all badge definitions
router.get('/all', async (req, res, next) => {
  try {
    res.json({ success: true, data: BADGE_DEFINITIONS });
  } catch (err) {
    next(err);
  }
});

// GET /api/badges/:profileId — earned badges for a profile
router.get('/:profileId', async (req, res, next) => {
  try {
    const badges = await getEarnedBadges(req.params.profileId);
    res.json({ success: true, data: badges });
  } catch (err) {
    next(err);
  }
});

// POST /api/badges/seed — seed badge definitions (call once)
router.post('/seed', async (req, res, next) => {
  try {
    await seedBadges();
    res.json({ success: true, data: { seeded: BADGE_DEFINITIONS.length } });
  } catch (err) {
    next(err);
  }
});

// POST /api/badges/hint — award a badge from client-side hint (time_of_day, weekend, streaks)
router.post('/hint', async (req, res, next) => {
  try {
    const { profileId, badgeId } = req.body;
    if (!profileId || !badgeId) {
      return res.status(400).json({ success: false, error: 'profileId and badgeId required' });
    }
    const validHintBadges = ['night-owl', 'early-bird', 'weekend-warrior', 'streak-5q', 'streak-10q', 'speed-demon'];
    if (!validHintBadges.includes(badgeId)) {
      return res.status(400).json({ success: false, error: 'Invalid hint badge' });
    }
    const badge = await awardBadgeByHint(profileId, badgeId);
    res.json({ success: true, data: badge });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
