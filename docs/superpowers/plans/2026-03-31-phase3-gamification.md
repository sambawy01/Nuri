# Phase 3: Gamification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real badge earning (40 badges), daily mystery challenge, sticker book, Nuri evolution display, and XP bar polish to make kids want to come back every day.

**Architecture:** Server-side badge evaluation service checks conditions after key events (quiz, learn, streak). Daily challenge generates one question per day via Claude. Client shows sticker book, mystery challenge modal, and level-up celebrations. No new external dependencies.

**Tech Stack:** PostgreSQL, Express, React 18, Framer Motion, Tailwind CSS, Anthropic Claude API

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `server/src/db/migrate-v4.js` | Create | Migration: badges, earned_badges, daily_challenges, daily_challenge_attempts |
| `server/src/db/schema.sql` | Modify | Add new tables to canonical schema |
| `server/src/services/badges.js` | Create | Badge definitions + evaluation logic |
| `server/src/routes/badges.js` | Create | GET /api/badges/:profileId |
| `server/src/routes/challenge.js` | Create | GET /api/challenge/today, POST /api/challenge/answer |
| `server/src/routes/quiz.js` | Modify | Call badge evaluation after answer |
| `server/src/routes/stats.js` | Modify | Include earned badges in response |
| `server/src/index.js` | Modify | Mount badges + challenge routes |
| `client/src/pages/BadgesPage.jsx` | Modify | Use real earned badges, expand to 40 |
| `client/src/pages/StickerBookPage.jsx` | Create | Sticker book grid with rarity borders |
| `client/src/components/MysteryChallenge.jsx` | Create | Envelope modal for daily challenge |
| `client/src/pages/HomePage.jsx` | Modify | Mystery challenge card, evolution Nuri |
| `client/src/components/XPBar.jsx` | Modify | Use real level thresholds |
| `client/src/context/ProfileContext.jsx` | Modify | Level-up detection |
| `client/src/pages/QuizPage.jsx` | Modify | Show LevelUpModal + badge toast |
| `client/src/pages/ProfilePage.jsx` | Modify | Evolution stage, sticker book link |
| `client/src/App.jsx` | Modify | Add /stickers route |

---

### Task 1: Database Migration (v4)

**Files:**
- Create: `server/src/db/migrate-v4.js`
- Modify: `server/src/db/schema.sql`

- [ ] **Step 1: Create the v4 migration file**

