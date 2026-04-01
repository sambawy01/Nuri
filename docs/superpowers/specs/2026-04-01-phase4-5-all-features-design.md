# Phase 4-5: All Remaining Features — Design Spec

**Goal:** Complete the full product spec with Profile Switcher, Parent Dashboard, Pre-Test Predictor, Cross-Subject Connections, Study Duels, Nuri's World, and Story Mode.

---

## 1. Profile Switcher

**What:** Multiple children can use the app on the same device (siblings, classmates).

**WelcomePage changes:**
- Show all existing profiles as avatar circles
- Tap a profile to log in (PIN optional for older kids)
- "Add New Profile" button at the bottom
- "Edit" mode to delete profiles

**No new tables needed** — profiles table already supports multiple profiles. Just need better UI.

**Client changes only:**
- `WelcomePage.jsx` — show profile list, tap to login
- `ProfileContext.jsx` — no changes needed (already supports switching via `login()`)

---

## 2. Parent Dashboard

**What:** Parents see their child's progress, session history, strengths/struggles, time spent, and weekly reports. Protected by a simple PIN.

**Access:** From ProfilePage → "Parent Dashboard" button → enter 4-digit parent PIN.

**Dashboard shows:**
- Weekly summary: sessions, XP earned, time spent, accuracy trend
- Per-subject progress bars with accuracy %
- Recent session reports (AI-generated strengths/struggles)
- Homework completion history
- Test predictions ("upcoming test likely on fractions")
- Mistake patterns ("common error: calculation mistakes in maths")
- Badges earned this week
- Recommendation: "Focus on [topic] this week"

**Database:**
- `parent_pins` table: profile_id, pin_hash, created_at
- No new data collection needed — everything reads from existing tables (session_reports, topic_mastery, homework_sessions, mistakes, earned_badges, confidence_responses)

**Server:**
- `POST /api/parent/verify-pin` — verify parent PIN
- `GET /api/parent/dashboard/:profileId` — aggregated dashboard data
- `POST /api/parent/set-pin` — set/update parent PIN

**Client:**
- `ParentDashboardPage.jsx` — full dashboard
- `ParentPinModal.jsx` — PIN entry modal
- Route: `/parent/:profileId`

---

## 3. Pre-Test Predictor

**What:** Child tells Nuri "I have a test coming up!" → Nuri creates a countdown study plan.

**Flow:**
1. Button on SubjectPage: "I have a test coming!"
2. Modal: pick subject, topic(s), date
3. Nuri generates a study plan: Day 1 review, Day 2 practice, Day 3 mock test, etc.
4. Daily reminder on HomePage: "Day 2 of your test prep! Time to practice [topic]"
5. Study plan auto-includes mistake journal items for that topic

**Database:**
- `test_plans` table: id, profile_id, subject, topics (JSONB), test_date, plan (JSONB), created_at
- `test_plan_days` table: id, plan_id, day_number, day_date, tasks (JSONB), completed (boolean)

**Server:**
- `POST /api/test-plan/create` — generate study plan via AI
- `GET /api/test-plan/active/:profileId` — get active test plans
- `POST /api/test-plan/complete-day` — mark a day's tasks as done

**Client:**
- `TestPlanModal.jsx` — create test plan (pick subject, topics, date)
- `TestPlanCard.jsx` — shows on HomePage ("Day 2 of 4: Practice fractions")
- SubjectPage button: "I have a test!"

---

## 4. Cross-Subject Connections

**What:** When teaching one subject, Nuri points out connections to other subjects the child is studying.

**Implementation:** Add a connection prompt section to the Learn mode system prompt. No separate UI needed — Nuri naturally mentions connections during conversation.

**Connection map** (hardcoded in a service file):
```
Fractions (Maths) ↔ "In Arabic, fraction is كسر (kasr)!" (Arabic)
Water Cycle (Science) ↔ "The Nile floods because of the water cycle!" (History)
Adjectives (English) ↔ "In Arabic, adjectives come AFTER the noun!" (Arabic)
Measuring (Maths) ↔ "In Science lab, you use these same units!" (Science)
Roman numerals (Maths) ↔ "The Romans used these for everything!" (History)
```

**Server:**
- `server/src/services/cross-subject.js` — connection map + `getConnections(subject, topic)` function
- Inject relevant connections into Learn mode system prompt

**No new database or client changes** — purely AI prompt enhancement.

---

## 5. Study Duels

**What:** Two kids compete head-to-head on the same questions. Works for siblings (same device, take turns) or async challenges.

**Modes:**
- **Same-device duel:** Player 1 answers 5 questions, Player 2 answers same 5, compare scores
- **Async challenge:** Create a 5-question challenge, share a code, other player answers later

**No real-time/websockets needed** — turn-based, stored in DB.

