const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { getChapters, getChapter, getStage } = require('../services/story-content');
const { evaluateBadges } = require('../services/badges');

// Ensure story_progress table exists (idempotent migration helper)
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS story_progress (
      id          SERIAL PRIMARY KEY,
      profile_id  UUID NOT NULL,
      chapter     INTEGER NOT NULL,
      stage       INTEGER NOT NULL,
      score       INTEGER NOT NULL DEFAULT 0,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (profile_id, chapter, stage)
    )
  `);
}

// GET /api/story/progress/:profileId
router.get('/progress/:profileId', async (req, res, next) => {
  try {
    await ensureTable();
    const { profileId } = req.params;

    const result = await pool.query(
      `SELECT chapter, stage, score, completed_at
       FROM story_progress
       WHERE profile_id = $1
       ORDER BY chapter, stage`,
      [profileId]
    );

    const rows = result.rows;

    // Build per-chapter progress summary alongside chapter metadata
    const chapters = getChapters().map(ch => {
      const completedStages = rows
        .filter(r => r.chapter === ch.id)
        .map(r => r.stage);

      const stagesComplete = completedStages.length;
      const totalStages = ch.stages.length;
      const chapterComplete = stagesComplete === totalStages;

      return {
        ...ch,
        stagesComplete,
        totalStages,
        chapterComplete,
        completedStages,
      };
    });

    res.json({ success: true, data: { chapters, raw: rows } });
  } catch (err) {
    next(err);
  }
});

// GET /api/story/chapter/:chapterId
router.get('/chapter/:chapterId', async (req, res, next) => {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    const chapter = getChapter(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    res.json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
});

// POST /api/story/complete-stage
// body: { profileId, chapter, stage, score }
router.post('/complete-stage', async (req, res, next) => {
  try {
    await ensureTable();
    const { profileId, chapter, stage, score = 0 } = req.body;

    if (!profileId || !chapter || !stage) {
      return res.status(400).json({ success: false, error: 'profileId, chapter, and stage are required' });
    }

    const stageData = getStage(chapter, stage);
    if (!stageData) {
      return res.status(404).json({ success: false, error: 'Stage not found' });
    }

    // Upsert completion record
    await pool.query(
      `INSERT INTO story_progress (profile_id, chapter, stage, score, completed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (profile_id, chapter, stage)
       DO UPDATE SET score = GREATEST(story_progress.score, EXCLUDED.score), completed_at = NOW()`,
      [profileId, chapter, stage, score]
    );

    // Award XP — reward stages give 50 XP, others 20 XP
    const xpAmount = stageData.type === 'reward' ? 50 : 20;
    const subject = getChapter(chapter)?.subject || 'maths';

    await pool.query(
      `INSERT INTO xp_events (profile_id, xp_amount, event_type, subject, topic)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, xpAmount, `story_stage_${stageData.type}`, subject, `chapter_${chapter}`]
    );

    const xpResult = await pool.query(
      `UPDATE profiles SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2 RETURNING total_xp, current_level`,
      [xpAmount, profileId]
    );

    let level = xpResult.rows[0]?.current_level || 1;
    const totalXP = xpResult.rows[0]?.total_xp || 0;

    // Level thresholds (matches xp.js)
    const thresholds = [
      { level: 1, xp: 0 }, { level: 2, xp: 100 }, { level: 3, xp: 250 },
      { level: 4, xp: 500 }, { level: 5, xp: 800 }, { level: 6, xp: 1200 },
      { level: 7, xp: 1700 }, { level: 8, xp: 2300 }, { level: 9, xp: 3000 },
      { level: 10, xp: 4000 }, { level: 15, xp: 8000 }, { level: 20, xp: 15000 },
    ];
    for (const t of thresholds) {
      if (totalXP >= t.xp) level = t.level;
      else break;
    }

    await pool.query(
      `UPDATE profiles SET current_level = $1 WHERE id = $2 AND current_level < $1`,
      [level, profileId]
    );

    // Evaluate badges
    const newBadges = await evaluateBadges(profileId);

    res.json({
      success: true,
      data: {
        xpEarned: xpAmount,
        totalXP,
        level,
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
