/**
 * Smart Question Generator
 *
 * Single source of truth for generating questions across the entire platform.
 * Used by: Quiz, Duels, Daily Challenge, Story Mode.
 *
 * Features:
 * - No repeated questions within a session
 * - Age-appropriate (uses the improved claude.js prompt)
 * - Picks topics based on child's mastery data
 * - Equal-length options, random correct position
 * - Tries question bank first, falls back to live AI
 */

const pool = require('../db/connection');
const { generateQuizQuestion } = require('./ai-provider');
const { getTopics } = require('./curriculum');

/**
 * Generate N unique questions for a child
 *
 * @param {object} options
 * @param {number} options.profileId
 * @param {string} options.subject
 * @param {number} options.yearGroup
 * @param {string} options.difficulty - 'easy' | 'medium' | 'hard' | 'challenge'
 * @param {number} options.count - number of questions to generate
 * @param {string[]} [options.topics] - specific topics to use (optional, auto-picks if not provided)
 * @param {string[]} [options.excludeQuestions] - question texts to exclude (avoid repeats)
 * @returns {Promise<object[]>} array of question objects
 */
async function generateSmartQuestions({
  profileId, subject, yearGroup, difficulty = 'medium', count = 5, topics: specificTopics, excludeQuestions = [],
}) {
  const allTopics = getTopics(subject, yearGroup);
  if (!allTopics || allTopics.length === 0) {
    throw new Error(`No topics for ${subject} year ${yearGroup}`);
  }

  // Pick topics intelligently based on mastery
  let selectedTopics;
  if (specificTopics && specificTopics.length > 0) {
    selectedTopics = specificTopics;
  } else {
    selectedTopics = await pickSmartTopics(profileId, subject, yearGroup, allTopics, count);
  }

  // Generate questions — try bank first, then live AI
  const questions = [];
  const usedTexts = new Set(excludeQuestions.map(q => q.toLowerCase()));

  for (let i = 0; i < count; i++) {
    const topicName = selectedTopics[i % selectedTopics.length];
    let question = null;

    // Try question bank first
    try {
      const bankResult = await pool.query(
        `SELECT * FROM question_bank
         WHERE subject = $1 AND year_group = $2 AND difficulty = $3 AND topic = $4
         ORDER BY times_served ASC, RANDOM()
         LIMIT 5`,
        [subject, yearGroup, difficulty, topicName]
      );

      // Pick one that hasn't been used in this session
      for (const q of bankResult.rows) {
        if (!usedTexts.has(q.question_text.toLowerCase())) {
          const labels = ['A', 'B', 'C', 'D'];
          const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          question = {
            question: q.question_text,
            options: opts.map((opt, idx) => `${labels[idx]}) ${opt}`),
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            topic: topicName,
          };
          await pool.query('UPDATE question_bank SET times_served = times_served + 1 WHERE id = $1', [q.id]);
          break;
        }
      }
    } catch {}

    // Fall back to live AI
    if (!question) {
      try {
        const q = await generateQuizQuestion(subject, topicName, yearGroup, difficulty);
        question = { ...q, topic: topicName };
      } catch {
        // Skip this question rather than adding a fallback
        continue;
      }
    }

    if (question && !usedTexts.has(question.question.toLowerCase())) {
      usedTexts.add(question.question.toLowerCase());
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Pick topics intelligently based on mastery data
 * Prioritizes: weak topics > untouched topics > random
 */
async function pickSmartTopics(profileId, subject, yearGroup, allTopics, count) {
  // Get mastery data
  let masteryMap = {};
  try {
    const result = await pool.query(
      'SELECT topic, stars, attempts, correct_count FROM topic_mastery WHERE profile_id = $1 AND subject = $2',
      [profileId, subject]
    );
    for (const row of result.rows) {
      masteryMap[row.topic] = row;
    }
  } catch {}

  // Categorize topics
  const weak = []; // attempted but low accuracy
  const untouched = []; // never attempted
  const strong = []; // high accuracy

  for (const topic of allTopics) {
    const mastery = masteryMap[topic.name];
    if (!mastery || mastery.attempts === 0) {
      untouched.push(topic.name);
    } else if (mastery.stars < 3) {
      weak.push(topic.name);
    } else {
      strong.push(topic.name);
    }
  }

  // Build selection: prioritize weak, then untouched, then mix in strong
  const selected = [];
  const pools = [weak, untouched, strong];

  for (const topicPool of pools) {
    // Shuffle each pool
    for (let i = topicPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topicPool[i], topicPool[j]] = [topicPool[j], topicPool[i]];
    }
  }

  // Fill: 60% weak/untouched, 40% strong (for confidence)
  const weakCount = Math.ceil(count * 0.6);
  const strongCount = count - weakCount;

  const weakPool = [...weak, ...untouched];
  for (let i = 0; i < weakCount && i < weakPool.length; i++) {
    selected.push(weakPool[i]);
  }
  for (let i = 0; i < strongCount && i < strong.length; i++) {
    selected.push(strong[i]);
  }

  // Fill remaining if needed
  while (selected.length < count) {
    const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)].name;
    selected.push(randomTopic);
  }

  // Shuffle final selection so weak and strong are mixed
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

module.exports = { generateSmartQuestions, pickSmartTopics };
