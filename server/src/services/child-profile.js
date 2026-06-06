/**
 * Child Intelligence Profile — DeepTutor L3 Synthesis
 *
 * Gathers everything we know about a child and builds a context string
 * that gets injected into EVERY AI prompt across the platform.
 *
 * Layers:
 *   L0 — Flat session CRUD (via session-memory)
 *   L1 — Skill traces (via skill-memory, queried by session-memory)
 *   L2 — Working facts (via session-memory getWorkingFacts)
 *   L3 — Cross-subject synthesis (NEW: getSynthesis, getCrossSubjectInsights)
 *
 * Backward compatible: existing getChildProfile still works,
 * just appends L3 synthesis at the end.
 */
'use strict';

const pool = require('../db/connection');
const { getObjectiveSummary } = require('./objective-mastery');
const { checkPrerequisites } = require('./prerequisites');
const { getMemoryContext } = require('./session-memory');
const { getLearningNeeds, buildAdaptationPrompt } = require('./learning-needs');

// Cache profiles for 5 minutes to avoid hammering the DB on every message
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// L3 synthesis cache (shorter TTL — more volatile)
const synthesisCache = new Map();
const SYNTHESIS_CACHE_TTL = 2 * 60 * 1000;

// ─── L3: CROSS-SUBJECT SYNTHESIS ────────────────────────────────────────────

/**
 * Get cross-subject insights by finding correlation patterns in BKT mastery.
 *
 * Looks for:
 * - Subjects where the child is strong (high mastery) — transfer potential
 * - Subjects where the child is weak (low mastery) — support needed
 * - Cross-subject patterns (e.g., "struggles with word problems in maths AND science")
 *
 * @param {number} profileId
 * @returns {Object} — { strongSubjects, weakSubjects, crossPatterns }
 */
