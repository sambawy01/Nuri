const pool = require('../db/connection');

const XP_VALUES = {
  correct_first_try: 15,
  correct_with_hint: 10,
  wrong_but_tried: 5,
  learn_session: 20,
  streak_bonus: 25,
  daily_login: 5,
  confidence_used: 2,
};

const DIFFICULTY_XP = {
  easy:      { correct_first_try: 5,  correct_with_hint: 3,  wrong_but_tried: 2 },
  medium:    { correct_first_try: 10, correct_with_hint: 7,  wrong_but_tried: 5 },
  hard:      { correct_first_try: 15, correct_with_hint: 10, wrong_but_tried: 5 },
  challenge: { correct_first_try: 20, correct_with_hint: 14, wrong_but_tried: 7 },
};

const DIFFICULTY_STREAK_BONUS = {
  easy: 10,
  medium: 25,
  hard: 40,
  challenge: 60,
};

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 800 },
  { level: 6, xp: 1200 },
  { level: 7, xp: 1700 },
  { level: 8, xp: 2300 },
  { level: 9, xp: 3000 },
  { level: 10, xp: 4000 },
  { level: 15, xp: 8000 },
  { level: 20, xp: 15000 },
  { level: 25, xp: 25000 },
  { level: 30, xp: 40000 },
];

function getLevel(totalXP) {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.xp) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

async function awardXP(profileId, eventType, subject, topic) {
  const xpAmount = XP_VALUES[eventType];
  if (!xpAmount) {
    throw new Error(`Unknown XP event type: ${eventType}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Record the XP event
    await client.query(
      'INSERT INTO xp_events (profile_id, xp_amount, event_type, subject, topic) VALUES ($1, $2, $3, $4, $5)',
      [profileId, xpAmount, eventType, subject, topic]
    );

    // Update profile total XP (XP never decreases)
    const result = await client.query(
      'UPDATE profiles SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2 RETURNING total_xp',
      [xpAmount, profileId]
    );

    const newTotalXP = result.rows[0].total_xp;
    const newLevel = getLevel(newTotalXP);

    // Update level if it changed
    await client.query(
      'UPDATE profiles SET current_level = $1 WHERE id = $2 AND current_level < $1',
      [newLevel, profileId]
    );

    await client.query('COMMIT');

    return { xpAwarded: xpAmount, totalXP: newTotalXP, level: newLevel };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function awardQuizXP(profileId, eventType, difficulty, subject, topic) {
  const diffXP = DIFFICULTY_XP[difficulty] || DIFFICULTY_XP.medium;
  const xpAmount = diffXP[eventType] || 5;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'INSERT INTO xp_events (profile_id, xp_amount, event_type, subject, topic) VALUES ($1, $2, $3, $4, $5)',
      [profileId, xpAmount, `${eventType}_${difficulty}`, subject, topic]
    );

    const result = await client.query(
      'UPDATE profiles SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2 RETURNING total_xp',
      [xpAmount, profileId]
    );

    const newTotalXP = result.rows[0].total_xp;
    const newLevel = getLevel(newTotalXP);

    await client.query(
      'UPDATE profiles SET current_level = $1 WHERE id = $2 AND current_level < $1',
      [newLevel, profileId]
    );

    await client.query('COMMIT');
    return { xpAwarded: xpAmount, totalXP: newTotalXP, level: newLevel };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Streak integrity: if presence is enabled for this profile and today's most
// recent ended presence session scored below the threshold, silently skip the
// streak write. XP is unaffected — the child's experience is identical.
async function shouldCountTodayForStreak(client, profileId) {
  const profile = await client.query(
    'SELECT presence_tier FROM profiles WHERE id = $1',
    [profileId]
  );
  if (profile.rows.length === 0) return true;
  const tier = profile.rows[0].presence_tier;
  if (!tier || tier === 'off') return true;

  // Look for an ended presence session today.
  const today = new Date().toISOString().split('T')[0];
  const session = await client.query(
    `SELECT counted_toward_streak
       FROM presence_sessions
      WHERE profile_id = $1
        AND ended_at IS NOT NULL
        AND started_at::date = $2::date
      ORDER BY ended_at DESC
      LIMIT 1`,
    [profileId, today]
  );
  if (session.rows.length === 0) return true; // no presence data → don't penalize
  return session.rows[0].counted_toward_streak === true;
}

async function updateStreak(profileId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = new Date().toISOString().split('T')[0];

    if (!(await shouldCountTodayForStreak(client, profileId))) {
      await client.query('COMMIT');
      const cur = await pool.query(
        'SELECT streak_days FROM profiles WHERE id = $1',
        [profileId]
      );
      return {
        streakDays: cur.rows[0]?.streak_days ?? 0,
        isNewDay: false,
        voidedByPresence: true,
      };
    }

    // Try to insert today's streak record
    const insertResult = await client.query(
      `INSERT INTO streak_history (profile_id, streak_date, activity_type)
       VALUES ($1, $2, 'session')
       ON CONFLICT (profile_id, streak_date) DO NOTHING
       RETURNING id`,
      [profileId, today]
    );

    // If this is a new entry for today, update the streak
    if (insertResult.rows.length > 0) {
      // Get the profile's last active date
      const profileResult = await client.query(
        'SELECT last_active_date, streak_days FROM profiles WHERE id = $1',
        [profileId]
      );

      const profile = profileResult.rows[0];
      const lastActive = profile.last_active_date;
      let newStreak = 1;

      if (lastActive) {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day: increment streak
          newStreak = profile.streak_days + 1;
        } else if (diffDays === 0) {
          // Same day: keep streak
          newStreak = profile.streak_days;
        }
        // diffDays > 1: streak resets to 1
      }

      await client.query(
        'UPDATE profiles SET streak_days = $1, last_active_date = $2, updated_at = NOW() WHERE id = $3',
        [newStreak, today, profileId]
      );

      // Award streak bonus if streak is a multiple of 5
      if (newStreak > 0 && newStreak % 5 === 0) {
        await awardXP(profileId, 'streak_bonus', null, null);
      }

      await client.query('COMMIT');
      return { streakDays: newStreak, isNewDay: true };
    }

    await client.query('COMMIT');

    const currentProfile = await pool.query(
      'SELECT streak_days FROM profiles WHERE id = $1',
      [profileId]
    );

    return { streakDays: currentProfile.rows[0].streak_days, isNewDay: false };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  XP_VALUES,
  DIFFICULTY_XP,
  DIFFICULTY_STREAK_BONUS,
  LEVEL_THRESHOLDS,
  getLevel,
  awardXP,
  awardQuizXP,
  updateStreak,
};
