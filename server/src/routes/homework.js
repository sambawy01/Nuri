// server/src/routes/homework.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { analyzeHomework, verifyWrittenAnswer, buildHomeworkPrompt, getTestPredictions, trackHomeworkTopic } = require('../services/homework');
const { chat } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');
const { evaluateBadges } = require('../services/badges');

// POST /api/homework/analyze — analyze homework image/text
router.post('/analyze', async (req, res, next) => {
  try {
    const { profileId, image, mediaType, text, sourceType } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId required' });
    }
    if (!image && !text) {
      return res.status(400).json({ success: false, error: 'image or text required' });
    }

    let analysis;
    if (text) {
      // Typed input — wrap as a single question
      analysis = {
        subject: 'general',
        topic: 'homework',
        questions: [{ number: 1, text, type: 'short_answer' }],
      };
    } else {
      // Image/PDF — use Vision
      analysis = await analyzeHomework(image, mediaType || 'image/jpeg');
    }

    // Create session
    const sessionResult = await pool.query(
      `INSERT INTO homework_sessions (profile_id, subject, topic, source_type, questions_detected)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [profileId, analysis.subject, analysis.topic, sourceType || 'upload_image', analysis.questions?.length || 0]
    );
    const sessionId = sessionResult.rows[0].id;

    // Insert detected questions
    for (const q of (analysis.questions || [])) {
      await pool.query(
        `INSERT INTO homework_questions (session_id, question_number, question_text)
         VALUES ($1, $2, $3)`,
        [sessionId, q.number, q.text]
      );
    }

    res.json({
      success: true,
      data: {
        sessionId,
        subject: analysis.subject,
        topic: analysis.topic,
        questions: analysis.questions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/chat — Socratic conversation for a question
router.post('/chat', async (req, res, next) => {
  try {
    const { profileId, sessionId, questionIndex, message } = req.body;

    if (!profileId || !sessionId || questionIndex === undefined || !message) {
      return res.status(400).json({ success: false, error: 'profileId, sessionId, questionIndex, and message required' });
    }

    // Get profile
    const profileResult = await pool.query('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    const profile = profileResult.rows[0];

    // Get the question
    const questionResult = await pool.query(
      'SELECT * FROM homework_questions WHERE session_id = $1 AND question_number = $2',
      [sessionId, questionIndex]
    );
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    const question = questionResult.rows[0];

    // Get session for subject
    const sessionResult = await pool.query('SELECT subject FROM homework_sessions WHERE id = $1', [sessionId]);
    const subject = sessionResult.rows[0]?.subject || 'general';

    // Get learning style
    let learningStyle = null;
    const styleResult = await pool.query('SELECT * FROM learning_style_profiles WHERE profile_id = $1', [profileId]);
    if (styleResult.rows.length > 0) learningStyle = styleResult.rows[0];

    // Build messages from history
    const existingMessages = question.messages || [];
    existingMessages.push({ role: 'user', content: message });

    const systemPrompt = buildHomeworkPrompt(profile, subject, question.question_text, learningStyle);
    const responseText = await chat(existingMessages, systemPrompt);

    // Parse response
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { reply: responseText, questionComplete: false };
    }

    existingMessages.push({ role: 'assistant', content: responseText });

    // Update question messages
    await pool.query(
      'UPDATE homework_questions SET messages = $1 WHERE id = $2',
      [JSON.stringify(existingMessages), question.id]
    );

    // If question complete, store answer
    if (parsed.questionComplete && parsed.correctAnswer) {
      await pool.query(
        'UPDATE homework_questions SET correct_answer = $1 WHERE id = $2',
        [parsed.correctAnswer, question.id]
      );
    }

    res.json({
      success: true,
      data: {
        reply: parsed.reply,
        questionComplete: parsed.questionComplete || false,
        correctAnswer: parsed.questionComplete ? parsed.correctAnswer : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/verify — verify child's written answer
router.post('/verify', async (req, res, next) => {
  try {
    const { profileId, sessionId, questionIndex, image, mediaType } = req.body;

    if (!profileId || !sessionId || questionIndex === undefined || !image) {
      return res.status(400).json({ success: false, error: 'profileId, sessionId, questionIndex, and image required' });
    }

    // Get the question
    const questionResult = await pool.query(
      'SELECT * FROM homework_questions WHERE session_id = $1 AND question_number = $2',
      [sessionId, questionIndex]
    );
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    const question = questionResult.rows[0];

    if (!question.correct_answer) {
      return res.status(400).json({ success: false, error: 'Question not yet solved through chat' });
    }

    const verification = await verifyWrittenAnswer(
      image,
      mediaType || 'image/jpeg',
      question.question_text,
      question.correct_answer
    );

    const result = verification.isCorrect ? 'correct' : 'incorrect';
    const xpAmount = verification.isCorrect ? 20 : 10;

    // Update question
    await pool.query(
      `UPDATE homework_questions
       SET child_answer = $1, verification_result = $2, xp_earned = $3
       WHERE id = $4`,
      [verification.childAnswer, result, xpAmount, question.id]
    );

    // Award XP
    await awardXP(profileId, verification.isCorrect ? 'correct_first_try' : 'wrong_but_tried', null, null);

    // Update session counters
    await pool.query(
      `UPDATE homework_sessions
       SET questions_completed = questions_completed + 1,
           questions_correct = questions_correct + CASE WHEN $1 = 'correct' THEN 1 ELSE 0 END,
           total_xp_earned = total_xp_earned + $2
       WHERE id = $3`,
      [result, xpAmount, sessionId]
    );

    res.json({
      success: true,
      data: {
        match: verification.isCorrect,
        childAnswer: verification.childAnswer,
        hasWorking: verification.hasWorking,
        feedback: verification.feedback,
        xpEarned: xpAmount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/complete — finalize session
router.post('/complete', async (req, res, next) => {
  try {
    const { profileId, sessionId } = req.body;

    if (!profileId || !sessionId) {
      return res.status(400).json({ success: false, error: 'profileId and sessionId required' });
    }

    // Mark session complete
    await pool.query(
      'UPDATE homework_sessions SET completed_at = NOW() WHERE id = $1',
      [sessionId]
    );

    // Get session data for tracking
    const session = await pool.query('SELECT * FROM homework_sessions WHERE id = $1', [sessionId]);
    if (session.rows.length > 0) {
      const s = session.rows[0];
      if (s.subject && s.topic) {
        await trackHomeworkTopic(profileId, s.subject, s.topic, s.questions_detected);
      }
    }

    // Evaluate badges
    const newBadges = await evaluateBadges(profileId);

    // Get summary
    const summary = await pool.query(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE verification_result = 'correct')::int as correct,
         SUM(xp_earned)::int as xp,
         SUM(time_spent_seconds)::int as time_seconds
       FROM homework_questions WHERE session_id = $1`,
      [sessionId]
    );

    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/homework/predictions/:profileId — test predictions
router.get('/predictions/:profileId', async (req, res, next) => {
  try {
    const predictions = await getTestPredictions(req.params.profileId);
    res.json({ success: true, data: predictions });
  } catch (err) {
    next(err);
  }
});

// GET /api/homework/sessions/:profileId — homework history
router.get('/sessions/:profileId', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM homework_sessions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.params.profileId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