async function getCrossSubjectInsights(profileId) {
  let bktRows = [];
  let topicRows = [];

  try {
    // Query BKT skill mastery across all subjects
    const bktResult = await pool.query(
      `SELECT subject, topic, p_mastered, n_attempts, n_correct
       FROM bkt_skills WHERE profile_id = $1 AND n_attempts >= 2
       ORDER BY p_mastered ASC`,
      [profileId]
    );
    bktRows = bktResult.rows;
  } catch (err) {
    if (err.code === '42P01') {
      console.warn('[Profile] bkt_skills table not available — skipping L3 cross-subject insights');
    } else {
      console.error('[Profile] getCrossSubjectInsights bkt query failed:', err.message);
    }
  }

  try {
    // Also query topic_mastery as a fallback data source
    const topicResult = await pool.query(
      `SELECT subject, topic, attempts, correct_count, stars,
              ROUND(correct_count::numeric / GREATEST(attempts, 1) * 100) as accuracy
       FROM topic_mastery WHERE profile_id = $1 AND attempts >= 2
       ORDER BY accuracy ASC`,
      [profileId]
    );
    topicRows = topicResult.rows;
  } catch (err) {
    console.warn('[Profile] topic_mastery query failed in L3:', err.message);
  }

  // Aggregate per-subject
  const subjectStats = {};

  // From BKT data
  for (const row of bktRows) {
    const subj = (row.subject || 'unknown').toLowerCase();
    if (!subjectStats[subj]) {
      subjectStats[subj] = { topics: 0, totalMastery: 0, weakTopics: [], strongTopics: [] };
    }
    subjectStats[subj].topics++;
    subjectStats[subj].totalMastery += (row.p_mastered || 0);

    if ((row.p_mastered || 0) < 0.5) {
      subjectStats[subj].weakTopics.push(row.topic);
    } else if ((row.p_mastered || 0) >= 0.85) {
      subjectStats[subj].strongTopics.push(row.topic);
    }
  }

  // From topic_mastery data (supplement)
  for (const row of topicRows) {
    const subj = (row.subject || 'unknown').toLowerCase();
    const accuracy = parseInt(row.accuracy) || 0;
    if (!subjectStats[subj]) {
      subjectStats[subj] = { topics: 0, totalMastery: 0, weakTopics: [], strongTopics: [] };
    }
    // Only add if not already covered by BKT
    const bktCovers = bktRows.some(r => r.subject?.toLowerCase() === subj && r.topic === row.topic);
    if (!bktCovers) {
      subjectStats[subj].topics++;
      // Convert accuracy to approximate mastery (0-1 scale)
      const approxMastery = accuracy / 100;
      subjectStats[subj].totalMastery += approxMastery;
      if (accuracy < 50) {
        subjectStats[subj].weakTopics.push(row.topic);
      } else if (accuracy >= 85) {
        subjectStats[subj].strongTopics.push(row.topic);
      }
    }
  }

  // Classify subjects
  const strongSubjects = [];
  const weakSubjects = [];

  for (const [subj, stats] of Object.entries(subjectStats)) {
    const avgMastery = stats.topics > 0 ? stats.totalMastery / stats.topics : 0;
    const label = stats.topics > 0 ? Math.round(avgMastery * 100) : 0;

    if (avgMastery >= 0.7) {
      strongSubjects.push({ subject: subj, avgMastery: label, strongTopics: stats.strongTopics.slice(0, 3) });
    } else if (avgMastery < 0.5) {
      weakSubjects.push({ subject: subj, avgMastery: label, weakTopics: stats.weakTopics.slice(0, 3) });
    }
  }

  // Detect cross-subject patterns
  const crossPatterns = [];

  // Pattern: struggles with "word problems" or similar across subjects
  const allWeakTopics = [];
  for (const [subj, stats] of Object.entries(subjectStats)) {
    for (const t of stats.weakTopics.slice(0, 5)) {
      allWeakTopics.push({ subject: subj, topic: (t || '').toLowerCase() });
    }
  }

  // Group weak topics by keyword overlap
  const weakKeywords = {};
  for (const wt of allWeakTopics) {
    const words = (wt.topic || '').split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      if (!weakKeywords[word]) weakKeywords[word] = [];
      if (!weakKeywords[word].includes(wt.subject)) {
        weakKeywords[word].push(wt.subject);
      }
    }
  }

  // Keywords that appear in 2+ subjects indicate cross-subject struggle
  for (const [keyword, subjects] of Object.entries(weakKeywords)) {
    if (subjects.length >= 2) {
      crossPatterns.push({
        type: 'cross_struggle',
        keyword,
        subjects,
        description: `Struggles with "${keyword}" across ${subjects.join(' and ')} — may need a transfer-of-learning approach`,
      });
    }
  }

  // Also check: if strong in one subject and weak in another, suggest transfer
  for (const strong of strongSubjects) {
    for (const weak of weakSubjects) {
      if (strong.subject !== weak.subject) {
        crossPatterns.push({
          type: 'transfer_opportunity',
          from: strong.subject,
          to: weak.subject,
          description: `Strong in ${strong.subject} (${strong.avgMastery}% mastery) — can use analogies from ${strong.subject} to help with ${weak.subject}`,
        });
        break; // one transfer suggestion per weak subject is enough
      }
    }
  }

  return { strongSubjects, weakSubjects, crossPatterns };
}

/**
 * Build L3 synthesis context — cross-surface, cross-subject understanding.
 *
 * Queries skill_memory for patterns ACROSS subjects and produces
 * a short SYNTHESIS block appended to the profile context.
 *
 * @param {number} profileId
 * @returns {string} — synthesis context string for AI prompt
 */
