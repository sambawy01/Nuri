const pool = require('../db/connection');

/**
 * Intervention Log
 *
 * Records every automatic or teacher-triggered intervention:
 *   auto_pause, auto_resume, difficulty_drop, hint_escalation,
 *   streak_save, break_suggested, parent_alert
 */

async function recordIntervention({
  profileId,
  sessionId,
  interventionType,
  context,
  details,
  triggeredBy,
}) {
  const result = await pool.query(
    `INSERT INTO interventions
       (profile_id, session_id, intervention_type, context, details, triggered_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [
      profileId,
      sessionId || null,
      interventionType,
      context || null,
      details ? JSON.stringify(details) : null,
      triggeredBy || null,
    ]
  );
  return result.rows[0];
}

async function getInterventions(profileId, options = {}) {
  const { type, limit = 50, days = 30 } = options;
  let sql = `SELECT * FROM interventions WHERE profile_id = $1
               AND created_at >= NOW() - INTERVAL '${days} days'`;
  const params = [profileId];
  if (type) {
    sql += ` AND intervention_type = $2`;
    params.push(type);
  }
  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  const result = await pool.query(sql, params);
  return result.rows;
}

async function getUnresolvedInterventions(profileId) {
  const result = await pool.query(
    `SELECT * FROM interventions
     WHERE profile_id = $1 AND resolved = FALSE
     ORDER BY created_at DESC`,
    [profileId]
  );
  return result.rows;
}

async function resolveIntervention(id) {
  await pool.query(
    `UPDATE interventions SET resolved = TRUE WHERE id = $1`,
    [id]
  );
}

async function getInterventionSummary(profileId, days = 7) {
  const result = await pool.query(
    `SELECT intervention_type, COUNT(*) as count
     FROM interventions
     WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY intervention_type
     ORDER BY count DESC`,
    [profileId]
  );
  return result.rows;
}

module.exports = {
  recordIntervention,
  getInterventions,
  getUnresolvedInterventions,
  resolveIntervention,
  getInterventionSummary,
};
