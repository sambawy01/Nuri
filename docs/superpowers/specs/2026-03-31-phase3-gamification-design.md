# Phase 3: Gamification — Design Spec

**Goal:** Make kids want to come back every day through real badge earning, daily challenges, collectible stickers, Nuri evolution, and XP/level polish.

---

## 1. Badge Earning Logic

### Database

**`badges` table** — static badge definitions (seeded, not user-generated):

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | e.g. "first-quiz", "fearless" |
| name | VARCHAR(100) | Display name |
| description | TEXT | How to earn it |
| icon | VARCHAR(10) | Emoji |
| category | VARCHAR(30) | milestones, quizzes, learning, mastery, streaks, subjects, fun, challenge |
| rarity | VARCHAR(20) | common, uncommon, rare, epic, legendary |
| condition_type | VARCHAR(50) | The check type (see below) |
| condition_value | INT | Threshold value |

**`earned_badges` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| profile_id | INT FK | |
| badge_id | VARCHAR(50) FK | |
| earned_at | TIMESTAMP | |
| UNIQUE(profile_id, badge_id) | | |

### Badge Definitions (40 badges)

**Milestones (8):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| first-quiz | First Steps | star | 1 quiz completed | common |
| quiz-10 | Quiz Explorer | rocket | 10 quizzes | common |
| quiz-50 | Quiz Champion | trophy | 50 quizzes | uncommon |
| quiz-100 | Quiz Legend | crown | 100 quizzes | rare |
| level-5 | Rising Star | star | Reach level 5 | common |
| level-10 | Superstar | star2 | Reach level 10 | uncommon |
| level-20 | Legend | crown | Reach level 20 | rare |
| level-30 | Cosmic Master | sparkles | Reach level 30 | legendary |

**Quizzes (7):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| perfect-quiz | Perfect Score | 100 | 10/10 on a quiz | uncommon |
| perfect-3 | Triple Perfection | fire | 3 perfect quizzes | rare |
| fearless | Fearless | lion | 10 quizzes on Hard | uncommon |
| challenger | Challenge Accepted | skull | 10 quizzes on Challenge Me | rare |
| speed-demon | Speed Demon | lightning | Answer 5 in <30s each (tracked client-side) | uncommon |
| streak-5q | Hot Streak | fire | 5 correct in a row in one quiz | common |
| streak-10q | Unstoppable | comet | 10 correct in a row across quizzes | rare |

**Streaks (5):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| streak-3 | Getting Going | flame | 3-day streak | common |
| streak-7 | Week Warrior | flame | 7-day streak | uncommon |
| streak-14 | Two Week Titan | flame | 14-day streak | rare |
| streak-30 | Monthly Master | gem | 30-day streak | epic |
| streak-100 | Century Club | diamond | 100-day streak | legendary |

**Learning (6):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| learn-5 | Curious Mind | brain | 5 learn sessions | common |
| learn-20 | Knowledge Seeker | books | 20 learn sessions | uncommon |
| explain-1 | First Lesson | graduation | 1 Explain It Back session | common |
| explain-10 | Master Teacher | graduation | 10 Explain It Back sessions | rare |
| confidence-10 | Self Aware | mirror | Used Confidence Meter 10 times | common |
| comeback-10 | Comeback Kid | muscle | Resolved 10 mistakes | uncommon |

**Mastery (6):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| maths-star | Maths Star | numbers | 5 stars in any maths topic | uncommon |
| science-star | Science Star | microscope | 5 stars in any science topic | uncommon |
| english-star | English Star | book | 5 stars in any English topic | uncommon |
| arabic-star | Arabic Star | writing | 5 stars in any Arabic topic | uncommon |
| history-star | History Star | scroll | 5 stars in any history topic | uncommon |
| religion-star | Religion Star | dove | 5 stars in any religion topic | uncommon |

**Subjects (3):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| all-subjects | Explorer | map | Practiced all 6 subjects | uncommon |
| all-stars | Universal Scholar | globe | 5-star topic in every subject | legendary |
| diverse-learner | Diverse Learner | rainbow | Learn sessions in 4+ subjects | uncommon |

**Fun (3):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| night-owl | Night Owl | moon | Study after 8 PM | common |
| early-bird | Early Bird | sunrise | Study before 8 AM | common |
| weekend-warrior | Weekend Warrior | calendar | Study on a weekend | common |

**Challenge (2):**
| ID | Name | Icon | Condition | Rarity |
|----|------|------|-----------|--------|
| daily-1 | Mystery Solver | envelope | Complete 1 daily challenge | common |
| daily-7 | Challenge Streak | star | Complete 7 daily challenges | uncommon |

### Badge Evaluation Service

`server/src/services/badges.js` — evaluates which badges a profile has earned.

**Called after:** quiz answer, learn session end, streak update, explain-back completion, daily challenge completion.

**Method:** Query the relevant counts/stats, compare against badge conditions, insert any newly earned badges. Return list of newly earned badge IDs (for client celebration).

**Condition types and their SQL:**
- `quiz_count` — COUNT from quiz_history WHERE was_correct IS NOT NULL
- `quiz_correct_streak` — tracked in quiz_history, consecutive correct answers
- `perfect_quiz` — COUNT of quiz sessions with 10/10
- `level` — profile.current_level
- `streak_days` — profile.streak_days
- `learn_sessions` — COUNT from chat_sessions WHERE mode='learn'
- `explain_sessions` — COUNT from explain_back_sessions
- `confidence_count` — COUNT from confidence_responses
- `mistakes_resolved` — COUNT from mistakes WHERE resolved=TRUE
- `subject_mastery` — topic_mastery WHERE stars=5 AND subject=X
- `subjects_practiced` — COUNT DISTINCT subject from quiz_history
- `difficulty_count` — COUNT from quiz_history WHERE difficulty=X
- `daily_challenge_count` — COUNT from daily_challenge_attempts WHERE completed=TRUE
- `time_of_day` — checked client-side, passed to server