**Database:**
- `duels` table: id, creator_profile_id, opponent_profile_id, subject, questions (JSONB), creator_score, opponent_score, status (waiting/active/complete), code (6-char), created_at
- `duel_answers` table: id, duel_id, profile_id, question_index, answer, correct, time_ms

**Server:**
- `POST /api/duels/create` — generate 5 questions, return duel code
- `GET /api/duels/join/:code` — join a duel
- `POST /api/duels/answer` — submit answer
- `GET /api/duels/:id/results` — get comparison results
- `GET /api/duels/history/:profileId` — past duels

**Client:**
- `DuelsPage.jsx` — create or join duel
- `DuelPlayPage.jsx` — answer questions (timer, score)
- `DuelResultsPage.jsx` — side-by-side comparison
- Routes: `/duels`, `/duel/:id`
- HomePage: "Challenge a Friend!" button

**XP:** Winner +50 XP, loser +20 XP (everyone gets something)

---

## 6. Nuri's World (Virtual Treehouse)

**What:** A virtual treehouse that the child decorates with items earned through learning. Visual reward space.

**Items earned by:**
- Reaching levels (furniture unlocks)
- Earning badges (decorations)
- Completing homework (accessories for Nuri)
- Streak milestones (special items)

**Database:**
- `treehouse_items` table: id, name, category (furniture/decoration/accessory), unlock_type (level/badge/homework/streak), unlock_value, image_url
- `owned_items` table: id, profile_id, item_id, equipped (boolean), earned_at

**Server:**
- `GET /api/treehouse/:profileId` — get owned items + available items
- `POST /api/treehouse/equip` — equip/unequip an item

**Client:**
- `TreehousePage.jsx` — visual treehouse with placed items
- Items displayed as emoji/icons on a treehouse background
- Tap to equip/move items
- Route: `/treehouse`

**Keep it simple:** No drag-and-drop, just a grid of slots (bookshelf, desk, window, door, tree) with tap-to-place items.

---

## 7. Story Mode — The 7 Lost Books of Knowledge

**What:** A narrative adventure where the child helps Nuri find 7 lost magical books, each representing a subject. Each book has 5 stages mixing story, teaching, and quizzes.

**Structure:**
- 7 chapters (one per subject: Maths, Science, English, History, Arabic, Religion, Social Studies)
- 5 stages per chapter:
  1. **Story intro** — animated text revealing the quest
  2. **Learn** — Nuri teaches the key concept needed
  3. **Challenge** — quiz questions related to the story
  4. **Boss puzzle** — a harder multi-step problem
  5. **Reward** — book found! XP + sticker + treehouse item

**Database:**
- `story_progress` table: id, profile_id, chapter (1-7), stage (1-5), completed, score, created_at

**Server:**
- `GET /api/story/progress/:profileId` — get chapter/stage progress
- `POST /api/story/complete-stage` — mark stage done, award XP
- Story content is hardcoded (not AI-generated) for consistency

**Client:**
- `StoryMapPage.jsx` — world map showing 7 book locations (chapters)
- `StoryChapterPage.jsx` — plays through the 5 stages
- `StoryIntroPage.jsx` — animated story text
- Route: `/story`, `/story/:chapter/:stage`

**Story content:** Each chapter has a theme:
1. The Book of Numbers (Maths) — hidden in a pyramid, needs maths to unlock doors
2. The Book of Nature (Science) — lost in a jungle, science knowledge to survive
3. The Book of Words (English) — trapped in a library, grammar puzzles to free it
4. The Book of Time (History) — stuck in the past, history knowledge to return
5. The Book of Letters (Arabic) — guarded by a sphinx, Arabic riddles to pass
6. The Book of Light (Religion) — in a monastery, faith and knowledge to find it
7. The Book of People (Social Studies) — in a busy city, social knowledge to navigate

---

## Architecture Summary

### New Files (per feature)

**Profile Switcher:** Modify `WelcomePage.jsx` only

**Parent Dashboard:** `ParentDashboardPage.jsx`, `ParentPinModal.jsx`, `server/routes/parent.js`, migration for parent_pins

**Pre-Test Predictor:** `TestPlanModal.jsx`, `TestPlanCard.jsx`, `server/routes/test-plan.js`, migration for test_plans + test_plan_days

**Cross-Subject:** `server/services/cross-subject.js`, modify `server/services/claude.js`

**Study Duels:** `DuelsPage.jsx`, `DuelPlayPage.jsx`, `DuelResultsPage.jsx`, `server/routes/duels.js`, migration for duels + duel_answers

**Nuri's World:** `TreehousePage.jsx`, `server/routes/treehouse.js`, migration for treehouse_items + owned_items

**Story Mode:** `StoryMapPage.jsx`, `StoryChapterPage.jsx`, `server/routes/story.js`, `server/services/story-content.js`, migration for story_progress