async function getSynthesis(profileId) {
  // Check cache first
  const cached = synthesisCache.get(profileId);
  if (cached && Date.now() - cached.timestamp < SYNTHESIS_CACHE_TTL) {
    return cached.synthesis;
  }

  let synthesis = '';

  try {
    // 1. Cross-subject insights from BKT mastery
    const insights = await getCrossSubjectInsights(profileId);

    if (insights.crossPatterns.length > 0 || insights.strongSubjects.length > 0 || insights.weakSubjects.length > 0) {
      synthesis += '\nSYNTHESIS — cross-subject understanding:';

      // Strong subjects — use as anchors for transfer
      if (insights.strongSubjects.length > 0) {
        const anchorDesc = insights.strongSubjects
          .map(s => `${s.subject} (${s.avgMastery}% mastery)`)
          .join(', ');
        synthesis += `\n- STRENGTH ANCHORS: ${anchorDesc}. Use analogies and examples from these subjects when teaching new material.`;
      }

      // Weak subjects — need extra support
      if (insights.weakSubjects.length > 0) {
        const weakDesc = insights.weakSubjects
          .map(s => `${s.subject} (${s.avgMastery}% mastery, struggling with: ${s.weakTopics.join(', ')})`)
          .join(', ');
        synthesis += `\n- SUPPORT NEEDED: ${weakDesc}. Go slower, use more concrete examples, check understanding more often.`;
      }

      // Cross-subject patterns
      for (const pattern of insights.crossPatterns.slice(0, 3)) {
        if (pattern.type === 'cross_struggle') {
          synthesis += `\n- PATTERN: ${pattern.description}`;
        } else if (pattern.type === 'transfer_opportunity') {
          synthesis += `\n- TRANSFER: ${pattern.description}`;
        }
      }
    }

    // 2. Cross-subject patterns from skill_memory events
    try {
      const skillResult = await pool.query(
        `SELECT subject, event_type, COUNT(*) as count, 
                ARRAY_AGG(DISTINCT topic) FILTER (WHERE topic IS NOT NULL) as topics
         FROM skill_memory 
         WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '14 days'
         GROUP BY subject, event_type
         HAVING COUNT(*) >= 2
         ORDER BY count DESC`,
        [profileId]
      );
      const skillEvents = skillResult.rows;

      if (skillEvents.length > 0) {
        // Find subjects with high struggle rates
        const highStruggleSubjects = skillEvents
          .filter(e => e.event_type === 'struggle' && parseInt(e.count) >= 3)
          .map(e => `${e.subject} (${e.count}x struggling)`);

        if (highStruggleSubjects.length > 0) {
          synthesis += `\n- RECENT DIFFICULTY: ${highStruggleSubjects.join(', ')}. Be extra patient and use simpler explanations.`;
        }

        // Find subjects with recent breakthroughs
        const recentBreakthroughs = skillEvents
          .filter(e => e.event_type === 'breakthrough' && parseInt(e.count) >= 1)
          .map(e => `${e.subject}`);

        if (recentBreakthroughs.length > 0) {
          synthesis += `\n- RECENT PROGRESS: Breakthrough in ${recentBreakthroughs.join(', ')}. Build on this momentum!`;
        }
      }
    } catch (err) {
      if (err.code !== '42P01') {
        console.warn('[Profile] L3 skill_memory aggregation failed:', err.message);
      }
    }

  } catch (err) {
    console.error('[Profile] getSynthesis failed:', err.message);
  }

  // Cache the result
  synthesisCache.set(profileId, { synthesis, timestamp: Date.now() });

  return synthesis;
}

// ─── EXISTING BUILD PROFILE (enhanced with L3) ──────────────────────────────

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
    parentNotes,
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

    // Parent notes
    pool.query(
      'SELECT note, priority FROM parent_notes WHERE profile_id = $1 AND active = TRUE ORDER BY priority DESC LIMIT 5',
      [profileId]
    ).then(r => r.rows).catch(() => []),
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

  // Parent/teacher notes — override everything else
  if (parentNotes && parentNotes.length > 0) {
    context += '\n\nPARENT/TEACHER INSTRUCTIONS — these OVERRIDE everything else:';
    for (const note of parentNotes) {
      const priority = note.priority === 'urgent' ? '🚨 URGENT' : note.priority === 'high' ? '⚠️ HIGH' : '';
      context += `\n- ${priority} ${note.note}`;
    }
    context += '\nFollow these instructions from the parent/teacher. They know this child best.';
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

  // Session memory (what happened last time) — L0 + L2
  try {
    const memoryContext = await getMemoryContext(profileId, null);
    if (memoryContext) context += memoryContext;
  } catch (err) {
    console.warn('[Profile] Memory context unavailable:', err.message);
  }

  // Learning needs adaptations (dyslexia, ADHD, autism, dyscalculia)
  try {
    const learningNeeds = await getLearningNeeds(profileId);
    if (learningNeeds) {
      const adaptations = buildAdaptationPrompt(learningNeeds);
      if (adaptations) context += adaptations;
    }
  } catch {}

  // ─── L3: CROSS-SUBJECT SYNTHESIS (NEW) ──────────────────────────────────
  try {
    const synthesis = await getSynthesis(profileId);
    if (synthesis) context += synthesis;
  } catch (err) {
    console.warn('[Profile] L3 synthesis unavailable:', err.message);
  }

  return context || '';
}

module.exports = { getChildProfile, getSynthesis, getCrossSubjectInsights };