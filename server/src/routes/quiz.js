const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { generateQuizQuestion } = require('../services/ai-provider');
const { awardXP, awardQuizXP } = require('../services/xp');
const { getTopics } = require('../services/curriculum');
const { evaluateBadges } = require('../services/badges');
const { generateSessionReport } = require('../services/session-reports');

// POST /api/quiz/question — generate quiz question
router.post('/question', async (req, res, next) => {
  try {
    const { profileId, subject, topic, difficulty } = req.body;

    if (!profileId || !subject || !topic) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, and topic are required',
      });
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'challenge'];
    const questionDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

    // Get the profile to determine year group
    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    // Validate topic exists in curriculum
    const topics = getTopics(subject, profile.year_group);
    if (!topics) {
      return res.status(400).json({
        success: false,
        error: `Invalid subject "${subject}" for year group ${profile.year_group}`,
      });
    }

    // Try question bank first (instant), fall back to live AI
    let question;
    const bankResult = await pool.query(
      `SELECT * FROM question_bank
       WHERE subject = $1 AND year_group = $2 AND difficulty = $3
         AND (topic = $4 OR $4 IS NULL)
       ORDER BY times_served ASC, RANDOM()
       LIMIT 1`,
      [subject, profile.year_group, questionDifficulty, topic]
    );

    if (bankResult.rows.length > 0) {
      const q = bankResult.rows[0];
      question = {
        question: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      };
      // Increment times_served
      await pool.query('UPDATE question_bank SET times_served = times_served + 1 WHERE id = $1', [q.id]);
    } else {
      // Fall back to live AI generation
      question = await generateQuizQuestion(
        subject,
        topic,
        profile.year_group,
        questionDifficulty
      );
    }

    // Store the question in quiz_history
    const historyResult = await pool.query(
      `INSERT INTO quiz_history (profile_id, subject, topic, question_text, correct_answer, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [profileId, subject, topic, question.question, question.correctAnswer, questionDifficulty]
    );

    res.json({
      success: true,
      data: {
        questionId: historyResult.rows[0].id,
        question: question.question,
        options: question.options,
        explanation: question.explanation,
        difficulty: questionDifficulty,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/quiz/answer — submit answer
router.post('/answer', async (req, res, next) => {
  try {
    const { profileId, questionId, answer, subject, topic, confidence } = req.body;

    if (!profileId || !questionId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'profileId, questionId, and answer are required',
      });
    }

    // Get the question from history
    const questionResult = await pool.query(
      'SELECT * FROM quiz_history WHERE id = $1 AND profile_id = $2',
      [questionId, profileId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const question = questionResult.rows[0];
    const isCorrect = answer.toUpperCase() === question.correct_answer.toUpperCase();

    // Determine XP event type
    let eventType;
    if (isCorrect && question.hint_level_used === 0) {
      eventType = 'correct_first_try';
    } else if (isCorrect) {
      eventType = 'correct_with_hint';
    } else {
      eventType = 'wrong_but_tried';
    }

    // Award XP
    const xpResult = await awardQuizXP(
      profileId,
      eventType,
      question.difficulty || 'medium',
      subject || question.subject,
      topic || question.topic
    );

    // Update quiz history with the answer
    await pool.query(
      `UPDATE quiz_history
       SET child_answer = $1, was_correct = $2, xp_earned = $3
       WHERE id = $4`,
      [answer, isCorrect, xpResult.xpAwarded, questionId]
    );

    // Record confidence response if provided
    const validConfidence = ['guessed', 'unsure', 'pretty_sure', 'knew_it'];
    if (confidence && validConfidence.includes(confidence)) {
      await pool.query(
        `INSERT INTO confidence_responses (profile_id, quiz_history_id, confidence_level, was_correct, subject, topic)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [profileId, questionId, confidence, isCorrect, subject || question.subject, topic || question.topic]
      );

      // +2 XP for using confidence meter
      await awardXP(profileId, 'confidence_used', subject || question.subject, topic || question.topic);

      // Blind spots (confident + wrong) get highest priority in spaced repetition
      if ((confidence === 'knew_it' || confidence === 'pretty_sure') && !isCorrect) {
        await pool.query(
          `UPDATE review_items SET memory_score = 0, next_review_date = CURRENT_DATE
           WHERE profile_id = $1 AND question_text = $2`,
          [profileId, question.question_text]
        );
      }

      // Lucky guesses (unsure + right) stay in review
      if ((confidence === 'guessed' || confidence === 'unsure') && isCorrect) {
        await pool.query(
          `INSERT INTO review_items (profile_id, subject, topic, question_text, correct_answer, memory_score)
           VALUES ($1, $2, $3, $4, $5, 1)
           ON CONFLICT DO NOTHING`,
          [profileId, subject || question.subject, topic || question.topic, question.question_text, question.correct_answer]
        );
      }
    }

    // Update topic mastery
    const masterySubject = subject || question.subject;
    const masteryTopic = topic || question.topic;

    if (masterySubject && masteryTopic) {
      await pool.query(
        `INSERT INTO topic_mastery (profile_id, subject, topic, attempts, correct_count, last_practiced)
         VALUES ($1, $2, $3, 1, $4, NOW())
         ON CONFLICT (profile_id, subject, topic)
         DO UPDATE SET
           attempts = topic_mastery.attempts + 1,
           correct_count = topic_mastery.correct_count + $4,
           stars = LEAST(5, FLOOR((topic_mastery.correct_count + $4)::float / GREATEST(1, topic_mastery.attempts + 1) * 5)),
           last_practiced = NOW()`,
        [profileId, masterySubject, masteryTopic, isCorrect ? 1 : 0]
      );
    }

    // If wrong, record as a mistake and add to spaced repetition queue
    if (!isCorrect) {
      await pool.query(
        `INSERT INTO mistakes (profile_id, subject, topic, question_text, child_answer, correct_answer)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [profileId, masterySubject, masteryTopic, question.question_text, answer, question.correct_answer]
      );

      // Auto-add to spaced repetition review queue
      await pool.query(
        `INSERT INTO review_items (profile_id, subject, topic, question_text, correct_answer)
         VALUES ($1, $2, $3, $4, $5)`,
        [profileId, masterySubject, masteryTopic, question.question_text, question.correct_answer]
      );
    }

    // Evaluate badges
    const newBadges = await evaluateBadges(profileId);

    res.json({
      success: true,
      data: {
        correct: isCorrect,
        correctAnswer: question.correct_answer,
        xpEarned: xpResult.xpAwarded,
        totalXP: xpResult.totalXP,
        level: xpResult.level,
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/quiz/complete — finalize quiz session and generate report
router.post('/complete', async (req, res, next) => {
  try {
    const { profileId, subject, topic, score, total, sessionXP, difficulty } = req.body;

    if (!profileId || !subject) {
      return res.status(400).json({ success: false, error: 'profileId and subject required' });
    }

    // Generate session report
    const report = await generateSessionReport({
      profileId,
      sessionType: 'quiz',
      subject,
      topic: topic || subject,
      questionsAttempted: total || 10,
      questionsCorrect: score || 0,
      xpEarned: sessionXP || 0,
    });

    res.json({
      success: true,
      data: {
        report,
        nextSuggestion: report.recommendations,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
