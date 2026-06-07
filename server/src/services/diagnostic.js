const pool = require('../db/connection');
const { generateQuizQuestion } = require('./ai-provider');
const { getTopics } = require('./curriculum');
const { setSubjectLevel, MAX_LEVEL, MIN_LEVEL } = require('./levels');

const MAX_QUESTIONS = 6;

/**
 * Adaptive placement (staircase):
 *   - start at the student's school year
 *   - correct  → record the level as passed, step up
 *   - wrong    → record the level as failed, step down
 *   - stop when bracketed (passed L, failed L+1), at a boundary, or after
 *     MAX_QUESTIONS
 *   - final level = highest level they answered correctly (floor MIN_LEVEL)
 */

function pickTopic(subject, level, religionType) {
  const topics = getTopics(subject, level, religionType);
  if (!topics || topics.length === 0) return null;
  return topics[Math.floor(Math.random() * topics.length)];
}

async function generateForLevel(subject, level, religionType) {
  const topic = pickTopic(subject, level, religionType);
  if (!topic) return null;
  const q = await generateQuizQuestion(subject, topic.name, level, 'medium');
  return { ...q, topic: topic.name, level };
}

async function startDiagnostic(profileId, subject) {
  const prof = await pool.query('SELECT year_group, religion FROM profiles WHERE id = $1', [profileId]);
  if (prof.rows.length === 0) throw new Error('profile not found');
  const religionType = prof.rows[0].religion === 'islamic' ? 'islamic' : undefined;
  const startLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, prof.rows[0].year_group ?? 1));

  const question = await generateForLevel(subject, startLevel, religionType);
  if (!question) throw new Error(`no curriculum for ${subject} level ${startLevel}`);

  const session = await pool.query(
    `INSERT INTO diagnostic_sessions (profile_id, subject, current_level, current_question, questions_asked)
     VALUES ($1, $2, $3, $4, 1)
     RETURNING id`,
    [profileId, subject, startLevel, JSON.stringify(question)]
  );

  return {
    sessionId: session.rows[0].id,
    questionNumber: 1,
    maxQuestions: MAX_QUESTIONS,
    level: startLevel,
    question: publicQuestion(question),
  };
}

function publicQuestion(q) {
  // Never leak the correct answer to the client.
  return { question: q.question, options: q.options, topic: q.topic, level: q.level };
}

async function answerDiagnostic(sessionId, answer) {
  const res = await pool.query('SELECT * FROM diagnostic_sessions WHERE id = $1', [sessionId]);
  if (res.rows.length === 0) throw new Error('session not found');
  const s = res.rows[0];
  if (s.status !== 'active') throw new Error('session already complete');

  const current = s.current_question;
  const correct = String(answer).toUpperCase() === String(current.correctAnswer).toUpperCase();

  const level = s.current_level;
  let highestPassed = s.highest_passed;
  let lowestFailed = s.lowest_failed;
  if (correct) highestPassed = highestPassed == null ? level : Math.max(highestPassed, level);
  else lowestFailed = lowestFailed == null ? level : Math.min(lowestFailed, level);

  const history = Array.isArray(s.history) ? s.history : [];
  history.push({ level, correct });

  const asked = s.questions_asked;

  // Decide the next step.
  const bracketed = highestPassed != null && lowestFailed != null && lowestFailed <= highestPassed + 1;
  const atCeiling = correct && level >= MAX_LEVEL;
  const atFloor = !correct && level <= MIN_LEVEL;
  const outOfQuestions = asked >= MAX_QUESTIONS;

  if (bracketed || atCeiling || atFloor || outOfQuestions) {
    const finalLevel = highestPassed != null ? highestPassed : MIN_LEVEL;
    await pool.query(
      `UPDATE diagnostic_sessions
          SET status = 'complete', completed_at = NOW(),
              highest_passed = $2, lowest_failed = $3,
              history = $4, final_level = $5, current_question = NULL
        WHERE id = $1`,
      [sessionId, highestPassed, lowestFailed, JSON.stringify(history), finalLevel]
    );
    await setSubjectLevel(s.profile_id, s.subject, finalLevel, 'diagnostic');
    return {
      done: true,
      correct,
      correctAnswer: current.correctAnswer,
      explanation: current.explanation,
      finalLevel,
    };
  }

  // Otherwise step the staircase and pose the next question.
  const nextLevel = correct
    ? Math.min(MAX_LEVEL, level + 1)
    : Math.max(MIN_LEVEL, level - 1);

  const prof = await pool.query('SELECT religion FROM profiles WHERE id = $1', [s.profile_id]);
  const religionType = prof.rows[0]?.religion === 'islamic' ? 'islamic' : undefined;
  const nextQuestion = await generateForLevel(s.subject, nextLevel, religionType);

  // If we can't generate for the next level (no curriculum), finish here.
  if (!nextQuestion) {
    const finalLevel = highestPassed != null ? highestPassed : MIN_LEVEL;
    await pool.query(
      `UPDATE diagnostic_sessions
          SET status = 'complete', completed_at = NOW(),
              highest_passed = $2, lowest_failed = $3,
              history = $4, final_level = $5, current_question = NULL
        WHERE id = $1`,
      [sessionId, highestPassed, lowestFailed, JSON.stringify(history), finalLevel]
    );
    await setSubjectLevel(s.profile_id, s.subject, finalLevel, 'diagnostic');
    return { done: true, correct, correctAnswer: current.correctAnswer, explanation: current.explanation, finalLevel };
  }

  await pool.query(
    `UPDATE diagnostic_sessions
        SET current_level = $2, current_question = $3,
            questions_asked = questions_asked + 1,
            highest_passed = $4, lowest_failed = $5, history = $6
      WHERE id = $1`,
    [sessionId, nextLevel, JSON.stringify(nextQuestion), highestPassed, lowestFailed, JSON.stringify(history)]
  );

  return {
    done: false,
    correct,
    correctAnswer: current.correctAnswer,
    explanation: current.explanation,
    questionNumber: asked + 1,
    maxQuestions: MAX_QUESTIONS,
    level: nextLevel,
    question: publicQuestion(nextQuestion),
  };
}

module.exports = { startDiagnostic, answerDiagnostic, MAX_QUESTIONS };
