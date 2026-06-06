const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const sr = require('../services/spaced-repetition');
const { recordObjectiveAttempt } = require('../services/objective-mastery');
const { logEvent } = require('../services/skill-memory');

// ─── LEGACY: review_items table (pre-FSRS) ────────────────────────────────
// Still used for question-level review items. The FSRS review_cards
// track topic-level spaced repetition with memory decay curves.

const REVIEW_INTERVALS = [1, 1, 3, 7, 14, 30]; // legacy fallback

function getNextReviewDate(memoryScore) {
  const days = memoryScore < REVIEW_INTERVALS.length
    ? REVIEW_INTERVALS[memoryScore]
    : 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// GET /api/review/:profileId/due — get FSRS-scheduled cards + legacy items due today
router.get('/:profileId/due', async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { subject } = req.query;

    // ── FSRS review cards (topic-level) ──
    let fsrsCards = [];
    try {
      const subjectFilter = subject ? ' AND subject = $2' : '';
      const params = subject ? [profileId, subject] : [profileId];
      const fsrsResult = await pool.query(
        `SELECT * FROM review_cards
         WHERE profile_id = $1${subjectFilter}
         ORDER BY due ASC`,
        params
      );
      fsrsCards = fsrsResult.rows;
      const dueCards = sr.getDueCards(fsrsCards.map(sr.rowToCard));
      // Merge FSRS card data with retrievability info
      const fsrsDue = fsrsResult.rows.filter((row) => {
        const card = sr.rowToCard(row);
        return new Date(card.due) <= new Date();
      });
      // Return FSRS cards as topic-level review suggestions
      const fsrsItems = fsrsDue.map(row => ({
        source: 'fsrs',
        id: row.id,
        profile_id: row.profile_id,
        subject: row.subject,
        topic: row.topic,
        due: row.due,
        last_score: row.last_score,
        retrievability: sr.getRetrievability(sr.rowToCard(row)),
        reps: row.reps,
        state: row.state,
        stability: row.stability,
        difficulty: row.difficulty,
      }));

      return res.json({
        success: true,
        data: {
          fsrs: fsrsItems,
          legacy: [],
          stats: sr.getReviewStats(fsrsCards.map(sr.rowToCard)),
        },
      });
    } catch (err) {
      if (err.code !== '42P01') {
        console.warn('[Review] FSRS query failed:', err.message);
      }
      // review_cards not migrated yet — fall through to legacy
    }

    // ── Legacy fallback: review_items ──
    const result = await pool.query(
      `SELECT * FROM review_items
       WHERE profile_id = $1 AND next_review_date <= CURRENT_DATE
       ORDER BY memory_score ASC, next_review_date ASC`,
      [profileId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/review/:profileId/add — add item to review queue (legacy + FSRS)
router.post('/:profileId/add', async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { subject, topic, questionText, correctAnswer } = req.body;

    if (!subject || !questionText || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'subject, questionText, and correctAnswer are required',
      });
    }

    // Add to legacy review_items
    const result = await pool.query(
      `INSERT INTO review_items (profile_id, subject, topic, question_text, correct_answer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [profileId, subject, topic || null, questionText, correctAnswer]
    );

    // Also create an FSRS review card for the topic
    try {
      const card = sr.createCard({ profileId: parseInt(profileId), subject, topic: topic || subject });
      const row = sr.cardToRow(card);
      await pool.query(
        `INSERT INTO review_cards (profile_id, subject, topic, state, stability, difficulty,
          elapsed_days, scheduled_days, reps, lapses, last_review, due, last_score, first_learn_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (profile_id, subject, topic) DO NOTHING`,
        [row.profile_id, row.subject, row.topic, row.state, row.stability, row.difficulty,
         row.elapsed_days, row.scheduled_days, row.reps, row.lapses, row.last_review,
         row.due, row.last_score, row.first_learn_date]
      );
    } catch (err) {
      if (err.code !== '42P01') console.warn('[Review] FSRS card create failed:', err.message);
    }

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/review/:id/result — record review result (FSRS + legacy)
router.post('/:id/result', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correct, confidence, subject, topic, profileId } = req.body;

    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'correct (boolean) is required',
      });
    }

    // ── Legacy review_items update ──
    const itemResult = await pool.query(
      'SELECT * FROM review_items WHERE id = $1',
      [id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review item not found' });
    }

    const item = itemResult.rows[0];
    let newScore;
    let nextReviewDate;

    if (correct) {
      newScore = item.memory_score + 1;
      nextReviewDate = getNextReviewDate(newScore);
    } else {
      newScore = 0;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextReviewDate = tomorrow.toISOString().split('T')[0];
    }

    const result = await pool.query(
      `UPDATE review_items
       SET memory_score = $1, next_review_date = $2, times_reviewed = times_reviewed + 1
       WHERE id = $3
       RETURNING *`,
      [newScore, nextReviewDate, id]
    );

    // ── FSRS review card update ──
    const effectiveSubject = subject || item.subject;
    const effectiveTopic = topic || item.topic;
    const effectiveProfileId = profileId || item.profile_id;
    let fsrsResult = null;

    try {
      const rating = sr.answerToRating(correct, confidence);
      const cardResult = await pool.query(
        `SELECT * FROM review_cards WHERE profile_id = $1 AND subject = $2 AND topic = $3`,
        [effectiveProfileId, effectiveSubject, effectiveTopic]
      );

      if (cardResult.rows.length > 0) {
        const card = sr.rowToCard(cardResult.rows[0]);
        const updated = sr.scheduleReview(card, rating);
        await pool.query(
          `UPDATE review_cards SET state=$1, stability=$2, difficulty=$3, elapsed_days=$4,
           scheduled_days=$5, reps=$6, lapses=$7, last_review=$8, due=$9, last_score=$10, updated_at=NOW()
           WHERE profile_id = $11 AND subject = $12 AND topic = $13`,
          [updated.state, updated.stability, updated.difficulty, updated.elapsedDays,
           updated.scheduledDays, updated.reps, updated.lapses, updated.lastReview,
           updated.due, updated.lastScore, effectiveProfileId, effectiveSubject, effectiveTopic]
        );
        fsrsResult = {
          nextDue: updated.due,
          stability: updated.stability,
          difficulty: updated.difficulty,
          retrievability: sr.getRetrievability(updated),
        };
      } else {
        // Create a new FSRS card
        const card = sr.createCard({ profileId: effectiveProfileId, subject: effectiveSubject, topic: effectiveTopic });
        const updated = sr.scheduleReview(card, rating);
        const row = sr.cardToRow(updated);
        await pool.query(
          `INSERT INTO review_cards (profile_id, subject, topic, state, stability, difficulty,
            elapsed_days, scheduled_days, reps, lapses, last_review, due, last_score, first_learn_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [row.profile_id, row.subject, row.topic, row.state, row.stability, row.difficulty,
           row.elapsed_days, row.scheduled_days, row.reps, row.lapses, row.last_review,
           row.due, row.last_score, row.first_learn_date]
        );
        fsrsResult = {
          nextDue: updated.due,
          stability: updated.stability,
          difficulty: updated.difficulty,
          retrievability: sr.getRetrievability(updated),
        };
      }
    } catch (err) {
      if (err.code !== '42P01') console.warn('[Review] FSRS result update failed:', err.message);
    }

    // ── BKT mastery update ──
    await recordObjectiveAttempt(
      effectiveProfileId, effectiveSubject, effectiveTopic,
      correct ? 'review correct' : 'review wrong',
      correct
    ).catch(() => {}); // non-blocking

    // ── Skill memory event ──
    logEvent({
      profileId: effectiveProfileId, surface: 'learn',
      eventType: correct ? 'breakthrough' : 'struggle',
      subject: effectiveSubject, topic: effectiveTopic,
      details: { reviewItemId: id, correct, confidence },
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        fsrs: fsrsResult,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/review/:profileId/stats — review stats (FSRS + legacy)
router.get('/:profileId/stats', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    // Try FSRS stats first
    try {
      const fsrsResult = await pool.query(
        `SELECT * FROM review_cards WHERE profile_id = $1`,
        [profileId]
      );
      const cards = fsrsResult.rows.map(sr.rowToCard);
      const fsrsStats = sr.getReviewStats(cards);

      const bySubject = {};
      for (const row of fsrsResult.rows) {
        bySubject[row.subject] = (bySubject[row.subject] || 0) + 1;
      }

      return res.json({
        success: true,
        data: {
          ...fsrsStats,
          bySubject,
        },
      });
    } catch (err) {
      if (err.code !== '42P01') console.warn('[Review] FSRS stats failed:', err.message);
      // Fall through to legacy
    }

    // Legacy fallback
    const statsResult = await pool.query(
      `SELECT
         COUNT(*)::int AS "totalItems",
         COUNT(*) FILTER (WHERE next_review_date <= CURRENT_DATE)::int AS "dueToday",
         COUNT(*) FILTER (WHERE memory_score >= 5)::int AS mastered
       FROM review_items WHERE profile_id = $1`,
      [profileId]
    );

    const bySubjectResult = await pool.query(
      `SELECT subject, COUNT(*)::int AS count
       FROM review_items WHERE profile_id = $1
       GROUP BY subject`,
      [profileId]
    );

    const bySubject = {};
    for (const row of bySubjectResult.rows) {
      bySubject[row.subject] = row.count;
    }

    res.json({
      success: true,
      data: {
        ...statsResult.rows[0],
        bySubject,
        engine: 'legacy',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;