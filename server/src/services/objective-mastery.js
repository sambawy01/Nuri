const pool = require('../db/connection');
const { getTopics } = require('./curriculum');
const bkt = require('./bkt');

/**
 * Objective Mastery — backed by Bayesian Knowledge Tracing with legacy fallback.
 *
 * Dual-write pattern: both legacy objective_mastery and bkt_skills are updated.
 * BKT is the source of truth; legacy persists for analytics continuity.
 *
 * Invariant: recordObjectiveAttempt always returns a status object so callers
 * can detect when BKT tracking degraded.
 */

/**
 * Record an attempt on a specific objective.
 * Updates both the legacy objective_mastery table AND the BKT skill.
 *
 * @returns {{ legacy: boolean, bkt: boolean, bktError?: string }}
 */
async function recordObjectiveAttempt(profileId, subject, topic, objective, correct) {
  const result = { legacy: false, bkt: false };

  // ── Legacy table (analytics continuity) ──
  try {
    await pool.query(
      `INSERT INTO objective_mastery (profile_id, subject, topic, objective, attempts, correct_count, last_practiced)
       VALUES ($1, $2, $3, $4, 1, $5, NOW())
       ON CONFLICT (profile_id, subject, objective)
       DO UPDATE SET
         attempts = objective_mastery.attempts + 1,
         correct_count = objective_mastery.correct_count + $5,
         last_practiced = NOW()`,
      [profileId, subject, topic, objective, correct ? 1 : 0]
    );
    result.legacy = true;
  } catch (err) {
    console.error('[Mastery] Legacy write failed:', err.message);
  }

  // ── BKT update (atomic via SELECT FOR UPDATE in transaction) ──
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Use INSERT ... ON CONFLICT DO NOTHING then SELECT FOR UPDATE to avoid race
    await client.query(
      `INSERT INTO bkt_skills (profile_id, subject, topic, p_mastered, p_guess, p_slip, p_learn, n_attempts, n_correct)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0)
       ON CONFLICT (profile_id, subject, topic) DO NOTHING`,
      [profileId, subject, topic,
       bkt.DEFAULTS.p_mastered, bkt.DEFAULTS.p_guess,
       bkt.DEFAULTS.p_slip, bkt.DEFAULTS.p_learn]
    );

    // Lock the row for this transaction — prevents concurrent lost-updates
    let skill = await client.query(
      `SELECT * FROM bkt_skills WHERE profile_id = $1 AND subject = $2 AND topic = $3 FOR UPDATE`,
      [profileId, subject, topic]
    );

    if (skill.rows.length === 0) {
      throw new Error('BKT skill row not found after upsert');
    }

    skill = skill.rows[0];

    // Update with new observation
    const updated = bkt.updateSkill(skill, correct);
    const paramUpdated = bkt.updateParams(updated);

    await client.query(
      `UPDATE bkt_skills
       SET p_mastered = $1, p_guess = $2, p_slip = $3, p_learn = $4,
           n_attempts = $5, n_correct = $6, last_seen = $7, updated_at = NOW()
       WHERE profile_id = $8 AND subject = $9 AND topic = $10`,
      [paramUpdated.p_mastered, paramUpdated.p_guess, paramUpdated.p_slip, paramUpdated.p_learn,
       paramUpdated.n_attempts, paramUpdated.n_correct,
       paramUpdated.last_seen,
       profileId, subject, topic]
    );

    await client.query('COMMIT');
    result.bkt = true;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    // BKT table may not exist yet (v13 migration not run)
    if (err.code === '42P01') {
      // undefined_table — expected before migration
      result.bktError = 'BKT table not migrated yet';
    } else {
      result.bktError = err.message;
      console.warn('[BKT] Failed to update skill:', err.message);
    }
  } finally {
    client.release();
  }

  return result;
}

/**
 * Get weak objectives (legacy — maintained for compatibility).
 * BKT-based version would sort by lowest P(mastered).
 */
async function getWeakObjectives(profileId, subject) {
  const result = await pool.query(
    `SELECT topic, objective, attempts, correct_count,
            ROUND(correct_count::numeric / GREATEST(attempts, 1) * 100) as accuracy
     FROM objective_mastery
     WHERE profile_id = $1 AND subject = $2 AND mastered = FALSE AND attempts >= 1
     ORDER BY accuracy ASC
     LIMIT 10`,
    [profileId, subject]
  );
  return result.rows;
}

