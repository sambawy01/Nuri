const pool = require('../db/connection');

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

/**
 * Build memory context string for AI prompt injection
 */
async function getMemoryContext(profileId, subject) {
  const memories = await getRecentMemories(profileId, subject);
  if (memories.length === 0) return '';

  let context = '\nSESSION MEMORY — what happened in recent sessions:';

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

  return context;
}

module.exports = { saveSessionMemory, getRecentMemories, getMemoryContext };
