/**
 * Session Memory — DeepTutor L2 Working Memory
 *
 * Curated, deduplicated facts about each child per subject.
 * Uses the skill_memory table (L1 trace) to distill structured
 * working facts that persist across sessions.
 *
 * Layers:
 *   L0 — Flat session CRUD (saveSessionMemory, getRecentMemories)
 *   L2 — Working facts (getWorkingFacts, extractFacts)
 *        Aggregates L1 traces into deduplicated key-value insights
 */
'use strict';

const pool = require('../db/connection');

// ─── L0: SESSION MEMORY (original, unchanged) ──────────────────────────────

/**
 * Save a memory of what happened in this session
 */
async function saveSessionMemory({ profileId, subject, topic, lastObjective, leftOffAt, struggledWith, breakthroughs, emotionalNote }) {
  await pool.query(
    `INSERT INTO session_memory (profile_id, subject, topic, last_objective, left_off_at, struggled_with, breakthroughs, emotional_note, session_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)`,
    [profileId, subject, topic || null, lastObjective || null, leftOffAt || null, struggledWith || null, breakthroughs || null, emotionalNote || null]
  );
}

/**
 * Get recent memories for a subject (last 3 sessions)
 */
async function getRecentMemories(profileId, subject) {
  const result = await pool.query(
    `SELECT * FROM session_memory
     WHERE profile_id = $1 AND ($2 IS NULL OR subject = $2)
     ORDER BY created_at DESC LIMIT 3`,
    [profileId, subject || null]
  );
  return result.rows;
}

// ─── L2: WORKING FACTS ──────────────────────────────────────────────────────

/**
 * Extract structured key-value facts from recent skill_memory events.
 *
 * Groups events by type and distills them into deduplicated facts
 * suitable for AI prompt injection.
 *
 * @param {Array} events — rows from skill_memory table
 * @returns {Object} — { struggles: [...], breakthroughs: [...], hints: [...], patterns: [...], engagement: {...} }
 */
function extractFacts(events) {
  if (!events || events.length === 0) {
    return { struggles: [], breakthroughs: [], hints: [], patterns: [], engagement: {} };
  }

  const struggles = [];
  const breakthroughs = [];
  const hints = [];
  const topicStruggleCount = {};

  for (const ev of events) {
    const topicKey = `${ev.subject || 'unknown'}:${ev.topic || 'general'}`;

    switch (ev.event_type) {
      case 'struggle': {
        const detail = ev.details || {};
        const desc = detail.description || detail.question || detail.concept || ev.topic || 'unspecified topic';
        // Deduplicate: track per topic
        if (!topicStruggleCount[topicKey]) {
          topicStruggleCount[topicKey] = { subject: ev.subject, topic: ev.topic, count: 0, descriptions: [] };
        }
        topicStruggleCount[topicKey].count++;
        // Keep only unique descriptions (max 3 per topic)
        if (topicStruggleCount[topicKey].descriptions.length < 3 && !topicStruggleCount[topicKey].descriptions.includes(desc)) {
          topicStruggleCount[topicKey].descriptions.push(desc);
        }
        break;
      }
      case 'breakthrough': {
        const detail = ev.details || {};
        const desc = detail.description || detail.concept || ev.topic || 'unspecified';
        breakthroughs.push({ subject: ev.subject, topic: ev.topic, description: desc, surface: ev.surface });
        break;
      }
      case 'hint_shown': {
        const detail = ev.details || {};
        if (detail.hintType || detail.hint) {
          hints.push({ subject: ev.subject, topic: ev.topic, hintType: detail.hintType, hint: detail.hint });
        }
        break;
      }
      default:
        break;
    }
  }

  // Convert struggle counts into deduplicated fact objects
  for (const [key, val] of Object.entries(topicStruggleCount)) {
    struggles.push({
      subject: val.subject,
      topic: val.topic,
      count: val.count,
      descriptions: val.descriptions,
    });
  }

  // Sort struggles by frequency (most struggled first)
  struggles.sort((a, b) => b.count - a.count);

  // Deduplicate breakthroughs by topic (keep latest per topic)
  const seenTopics = new Set();
  const uniqueBreakthroughs = [];
  for (const b of breakthroughs) {
    const key = `${b.subject}:${b.topic}`;
    if (!seenTopics.has(key)) {
      seenTopics.add(key);
      uniqueBreakthroughs.push(b);
    }
  }

  // Remove duplicate hints by hintType per topic
  const seenHints = new Set();
  const uniqueHints = hints.filter(h => {
    const key = `${h.subject}:${h.topic}:${h.hintType}`;
    if (seenHints.has(key)) return false;
    seenHints.add(key);
    return true;
  });

  // Engagement patterns: surface usage counts
  const surfaceCounts = {};
  const answerCounts = { correct: 0, wrong: 0, total: 0 };
  for (const ev of events) {
    const s = ev.surface || 'unknown';
    surfaceCounts[s] = (surfaceCounts[s] || 0) + 1;
    if (ev.event_type === 'answer_given') {
      answerCounts.total++;
      const detail = ev.details || {};
      if (detail.correct) answerCounts.correct++;
      else answerCounts.wrong++;
    }
  }

  const engagement = {
    surfaces: surfaceCounts,
    accuracy: answerCounts.total > 0 ? Math.round((answerCounts.correct / answerCounts.total) * 100) : null,
    totalEvents: events.length,
  };

  return {
    struggles: struggles.slice(0, 5), // top 5 struggle areas
    breakthroughs: uniqueBreakthroughs.slice(0, 3), // top 3 recent breakthroughs
    hints: uniqueHints.slice(0, 5), // top 5 unique hints used
    patterns: [], // reserved for future pattern detection
    engagement,
  };
}

