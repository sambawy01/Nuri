// server/src/routes/challenge.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { generateQuizQuestion } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');
const { evaluateBadges } = require('../services/badges');
const { getTopics } = require('../services/curriculum');

const SUBJECTS = ['maths', 'science', 'english', 'history', 'religion', 'arabic'];

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Deterministic daily subject/topic selection based on date
function getDailySubjectTopic(date, yearGroup) {
  const seed = date.split('-').join('');
  const subjectIndex = parseInt(seed, 10) % SUBJECTS.length;
  const subject = SUBJECTS[subjectIndex];
  const topics = getTopics(subject, yearGroup);
  if (!topics || topics.length === 0) return { subject, topic: subject };
  const topicIndex = parseInt(seed, 10) % topics.length;
  return { subject, topic: topics[topicIndex].name };
}

// GET /api/challenge/today — get today's challenge
router.get('/today', async (req, res, next) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId query param required' });
    }

    const today = getTodayDate();

    // Check if profile already attempted
    const attemptResult = await pool.query(
      'SELECT * FROM daily_challenge_attempts WHERE profile_id = $1 AND challenge_date = $2',
      [profileId, today]
    );
    const attempted = attemptResult.rows.length > 0;

    // Check if challenge exists for today
    let challengeResult = await pool.query(
      'SELECT * FROM daily_challenges WHERE challenge_date = $1',
      [today]
    );

    if (challengeResult.rows.length === 0) {
      // Generate today's challenge
      const profile = await pool.query('SELECT year_group FROM profiles WHERE id = $1', [profileId]);
      const yearGroup = profile.rows[0]?.year_group || 3;
      const { subject, topic } = getDailySubjectTopic(today, yearGroup);

      const questionData = await generateQuizQuestion(subject, topic, yearGroup, 'medium');

      await pool.query(
        'INSERT INTO daily_challenges (challenge_date, subject, topic, question_data) VALUES ($1, $2, $3, $4) ON CONFLICT (challenge_date) DO NOTHING',
        [today, subject, topic, JSON.stringify(questionData)]
      );

      challengeResult = await pool.query(
        'SELECT * FROM daily_challenges WHERE challenge_date = $1',
        [today]
      );
    }

    const challenge = challengeResult.rows[0];

    res.json({
      success: true,
      data: {
        date: challenge.challenge_date,
        subject: challenge.subject,
        topic: challenge.topic,
        question: challenge.question_data,
        attempted,
        attempt: attempted ? attemptResult.rows[0] : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenge/answer — submit answer
router.post('/answer', async (req, res, next) => {
  try {
    const { profileId, answer } = req.body;
    if (!profileId || answer === undefined) {
      return res.status(400).json({ success: false, error: 'profileId and answer required' });
    }

    const today = getTodayDate();

    // Check already attempted
    const existing = await pool.query(
      'SELECT id FROM daily_challenge_attempts WHERE profile_id = $1 AND challenge_date = $2',
      [profileId, today]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Already attempted today' });
    }

    // Get today's challenge
    const challengeResult = await pool.query(
      'SELECT * FROM daily_challenges WHERE challenge_date = $1',
      [today]
    );
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No challenge for today' });
    }

    const challenge = challengeResult.rows[0];
    const questionData = challenge.question_data;
    const isCorrect = answer.toString().toUpperCase() === questionData.correctAnswer.toString().toUpperCase();
    const xpAmount = isCorrect ? 50 : 15;

    // Record attempt
    await pool.query(
      'INSERT INTO daily_challenge_attempts (profile_id, challenge_date, answer, was_correct, xp_earned) VALUES ($1, $2, $3, $4, $5)',
      [profileId, today, answer, isCorrect, xpAmount]
    );

    // Award XP
    const xpResult = await awardXP(profileId, isCorrect ? 'correct_first_try' : 'wrong_but_tried', challenge.subject, challenge.topic);

    // Check for new badges
    const newBadges = await evaluateBadges(profileId);

    res.json({
      success: true,
      data: {
        correct: isCorrect,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        xpEarned: xpAmount,
        xp: xpResult,
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
