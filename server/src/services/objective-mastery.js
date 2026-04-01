const pool = require('../db/connection');
const { getTopics } = require('./curriculum');

/**
 * Record an attempt on a specific objective
 */
async function recordObjectiveAttempt(profileId, subject, topic, objective, correct) {
  await pool.query(
    `INSERT INTO objective_mastery (profile_id, subject, topic, objective, attempts, correct_count, last_practiced)
     VALUES ($1, $2, $3, $4, 1, $5, NOW())
     ON CONFLICT (profile_id, subject, objective)
     DO UPDATE SET
       attempts = objective_mastery.attempts + 1,
       correct_count = objective_mastery.correct_count + $5,
       last_practiced = NOW(),
       mastered = CASE WHEN (objective_mastery.correct_count + $5)::float / (objective_mastery.attempts + 1) >= 0.8 AND objective_mastery.attempts + 1 >= 3 THEN TRUE ELSE FALSE END`,
    [profileId, subject, topic, objective, correct ? 1 : 0]
  );
}

/**
 * Get weak objectives for a subject (not mastered, attempted at least once)
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
 * Get untouched objectives (never attempted)
 */
async function getUntouchedObjectives(profileId, subject, yearGroup) {
  const topics = getTopics(subject, yearGroup);
  if (!topics) return [];

  // Get all attempted objectives
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
 * Get mastery summary for AI context
 */
async function getObjectiveSummary(profileId, subject) {
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
  };
}

module.exports = { recordObjectiveAttempt, getWeakObjectives, getUntouchedObjectives, getObjectiveSummary };
