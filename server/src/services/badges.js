// server/src/services/badges.js
const pool = require('../db/connection');

const BADGE_DEFINITIONS = [
  // Milestones
  { id: 'first-quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '\u{1F31F}', category: 'milestones', rarity: 'common', condition_type: 'quiz_count', condition_value: 1 },
  { id: 'quiz-10', name: 'Quiz Explorer', description: 'Complete 10 quizzes', icon: '\u{1F680}', category: 'milestones', rarity: 'common', condition_type: 'quiz_count', condition_value: 10 },
  { id: 'quiz-50', name: 'Quiz Champion', description: 'Complete 50 quizzes', icon: '\u{1F3C6}', category: 'milestones', rarity: 'uncommon', condition_type: 'quiz_count', condition_value: 50 },
  { id: 'quiz-100', name: 'Quiz Legend', description: 'Complete 100 quizzes', icon: '\u{1F451}', category: 'milestones', rarity: 'rare', condition_type: 'quiz_count', condition_value: 100 },
  { id: 'level-5', name: 'Rising Star', description: 'Reach Level 5', icon: '\u2B50', category: 'milestones', rarity: 'common', condition_type: 'level', condition_value: 5 },
  { id: 'level-10', name: 'Superstar', description: 'Reach Level 10', icon: '\u{1F31F}', category: 'milestones', rarity: 'uncommon', condition_type: 'level', condition_value: 10 },
  { id: 'level-20', name: 'Legend', description: 'Reach Level 20', icon: '\u{1F451}', category: 'milestones', rarity: 'rare', condition_type: 'level', condition_value: 20 },
  { id: 'level-30', name: 'Cosmic Master', description: 'Reach Level 30', icon: '\u2728', category: 'milestones', rarity: 'legendary', condition_type: 'level', condition_value: 30 },

  // Quizzes
  { id: 'perfect-quiz', name: 'Perfect Score', description: '10/10 on a quiz', icon: '\u{1F4AF}', category: 'quizzes', rarity: 'uncommon', condition_type: 'perfect_quiz', condition_value: 1 },
  { id: 'perfect-3', name: 'Triple Perfection', description: '3 perfect quizzes', icon: '\u{1F525}', category: 'quizzes', rarity: 'rare', condition_type: 'perfect_quiz', condition_value: 3 },
  { id: 'fearless', name: 'Fearless', description: 'Complete 10 quizzes on Hard', icon: '\u{1F981}', category: 'quizzes', rarity: 'uncommon', condition_type: 'difficulty_count', condition_value: 10, condition_extra: 'hard' },
  { id: 'challenger', name: 'Challenge Accepted', description: '10 quizzes on Challenge Me', icon: '\u{1F480}', category: 'quizzes', rarity: 'rare', condition_type: 'difficulty_count', condition_value: 10, condition_extra: 'challenge' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Answer 5 in under 30s each', icon: '\u26A1', category: 'quizzes', rarity: 'uncommon', condition_type: 'speed_streak', condition_value: 5 },
  { id: 'streak-5q', name: 'Hot Streak', description: '5 correct in a row', icon: '\u{1F525}', category: 'quizzes', rarity: 'common', condition_type: 'correct_streak', condition_value: 5 },
  { id: 'streak-10q', name: 'Unstoppable', description: '10 correct in a row', icon: '\u2604\uFE0F', category: 'quizzes', rarity: 'rare', condition_type: 'correct_streak', condition_value: 10 },

  // Streaks
  { id: 'streak-3', name: 'Getting Going', description: '3-day streak', icon: '\u{1F525}', category: 'streaks', rarity: 'common', condition_type: 'streak_days', condition_value: 3 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day streak', icon: '\u{1F525}', category: 'streaks', rarity: 'uncommon', condition_type: 'streak_days', condition_value: 7 },
  { id: 'streak-14', name: 'Two Week Titan', description: '14-day streak', icon: '\u{1F525}', category: 'streaks', rarity: 'rare', condition_type: 'streak_days', condition_value: 14 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day streak', icon: '\u{1F48E}', category: 'streaks', rarity: 'epic', condition_type: 'streak_days', condition_value: 30 },
  { id: 'streak-100', name: 'Century Club', description: '100-day streak', icon: '\u{1F48E}', category: 'streaks', rarity: 'legendary', condition_type: 'streak_days', condition_value: 100 },

  // Learning
  { id: 'learn-5', name: 'Curious Mind', description: '5 Learn sessions', icon: '\u{1F9E0}', category: 'learning', rarity: 'common', condition_type: 'learn_sessions', condition_value: 5 },
  { id: 'learn-20', name: 'Knowledge Seeker', description: '20 Learn sessions', icon: '\u{1F4DA}', category: 'learning', rarity: 'uncommon', condition_type: 'learn_sessions', condition_value: 20 },
  { id: 'explain-1', name: 'First Lesson', description: 'Complete 1 Explain It Back', icon: '\u{1F393}', category: 'learning', rarity: 'common', condition_type: 'explain_sessions', condition_value: 1 },
  { id: 'explain-10', name: 'Master Teacher', description: '10 Explain It Back sessions', icon: '\u{1F393}', category: 'learning', rarity: 'rare', condition_type: 'explain_sessions', condition_value: 10 },
  { id: 'confidence-10', name: 'Self Aware', description: 'Use Confidence Meter 10 times', icon: '\u{1FA9E}', category: 'learning', rarity: 'common', condition_type: 'confidence_count', condition_value: 10 },
  { id: 'comeback-10', name: 'Comeback Kid', description: 'Resolve 10 mistakes', icon: '\u{1F4AA}', category: 'learning', rarity: 'uncommon', condition_type: 'mistakes_resolved', condition_value: 10 },

  // Mastery
  { id: 'maths-star', name: 'Maths Star', description: '5 stars in a maths topic', icon: '\u{1F522}', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'maths' },
  { id: 'science-star', name: 'Science Star', description: '5 stars in a science topic', icon: '\u{1F52C}', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'science' },
  { id: 'english-star', name: 'English Star', description: '5 stars in an English topic', icon: '\u{1F4D6}', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'english' },
  { id: 'arabic-star', name: 'Arabic Star', description: '5 stars in an Arabic topic', icon: '\u270D\uFE0F', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'arabic' },
  { id: 'history-star', name: 'History Star', description: '5 stars in a history topic', icon: '\u{1F4DC}', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'history' },
  { id: 'religion-star', name: 'Religion Star', description: '5 stars in a religion topic', icon: '\u{1F54A}\uFE0F', category: 'mastery', rarity: 'uncommon', condition_type: 'subject_mastery', condition_value: 1, condition_extra: 'religion' },

  // Subjects
  { id: 'all-subjects', name: 'Explorer', description: 'Practiced all 6 subjects', icon: '\u{1F5FA}\uFE0F', category: 'subjects', rarity: 'uncommon', condition_type: 'subjects_practiced', condition_value: 6 },
  { id: 'all-stars', name: 'Universal Scholar', description: '5-star topic in every subject', icon: '\u{1F30D}', category: 'subjects', rarity: 'legendary', condition_type: 'all_subjects_mastery', condition_value: 6 },
  { id: 'diverse-learner', name: 'Diverse Learner', description: 'Learn sessions in 4+ subjects', icon: '\u{1F308}', category: 'subjects', rarity: 'uncommon', condition_type: 'subjects_learned', condition_value: 4 },

  // Fun
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 8 PM', icon: '\u{1F319}', category: 'fun', rarity: 'common', condition_type: 'time_of_day', condition_value: 20 },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 8 AM', icon: '\u{1F305}', category: 'fun', rarity: 'common', condition_type: 'time_of_day', condition_value: 8 },
  { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Study on a weekend', icon: '\u{1F4C5}', category: 'fun', rarity: 'common', condition_type: 'weekend', condition_value: 1 },

  // Challenge
  { id: 'daily-1', name: 'Mystery Solver', description: 'Complete 1 daily challenge', icon: '\u2709\uFE0F', category: 'challenge', rarity: 'common', condition_type: 'daily_challenge_count', condition_value: 1 },
  { id: 'daily-7', name: 'Challenge Streak', description: 'Complete 7 daily challenges', icon: '\u{1F31F}', category: 'challenge', rarity: 'uncommon', condition_type: 'daily_challenge_count', condition_value: 7 },
];

async function seedBadges() {
  for (const badge of BADGE_DEFINITIONS) {
    await pool.query(
      `INSERT INTO badges (id, name, description, icon, category, rarity, condition_type, condition_value, condition_extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon,
         category = EXCLUDED.category, rarity = EXCLUDED.rarity,
         condition_type = EXCLUDED.condition_type, condition_value = EXCLUDED.condition_value,
         condition_extra = EXCLUDED.condition_extra`,
      [badge.id, badge.name, badge.description, badge.icon, badge.category, badge.rarity, badge.condition_type, badge.condition_value, badge.condition_extra || null]
    );
  }
}

async function evaluateBadges(profileId) {
  // Get all badge definitions not yet earned
  const unearnedResult = await pool.query(
    `SELECT b.* FROM badges b
     WHERE b.id NOT IN (SELECT badge_id FROM earned_badges WHERE profile_id = $1)`,
    [profileId]
  );

  if (unearnedResult.rows.length === 0) return [];

  // Gather stats for evaluation
  const stats = await gatherStats(profileId);
  const newBadges = [];

  for (const badge of unearnedResult.rows) {
    if (checkCondition(badge, stats)) {
      await pool.query(
        'INSERT INTO earned_badges (profile_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [profileId, badge.id]
      );
      newBadges.push(badge);
    }
  }

  return newBadges;
}

async function gatherStats(profileId) {
  const [profile, quizCount, perfectCount, learnCount, explainCount,
    confidenceCount, resolvedCount, subjectsPracticed, subjectsLearned,
    difficultyHard, difficultyChallenge, dailyCount, masteryBySubject] = await Promise.all([
    pool.query('SELECT current_level, streak_days FROM profiles WHERE id = $1', [profileId]).then(r => r.rows[0]),
    pool.query('SELECT COUNT(*) as c FROM quiz_history WHERE profile_id = $1 AND was_correct IS NOT NULL', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query(`SELECT COUNT(*) as c FROM (
      SELECT profile_id, DATE(created_at) as d, subject
      FROM quiz_history WHERE profile_id = $1 AND was_correct = TRUE
      GROUP BY profile_id, DATE(created_at), subject
      HAVING COUNT(*) >= 10 AND COUNT(*) = SUM(CASE WHEN was_correct THEN 1 ELSE 0 END)
    ) sub`, [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query("SELECT COUNT(*) as c FROM chat_sessions WHERE profile_id = $1 AND mode = 'learn'", [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(*) as c FROM explain_back_sessions WHERE profile_id = $1 AND understanding_score IS NOT NULL', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(*) as c FROM confidence_responses WHERE profile_id = $1', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(*) as c FROM mistakes WHERE profile_id = $1 AND resolved = TRUE', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(DISTINCT subject) as c FROM quiz_history WHERE profile_id = $1', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query("SELECT COUNT(DISTINCT subject) as c FROM chat_sessions WHERE profile_id = $1 AND mode = 'learn'", [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query("SELECT COUNT(*) as c FROM quiz_history WHERE profile_id = $1 AND difficulty = 'hard' AND was_correct IS NOT NULL", [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query("SELECT COUNT(*) as c FROM quiz_history WHERE profile_id = $1 AND difficulty = 'challenge' AND was_correct IS NOT NULL", [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT COUNT(*) as c FROM daily_challenge_attempts WHERE profile_id = $1', [profileId]).then(r => parseInt(r.rows[0].c)),
    pool.query('SELECT subject, COUNT(*) as c FROM topic_mastery WHERE profile_id = $1 AND stars = 5 GROUP BY subject', [profileId]).then(r => {
      const map = {};
      r.rows.forEach(row => { map[row.subject] = parseInt(row.c); });
      return map;
    }),
  ]);

  return {
    level: profile?.current_level || 1,
    streakDays: profile?.streak_days || 0,
    quizCount,
    perfectCount,
    learnCount,
    explainCount,
    confidenceCount,
    resolvedCount,
    subjectsPracticed,
    subjectsLearned,
    difficultyHard,
    difficultyChallenge,
    dailyCount,
    masteryBySubject,
  };
}

function checkCondition(badge, stats) {
  const { condition_type, condition_value, condition_extra } = badge;

  switch (condition_type) {
    case 'quiz_count': return stats.quizCount >= condition_value;
    case 'level': return stats.level >= condition_value;
    case 'streak_days': return stats.streakDays >= condition_value;
    case 'perfect_quiz': return stats.perfectCount >= condition_value;
    case 'learn_sessions': return stats.learnCount >= condition_value;
    case 'explain_sessions': return stats.explainCount >= condition_value;
    case 'confidence_count': return stats.confidenceCount >= condition_value;
    case 'mistakes_resolved': return stats.resolvedCount >= condition_value;
    case 'subjects_practiced': return stats.subjectsPracticed >= condition_value;
    case 'subjects_learned': return stats.subjectsLearned >= condition_value;
    case 'daily_challenge_count': return stats.dailyCount >= condition_value;
    case 'difficulty_count':
      if (condition_extra === 'hard') return stats.difficultyHard >= condition_value;
      if (condition_extra === 'challenge') return stats.difficultyChallenge >= condition_value;
      return false;
    case 'subject_mastery':
      return (stats.masteryBySubject[condition_extra] || 0) >= condition_value;
    case 'all_subjects_mastery':
      return Object.keys(stats.masteryBySubject).length >= condition_value;
    // time_of_day, weekend, correct_streak, speed_streak — checked client-side and passed as hints
    case 'time_of_day': return false; // awarded via separate hint endpoint
    case 'weekend': return false; // awarded via separate hint endpoint
    case 'correct_streak': return false; // tracked client-side
    case 'speed_streak': return false; // tracked client-side
    default: return false;
  }
}

async function getEarnedBadges(profileId) {
  const result = await pool.query(
    `SELECT b.*, eb.earned_at FROM earned_badges eb
     JOIN badges b ON b.id = eb.badge_id
     WHERE eb.profile_id = $1
     ORDER BY eb.earned_at DESC`,
    [profileId]
  );
  return result.rows;
}

async function awardBadgeByHint(profileId, badgeId) {
  const result = await pool.query(
    'INSERT INTO earned_badges (profile_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [profileId, badgeId]
  );
  if (result.rows.length > 0) {
    const badge = await pool.query('SELECT * FROM badges WHERE id = $1', [badgeId]);
    return badge.rows[0];
  }
  return null;
}

module.exports = {
  BADGE_DEFINITIONS,
  seedBadges,
  evaluateBadges,
  gatherStats,
  checkCondition,
  getEarnedBadges,
  awardBadgeByHint,
};
