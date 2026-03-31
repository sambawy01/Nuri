const pool = require('../db/connection');

const XP_VALUES = {
  correct_first_try: 15,
  correct_with_hint: 10,
  wrong_but_tried: 5,
  learn_session: 20,
  streak_bonus: 25,
  daily_login: 5,
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

async function updateStreak(profileId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = new Date().toISOString().split('T')[0];

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
  LEVEL_THRESHOLDS,
  getLevel,
  awardXP,
  updateStreak,
};