```js
// server/src/db/migrate-v4.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV4() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Running v4 migration (Phase 3 gamification)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL,
        category VARCHAR(30) NOT NULL,
        rarity VARCHAR(20) NOT NULL DEFAULT 'common',
        condition_type VARCHAR(50) NOT NULL,
        condition_value INT NOT NULL DEFAULT 1,
        condition_extra VARCHAR(50)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS earned_badges (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        badge_id VARCHAR(50) REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(profile_id, badge_id)
      );
      CREATE INDEX IF NOT EXISTS idx_earned_badges_profile ON earned_badges(profile_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id SERIAL PRIMARY KEY,
        challenge_date DATE UNIQUE NOT NULL,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        question_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        challenge_date DATE NOT NULL,
        answer TEXT,
        was_correct BOOLEAN,
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(profile_id, challenge_date)
      );
      CREATE INDEX IF NOT EXISTS idx_daily_attempts_profile ON daily_challenge_attempts(profile_id);
    `);

    console.log('v4 migration completed successfully.');
  } catch (err) {
    console.error('v4 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV4();
```

- [ ] **Step 2: Update schema.sql**

Append the four table definitions and indexes to the end of `server/src/db/schema.sql`, matching the SQL above.

- [ ] **Step 3: Commit**

```bash
git add server/src/db/migrate-v4.js server/src/db/schema.sql
git commit -m "feat: add v4 migration for badges, earned_badges, daily challenges"
```

---

### Task 2: Badge Definitions + Evaluation Service

**Files:**
- Create: `server/src/services/badges.js`

- [ ] **Step 1: Create the badge service**

```js
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
  getEarnedBadges,
  awardBadgeByHint,
};
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/badges.js
git commit -m "feat: add badge definitions and evaluation service with 40 badges"
```

---

### Task 3: Badge + Challenge Routes

**Files:**
- Create: `server/src/routes/badges.js`
- Create: `server/src/routes/challenge.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: Create badges route**

```js
// server/src/routes/badges.js
const express = require('express');
const router = express.Router();
const { getEarnedBadges, BADGE_DEFINITIONS, seedBadges, awardBadgeByHint } = require('../services/badges');

// GET /api/badges/all — all badge definitions
router.get('/all', async (req, res, next) => {
  try {
    res.json({ success: true, data: BADGE_DEFINITIONS });
  } catch (err) {
    next(err);
  }
});

// GET /api/badges/:profileId — earned badges for a profile
router.get('/:profileId', async (req, res, next) => {
  try {
    const badges = await getEarnedBadges(req.params.profileId);
    res.json({ success: true, data: badges });
  } catch (err) {
    next(err);
  }
});

// POST /api/badges/seed — seed badge definitions (call once)
router.post('/seed', async (req, res, next) => {
  try {
    await seedBadges();
    res.json({ success: true, data: { seeded: BADGE_DEFINITIONS.length } });
  } catch (err) {
    next(err);
  }
});

// POST /api/badges/hint — award a badge from client-side hint (time_of_day, weekend, streaks)
router.post('/hint', async (req, res, next) => {
  try {
    const { profileId, badgeId } = req.body;
    if (!profileId || !badgeId) {
      return res.status(400).json({ success: false, error: 'profileId and badgeId required' });
    }
    const validHintBadges = ['night-owl', 'early-bird', 'weekend-warrior', 'streak-5q', 'streak-10q', 'speed-demon'];
    if (!validHintBadges.includes(badgeId)) {
      return res.status(400).json({ success: false, error: 'Invalid hint badge' });
    }
    const badge = await awardBadgeByHint(profileId, badgeId);
    res.json({ success: true, data: badge });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Create challenge route**

```js
// server/src/routes/challenge.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { generateQuizQuestion } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');
const { evaluateBadges } = require('../services/badges');
const { getTopics } = require('../services/curriculum');

const SUBJECTS = ['maths', 'science', 'english', 'history', 'religion', 'arabic'];

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Deterministic daily subject/topic selection based on date
function getDailySubjectTopic(date, yearGroup) {
  const seed = date.split('-').join('');
  const subjectIndex = parseInt(seed, 10) % SUBJECTS.length;
  const subject = SUBJECTS[subjectIndex];
  const topics = getTopics(subject, yearGroup);
  if (!topics || topics.length === 0) return { subject, topic: subject };
  const topicIndex = parseInt(seed, 10) % topics.length;
  return { subject, topic: topics[topicIndex].name };
}

// GET /api/challenge/today — get today's challenge
router.get('/today', async (req, res, next) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId query param required' });
    }

    const today = getTodayDate();

    // Check if profile already attempted
    const attemptResult = await pool.query(
      'SELECT * FROM daily_challenge_attempts WHERE profile_id = $1 AND challenge_date = $2',
      [profileId, today]
    );
    const attempted = attemptResult.rows.length > 0;

    // Check if challenge exists for today
    let challengeResult = await pool.query(
      'SELECT * FROM daily_challenges WHERE challenge_date = $1',
      [today]
    );

    if (challengeResult.rows.length === 0) {
      // Generate today's challenge
      const profile = await pool.query('SELECT year_group FROM profiles WHERE id = $1', [profileId]);
      const yearGroup = profile.rows[0]?.year_group || 3;
      const { subject, topic } = getDailySubjectTopic(today, yearGroup);

      const questionData = await generateQuizQuestion(subject, topic, yearGroup, 'medium');

      await pool.query(
        'INSERT INTO daily_challenges (challenge_date, subject, topic, question_data) VALUES ($1, $2, $3, $4) ON CONFLICT (challenge_date) DO NOTHING',
        [today, subject, topic, JSON.stringify(questionData)]
      );

      challengeResult = await pool.query(
        'SELECT * FROM daily_challenges WHERE challenge_date = $1',
        [today]
      );
    }

    const challenge = challengeResult.rows[0];

    res.json({
      success: true,
      data: {
        date: challenge.challenge_date,
        subject: challenge.subject,
        topic: challenge.topic,
        question: challenge.question_data,
        attempted,
        attempt: attempted ? attemptResult.rows[0] : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenge/answer — submit answer
router.post('/answer', async (req, res, next) => {
  try {
    const { profileId, answer } = req.body;
    if (!profileId || answer === undefined) {
      return res.status(400).json({ success: false, error: 'profileId and answer required' });
    }

    const today = getTodayDate();

    // Check already attempted
    const existing = await pool.query(
      'SELECT id FROM daily_challenge_attempts WHERE profile_id = $1 AND challenge_date = $2',
      [profileId, today]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Already attempted today' });
    }

    // Get today's challenge
    const challengeResult = await pool.query(
      'SELECT * FROM daily_challenges WHERE challenge_date = $1',
      [today]
    );
    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No challenge for today' });
    }

    const challenge = challengeResult.rows[0];
    const questionData = challenge.question_data;
    const isCorrect = answer.toString().toUpperCase() === questionData.correctAnswer.toString().toUpperCase();
    const xpAmount = isCorrect ? 50 : 15;

    // Record attempt
    await pool.query(
      'INSERT INTO daily_challenge_attempts (profile_id, challenge_date, answer, was_correct, xp_earned) VALUES ($1, $2, $3, $4, $5)',
      [profileId, today, answer, isCorrect, xpAmount]
    );

    // Award XP
    const xpResult = await awardXP(profileId, isCorrect ? 'correct_first_try' : 'wrong_but_tried', challenge.subject, challenge.topic);

    // Check for new badges
    const newBadges = await evaluateBadges(profileId);

    res.json({
      success: true,
      data: {
        correct: isCorrect,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        xpEarned: xpAmount,
        xp: xpResult,
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 3: Mount routes in index.js**

In `server/src/index.js`, add imports:

```js
const badgesRouter = require('./routes/badges');
const challengeRouter = require('./routes/challenge');
```

Add mounts after the existing `app.use` lines:

```js
app.use('/api/badges', badgesRouter);
app.use('/api/challenge', challengeRouter);
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/badges.js server/src/routes/challenge.js server/src/index.js
git commit -m "feat: add badge and daily challenge server routes"
```

---

### Task 4: Wire Badge Evaluation into Quiz + Stats

**Files:**
- Modify: `server/src/routes/quiz.js`
- Modify: `server/src/routes/stats.js`

- [ ] **Step 1: Add badge evaluation to quiz answer route**

In `server/src/routes/quiz.js`:

1. Add import at top: `const { evaluateBadges } = require('../services/badges');`

2. At the end of the POST `/answer` handler, just before `res.json(...)`, add:

```js
// Evaluate badges
const newBadges = await evaluateBadges(profileId);
```

3. Add `newBadges` to the response data object:

```js
res.json({
  success: true,
  data: {
    correct: isCorrect,
    correctAnswer: question.correct_answer,
    xpEarned: xpResult.xpAwarded,
    totalXP: xpResult.totalXP,
    level: xpResult.level,
    newBadges,
  },
});
```

- [ ] **Step 2: Add earned badges to stats endpoint**

In `server/src/routes/stats.js`:

1. Add import: `const { getEarnedBadges } = require('../services/badges');`

2. In the GET `/:profileId` handler, add a query alongside the existing ones:

```js
const earnedBadges = await getEarnedBadges(profileId);
```

3. Add to the response object:

```js
badges: earnedBadges,
```

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/quiz.js server/src/routes/stats.js
git commit -m "feat: wire badge evaluation into quiz answers and stats endpoint"
```

---

### Task 5: Client — Update BadgesPage with Real Data + 40 Badges

**Files:**
- Modify: `client/src/pages/BadgesPage.jsx`

- [ ] **Step 1: Rewrite BadgesPage to use real API data**

Read the current `client/src/pages/BadgesPage.jsx`. Replace the hardcoded `allBadges` array and mock data with API calls:

1. Remove the entire `allBadges` constant (lines 9-30).

2. Add state for all badges: `const [allBadges, setAllBadges] = useState([]);`

3. Replace `fetchBadges` with:

```js
async function fetchBadges() {
  try {
    const pid = currentProfile._id || currentProfile.id;
    const [all, earned] = await Promise.all([
      api('/badges/all'),
      api(`/badges/${pid}`),
    ]);
    setAllBadges(all);
    setEarnedBadges(earned.map(b => ({ id: b.id, earnedAt: b.earned_at })));
  } catch {
    setAllBadges([]);
    setEarnedBadges([]);
  } finally {
    setLoadingBadges(false);
  }
}
```

4. Add 'challenge' to the categories array:

```js
const categories = [
  { key: 'all', label: 'All' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'learning', label: 'Learning' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'fun', label: 'Fun' },
  { key: 'challenge', label: 'Daily' },
];
```

5. Add a rarity border color to each badge card. In the badge grid render, add a rarity-based ring:

```js
const rarityColors = {
  common: 'border-gray-200',
  uncommon: 'border-green-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};
```

Use `rarityColors[badge.rarity]` in the className for earned badges instead of the static `border-purple-100`.

- [ ] **Step 2: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/BadgesPage.jsx
git commit -m "feat: BadgesPage uses real API data with 40 badges and rarity borders"
```

---

### Task 6: Client — Sticker Book Page

**Files:**
- Create: `client/src/pages/StickerBookPage.jsx`
- Modify: `client/src/App.jsx`
- Modify: `client/src/pages/HomePage.jsx`
- Modify: `client/src/pages/ProfilePage.jsx`

- [ ] **Step 1: Create StickerBookPage**

```jsx
// client/src/pages/StickerBookPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const RARITY_STYLES = {
  common: { border: 'border-gray-300', bg: 'bg-gray-50', glow: '' },
  uncommon: { border: 'border-green-400', bg: 'bg-green-50', glow: 'shadow-green-200' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-50', glow: 'shadow-blue-200' },
  epic: { border: 'border-purple-400', bg: 'bg-purple-50', glow: 'shadow-purple-200' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-50', glow: 'shadow-yellow-200' },
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_LABELS = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

export default function StickerBookPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [allBadges, setAllBadges] = useState([]);
  const [earnedIds, setEarnedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeRarity, setActiveRarity] = useState('all');
  const [selectedSticker, setSelectedSticker] = useState(null);

  useEffect(() => {
    if (!profileLoading && !currentProfile) { navigate('/'); return; }
    if (currentProfile) fetchData();
  }, [currentProfile, profileLoading]);

  async function fetchData() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const [all, earned] = await Promise.all([
        api('/badges/all'),
        api(`/badges/${pid}`),
      ]);
      setAllBadges(all);
      setEarnedIds(new Set(earned.map(b => b.id)));
    } catch {
      setAllBadges([]);
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading || loading) return <LoadingSpinner text="Loading sticker book..." />;
  if (!currentProfile) return null;

  const filtered = activeRarity === 'all'
    ? allBadges
    : allBadges.filter(b => b.rarity === activeRarity);

  const earnedCount = allBadges.filter(b => earnedIds.has(b.id)).length;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <motion.button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700" whileHover={{ x: -4 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-2xl font-extrabold text-gray-800">Sticker Book</h1>
      </motion.div>

      {/* Progress */}
      <motion.div className="bg-white rounded-2xl shadow-lg p-4 mb-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-3xl font-extrabold gradient-text">{earnedCount}/{allBadges.length}</p>
        <p className="text-sm text-gray-500 font-semibold">stickers collected</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <motion.div className="h-full rounded-full gradient-bg" initial={{ width: 0 }} animate={{ width: `${(earnedCount / Math.max(allBadges.length, 1)) * 100}%` }} transition={{ duration: 0.8 }} />
        </div>
      </motion.div>

      {/* Rarity filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
        {['all', ...RARITY_ORDER].map(r => (
          <motion.button key={r} onClick={() => setActiveRarity(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap capitalize transition-colors ${activeRarity === r ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
            whileTap={{ scale: 0.95 }}
          >
            {r === 'all' ? 'All' : RARITY_LABELS[r]}
          </motion.button>
        ))}
      </div>

      {/* Sticker Grid */}
      <div className="grid grid-cols-4 gap-3">
        {filtered.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
          return (
            <motion.button key={badge.id}
              onClick={() => setSelectedSticker(badge)}
              className={`relative rounded-2xl p-2 text-center border-2 transition-shadow ${earned ? `${style.border} ${style.bg} shadow-lg ${style.glow}` : 'border-gray-100 bg-gray-50'}`}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            >
              {!earned && <Lock size={10} className="absolute top-1 right-1 text-gray-300" />}
              <div className={`text-2xl ${earned ? '' : 'grayscale opacity-30'}`}>{badge.icon}</div>
              <p className={`text-[9px] font-bold mt-1 leading-tight ${earned ? 'text-gray-700' : 'text-gray-300'}`}>{badge.name}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSticker(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div className="relative bg-white rounded-3xl shadow-2xl p-6 mx-6 text-center max-w-xs" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={e => e.stopPropagation()}>
              <div className={`text-5xl mb-3 ${earnedIds.has(selectedSticker.id) ? '' : 'grayscale opacity-40'}`}>{selectedSticker.icon}</div>
              <h3 className="text-lg font-extrabold text-gray-800">{selectedSticker.name}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize mt-1 ${RARITY_STYLES[selectedSticker.rarity]?.bg} ${RARITY_STYLES[selectedSticker.rarity]?.border} border`}>
                {selectedSticker.rarity}
              </span>
              <p className="text-sm text-gray-500 mt-2">{selectedSticker.description}</p>
              {earnedIds.has(selectedSticker.id) ? (
                <p className="text-xs text-green-600 font-bold mt-3">Collected!</p>
              ) : (
                <p className="text-xs text-gray-400 font-bold mt-3">Not yet earned</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.jsx**

Add import: `import StickerBookPage from './pages/StickerBookPage';`
Add route: `<Route path="/stickers" element={<StickerBookPage />} />`

- [ ] **Step 3: Add sticker book link to HomePage tools section**

In `client/src/pages/HomePage.jsx`, add a "Sticker Book" button in the tools section (after Daily Review button). Import `Sticker` from lucide-react (or use `Star` which is already likely imported):

```jsx
<motion.button
  onClick={() => navigate('/stickers')}
  className="w-full bg-white rounded-2xl p-4 shadow-lg border-l-4 text-left flex items-center gap-4 cursor-pointer"
  style={{ borderLeftColor: '#F59E0B' }}
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0 bg-yellow-500">
    <Star size={24} />
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-bold text-gray-800">Sticker Book {'\u2B50'}</p>
    <p className="text-sm text-gray-500 font-semibold">Collect them all!</p>
  </div>
</motion.button>
```

- [ ] **Step 4: Add sticker book button to ProfilePage**

In `client/src/pages/ProfilePage.jsx`, add a button in the actions section (before "View Badges"):

```jsx
<motion.button
  onClick={() => navigate('/stickers')}
  className="w-full bg-yellow-50 border-2 border-yellow-200 text-yellow-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <Star size={18} />
  Sticker Book
</motion.button>
```

- [ ] **Step 5: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/StickerBookPage.jsx client/src/App.jsx client/src/pages/HomePage.jsx client/src/pages/ProfilePage.jsx
git commit -m "feat: add Sticker Book page with rarity tiers and navigation links"
```

---

### Task 7: Client — Mystery Challenge Modal

**Files:**
- Create: `client/src/components/MysteryChallenge.jsx`
- Modify: `client/src/pages/HomePage.jsx`

- [ ] **Step 1: Create MysteryChallenge component**

```jsx
// client/src/components/MysteryChallenge.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MailOpen, Check, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import NuriOwl from './NuriOwl';
import QuestionCard from './QuestionCard';

export default function MysteryChallenge({ visible, onClose }) {
  const { currentProfile, updateXP } = useProfile();
  const [stage, setStage] = useState('envelope'); // envelope | opening | question | result
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (visible && currentProfile) {
      fetchChallenge();
    }
  }, [visible]);

  async function fetchChallenge() {
    setLoading(true);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api(`/challenge/today?profileId=${pid}`);
      setChallenge(data);
      if (data.attempted) {
        setStage('result');
        setResult({ correct: data.attempt.was_correct, xpEarned: data.attempt.xp_earned });
        setCorrectAnswer(data.question.correctAnswer);
      }
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEnvelope() {
    setStage('opening');
    setTimeout(() => setStage('question'), 800);
  }

  async function handleAnswer(index) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const options = challenge.question.options;
    const correctIdx = options.findIndex((_, i) =>
      String.fromCharCode(65 + i) === challenge.question.correctAnswer
    );
    setCorrectAnswer(correctIdx);

    const answer = String.fromCharCode(65 + index);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/challenge/answer', {
        method: 'POST',
        body: { profileId: pid, answer },
      });
      setResult({ correct: data.correct, xpEarned: data.xpEarned, newBadges: data.newBadges });
      updateXP(data.xpEarned);
    } catch {
      setResult({ correct: index === correctIdx, xpEarned: 0 });
    }

    setTimeout(() => setStage('result'), 1500);
  }

  function handleClose() {
    setStage('envelope');
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setResult(null);
    setChallenge(null);
    onClose();
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>

          {loading && (
            <div className="text-center py-12">
              <NuriOwl size="md" state="thinking" level={currentProfile?.level || 1} />
              <p className="text-gray-500 font-semibold mt-4">Preparing your mystery...</p>
            </div>
          )}

          {!loading && stage === 'envelope' && (
            <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg font-extrabold text-gray-800 mb-2">Daily Mystery Challenge</p>
              <p className="text-sm text-gray-500 font-semibold mb-6">Tap to open today's mystery question!</p>
              <motion.button
                onClick={handleOpenEnvelope}
                className="mx-auto"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-7xl">
                  <Mail size={80} className="text-purple-500 mx-auto" />
                </div>
              </motion.button>
              <p className="text-xs text-purple-400 font-semibold mt-4">+50 XP if correct!</p>
            </motion.div>
          )}

          {!loading && stage === 'opening' && (
            <motion.div className="text-center py-12"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 0.9, 1.1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8 }}
            >
              <MailOpen size={80} className="text-purple-500 mx-auto" />
            </motion.div>
          )}

          {!loading && stage === 'question' && challenge && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <NuriOwl size="sm" state="excited" level={currentProfile?.level || 1} />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Today's Mystery</p>
                  <p className="text-xs text-gray-500 font-semibold capitalize">{challenge.subject} - {challenge.topic}</p>
                </div>
              </div>
              <QuestionCard
                question={challenge.question.question}
                options={challenge.question.options}
                onAnswer={handleAnswer}
                answered={answered}
                selectedAnswer={selectedAnswer}
                correctAnswer={correctAnswer}
                explanation={answered ? challenge.question.explanation : ''}
                subjectColor="#A855F7"
              />
            </div>
          )}

          {!loading && stage === 'result' && result && (
            <motion.div className="text-center py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <NuriOwl size="md" state={result.correct ? 'celebrating' : 'encouraging'} level={currentProfile?.level || 1} />
              <div className={`mt-4 w-16 h-16 rounded-full mx-auto flex items-center justify-center ${result.correct ? 'bg-green-100' : 'bg-orange-100'}`}>
                {result.correct
                  ? <Check size={32} className="text-green-600" />
                  : <XCircle size={32} className="text-orange-500" />
                }
              </div>
              <p className="text-xl font-extrabold text-gray-800 mt-3">
                {result.correct ? 'Amazing!' : 'Nice try!'}
              </p>
              <p className="text-sm text-gray-500 font-semibold mt-1">
                {result.correct ? "You solved today's mystery!" : "You'll get it tomorrow!"}
              </p>
              <div className="bg-purple-50 rounded-xl px-4 py-2 inline-block mt-3">
                <p className="text-lg font-extrabold text-purple-600">+{result.xpEarned} XP</p>
              </div>
              {result.newBadges?.length > 0 && (
                <div className="mt-3 bg-yellow-50 rounded-xl px-4 py-2">
                  <p className="text-sm font-bold text-yellow-700">
                    New badge: {result.newBadges[0].name} {result.newBadges[0].icon}
                  </p>
                </div>
              )}
              <motion.button
                onClick={handleClose}
                className="mt-4 gradient-bg text-white font-bold py-3 px-8 rounded-2xl shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Add Mystery Challenge card to HomePage**

In `client/src/pages/HomePage.jsx`:

1. Add import: `import MysteryChallenge from '../components/MysteryChallenge';`
2. Add import: `import { Mail } from 'lucide-react';`
3. Add state: `const [showChallenge, setShowChallenge] = useState(false);`
4. Add the Mystery Challenge card at the TOP of the Tools section (before Mistake Journal):

```jsx
<motion.button
  onClick={() => setShowChallenge(true)}
  className="w-full bg-gradient-to-r from-purple-500 to-orange-400 rounded-2xl p-4 shadow-lg text-left flex items-center gap-4 cursor-pointer text-white"
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 shrink-0">
    <Mail size={24} />
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-bold">Daily Mystery Challenge</p>
    <p className="text-sm opacity-80 font-semibold">Open today's mystery question!</p>
  </div>
  <span className="bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full">+50 XP</span>
</motion.button>
```

5. Add the modal at the bottom of the component (before the closing `</div>`):

```jsx
<MysteryChallenge visible={showChallenge} onClose={() => setShowChallenge(false)} />
```

- [ ] **Step 3: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 4: Commit**

```bash
git add client/src/components/MysteryChallenge.jsx client/src/pages/HomePage.jsx
git commit -m "feat: add Daily Mystery Challenge with envelope animation on HomePage"
```

---

### Task 8: Client — Nuri Evolution + XPBar Polish + Level-Up Detection

**Files:**
- Modify: `client/src/components/XPBar.jsx`
- Modify: `client/src/context/ProfileContext.jsx`
- Modify: `client/src/pages/QuizPage.jsx`
- Modify: `client/src/pages/HomePage.jsx`
- Modify: `client/src/pages/ProfilePage.jsx`

- [ ] **Step 1: Fix XPBar to use real level thresholds**

Replace the entire `client/src/components/XPBar.jsx` content:

```jsx
import { motion } from 'framer-motion';

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

function getLevelInfo(totalXP) {
  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1] || { level: 99, xp: 999999 };

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xp) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || { level: currentThreshold.level + 1, xp: currentThreshold.xp + 10000 };
    } else {
      break;
    }
  }

  const xpInLevel = totalXP - currentThreshold.xp;
  const xpNeeded = nextThreshold.xp - currentThreshold.xp;
  const progress = Math.min(xpInLevel / xpNeeded, 1);

  return { level: currentThreshold.level, xpInLevel, xpNeeded, progress };
}

export default function XPBar({ currentXP = 0, level }) {
  const info = getLevelInfo(currentXP);
  const displayLevel = level || info.level;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-purple-600">Level {displayLevel}</span>
        <span className="text-xs text-gray-500 font-semibold">
          {info.xpInLevel} / {info.xpNeeded} XP
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full gradient-bg"
          initial={{ width: 0 }}
          animate={{ width: `${info.progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add level-up detection to ProfileContext**

In `client/src/context/ProfileContext.jsx`:

1. Add state: `const [levelUpData, setLevelUpData] = useState(null);`

2. Modify `updateXP` to detect level changes:

```js
const updateXP = useCallback((amount) => {
  setCurrentProfile((prev) => {
    if (!prev) return prev;
    const newXP = (prev.xp || prev.total_xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const oldLevel = prev.level || prev.current_level || 1;
    if (newLevel > oldLevel) {
      setLevelUpData({ level: newLevel, previousLevel: oldLevel });
    }
    return { ...prev, xp: newXP, total_xp: newXP, level: newLevel, current_level: newLevel };
  });
}, []);

const clearLevelUp = useCallback(() => {
  setLevelUpData(null);
}, []);
```

3. Add `levelUpData` and `clearLevelUp` to the Provider value:

```jsx
<ProfileContext.Provider value={{ currentProfile, loading, login, logout, updateXP, levelUpData, clearLevelUp }}>
```

- [ ] **Step 3: Show LevelUpModal in QuizPage**

In `client/src/pages/QuizPage.jsx`:

1. Add to useProfile destructure: `const { currentProfile, updateXP, levelUpData, clearLevelUp } = useProfile();`
2. Add import: `import LevelUpModal from '../components/LevelUpModal';` (if not already imported)
3. Add the modal at the bottom of the return JSX (before the last closing `</div>`):

```jsx
<LevelUpModal
  level={levelUpData?.level}
  visible={!!levelUpData}
  onClose={clearLevelUp}
/>
```

- [ ] **Step 4: Show evolution Nuri on HomePage**

In `client/src/pages/HomePage.jsx`:

1. Import `getStageImage` from NuriOwl: `import NuriOwl, { getStageImage } from '../components/NuriOwl';`

2. Replace the floating Nuri at the bottom of the page. Find the fixed bottom-right NuriOwl and replace with the evolution stage image:

```jsx
<motion.div
  className="fixed bottom-6 right-6 cursor-pointer z-40"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => navigate('/profile')}
>
  <img
    src={getStageImage(level)}
    alt="Nuri"
    className="w-16 h-16 object-contain drop-shadow-lg"
    draggable={false}
  />
</motion.div>
```

- [ ] **Step 5: Show evolution stage on ProfilePage**

In `client/src/pages/ProfilePage.jsx`:

1. Import: `import { getStageImage } from '../components/NuriOwl';`

2. Replace the `<NuriAvatar size={120} />` with the evolution stage image:

```jsx
<img
  src={getStageImage(level)}
  alt="Nuri Evolution"
  className="w-28 h-28 object-contain mx-auto"
  draggable={false}
/>
```

Remove the `NuriAvatar` import if it becomes unused.

- [ ] **Step 6: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 7: Commit**

```bash
git add client/src/components/XPBar.jsx client/src/context/ProfileContext.jsx client/src/pages/QuizPage.jsx client/src/pages/HomePage.jsx client/src/pages/ProfilePage.jsx
git commit -m "feat: XP bar real thresholds, level-up detection, Nuri evolution display"
```

---

### Task 9: Badge Seeding + Final Build Verification

**Files:**
- Modify: `server/src/db/migrate-v4.js`

- [ ] **Step 1: Add badge seeding to v4 migration**

In `server/src/db/migrate-v4.js`, after the table creation queries and before `console.log('v4 migration completed')`, add:

```js
// Seed badge definitions
const { seedBadges } = require('../services/badges');
await seedBadges();
console.log('Badge definitions seeded.');
```

- [ ] **Step 2: Full client build**

Run: `cd client && npm run build`
Expected: Build succeeds, no errors.

- [ ] **Step 3: Server module check**

Run: `cd server && node -e "require('./src/services/badges'); require('./src/routes/badges'); require('./src/routes/challenge'); console.log('OK')"`
Expected: "OK"

- [ ] **Step 4: Commit**

```bash
git add server/src/db/migrate-v4.js
git commit -m "feat: seed badge definitions during v4 migration"
```
