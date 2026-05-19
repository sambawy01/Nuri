const pool = require('../db/connection');

const STREAK_THRESHOLD = 0.40;

async function startSession({ profileId, context, contextRef, tier }) {
  const result = await pool.query(
    `INSERT INTO presence_sessions (profile_id, context, context_ref, tier)
     VALUES ($1, $2, $3, $4)
     RETURNING id, started_at`,
    [profileId, context, contextRef || null, tier]
  );
  return { sessionId: result.rows[0].id, startedAt: result.rows[0].started_at };
}

async function recordBatch({ sessionId, samplesTotal, samplesPresent, livenessEvents, pausedCount }) {
  await pool.query(
    `UPDATE presence_sessions
        SET samples_total    = samples_total    + $2,
            samples_present  = samples_present  + $3,
            liveness_events  = liveness_events  + $4,
            paused_count     = paused_count     + $5
      WHERE id = $1`,
    [
      sessionId,
      samplesTotal | 0,
      samplesPresent | 0,
      livenessEvents | 0,
      pausedCount | 0,
    ]
  );
}

async function endSession({ sessionId, autoEnded }) {
  const result = await pool.query(
    `SELECT profile_id, tier, samples_total, samples_present, liveness_events, started_at
       FROM presence_sessions
      WHERE id = $1`,
    [sessionId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  const totalSamples = row.samples_total | 0;
  const presentSamples = row.samples_present | 0;
  const livenessEvents = row.liveness_events | 0;

  // Score: camera-based when available, fallback to liveness-only.
  // For T1 (no camera) presence_score reflects liveness density:
  //   any liveness within the window counts the session as "engaged".
  let presenceScore;
  if (row.tier === 't1') {
    presenceScore = livenessEvents > 0 ? 1.0 : 0.0;
  } else if (totalSamples > 0) {
    presenceScore = presentSamples / totalSamples;
  } else {
    // No camera samples recorded — fall back to liveness.
    presenceScore = livenessEvents > 0 ? 1.0 : 0.0;
  }

  const counted = presenceScore >= STREAK_THRESHOLD;

  const durationResult = await pool.query(
    `UPDATE presence_sessions
        SET ended_at = NOW(),
            duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT,
            presence_score = $2,
            auto_ended = $3,
            counted_toward_streak = $4
      WHERE id = $1
      RETURNING duration_seconds, profile_id`,
    [sessionId, presenceScore, !!autoEnded, counted]
  );

  return {
    profileId: row.profile_id,
    presenceScore,
    countedTowardStreak: counted,
    durationSeconds: durationResult.rows[0].duration_seconds,
  };
}

async function getProfilePresenceTier(profileId) {
  const result = await pool.query(
    `SELECT presence_tier FROM profiles WHERE id = $1`,
    [profileId]
  );
  if (result.rows.length === 0) return 'off';
  return result.rows[0].presence_tier;
}

async function setProfilePresenceTier(profileId, tier) {
  const valid = ['off', 't1', 't2', 't3'];
  if (!valid.includes(tier)) {
    throw new Error(`Invalid presence tier: ${tier}`);
  }
  await pool.query(
    `UPDATE profiles
        SET presence_tier = $2::text,
            presence_consent_at = CASE WHEN $2::text = 'off' THEN NULL::timestamp ELSE NOW() END,
            updated_at = NOW()
      WHERE id = $1`,
    [profileId, tier]
  );
  return { tier };
}

// For a date range, return total engaged minutes and total elapsed minutes.
async function summarize(profileId, days = 7) {
  const result = await pool.query(
    `SELECT
        COUNT(*)::INT AS sessions,
        COALESCE(SUM(duration_seconds), 0)::INT AS total_seconds,
        COALESCE(SUM(
          CASE
            WHEN presence_score IS NULL THEN duration_seconds
            ELSE (presence_score * duration_seconds)::INT
          END
        ), 0)::INT AS engaged_seconds,
        COUNT(*) FILTER (WHERE auto_ended)::INT AS auto_ended_count,
        COUNT(*) FILTER (WHERE counted_toward_streak = false)::INT AS voided_streak_count
       FROM presence_sessions
      WHERE profile_id = $1
        AND ended_at IS NOT NULL
        AND started_at >= NOW() - ($2::INT * INTERVAL '1 day')`,
    [profileId, days]
  );
  const r = result.rows[0];
  return {
    sessions: r.sessions,
    totalMinutes: Math.round(r.total_seconds / 60),
    engagedMinutes: Math.round(r.engaged_seconds / 60),
    autoEndedCount: r.auto_ended_count,
    voidedStreakCount: r.voided_streak_count,
  };
}

// Class-level summary for teacher dashboard. Returns per-profile averages
// for the past N days. Privacy: only aggregates, never individual samples.
async function classSummary(classId, days = 7) {
  const result = await pool.query(
    `SELECT
        cr.profile_id,
        p.name,
        COUNT(ps.id)::INT AS sessions,
        COALESCE(AVG(ps.presence_score), 0)::FLOAT AS avg_presence,
        COUNT(ps.id) FILTER (WHERE ps.counted_toward_streak = false)::INT AS voided_count
       FROM class_roster cr
       JOIN profiles p ON p.id = cr.profile_id
       LEFT JOIN presence_sessions ps
         ON ps.profile_id = cr.profile_id
        AND ps.ended_at IS NOT NULL
        AND ps.started_at >= NOW() - ($2::INT * INTERVAL '1 day')
      WHERE cr.class_id = $1
      GROUP BY cr.profile_id, p.name
      ORDER BY avg_presence ASC`,
    [classId, days]
  );
  return result.rows.map((r) => ({
    profileId: r.profile_id,
    name: r.name,
    sessions: r.sessions,
    avgPresence: r.avg_presence,
    voidedCount: r.voided_count,
  }));
}

module.exports = {
  STREAK_THRESHOLD,
  startSession,
  recordBatch,
  endSession,
  getProfilePresenceTier,
  setProfilePresenceTier,
  summarize,
  classSummary,
};
