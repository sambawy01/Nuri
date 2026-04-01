const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { generateSmartQuestions } = require('../services/smart-questions');

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST /api/duels/create
router.post('/create', async (req, res, next) => {
  try {
    const { profileId, subject } = req.body;
    if (!profileId || !subject) {
      return res.status(400).json({ success: false, error: 'profileId and subject are required' });
    }

    const profileResult = await pool.query('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    const profile = profileResult.rows[0];

    // Generate 5 smart questions — no repeats, mastery-aware, age-appropriate
    const questions = await generateSmartQuestions({
      profileId,
      subject,
      yearGroup: profile.year_group || 3,
      difficulty: 'medium',
      count: 5,
    });

    if (questions.length === 0) {
      return res.status(500).json({ success: false, error: 'Could not generate questions. Try again.' });
    }

    const code = randomCode();

    const duelResult = await pool.query(
      `INSERT INTO duels (code, subject, creator_profile_id, questions, status, created_at)
       VALUES ($1, $2, $3, $4, 'waiting', NOW())
       RETURNING *`,
      [code, subject, profileId, JSON.stringify(questions)]
    );

    res.json({ success: true, data: duelResult.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/duels/join/:code
router.get('/join/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId is required' });
    }

    const duelResult = await pool.query(
      'SELECT * FROM duels WHERE code = $1',
      [code.toUpperCase()]
    );

    if (duelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Duel not found' });
    }

    const duel = duelResult.rows[0];

    if (duel.status !== 'waiting') {
      return res.status(400).json({ success: false, error: 'This duel is no longer available to join' });
    }

    if (duel.creator_profile_id === profileId) {
      return res.status(400).json({ success: false, error: 'You cannot join your own duel' });
    }

    const updated = await pool.query(
      `UPDATE duels SET opponent_profile_id = $1, status = 'active', started_at = NOW()
       WHERE id = $2 RETURNING *`,
      [profileId, duel.id]
    );

    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/duels/answer
router.post('/answer', async (req, res, next) => {
  try {
    const { duelId, profileId, questionIndex, answer, timeMs } = req.body;
    if (!duelId || !profileId || questionIndex === undefined || !answer) {
      return res.status(400).json({ success: false, error: 'duelId, profileId, questionIndex, and answer are required' });
    }

    const duelResult = await pool.query('SELECT * FROM duels WHERE id = $1', [duelId]);
    if (duelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Duel not found' });
    }
    const duel = duelResult.rows[0];

    const questions = typeof duel.questions === 'string' ? JSON.parse(duel.questions) : duel.questions;
    if (questionIndex < 0 || questionIndex >= questions.length) {
      return res.status(400).json({ success: false, error: 'Invalid question index' });
    }

    const question = questions[questionIndex];
    const isCorrect = answer.toUpperCase() === question.correctAnswer.toUpperCase();

    await pool.query(
      `INSERT INTO duel_answers (duel_id, profile_id, question_index, answer, is_correct, time_ms, answered_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (duel_id, profile_id, question_index)
       DO UPDATE SET answer = $4, is_correct = $5, time_ms = $6, answered_at = NOW()`,
      [duelId, profileId, questionIndex, answer.toUpperCase(), isCorrect, timeMs || null]
    );

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/duels/complete
router.post('/complete', async (req, res, next) => {
  try {
    const { duelId, profileId } = req.body;
    if (!duelId || !profileId) {
      return res.status(400).json({ success: false, error: 'duelId and profileId are required' });
    }

    const duelResult = await pool.query('SELECT * FROM duels WHERE id = $1', [duelId]);
    if (duelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Duel not found' });
    }
    const duel = duelResult.rows[0];

    // Fetch all answers for this duel
    const answersResult = await pool.query(
      'SELECT * FROM duel_answers WHERE duel_id = $1',
      [duelId]
    );
    const answers = answersResult.rows;

    const creatorAnswers = answers.filter(a => a.profile_id === duel.creator_profile_id);
    const opponentAnswers = answers.filter(a => a.profile_id === duel.opponent_profile_id);

    const creatorScore = creatorAnswers.filter(a => a.is_correct).length;
    const opponentScore = opponentAnswers.filter(a => a.is_correct).length;

    let winnerId = null;
    if (creatorScore > opponentScore) winnerId = duel.creator_profile_id;
    else if (opponentScore > creatorScore) winnerId = duel.opponent_profile_id;
    // null = tie

    // Only complete if both players have answered all questions (or force-complete by either player)
    const questions = typeof duel.questions === 'string' ? JSON.parse(duel.questions) : duel.questions;
    const totalQuestions = questions.length;
    const creatorDone = creatorAnswers.length >= totalQuestions;
    const opponentDone = !duel.opponent_profile_id || opponentAnswers.length >= totalQuestions;

    const bothDone = creatorDone && opponentDone;

    if (bothDone || duel.status !== 'complete') {
      await pool.query(
        `UPDATE duels SET status = 'complete', winner_profile_id = $1,
         creator_score = $2, opponent_score = $3, completed_at = NOW()
         WHERE id = $4`,
        [winnerId, creatorScore, opponentScore, duelId]
      );

      // Award XP to both participants
      if (duel.creator_profile_id) {
        const creatorXP = winnerId === duel.creator_profile_id ? 50 : 20;
        await pool.query(
          'UPDATE profiles SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2',
          [creatorXP, duel.creator_profile_id]
        );
        await pool.query(
          `INSERT INTO xp_events (profile_id, xp_amount, event_type, subject)
           VALUES ($1, $2, 'duel_complete', $3)`,
          [duel.creator_profile_id, creatorXP, duel.subject]
        );
      }
      if (duel.opponent_profile_id) {
        const opponentXP = winnerId === duel.opponent_profile_id ? 50 : 20;
        await pool.query(
          'UPDATE profiles SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2',
          [opponentXP, duel.opponent_profile_id]
        );
        await pool.query(
          `INSERT INTO xp_events (profile_id, xp_amount, event_type, subject)
           VALUES ($1, $2, 'duel_complete', $3)`,
          [duel.opponent_profile_id, opponentXP, duel.subject]
        );
      }
    }

    const finalDuel = await pool.query('SELECT * FROM duels WHERE id = $1', [duelId]);

    res.json({
      success: true,
      data: {
        duel: finalDuel.rows[0],
        creatorScore,
        opponentScore,
        winnerId,
        xpAwarded: winnerId === profileId ? 50 : 20,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/duels/history/:profileId
router.get('/history/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      `SELECT d.*,
         cp.name AS creator_name,
         op.name AS opponent_name
       FROM duels d
       LEFT JOIN profiles cp ON d.creator_profile_id = cp.id
       LEFT JOIN profiles op ON d.opponent_profile_id = op.id
       WHERE d.creator_profile_id = $1 OR d.opponent_profile_id = $1
       ORDER BY d.created_at DESC
       LIMIT 50`,
      [profileId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/duels/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const duelResult = await pool.query(
      `SELECT d.*,
         cp.name AS creator_name,
         op.name AS opponent_name
       FROM duels d
       LEFT JOIN profiles cp ON d.creator_profile_id = cp.id
       LEFT JOIN profiles op ON d.opponent_profile_id = op.id
       WHERE d.id = $1`,
      [id]
    );

    if (duelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Duel not found' });
    }

    const answersResult = await pool.query(
      'SELECT * FROM duel_answers WHERE duel_id = $1 ORDER BY question_index, answered_at',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...duelResult.rows[0],
        answers: answersResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
