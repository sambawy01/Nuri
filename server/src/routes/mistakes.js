const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/mistakes — save a mistake
router.post('/', async (req, res, next) => {
  try {
    const { profileId, subject, topic, questionText, childAnswer, correctAnswer, explanation } = req.body;

    if (!profileId || !subject || !questionText || !correctAnswer) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, questionText, and correctAnswer are required',
      });
    }

    // Classify error type based on subject and answer patterns
    const errorType = classifyErrorType(subject, childAnswer, correctAnswer);

    const result = await pool.query(
      `INSERT INTO mistakes (profile_id, subject, topic, question_text, child_answer, correct_answer, error_type, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [profileId, subject, topic || null, questionText, childAnswer || null, correctAnswer, errorType, explanation || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/mistakes/:profileId — get all unresolved mistakes for a profile
router.get('/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { subject } = req.query;

    let query = `SELECT * FROM mistakes WHERE profile_id = $1 AND resolved = FALSE`;
    const params = [profileId];

    if (subject) {
      query += ` AND subject = $2`;
      params.push(subject);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    // Group by subject
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.subject]) {
        grouped[row.subject] = [];
      }
      grouped[row.subject].push(row);
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    next(err);
  }
});

// POST /api/mistakes/:id/resolve — mark a mistake as resolved
router.post('/:id/resolve', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE mistakes SET resolved = TRUE, resolved_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Mistake not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/mistakes/:profileId/stats — mistake stats
router.get('/:profileId/stats', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const totalResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE resolved = TRUE)::int AS resolved,
         COUNT(*) FILTER (WHERE resolved = FALSE)::int AS unresolved
       FROM mistakes WHERE profile_id = $1`,
      [profileId]
    );

    const bySubjectResult = await pool.query(
      `SELECT subject, COUNT(*)::int AS count
       FROM mistakes WHERE profile_id = $1 AND resolved = FALSE
       GROUP BY subject`,
      [profileId]
    );

    const bySubject = {};
    for (const row of bySubjectResult.rows) {
      bySubject[row.subject] = row.count;
    }

    const stats = totalResult.rows[0];

    res.json({
      success: true,
      data: {
        total: stats.total,
        resolved: stats.resolved,
        unresolved: stats.unresolved,
        bySubject,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Classify the error type based on subject and answer patterns.
 * Uses simple heuristics; defaults to 'unknown' when uncertain.
 */
function classifyErrorType(subject, childAnswer, correctAnswer) {
  if (!childAnswer || !correctAnswer) return 'unknown';

  const child = childAnswer.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();

  // Maths-specific classification
  if (subject === 'maths') {
    // Check for sign/direction errors (e.g., 5 vs -5)
    if (child === `-${correct}` || correct === `-${child}`) {
      return 'sign_error';
    }
    // Check for digit transposition (e.g., 12 vs 21)
    if (/^\d+$/.test(child) && /^\d+$/.test(correct) && child.length === correct.length) {
      const sortedChild = child.split('').sort().join('');
      const sortedCorrect = correct.split('').sort().join('');
      if (sortedChild === sortedCorrect && child !== correct) {
        return 'transposition';
      }
    }
    // Check for off-by-one errors
    if (/^\d+$/.test(child) && /^\d+$/.test(correct)) {
      if (Math.abs(parseInt(child) - parseInt(correct)) === 1) {
        return 'off_by_one';
      }
      return 'calculation_error';
    }
  }

  // Check for spelling-close answers (possible careless mistake)
  if (child.length > 2 && correct.length > 2) {
    const distance = levenshteinDistance(child, correct);
    if (distance <= 2) {
      return 'spelling_error';
    }
  }

  // If answer is one of the other options, it's a conceptual misunderstanding
  return 'conceptual';
}

/**
 * Simple Levenshtein distance for short strings.
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

module.exports = router;