/**
 * Get untouched objectives (never attempted).
 */
async function getUntouchedObjectives(profileId, subject, yearGroup) {
  const topics = getTopics(subject, yearGroup);
  if (!topics) return [];

  const attempted = await pool.query(
    'SELECT objective FROM objective_mastery WHERE profile_id = $1 AND subject = $2',
    [profileId, subject]
  );
  const attemptedSet = new Set(attempted.rows.map(r => r.objective));

  const untouched = [];
  for (const topic of topics) {
    for (const obj of (topic.objectives || [])) {
      if (!attemptedSet.has(obj)) {
        untouched.push({ topic: topic.name, objective: obj });
      }
    }
  }
  return untouched;
}

/**
 * Get mastery summary — BKT-backed with legacy fallback.
 * Surfaces errors instead of swallowing them.
 */
async function getObjectiveSummary(profileId, subject) {
  // Try BKT first
  try {
    const bktSkills = await pool.query(
      `SELECT topic, p_mastered, n_attempts, n_correct
       FROM bkt_skills
       WHERE profile_id = $1 AND subject = $2
       ORDER BY p_mastered ASC`,
      [profileId, subject]
    );

    if (bktSkills.rows.length > 0) {
      const mastered = bktSkills.rows.filter(s => bkt.isMastered(s));
      const weakObjectives = bktSkills.rows
        .filter(s => !bkt.isMastered(s) && s.n_attempts > 0)
        .slice(0, 10)
        .map(s => `${s.topic}: ${Math.round(s.p_mastered * 100)}% mastery (${s.n_correct}/${s.n_attempts} correct)`);

      return {
        mastered: mastered.length,
        total: bktSkills.rows.length,
        weakObjectives,
        bktEnabled: true,
      };
    }
  } catch (err) {
    if (err.code !== '42P01') {
      // Not just "table missing" — log real errors
      console.warn('[Mastery] BKT summary failed:', err.message);
    }
    // Fall through to legacy
  }

  // Legacy fallback
  try {
    const weak = await getWeakObjectives(profileId, subject);
    const mastered = await pool.query(
      'SELECT COUNT(*) as c FROM objective_mastery WHERE profile_id = $1 AND subject = $2 AND mastered = TRUE',
      [profileId, subject]
    );
    const total = await pool.query(
      'SELECT COUNT(*) as c FROM objective_mastery WHERE profile_id = $1 AND subject = $2',
      [profileId, subject]
    );

    return {
      mastered: parseInt(mastered.rows[0].c),
      total: parseInt(total.rows[0].c),
      weakObjectives: weak.map(w => `${w.topic}: "${w.objective}" (${w.accuracy}% accuracy)`),
      bktEnabled: false,
    };
  } catch (err) {
    console.warn('[Mastery] Legacy summary failed:', err.message);
    return { mastered: 0, total: 0, weakObjectives: [], bktEnabled: false, error: err.message };
  }
}

/**
 * Get BKT skill summary for a profile.
 */
async function getBKTSummary(profileId, subject) {
  try {
    const skills = await pool.query(
      `SELECT * FROM bkt_skills
       WHERE profile_id = $1 AND ($2 IS NULL OR subject = $2)
       ORDER BY p_mastered ASC`,
      [profileId, subject || null]
    );

    return {
      skills: skills.rows.map(s => bkt.getSummary(s)),
      totalMastered: skills.rows.filter(s => bkt.isMastered(s)).length,
      averageMastery: skills.rows.length > 0
        ? Math.round(skills.rows.reduce((sum, s) => sum + s.p_mastered, 0) / skills.rows.length * 100)
        : 0,
    };
  } catch (err) {
    return {
      skills: [],
      totalMastered: 0,
      averageMastery: 0,
      bktUnavailable: true,
      bktError: err.code === '42P01' ? 'Not migrated' : err.message,
    };
  }
}

module.exports = {
  recordObjectiveAttempt,
  getWeakObjectives,
  getUntouchedObjectives,
  getObjectiveSummary,
  getBKTSummary,
};