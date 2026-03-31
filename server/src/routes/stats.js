const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getLevel } = require('../services/xp');

// GET /api/stats/:profileId — full stats
router.get('/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    // Get profile
    const profileResult = await pool.query(
      'SELECT id, name, year_group, total_xp, current_level, streak_days, last_active_date FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Get total questions answered
    const quizCountResult = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN was_correct THEN 1 ELSE 0 END) as correct FROM quiz_history WHERE profile_id = $1 AND was_correct IS NOT NULL',
      [profileId]
    );

    // Get XP breakdown by subject
    const xpBySubjectResult = await pool.query(
      'SELECT subject, SUM(xp_amount) as total_xp FROM xp_events WHERE profile_id = $1 AND subject IS NOT NULL GROUP BY subject ORDER BY total_xp DESC',
      [profileId]
    );

    // Get recent activity (last 7 days)
    const recentActivityResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as activities, SUM(xp_amount) as xp_earned
       FROM xp_events
       WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [profileId]
    );

    // Get unresolved mistakes count
    const mistakesResult = await pool.query(
      'SELECT COUNT(*) as unresolved FROM mistakes WHERE profile_id = $1 AND resolved = FALSE',
      [profileId]
    );

    // Get total sessions
    const sessionsResult = await pool.query(
      'SELECT COUNT(*) as total, mode FROM chat_sessions WHERE profile_id = $1 GROUP BY mode',
      [profileId]
    );

    const quizStats = quizCountResult.rows[0];
    const accuracy = quizStats.total > 0
      ? Math.round((quizStats.correct / quizStats.total) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        profile: {
          ...profile,
          level: getLevel(profile.total_xp),
        },
        quiz: {
          totalAnswered: parseInt(quizStats.total, 10),
          totalCorrect: parseInt(quizStats.correct || 0, 10),
          accuracy,
        },
        xpBySubject: xpBySubjectResult.rows,
        recentActivity: recentActivityResult.rows,
        unresolvedMistakes: parseInt(mistakesResult.rows[0].unresolved, 10),
        sessions: sessionsResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/:profileId/mastery — topic mastery by subject
router.get('/:profileId/mastery', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    // Verify profile exists
    const profileResult = await pool.query(
      'SELECT id FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Get all mastery data grouped by subject
    const masteryResult = await pool.query(
      `SELECT subject, topic, stars, attempts, correct_count, last_practiced
       FROM topic_mastery
       WHERE profile_id = $1
       ORDER BY subject, topic`,
      [profileId]
    );

    // Group by subject
    const mastery = {};
    for (const row of masteryResult.rows) {
      if (!mastery[row.subject]) {
        mastery[row.subject] = [];
      }
      mastery[row.subject].push({
        topic: row.topic,
        stars: row.stars,
        attempts: row.attempts,
        correctCount: row.correct_count,
        lastPracticed: row.last_practiced,
      });
    }

    res.json({
      success: true,
      data: mastery,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