### Stats Endpoint Update

`GET /api/stats/:profileId` — add earned badges to the response (replace mock data in BadgesPage).

---

## 2. Daily Mystery Challenge

### Database

**`daily_challenges` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| challenge_date | DATE UNIQUE | One per day |
| subject | VARCHAR(50) | Randomly picked |
| topic | VARCHAR(100) | Randomly picked from subject's curriculum |
| question_data | JSONB | The generated question (question, options, correctAnswer, explanation) |
| created_at | TIMESTAMP | |

**`daily_challenge_attempts` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| profile_id | INT FK | |
| challenge_date | DATE | |
| answer | TEXT | |
| was_correct | BOOLEAN | |
| xp_earned | INT | |
| created_at | TIMESTAMP | |
| UNIQUE(profile_id, challenge_date) | | One attempt per day |

### Server Endpoints

**GET /api/challenge/today** — returns today's challenge. If none exists for today, generates one (picks random subject + topic, calls Claude to generate question, stores it). Returns `{ challenge, attempted }` where `attempted` is whether this profile already answered.

**POST /api/challenge/answer** — submit answer. Awards 50 XP if correct, 15 XP for attempting. Triggers badge check for daily-1, daily-7. One attempt per profile per day.

### Client

**HomePage** — "Mystery Challenge" card in the tools section (above Mistake Journal). Shows a sealed envelope animation. Badge: "NEW" if not attempted today.

**Flow:** Tap envelope -> animated open -> shows question with 4 options -> answer -> celebration/encouragement -> XP award -> back to home.

No separate page needed — use a modal/overlay on HomePage.

---

## 3. Sticker Book (Achievement-Tied)

### Sticker-Badge Mapping

Each of the 40 badges has a corresponding sticker. The sticker IS the badge visual, displayed differently:
- **Earned:** Full color with rarity border glow (common=grey, uncommon=green, rare=blue, epic=purple, legendary=gold)
- **Unearned:** Grey silhouette with lock

Daily challenge stickers: completing each daily challenge earns the `daily-1` or `daily-7` badge sticker. No separate daily sticker system (keep it simple).

### Client

**StickerBookPage** — new page at `/stickers`:
- Grid of all 40 stickers (5 columns)
- Filter by rarity tier
- Progress counter: "12/40 collected"
- Tap a sticker to see its name, description, and earned date
- Unearned stickers show the requirement

**Navigation:** accessible from HomePage tools section and ProfilePage actions.

### No Separate Sticker DB Table

Stickers = earned_badges. The sticker book is a different visual presentation of the same data. The rarity comes from the badge definition.

---

## 4. Nuri Evolution Wiring

### Current State

- `getStageImage(level)` exists in NuriOwl.jsx, returns `/nuri/stage-N.png`
- Stage PNGs exist: stage-1 through stage-6
- Stages: 1-4, 5-9, 10-14, 15-19, 20-24, 25+

### Changes

**HomePage:** The floating Nuri in bottom-right corner should show the evolution stage image instead of generic idle. Use `getStageImage(level)` to pick the right PNG.

**ProfilePage:** Show the evolution stage above the avatar circle.

**LevelUpModal:** Already exists as a component. Trigger it when the user crosses a stage boundary (5, 10, 15, 20, 25). Show the new Nuri form with celebration. The modal should be triggered from QuizPage and LearnPage when XP crosses a threshold.

### Level-Up Detection

Add `previousLevel` tracking in ProfileContext. When `updateXP` causes a level change, set a `leveledUp` flag. QuizPage and LearnPage check this flag and show LevelUpModal.

For stage transitions specifically, check if `getStageImage(oldLevel) !== getStageImage(newLevel)`.

---

## 5. XP/Level Polish

### XPBar Fix

Current XPBar hardcodes `nextLevelXP = 100` and does `currentXP % 100`. Fix to use actual LEVEL_THRESHOLDS:
- Calculate XP within current level range
- Show progress toward next level threshold
- Display actual numbers

### Level-Up Notification

ProfileContext tracks level changes. When a new level is reached:
1. Set `levelUpData` in context (new level, stage change?)
2. Consuming pages show LevelUpModal
3. Modal dismissed -> clear flag

---

## Architecture Summary

### New Files
- `server/src/db/migrate-v4.js` — badges, earned_badges, daily_challenges, daily_challenge_attempts tables
- `server/src/services/badges.js` — badge evaluation logic
- `server/src/routes/badges.js` — badge endpoints
- `server/src/routes/challenge.js` — daily challenge endpoints
- `client/src/pages/StickerBookPage.jsx` — sticker book grid
- `client/src/components/MysteryChallenge.jsx` — envelope modal on HomePage
- `client/src/components/LevelUpCelebration.jsx` — enhanced level-up modal with stage transition

### Modified Files
- `server/src/db/schema.sql` — new tables
- `server/src/index.js` — mount new routes
- `server/src/routes/quiz.js` — call badge evaluation after answer
- `server/src/routes/stats.js` — include real earned badges
- `client/src/pages/HomePage.jsx` — mystery challenge card, evolution Nuri
- `client/src/pages/BadgesPage.jsx` — use real data, expand to 40 badges
- `client/src/pages/ProfilePage.jsx` — evolution stage, sticker book link
- `client/src/pages/QuizPage.jsx` — level-up detection
- `client/src/components/XPBar.jsx` — real thresholds
- `client/src/context/ProfileContext.jsx` — level-up tracking
- `client/src/App.jsx` — sticker book route
