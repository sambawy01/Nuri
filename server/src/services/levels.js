const pool = require('../db/connection');
const { getTopics } = require('./curriculum');

const SUBJECTS = ['maths', 'science', 'english', 'history', 'arabic', 'religion', 'socialstudies'];
const MAX_LEVEL = 6;
const MIN_LEVEL = 1;
const MASTERY_STARS = 3; // a topic counts as "mastered" at 3+ stars (of 5)

/**
 * The working level a student is at for a subject.
 * Falls back to the profile's year_group when no explicit level is set, so
 * existing students (and any subject never placed) behave exactly as before.
 */
async function getSubjectLevel(profileId, subject) {
  const row = await pool.query(
    'SELECT level FROM subject_levels WHERE profile_id = $1 AND subject = $2',
    [profileId, subject]
  );
  if (row.rows.length > 0) return row.rows[0].level;

  const prof = await pool.query('SELECT year_group FROM profiles WHERE id = $1', [profileId]);
  return prof.rows[0]?.year_group ?? 1;
}

/**
 * All subjects' levels for a profile, merging explicit placements with the
 * year_group fallback. Returns [{ subject, level, placedVia, isDefault }].
 */
async function getAllLevels(profileId) {
  const prof = await pool.query('SELECT year_group FROM profiles WHERE id = $1', [profileId]);
  const yearGroup = prof.rows[0]?.year_group ?? 1;

  const rows = await pool.query(
    'SELECT subject, level, placed_via FROM subject_levels WHERE profile_id = $1',
    [profileId]
  );
  const placed = Object.fromEntries(rows.rows.map((r) => [r.subject, r]));

  return SUBJECTS.map((subject) => {
    const p = placed[subject];
    return p
      ? { subject, level: p.level, placedVia: p.placed_via, isDefault: false }
      : { subject, level: yearGroup, placedVia: 'default', isDefault: true };
  });
}

async function setSubjectLevel(profileId, subject, level, placedVia = 'manual') {
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
  await pool.query(
    `INSERT INTO subject_levels (profile_id, subject, level, placed_via)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (profile_id, subject)
     DO UPDATE SET level = $3, placed_via = $4, updated_at = NOW()`,
    [profileId, subject, clamped, placedVia]
  );
  return { subject, level: clamped, placedVia };
}

/**
 * Has the student mastered every topic at their current level for this subject?
 * Uses topic_mastery stars (>= MASTERY_STARS) against the curriculum topics for
 * that level. Religion type doesn't change the count, so we use the default map.
 */
async function isLevelMastered(profileId, subject, level) {
  const topics = getTopics(subject, level);
  if (!topics || topics.length === 0) return false;

  const names = topics.map((t) => t.name);
  const mastered = await pool.query(
    `SELECT COUNT(*)::int AS c
       FROM topic_mastery
      WHERE profile_id = $1 AND subject = $2
        AND topic = ANY($3) AND stars >= $4`,
    [profileId, subject, names, MASTERY_STARS]
  );
  return mastered.rows[0].c >= names.length;
}

/**
 * Promote a subject one level when the current level is fully mastered.
 * Never demotes, never exceeds MAX_LEVEL. Returns { advanced, level }.
 */
async function maybeAdvance(profileId, subject) {
  const current = await getSubjectLevel(profileId, subject);
  if (current >= MAX_LEVEL) return { advanced: false, level: current, atCeiling: true };

  const mastered = await isLevelMastered(profileId, subject, current);
  if (!mastered) return { advanced: false, level: current };

  const next = current + 1;
  await setSubjectLevel(profileId, subject, next, 'advanced');
  return { advanced: true, level: next, previousLevel: current };
}

module.exports = {
  SUBJECTS,
  MAX_LEVEL,
  MIN_LEVEL,
  getSubjectLevel,
  getAllLevels,
  setSubjectLevel,
  isLevelMastered,
  maybeAdvance,
};
