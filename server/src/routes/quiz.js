const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { generateQuizQuestion } = require('../services/ai-provider');
const { awardXP, awardQuizXP } = require('../services/xp');
const { getTopics } = require('../services/curriculum');
const { evaluateBadges } = require('../services/badges');
const { generateSessionReport } = require('../services/session-reports');
const { getSubjectLevel, maybeAdvance } = require('../services/levels');
const { recordObjectiveAttempt } = require('../services/objective-mastery');
const sr = require('../services/spaced-repetition');
const { logEvent } = require('../services/skill-memory');
const { recordObservation } = require('../services/learning-needs');
const { recordIntervention } = require('../services/intervention');

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

    // Content level is the per-subject working level (falls back to year_group).
    // year_group still drives age-appropriate tone elsewhere.
    const contentLevel = await getSubjectLevel(profileId, subject);

    // Validate topic exists in curriculum at the working level
    const topics = getTopics(subject, contentLevel);
    if (!topics) {
      return res.status(400).json({
        success: false,
        error: `Invalid subject "${subject}" for level ${contentLevel}`,
      });
    }

    // Get recently asked questions for this child (last 50) to avoid repeats
    const recentResult = await pool.query(
      `SELECT question_text FROM quiz_history
       WHERE profile_id = $1 AND subject = $2
       ORDER BY created_at DESC LIMIT 50`,
      [profileId, subject]
    );
    const recentQuestions = recentResult.rows.map(r => r.question_text);

    // Try question bank first (instant), excluding recent questions
    let question;
    const bankResult = await pool.query(
      `SELECT * FROM question_bank
       WHERE subject = $1 AND year_group = $2 AND difficulty = $3
         AND (topic = $4 OR $4 IS NULL)
         AND question_text NOT IN (SELECT unnest($5::text[]))
       ORDER BY times_served ASC, RANDOM()
       LIMIT 1`,
      [subject, contentLevel, questionDifficulty, topic, recentQuestions.length > 0 ? recentQuestions : ['']]
    );

    if (bankResult.rows.length > 0) {
      const q = bankResult.rows[0];
      const labels = ['A', 'B', 'C', 'D'];
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      question = {
        question: q.question_text,
        options: opts.map((opt, i) => `${labels[i]}) ${opt}`),
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      };
      await pool.query('UPDATE question_bank SET times_served = times_served + 1 WHERE id = $1', [q.id]);
    } else {
      // Fall back to live AI — include recent questions so AI avoids them
      const avoidHint = recentQuestions.length > 0
        ? `\nDo NOT generate any of these questions (already asked): ${recentQuestions.slice(0, 5).join(' | ')}`
        : '';
      question = await generateQuizQuestion(
        subject,
        topic + avoidHint,
        contentLevel,
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
        correctAnswer: question.correctAnswer,
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

    // ── BKT mastery update (Bayesian Knowledge Tracing) ──
    // Dual-writes to bkt_skills + legacy objective_mastery; graceful if table not migrated.
    const bktResult = await recordObjectiveAttempt(
      profileId, masterySubject, masteryTopic,
      isCorrect ? 'quiz correct' : 'quiz wrong',
      isCorrect
    );

    // ── FSRS review card update (spaced repetition) ──
    // Upsert a review card and schedule its next review based on the answer quality.
    try {
      const rating = sr.answerToRating(isCorrect, confidence);
      const cardResult = await pool.query(
        `SELECT * FROM review_cards WHERE profile_id = $1 AND subject = $2 AND topic = $3`,
        [profileId, masterySubject, masteryTopic]
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
           updated.due, updated.lastScore, profileId, masterySubject, masteryTopic]
        );
      } else {
        const card = sr.createCard({ profileId, subject: masterySubject, topic: masteryTopic });
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
      }
    } catch (err) {
      if (err.code !== '42P01') console.warn('[Quiz] FSRS card update failed:', err.message);
      // review_cards table may not exist yet — non-blocking
    }

    // ── Skill memory event (DeepTutor L1 trace) ──
    logEvent({
      profileId, surface: 'quiz', eventType: isCorrect ? 'breakthrough' : 'struggle',
      subject: masterySubject, topic: masteryTopic,
      details: { questionId, answer, correct: isCorrect, difficulty: question.difficulty },
    }).catch(() => {}); // fire-and-forget

    // Gap 2: Wire behavioral observations (fire-and-forget, non-blocking)
    // Each observation is independent — overlapping signals are all recorded
    const answerTime = req.body.answerTimeMs || 0;
    
    if (answerTime > 0 && answerTime < 3000 && !isCorrect) {
      recordObservation(profileId, 'fast_guess', { 
        topic: masteryTopic, timeMs: answerTime, questionId 
      }, 'quiz').catch(() => {});
    }
    
    if (confidence === 'knew_it' && !isCorrect) {
      recordObservation(profileId, 'blind_spot', { 
        topic: masteryTopic, questionId 
      }, 'quiz').catch(() => {});
    }
    
    if ((confidence === 'guessed' || confidence === 'unsure') && isCorrect) {
      recordObservation(profileId, 'lucky_guess', { 
        topic: masteryTopic, questionId 
      }, 'quiz').catch(() => {});
    }
    
    // Repeated mistakes: non-blocking check (fire-and-forget)
    if (!isCorrect && masteryTopic) {
      pool.query(
        `SELECT COUNT(*) as cnt FROM quiz_history
         WHERE profile_id = $1 AND subject = $2 AND topic = $3 AND was_correct = false
         AND created_at > NOW() - INTERVAL '1 hour'`,
        [profileId, masterySubject, masteryTopic]
      ).then(result => {
        const count = parseInt(result.rows[0]?.cnt || 0);
        if (count >= 3) {
          recordObservation(profileId, 'repeated_mistake', { 
            topic: masteryTopic, count 
          }, 'quiz').catch(() => {});
          // Intervention: difficulty drop after 3 wrong
          if (count === 3) {
            recordIntervention({
              profileId,
              interventionType: 'difficulty_drop',
              context: masteryTopic,
              details: { subject: masterySubject, consecutive_wrong: count, trigger: 'quiz_answer' },
              triggeredBy: 'quiz_repeated_mistake',
            }).catch(() => {});
          }
          // Intervention: break suggested after 5 wrong
          if (count >= 5) {
            recordIntervention({
              profileId,
              interventionType: 'break_suggested',
              context: masteryTopic,
              details: { subject: masterySubject, consecutive_wrong: count, trigger: 'quiz_answer' },
              triggeredBy: 'quiz_repeated_mistake',
            }).catch(() => {});
          }
        }
      }).catch(() => {});
    }

    // Evaluate badges
    const newBadges = await evaluateBadges(profileId);

    // Level-based progression: if this answer completed mastery of the current
    // level for the subject, promote to the next level (never demotes, caps at 6).
    let levelUp = null;
    if (isCorrect && masterySubject) {
      try {
        const adv = await maybeAdvance(profileId, masterySubject);
        if (adv.advanced) {
          levelUp = { subject: masterySubject, level: adv.level, previousLevel: adv.previousLevel };
        }
      } catch { /* advancement is best-effort, never block the answer */ }
    }

    res.json({
      success: true,
      data: {
        correct: isCorrect,
        correctAnswer: question.correct_answer,
        xpEarned: xpResult.xpAwarded,
        totalXP: xpResult.totalXP,
        level: xpResult.level,
        newBadges,
        levelUp,
        bkt: bktResult.bkt ? { enabled: true } : { enabled: false, error: bktResult.bktError },
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
