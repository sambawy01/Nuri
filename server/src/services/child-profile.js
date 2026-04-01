/**
 * Child Intelligence Profile
 *
 * Gathers everything we know about a child and builds a context string
 * that gets injected into EVERY AI prompt across the platform.
 *
 * This makes Nuri truly aware of:
 * - What the child is good at and what they struggle with
 * - How they learn best
 * - Recent session performance
 * - Common mistakes and error patterns
 * - Confidence calibration (do they know what they know?)
 * - Homework patterns
 */

const pool = require('../db/connection');
const { getObjectiveSummary } = require('./objective-mastery');
const { checkPrerequisites } = require('./prerequisites');

// Cache profiles for 5 minutes to avoid hammering the DB on every message
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getChildProfile(profileId) {
  const cached = cache.get(profileId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.profile;
  }

  const profile = await buildProfile(profileId);
  cache.set(profileId, { profile, timestamp: Date.now() });
  return profile;
}

async function buildProfile(profileId) {
  const [
    recentReports,
    topStruggles,
    topStrengths,
    learningStyle,
    confidencePattern,
    mistakePatterns,
    subjectActivity,
    practicedSubjects,
  ] = await Promise.all([
    // Last 5 session reports
    pool.query(
      `SELECT session_type, subject, topic, strengths, struggles, recommendations
       FROM session_reports WHERE profile_id = $1
       ORDER BY created_at DESC LIMIT 5`,
      [profileId]
    ).then(r => r.rows).catch(() => []),

    // Topics with lowest accuracy (struggles)
    pool.query(
      `SELECT subject, topic, attempts, correct_count,
              ROUND(correct_count::numeric / GREATEST(attempts, 1) * 100) as accuracy
       FROM topic_mastery WHERE profile_id = $1 AND attempts >= 3
       ORDER BY accuracy ASC LIMIT 5`,
      [profileId]
    ).then(r => r.rows).catch(() => []),

    // Topics with highest accuracy (strengths)
    pool.query(
      `SELECT subject, topic, stars, attempts,
              ROUND(correct_count::numeric / GREATEST(attempts, 1) * 100) as accuracy
       FROM topic_mastery WHERE profile_id = $1 AND attempts >= 3
       ORDER BY accuracy DESC LIMIT 5`,
      [profileId]
    ).then(r => r.rows).catch(() => []),

    // Learning style
    pool.query(
      'SELECT * FROM learning_style_profiles WHERE profile_id = $1',
      [profileId]
    ).then(r => r.rows[0] || null).catch(() => null),

    // Confidence patterns (blind spots)
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE confidence_level IN ('knew_it','pretty_sure') AND was_correct = FALSE) as blind_spots,
         COUNT(*) FILTER (WHERE confidence_level IN ('guessed','unsure') AND was_correct = TRUE) as lucky_guesses,
         COUNT(*) as total
       FROM confidence_responses WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '14 days'`,
      [profileId]
    ).then(r => r.rows[0]).catch(() => null),

    // Recent mistake patterns
    pool.query(
      `SELECT subject, error_type, COUNT(*) as count
       FROM mistakes WHERE profile_id = $1 AND resolved = FALSE
       GROUP BY subject, error_type
       ORDER BY count DESC LIMIT 5`,
      [profileId]
    ).then(r => r.rows).catch(() => []),

    // Subject activity (days since last practice)
    pool.query(
      `SELECT subject, MAX(created_at) as last_active, COUNT(*) as sessions
       FROM chat_sessions WHERE profile_id = $1
       GROUP BY subject`,
      [profileId]
    ).then(r => r.rows).catch(() => []),

    // Objective mastery summary (add for each recent subject)
    pool.query(
      `SELECT DISTINCT subject FROM objective_mastery WHERE profile_id = $1 ORDER BY subject`,
      [profileId]
    ).then(r => r.rows.map(row => row.subject)).catch(() => []),
  ]);

  // Build the context string
  let context = '';

  // Struggles
  if (topStruggles.length > 0) {
    const struggleList = topStruggles
      .filter(s => parseInt(s.accuracy) < 60)
      .map(s => `${s.subject}/${s.topic} (${s.accuracy}% accuracy)`)
      .join(', ');
    if (struggleList) {
      context += `\nSTRUGGLES: This child finds these topics hard: ${struggleList}. Be extra patient and use simpler explanations for these.`;
    }
  }

  // Strengths
  if (topStrengths.length > 0) {
    const strengthList = topStrengths
      .filter(s => parseInt(s.accuracy) >= 80)
      .map(s => `${s.subject}/${s.topic} (${s.accuracy}%)`)
      .slice(0, 3)
      .join(', ');
    if (strengthList) {
      context += `\nSTRENGTHS: This child is good at: ${strengthList}. You can move faster on these topics and offer harder challenges.`;
    }
  }

  // Learning style
  if (learningStyle && learningStyle.total_interactions >= 10) {
    const styles = [
      { name: 'pictures and visual descriptions', score: learningStyle.visual },
      { name: 'real-life comparisons (pizza, games, animals)', score: learningStyle.analogy },
      { name: 'seeing examples before rules', score: learningStyle.example_first },
      { name: 'hearing explanations read aloud', score: learningStyle.auditory },
      { name: 'trying the question before being taught', score: learningStyle.try_first },
    ].filter(s => s.score > 0.4).sort((a, b) => b.score - a.score).slice(0, 2);

    if (styles.length > 0) {
      context += `\nLEARNING STYLE: This child learns best with ${styles.map(s => s.name).join(' and ')}. Prioritize these approaches.`;
    }
  }

  // Confidence calibration
  if (confidencePattern && parseInt(confidencePattern.total) >= 10) {
    const blindSpots = parseInt(confidencePattern.blind_spots) || 0;
    const luckyGuesses = parseInt(confidencePattern.lucky_guesses) || 0;
    if (blindSpots > 3) {
      context += `\nCONFIDENCE: This child often thinks they know the answer but gets it wrong (${blindSpots} blind spots recently). Double-check their understanding even when they seem confident.`;
    }
    if (luckyGuesses > 3) {
      context += `\nCONFIDENCE: This child sometimes guesses correctly without understanding (${luckyGuesses} lucky guesses). Ask them to explain their reasoning even when correct.`;
    }
  }

  // Mistake patterns
  if (mistakePatterns.length > 0) {
    const patterns = mistakePatterns
      .map(m => `${m.subject}: ${m.error_type} errors (${m.count}x)`)
      .join(', ');
    context += `\nCOMMON MISTAKES: ${patterns}. Watch for these patterns and address them proactively.`;
  }

  // Recent reports
  if (recentReports.length > 0) {
    const lastReport = recentReports[0];
    if (lastReport.struggles && lastReport.struggles !== 'None') {
      context += `\nLAST SESSION: Struggled with: ${lastReport.struggles}`;
    }
    if (lastReport.recommendations) {
      context += ` Recommendation: ${lastReport.recommendations}`;
    }
  }

  // Neglected subjects
  if (subjectActivity.length > 0) {
    const neglected = subjectActivity
      .filter(s => {
        const daysSince = (Date.now() - new Date(s.last_active).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
      })
      .map(s => s.subject);
    if (neglected.length > 0) {
      context += `\nNEGLECTED SUBJECTS: ${neglected.join(', ')} haven't been practiced in over a week. Gently suggest these when appropriate.`;
    }
  }

  // Objective-level mastery
  if (practicedSubjects && practicedSubjects.length > 0) {
    for (const subj of practicedSubjects.slice(0, 3)) {
      const objSummary = await getObjectiveSummary(profileId, subj);
      if (objSummary.weakObjectives.length > 0) {
        context += `\nWEAK OBJECTIVES in ${subj}: ${objSummary.weakObjectives.slice(0, 3).join('; ')}. Focus on these.`;
      }
    }
  }

  return context || '';
}

module.exports = { getChildProfile };