/**
 * Get curated, deduplicated working facts for a child in a subject.
 *
 * Queries skill_memory events from the last 7 days, groups them,
 * and returns structured facts ready for AI prompt injection.
 *
 * @param {number} profileId
 * @param {string} subject — optional subject filter
 * @returns {Object} — extracted facts (same shape as extractFacts output)
 */
async function getWorkingFacts(profileId, subject) {
  try {
    const conditions = ['profile_id = $1', "created_at >= NOW() - INTERVAL '7 days'"];
    const params = [profileId];
    let idx = 2;

    if (subject) {
      conditions.push(`subject = $${idx++}`);
      params.push(subject);
    }

    const result = await pool.query(
      `SELECT * FROM skill_memory WHERE ${conditions.join(' AND ')}
       ORDER BY created_at ASC`,
      params
    );

    const events = result.rows;
    return extractFacts(events);
  } catch (err) {
    if (err.code === '42P01') {
      // Table not migrated yet
      console.warn('[Memory] skill_memory table not available — skipping L2 facts');
      return { struggles: [], breakthroughs: [], hints: [], patterns: [], engagement: {} };
    }
    console.error('[Memory] getWorkingFacts failed:', err.message);
    return { struggles: [], breakthroughs: [], hints: [], patterns: [], engagement: {} };
  }
}

/**
 * Build a human-readable context block from working facts.
 *
 * @param {Object} facts — output of extractFacts or getWorkingFacts
 * @returns {string} — context string for AI prompt injection
 */
function formatWorkingFacts(facts) {
  if (!facts) return '';

  let context = '';

  // Struggles
  if (facts.struggles && facts.struggles.length > 0) {
    context += '\nWORKING MEMORY — recent struggles (7 days):';
    for (const s of facts.struggles) {
      const subj = s.subject ? `${s.subject}/` : '';
      context += `\n- ${subj}${s.topic || 'general'}: struggled ${s.count}x`;
      if (s.descriptions && s.descriptions.length > 0) {
        context += ` (${s.descriptions.join('; ')})`;
      }
    }
  }

  // Breakthroughs
  if (facts.breakthroughs && facts.breakthroughs.length > 0) {
    context += '\nRECENT BREAKTHROUGHS:';
    for (const b of facts.breakthroughs) {
      const subj = b.subject ? `${b.subject}/` : '';
      context += `\n- ${subj}${b.topic || 'general'}: ${b.description}`;
      if (b.surface) context += ` (via ${b.surface})`;
    }
  }

  // Hints needed
  if (facts.hints && facts.hints.length > 0) {
    context += '\nHINTS THAT HELPED:';
    for (const h of facts.hints) {
      const subj = h.subject ? `${h.subject}/` : '';
      context += `\n- ${subj}${h.topic || 'general'}: ${h.hintType || 'hint'}`;
      if (h.hint) context += ` — "${h.hint}"`;
    }
  }

  // Engagement snapshot
  if (facts.engagement && facts.engagement.totalEvents > 0) {
    context += '\nENGAGEMENT (7 days):';
    const eng = facts.engagement;
    const surfaceList = Object.entries(eng.surfaces || {})
      .map(([s, c]) => `${s}(${c}x)`)
      .join(', ');
    context += `\n- ${eng.totalEvents} events across ${surfaceList || 'unknown'}`;
    if (eng.accuracy !== null) {
      context += `, ${eng.accuracy}% accuracy`;
    }
  }

  return context;
}

// ─── COMBINED CONTEXT BUILDER ────────────────────────────────────────────────

/**
 * Build memory context string for AI prompt injection.
 *
 * Now includes both L0 session memory AND L2 working facts.
 * Backward compatible: if skill_memory table is unavailable,
 * falls back to L0 only.
 */
async function getMemoryContext(profileId, subject) {
  // L0: Session memory (what happened last time)
  const memories = await getRecentMemories(profileId, subject);
  let context = '';

  if (memories.length > 0) {
    context += '\nSESSION MEMORY — what happened in recent sessions:';
    for (const m of memories) {
      const daysDiff = Math.floor((Date.now() - new Date(m.session_date).getTime()) / (1000 * 60 * 60 * 24));
      const when = daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Yesterday' : `${daysDiff} days ago`;

      context += `\n- ${when} (${m.subject}):`;
      if (m.left_off_at) context += ` Left off at "${m.left_off_at}".`;
      if (m.struggled_with) context += ` Struggled with: ${m.struggled_with}.`;
      if (m.breakthroughs) context += ` Breakthrough: ${m.breakthroughs}.`;
      if (m.emotional_note) context += ` Mood: ${m.emotional_note}.`;
    }

    const lastMemory = memories[0];
    if (lastMemory.left_off_at) {
      context += `\n→ SUGGESTION: Start by saying "Last time we were working on ${lastMemory.left_off_at}. Want to pick up where we left off?"`;
    }
  }

  // L2: Working facts from skill_memory traces
  try {
    const workingFacts = await getWorkingFacts(profileId, subject);
    const factsBlock = formatWorkingFacts(workingFacts);
    if (factsBlock) context += factsBlock;
  } catch (err) {
    console.warn('[Memory] L2 working facts unavailable:', err.message);
  }

  return context;
}

module.exports = {
  saveSessionMemory,
  getRecentMemories,
  getMemoryContext,
  getWorkingFacts,
  extractFacts,
  formatWorkingFacts,
};