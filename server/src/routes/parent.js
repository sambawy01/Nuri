const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getRecentReports, getPerformanceSummary } = require('../services/session-reports');
const { getTestPredictions } = require('../services/homework');
const { getEarnedBadges } = require('../services/badges');

// POST /api/parent/set-pin
router.post('/set-pin', async (req, res, next) => {
  try {
    const { profileId, pin } = req.body;
    if (!profileId || !pin || pin.length !== 4) {
      return res.status(400).json({ success: false, error: '4-digit PIN required' });
    }
    await pool.query(
      'INSERT INTO parent_pins (profile_id, pin_hash) VALUES ($1, $2) ON CONFLICT (profile_id) DO UPDATE SET pin_hash = $2',
      [profileId, pin]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/parent/verify-pin
router.post('/verify-pin', async (req, res, next) => {
  try {
    const { profileId, pin } = req.body;
    const result = await pool.query('SELECT pin_hash FROM parent_pins WHERE profile_id = $1', [profileId]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { verified: true, firstTime: true } });
    }
    const verified = result.rows[0].pin_hash === pin;
    res.json({ success: true, data: { verified, firstTime: false } });
  } catch (err) { next(err); }
});

// GET /api/parent/dashboard/:profileId
router.get('/dashboard/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const [profile, reports, summary, predictions, badges, weeklyXP, weeklyTime, mistakePatterns, topicMastery] = await Promise.all([
      pool.query('SELECT name, year_group, total_xp, current_level, streak_days FROM profiles WHERE id = $1', [profileId]).then(r => r.rows[0]),
      getRecentReports(profileId, 10),
      getPerformanceSummary(profileId),
      getTestPredictions(profileId).catch(() => []),
      getEarnedBadges(profileId),
      pool.query(`SELECT DATE(created_at) as day, SUM(xp_amount) as xp FROM xp_events WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY day`, [profileId]).then(r => r.rows),
      pool.query(`SELECT COUNT(DISTINCT DATE(created_at)) as active_days, COUNT(*) as total_sessions FROM chat_sessions WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`, [profileId]).then(r => r.rows[0]),
      pool.query(`SELECT subject, error_type, COUNT(*) as count FROM mistakes WHERE profile_id = $1 AND resolved = FALSE GROUP BY subject, error_type ORDER BY count DESC LIMIT 10`, [profileId]).then(r => r.rows),
      pool.query(`SELECT subject, AVG(CASE WHEN attempts > 0 THEN correct_count::float / attempts * 100 ELSE 0 END)::int as avg_accuracy, COUNT(*) as topics FROM topic_mastery WHERE profile_id = $1 GROUP BY subject`, [profileId]).then(r => r.rows),
    ]);

    res.json({
      success: true,
      data: {
        profile,
        reports,
        summary,
        predictions,
        badges: badges.slice(0, 5),
        weeklyXP,
        weeklyTime,
        mistakePatterns,
        topicMastery,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/parent/notes — add a parent note
router.post('/notes', async (req, res, next) => {
  try {
    const { profileId, note, priority } = req.body;
    if (!profileId || !note) {
      return res.status(400).json({ success: false, error: 'profileId and note required' });
    }
    const result = await pool.query(
      'INSERT INTO parent_notes (profile_id, note, priority) VALUES ($1, $2, $3) RETURNING *',
      [profileId, note, priority || 'normal']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

// GET /api/parent/notes/:profileId — get active parent notes
router.get('/notes/:profileId', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM parent_notes WHERE profile_id = $1 AND active = TRUE ORDER BY priority DESC, created_at DESC',
      [req.params.profileId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

// DELETE /api/parent/notes/:noteId — deactivate a note
router.delete('/notes/:noteId', async (req, res, next) => {
  try {
    await pool.query('UPDATE parent_notes SET active = FALSE WHERE id = $1', [req.params.noteId]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
