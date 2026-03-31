const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Spaced repetition intervals in days, indexed by memory_score
const REVIEW_INTERVALS = [1, 1, 3, 7, 14, 30];

/**
 * Calculate the next review date based on memory score.
 */
function getNextReviewDate(memoryScore) {
  const days = memoryScore < REVIEW_INTERVALS.length
    ? REVIEW_INTERVALS[memoryScore]
    : 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// GET /api/review/:profileId/due — get items due for review today
router.get('/:profileId/due', async (req, res, next) => {
  try {
    const { profileId } = req.params;

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

// POST /api/review/:profileId/add — add item to review queue
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

    const result = await pool.query(
      `INSERT INTO review_items (profile_id, subject, topic, question_text, correct_answer)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [profileId, subject, topic || null, questionText, correctAnswer]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/review/:id/result — record review result
router.post('/:id/result', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { correct } = req.body;

    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'correct (boolean) is required',
      });
    }

    // Get current item
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
      // Reset to tomorrow
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

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/review/:profileId/stats — review stats
router.get('/:profileId/stats', async (req, res, next) => {
  try {
    const { profileId } = req.params;

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
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
