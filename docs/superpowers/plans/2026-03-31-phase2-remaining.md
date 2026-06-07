# Phase 2 Remaining Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the 4 remaining Phase 2 (Smart Learning Engine) features: Difficulty Dial (Challenge Me + XP scaling), Confidence Meter, Explain It Back mode, and Learning Style Detection.

**Architecture:** Each feature touches a vertical slice: DB migration -> server route/service -> client component/page. Features are independent and can be built in any order, but Difficulty Dial is simplest (extends existing quiz) and Confidence Meter is needed before Learning Style Detection (it feeds data into style tracking).

**Tech Stack:** PostgreSQL, Express, React 18, Framer Motion, Tailwind CSS, Anthropic Claude API

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `server/src/db/migrate-v3.js` | Create | DB migration: confidence_responses + learning_style_profiles + quiz_history columns |
| `server/src/db/schema.sql` | Modify | Add new tables to canonical schema |
| `server/src/services/xp.js` | Modify | Add difficulty-scaled XP values and confidence_used event |
| `server/src/routes/quiz.js` | Modify | Accept "challenge" difficulty, confidence field on answer submit |
| `server/src/services/claude.js` | Modify | Year-shift for difficulty, learning style injection into system prompt |
| `server/src/services/ai-provider.js` | Modify | Expose new chatExplainBack function |
| `server/src/routes/explain.js` | Create | POST /api/explain/evaluate endpoint |
| `server/src/routes/learning-style.js` | Create | GET /api/learning-style/:profileId |
| `server/src/index.js` | Modify | Mount new routes |
| `client/src/pages/QuizPage.jsx` | Modify | Challenge Me button, confidence meter after answer, XP scaling |
| `client/src/components/ConfidenceMeter.jsx` | Create | The 4-option confidence UI |
| `client/src/components/DifficultySelector.jsx` | Create | 4-button difficulty picker with XP preview |
| `client/src/pages/ExplainBackPage.jsx` | Create | Explain It Back chat interface |
| `client/src/pages/SubjectPage.jsx` | Modify | Add "Teach Nuri" mode button |
| `client/src/pages/ProfilePage.jsx` | Modify | Add learning style radar chart |
| `client/src/App.jsx` | Modify | Add /explain/:subject route |

---

### Task 1: Database Migration (v3)

**Files:**
- Create: `server/src/db/migrate-v3.js`
- Modify: `server/src/db/schema.sql`

- [ ] **Step 1: Create the v3 migration file**

```js
// server/src/db/migrate-v3.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Pool } = require('pg');

async function migrateV3() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Running v3 migration (Phase 2 remaining features)...');

    // Confidence responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS confidence_responses (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        quiz_history_id INT REFERENCES quiz_history(id) ON DELETE CASCADE,
        confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('guessed', 'unsure', 'pretty_sure', 'knew_it')),
        was_correct BOOLEAN NOT NULL,
        subject VARCHAR(50),
        topic VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_confidence_profile ON confidence_responses(profile_id);
      CREATE INDEX IF NOT EXISTS idx_confidence_blindspots ON confidence_responses(profile_id, confidence_level, was_correct);
    `);

    // Learning style profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_style_profiles (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
        visual FLOAT DEFAULT 0,
        analogy FLOAT DEFAULT 0,
        example_first FLOAT DEFAULT 0,
        auditory FLOAT DEFAULT 0,
        try_first FLOAT DEFAULT 0,
        total_interactions INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_learning_style_profile ON learning_style_profiles(profile_id);
    `);

    // Explain-back sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS explain_back_sessions (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        messages JSONB DEFAULT '[]',
        understanding_score INT CHECK (understanding_score BETWEEN 1 AND 5),
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_explain_back_profile ON explain_back_sessions(profile_id);
    `);

    console.log('v3 migration completed successfully.');
  } catch (err) {
    console.error('v3 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV3();
```

- [ ] **Step 2: Update schema.sql with the new tables**

Add the three new table definitions and indexes to the bottom of `server/src/db/schema.sql` (before any closing comments), matching the SQL from the migration above.

- [ ] **Step 3: Run the migration**

Run: `cd server && node src/db/migrate-v3.js`
Expected: "v3 migration completed successfully."

- [ ] **Step 4: Commit**

```bash
git add server/src/db/migrate-v3.js server/src/db/schema.sql
git commit -m "feat: add v3 migration for confidence, learning style, explain-back tables"
```

---

### Task 2: Difficulty Dial — Server (XP Scaling + Challenge Me)

**Files:**
- Modify: `server/src/services/xp.js`
- Modify: `server/src/routes/quiz.js`
- Modify: `server/src/services/claude.js`

- [ ] **Step 1: Add difficulty-scaled XP to xp.js**

In `server/src/services/xp.js`, replace the flat `XP_VALUES` object and `awardXP` function to support difficulty-based XP. Add a new `DIFFICULTY_XP` map and a new `awardQuizXP` function:

```js
// Add after existing XP_VALUES
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
```

Add `confidence_used: 2` to the existing `XP_VALUES` object.

Add a new exported function `awardQuizXP`:

```js
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
```

Export `awardQuizXP`, `DIFFICULTY_XP`, and `DIFFICULTY_STREAK_BONUS` from the module.

- [ ] **Step 2: Update quiz route to accept "challenge" difficulty and use scaled XP**

In `server/src/routes/quiz.js`:

Change the `validDifficulties` array from `['easy', 'medium', 'hard']` to `['easy', 'medium', 'hard', 'challenge']`.

Import `awardQuizXP` alongside `awardXP` from `../services/xp`.

In the `/answer` route, replace the `awardXP` call with `awardQuizXP`, passing the question's difficulty:

```js
const xpResult = await awardQuizXP(
  profileId,
  eventType,
  question.difficulty || 'medium',
  subject || question.subject,
  topic || question.topic
);
```

- [ ] **Step 3: Update claude.js to year-shift for difficulty**

In `server/src/services/claude.js`, modify `generateQuizQuestion` to adjust the effective year group based on difficulty:

```js
async function generateQuizQuestion(subject, topic, yearGroup, difficulty) {
  // Year-shift for difficulty
  let effectiveYear = yearGroup;
  let difficultyNote = '';
  if (difficulty === 'easy') {
    effectiveYear = Math.max(1, yearGroup - 1);
    difficultyNote = 'Make this an easy, confidence-building question.';
  } else if (difficulty === 'hard') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Make this a challenging stretch question.';
  } else if (difficulty === 'challenge') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Make this the HARDEST possible question. Include multi-step reasoning. This is a Challenge Me question for ambitious students.';
  }

  const systemPrompt = `You are a quiz question generator for Year ${effectiveYear} students studying ${subject}.
Generate exactly ONE multiple-choice question about "${topic}".
Difficulty: ${difficulty}
${difficultyNote}

You MUST respond with ONLY valid JSON in this exact format:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}

The correctAnswer must be just the letter (A, B, C, or D).
Make the question age-appropriate for ${getAgeRange(effectiveYear)} year old students.`;

  // ... rest of function unchanged
```

- [ ] **Step 4: Verify server starts**

Run: `cd server && node -e "require('./src/services/xp')" && echo "OK"`
Expected: "OK"

- [ ] **Step 5: Commit**

```bash
git add server/src/services/xp.js server/src/routes/quiz.js server/src/services/claude.js
git commit -m "feat: add Challenge Me difficulty, difficulty-scaled XP for quiz"
```

---

### Task 3: Difficulty Dial — Client (UI)

**Files:**
- Create: `client/src/components/DifficultySelector.jsx`
- Modify: `client/src/pages/QuizPage.jsx`

- [ ] **Step 1: Create DifficultySelector component**

```jsx
// client/src/components/DifficultySelector.jsx
import { motion } from 'framer-motion';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', emoji: '\ud83d\udfe2', xp: '+5 XP', color: '#22c55e' },
  { key: 'medium', label: 'Medium', emoji: '\ud83d\udfe1', xp: '+10 XP', color: '#eab308' },
  { key: 'hard', label: 'Hard', emoji: '\ud83d\udd34', xp: '+15 XP', color: '#ef4444' },
  { key: 'challenge', label: 'Challenge Me', emoji: '\u26ab', xp: '+20 XP', color: '#1f2937' },
];

export default function DifficultySelector({ selected, onSelect, disabled, subjectColor }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {DIFFICULTIES.map((d) => (
        <motion.button
          key={d.key}
          onClick={() => !disabled && onSelect(d.key)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
            selected === d.key
              ? 'text-white shadow-md'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
          style={selected === d.key ? { backgroundColor: d.color } : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {d.emoji} {d.label}
          {selected === d.key && (
            <span className="ml-1 opacity-75">({d.xp})</span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace difficulty buttons in QuizPage with DifficultySelector**

In `client/src/pages/QuizPage.jsx`:

1. Add import: `import DifficultySelector from '../components/DifficultySelector';`
2. Remove the `const DIFFICULTIES = ['easy', 'medium', 'hard'];` constant.
3. Replace the difficulty buttons section (the `<div className="flex justify-center gap-2 mb-6">` block with the DIFFICULTIES.map) with:

```jsx
<DifficultySelector
  selected={difficulty}
  onSelect={setDifficulty}
  disabled={answered}
  subjectColor={meta.color}
/>
```

4. Update the XP_PER_CORRECT constant usage. Replace the flat `const XP_PER_CORRECT = 15;` with a lookup:

```js
const DIFFICULTY_XP = { easy: 5, medium: 10, hard: 15, challenge: 20 };
```

Then in `handleAnswer`, replace `XP_PER_CORRECT` with `DIFFICULTY_XP[difficulty]`:

```js
const xpGain = DIFFICULTY_XP[difficulty] || 10;
setSessionXP((xp) => xp + xpGain);
updateXP(xpGain);
```

And update the XP float text to show `+${xpGain} XP`.

5. Add adaptive suggestion in the summary screen. After the `nuriMessage` assignment, add:

```js
let suggestion = null;
if (difficulty === 'easy' && percentage >= 90) {
  suggestion = "That was too easy for you! Want to try Medium? I think you're ready! \ud83d\udcaa";
} else if (difficulty === 'hard' && percentage < 40) {
  suggestion = "No shame! Let's go back to Medium and build up. You'll get there! \ud83c\udf1f";
} else if (difficulty === 'medium' && percentage >= 90) {
  suggestion = "You're crushing it! Ready to try Hard mode? \ud83d\udd25";
}
```

Render the suggestion below the nuriMessage in the summary if it exists:

```jsx
{suggestion && (
  <div className="bg-purple-50 rounded-2xl p-4 mb-4">
    <p className="text-sm text-purple-800 font-semibold">{suggestion}</p>
  </div>
)}
```

- [ ] **Step 3: Build and verify**

Run: `cd client && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/DifficultySelector.jsx client/src/pages/QuizPage.jsx
git commit -m "feat: add Challenge Me difficulty selector with XP scaling in quiz UI"
```

---

### Task 4: Confidence Meter — Server

**Files:**
- Modify: `server/src/routes/quiz.js`

- [ ] **Step 1: Add confidence field to the /answer endpoint**

In `server/src/routes/quiz.js`, update the `/answer` route to accept and store confidence:

After the existing destructuring `const { profileId, questionId, answer, subject, topic } = req.body;`, add `confidence` to the destructured fields:

```js
const { profileId, questionId, answer, subject, topic, confidence } = req.body;
```

After the `quiz_history` UPDATE query, add the confidence recording:

```js
// Record confidence response if provided
const validConfidence = ['guessed', 'unsure', 'pretty_sure', 'knew_it'];
if (confidence && validConfidence.includes(confidence)) {
  await pool.query(
    `INSERT INTO confidence_responses (profile_id, quiz_history_id, confidence_level, was_correct, subject, topic)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [profileId, questionId, confidence, isCorrect, masterySubject, masteryTopic]
  );

  // +2 XP for using confidence meter
  await awardXP(profileId, 'confidence_used', masterySubject, masteryTopic);

  // Blind spots (confident + wrong) get highest priority in spaced repetition
  if ((confidence === 'knew_it' || confidence === 'pretty_sure') && !isCorrect) {
    await pool.query(
      `UPDATE review_items SET memory_score = 0, next_review_date = CURRENT_DATE
       WHERE profile_id = $1 AND question_text = $2`,
      [profileId, question.question_text]
    );
  }

  // Lucky guesses (unsure + right) stay in review
  if ((confidence === 'guessed' || confidence === 'unsure') && isCorrect) {
    await pool.query(
      `INSERT INTO review_items (profile_id, subject, topic, question_text, correct_answer, memory_score)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT DO NOTHING`,
      [profileId, masterySubject, masteryTopic, question.question_text, question.correct_answer]
    );
  }
}
```

Add `confidence_used` to XP_VALUES. Note: `awardXP` looks up `XP_VALUES[eventType]`, so add `confidence_used: 2` to `XP_VALUES` in `xp.js`.

- [ ] **Step 2: Commit**

```bash
git add server/src/routes/quiz.js server/src/services/xp.js
git commit -m "feat: add confidence tracking to quiz answer endpoint with spaced rep integration"
```

---

### Task 5: Confidence Meter — Client

**Files:**
- Create: `client/src/components/ConfidenceMeter.jsx`
- Modify: `client/src/pages/QuizPage.jsx`

- [ ] **Step 1: Create ConfidenceMeter component**

```jsx
// client/src/components/ConfidenceMeter.jsx
import { motion, AnimatePresence } from 'framer-motion';

const OPTIONS = [
  { key: 'guessed', emoji: '\ud83d\ude2c', label: 'Guessed' },
  { key: 'unsure', emoji: '\ud83e\udd14', label: 'Unsure' },
  { key: 'pretty_sure', emoji: '\ud83d\ude0a', label: 'Pretty sure' },
  { key: 'knew_it', emoji: '\ud83d\udcaa', label: 'Knew it' },
];

export default function ConfidenceMeter({ visible, onSelect }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mt-4 bg-purple-50 rounded-2xl p-4"
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-bold text-purple-700 mb-3 text-center">
            How sure were you?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map((opt) => (
              <motion.button
                key={opt.key}
                onClick={() => onSelect(opt.key)}
                className="flex flex-col items-center gap-1 bg-white rounded-xl py-2 px-1 border-2 border-purple-100 hover:border-purple-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs font-semibold text-gray-600">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-purple-400 text-center mt-2 font-semibold">+2 XP for self-awareness</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Integrate ConfidenceMeter into QuizPage**

In `client/src/pages/QuizPage.jsx`:

1. Add import: `import ConfidenceMeter from '../components/ConfidenceMeter';`
2. Add state: `const [showConfidence, setShowConfidence] = useState(false);` and `const [confidenceGiven, setConfidenceGiven] = useState(false);`
3. In `handleAnswer`, after setting `setAnswered(true)`, add `setShowConfidence(true);`
4. In `fetchQuestion` (the reset section), add `setShowConfidence(false);` and `setConfidenceGiven(false);`
5. Add a handler function:

```js
async function handleConfidence(level) {
  setShowConfidence(false);
  setConfidenceGiven(true);
  setSessionXP((xp) => xp + 2);
  updateXP(2);

  try {
    await api('/quiz/answer', {
      method: 'POST',
      body: {
        profileId: currentProfile._id || currentProfile.id,
        questionId: question.questionId || question._id || question.id,
        confidence: level,
      },
    });
  } catch {
    // Non-critical
  }
}
```

Note: The confidence is sent as a separate call to the same `/quiz/answer` endpoint. However, looking at the route, it requires `answer` field. Instead, we should submit confidence alongside the original answer. Let's adjust:

Actually, the cleaner approach is to include confidence in the original answer call. Modify the existing `handleAnswer` to delay the API call until confidence is optionally given, OR send confidence as a PATCH-like update. The simplest approach: send confidence alongside the answer when the user taps a confidence button, and skip if they don't.

Revised approach — modify `handleAnswer` to NOT submit to the API immediately. Instead, store the answer data and submit when confidence is given OR when "Next" is tapped:

```js
const pendingAnswerRef = useRef(null);

async function handleAnswer(index) {
  if (answered) return;
  setAnswered(true);
  setSelectedAnswer(index);

  const correct = question.correctAnswer ?? 0;
  setCorrectAnswer(correct);
  setExplanation(question.explanation || '');

  const isCorrect = index === correct;
  const xpGain = DIFFICULTY_XP[difficulty] || 10;

  if (isCorrect) {
    setScore((s) => s + 1);
    setSessionXP((xp) => xp + xpGain);
    setQuizStreak((s) => s + 1);
    setCelebrate((c) => c + 1);
    setXpFloat(true);
    updateXP(xpGain);
    setTimeout(() => setXpFloat(false), 1500);
  } else {
    setQuizStreak(0);
  }

  setShowConfidence(true);

  // Store pending answer to submit with optional confidence
  pendingAnswerRef.current = {
    profileId: currentProfile._id || currentProfile.id,
    subject,
    questionId: question.questionId,
    answer: index,
    correct: isCorrect,
  };
}

async function submitAnswer(confidence) {
  if (!pendingAnswerRef.current) return;
  const body = { ...pendingAnswerRef.current };
  if (confidence) body.confidence = confidence;
  pendingAnswerRef.current = null;

  try {
    await api('/quiz/answer', {
      method: 'POST',
      body,
    });
  } catch {
    // Non-critical
  }
}

function handleConfidence(level) {
  setShowConfidence(false);
  setConfidenceGiven(true);
  setSessionXP((xp) => xp + 2);
  updateXP(2);
  submitAnswer(level);
}

function nextQuestion() {
  // Submit without confidence if not already submitted
  if (pendingAnswerRef.current) {
    submitAnswer(null);
  }
  if (questionNum >= TOTAL_QUESTIONS) {
    setShowSummary(true);
    return;
  }
  setQuestionNum((n) => n + 1);
  fetchQuestion();
}
```

Add `import { useRef } from 'react';` to the existing import (it's not there yet).

6. Render the ConfidenceMeter between the question and the "Next" button:

```jsx
{answered && (
  <ConfidenceMeter
    visible={showConfidence && !confidenceGiven}
    onSelect={handleConfidence}
  />
)}
```

- [ ] **Step 3: Build and verify**

Run: `cd client && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ConfidenceMeter.jsx client/src/pages/QuizPage.jsx
git commit -m "feat: add Confidence Meter UI to quiz flow"
```

---

### Task 6: Explain It Back — Server

**Files:**
- Create: `server/src/routes/explain.js`
- Modify: `server/src/services/claude.js`
- Modify: `server/src/services/ai-provider.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: Add explain-back system prompt builder to claude.js**

Add a new function to `server/src/services/claude.js` before the `module.exports`:

```js
function buildExplainBackPrompt(profile, subject, topic) {
  return `You are Nuri, a friendly owl who PRETENDS not to understand the topic.
The child (${profile.name}, Year ${profile.year_group}) is going to teach YOU about "${topic}" in ${subject}.

YOUR ROLE:
- Act confused and curious — "Hmm, I don't quite get it... what do you mean by X?"
- Ask follow-up questions that probe their understanding
- If they explain something WRONG, don't correct them directly. Instead, ask a question that reveals the gap: "But wait, if that's true, then what happens when...?"
- If they explain something correctly, show genuine surprise and excitement
- After 4-6 exchanges, give them an understanding score (1-5) and summary

RESPOND IN JSON:
{"reply": "your message", "done": false}

When ready to score (after 4-6 exchanges):
{"reply": "your final encouraging message with score", "done": true, "score": 4, "summary": "one-line summary of what they understood well and what needs work"}

IMPORTANT: Be warm and fun. This is a GAME where they get to be the teacher. Make it feel playful.`;
}
```

Export it: add `buildExplainBackPrompt` to the module.exports.

- [ ] **Step 2: Expose in ai-provider.js**

Add to `server/src/services/ai-provider.js`:

```js
function buildExplainBackPrompt(profile, subject, topic) {
  const service = getActiveService();
  return service.buildExplainBackPrompt(profile, subject, topic);
}
```

Export `buildExplainBackPrompt` from the module.

- [ ] **Step 3: Create the explain route**

```js
// server/src/routes/explain.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { buildExplainBackPrompt, chat } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');

// POST /api/explain/message — send explanation to Nuri
router.post('/message', async (req, res, next) => {
  try {
    const { profileId, subject, topic, message, sessionId } = req.body;

    if (!profileId || !subject || !topic || !message) {
      return res.status(400).json({
        success: false,
        error: 'profileId, subject, topic, and message are required',
      });
    }

    const profileResult = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];
    let session;
    let messages = [];

    if (sessionId) {
      const sessionResult = await pool.query(
        'SELECT * FROM explain_back_sessions WHERE id = $1 AND profile_id = $2',
        [sessionId, profileId]
      );
      if (sessionResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }
      session = sessionResult.rows[0];
      messages = session.messages || [];
    } else {
      const sessionResult = await pool.query(
        `INSERT INTO explain_back_sessions (profile_id, subject, topic)
         VALUES ($1, $2, $3) RETURNING *`,
        [profileId, subject, topic]
      );
      session = sessionResult.rows[0];
    }

    messages.push({ role: 'user', content: message });

    const systemPrompt = buildExplainBackPrompt(profile, subject, topic);
    const responseText = await chat(messages, systemPrompt);

    // Parse JSON response from AI
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { reply: responseText, done: false };
    }

    messages.push({ role: 'assistant', content: responseText });

    // Award XP and finalize if done
    let xpResult = null;
    if (parsed.done && parsed.score) {
      const xpAmount = parsed.score * 5; // 5-25 XP based on understanding
      await pool.query(
        `UPDATE explain_back_sessions
         SET messages = $1, understanding_score = $2, xp_earned = $3, ended_at = NOW()
         WHERE id = $4`,
        [JSON.stringify(messages), parsed.score, xpAmount, session.id]
      );
      xpResult = await awardXP(profileId, 'learn_session', subject, topic);
    } else {
      await pool.query(
        'UPDATE explain_back_sessions SET messages = $1 WHERE id = $2',
        [JSON.stringify(messages), session.id]
      );
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        reply: parsed.reply,
        done: parsed.done || false,
        score: parsed.score || null,
        summary: parsed.summary || null,
        xp: xpResult,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 4: Mount the route in index.js**

In `server/src/index.js`, add:

```js
const explainRouter = require('./routes/explain');
```

And mount it:

```js
app.use('/api/explain', explainRouter);
```

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/explain.js server/src/services/claude.js server/src/services/ai-provider.js server/src/index.js
git commit -m "feat: add Explain It Back server endpoint with AI evaluation"
```

---

### Task 7: Explain It Back — Client

**Files:**
- Create: `client/src/pages/ExplainBackPage.jsx`
- Modify: `client/src/pages/SubjectPage.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create ExplainBackPage**

```jsx
// client/src/pages/ExplainBackPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, GraduationCap, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import NuriOwl from '../components/NuriOwl';
import MicButton from '../components/MicButton';

export default function ExplainBackPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile, updateXP } = useProfile();
  const meta = subjects[subject];
  const topic = location.state?.topic;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentProfile || !topic) {
      navigate(`/subject/${subject}`);
      return;
    }
    // Nuri's opening line
    setMessages([{
      text: `Okay ${currentProfile.name}, I heard you know about "${topic}"... but I don't really get it. Can you teach me? Start from the beginning! \ud83e\udd14`,
      isNuri: true,
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    if (!text.trim() || isLoading || result) return;
    setMessages((prev) => [...prev, { text: text.trim(), isNuri: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await api('/explain/message', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject,
          topic,
          message: text.trim(),
          ...(sessionId && { sessionId }),
        },
      });

      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { text: data.reply, isNuri: true }]);

      if (data.done) {
        setResult({ score: data.score, summary: data.summary });
        if (data.xp) updateXP(data.xp.xpAwarded || 20);
      }
    } catch {
      setMessages((prev) => [...prev, {
        text: "Oops, I got confused! Try explaining again?",
        isNuri: true,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  if (!meta) {
    navigate('/home');
    return null;
  }

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="px-4 py-3 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate(`/subject/${subject}`)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <NuriOwl size="sm" state={isLoading ? 'thinking' : 'excited'} level={currentProfile?.level || 1} />
        <div>
          <p className="font-bold text-gray-800 text-sm">Teach Nuri: {topic}</p>
          <p className="text-xs text-gray-500 font-semibold">You're the teacher!</p>
        </div>
        <GraduationCap size={20} className="ml-auto text-purple-500" />
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={msg.text}
            isNuri={msg.isNuri}
            subjectColor={meta.color}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Result */}
      {result && (
        <motion.div
          className="mx-4 mb-2 bg-green-50 border border-green-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-green-800">Understanding Score:</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={s <= result.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>
          </div>
          {result.summary && <p className="text-sm text-green-700">{result.summary}</p>}
          <motion.button
            onClick={() => navigate(`/subject/${subject}`)}
            className="mt-3 w-full gradient-bg text-white font-bold py-3 rounded-xl"
            whileTap={{ scale: 0.98 }}
          >
            Back to {meta.name}
          </motion.button>
        </motion.div>
      )}

      {/* Input */}
      {!result && (
        <div className="px-4 pb-4 pt-2 shrink-0">
          <div className="flex gap-2 items-center">
            <MicButton
              onResult={(text) => sendMessage(text)}
              lang={subject === 'arabic' ? 'ar-SA' : 'en-US'}
              disabled={isLoading}
              size={44}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Teach Nuri..."
              className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-400 transition-colors"
              disabled={isLoading}
            />
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl gradient-bg text-white flex items-center justify-center disabled:opacity-50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add "Teach Nuri" button to SubjectPage**

In `client/src/pages/SubjectPage.jsx`:

1. Add `GraduationCap` to the lucide-react import.
2. In the "Mode Buttons" grid, change from `grid-cols-2` to `grid-cols-3` and add a third button after the Quiz button:

```jsx
<motion.button
  onClick={() => navigate(`/explain/${subject}`, { state: { topic: selectedTopic } })}
  className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow group"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.25 }}
  whileHover={{ y: -3 }}
  whileTap={{ scale: 0.97 }}
>
  <div
    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
    style={{ backgroundColor: `${meta.color}15` }}
  >
    <GraduationCap size={24} style={{ color: meta.color }} />
  </div>
  <h3 className="text-sm font-extrabold text-gray-800">Teach \ud83c\udf93</h3>
  <p className="text-gray-400 text-xs font-semibold mt-0.5">Explain to Nuri</p>
</motion.button>
```

Also add a third button in the selectedTopic action area:

```jsx
<button
  onClick={() => navigate(`/explain/${subject}`, { state: { topic: selectedTopic } })}
  className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg border-2"
  style={{ borderColor: meta.color, color: meta.color }}
>
  Teach: {selectedTopic}
</button>
```

- [ ] **Step 3: Add route to App.jsx**

In `client/src/App.jsx`:

1. Add import: `import ExplainBackPage from './pages/ExplainBackPage';`
2. Add route inside `<Routes>`: `<Route path="/explain/:subject" element={<ExplainBackPage />} />`

- [ ] **Step 4: Build and verify**

Run: `cd client && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/ExplainBackPage.jsx client/src/pages/SubjectPage.jsx client/src/App.jsx
git commit -m "feat: add Explain It Back page and Teach Nuri mode button"
```

---

### Task 8: Learning Style Detection — Server

**Files:**
- Create: `server/src/routes/learning-style.js`
- Modify: `server/src/services/claude.js`
- Modify: `server/src/services/ai-provider.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: Create learning style route**

```js
// server/src/routes/learning-style.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/learning-style/:profileId — get learning style profile
router.get('/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      'SELECT * FROM learning_style_profiles WHERE profile_id = $1',
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { visual: 0, analogy: 0, example_first: 0, auditory: 0, try_first: 0, total_interactions: 0 },
      });
    }

    const style = result.rows[0];
    res.json({
      success: true,
      data: {
        visual: style.visual,
        analogy: style.analogy,
        example_first: style.example_first,
        auditory: style.auditory,
        try_first: style.try_first,
        total_interactions: style.total_interactions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/learning-style/track — record a learning interaction outcome
router.post('/track', async (req, res, next) => {
  try {
    const { profileId, explanationType, wasCorrect } = req.body;

    if (!profileId || !explanationType || wasCorrect === undefined) {
      return res.status(400).json({
        success: false,
        error: 'profileId, explanationType, and wasCorrect are required',
      });
    }

    const validTypes = ['visual', 'analogy', 'example_first', 'auditory', 'try_first'];
    if (!validTypes.includes(explanationType)) {
      return res.status(400).json({
        success: false,
        error: `explanationType must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Upsert the learning style profile with running average
    // Formula: new_score = old_score + (outcome - old_score) / (n + 1)
    const outcome = wasCorrect ? 1.0 : 0.0;

    await pool.query(
      `INSERT INTO learning_style_profiles (profile_id, ${explanationType}, total_interactions)
       VALUES ($1, $2, 1)
       ON CONFLICT (profile_id)
       DO UPDATE SET
         ${explanationType} = learning_style_profiles.${explanationType} +
           ($2 - learning_style_profiles.${explanationType}) / (learning_style_profiles.total_interactions + 1),
         total_interactions = learning_style_profiles.total_interactions + 1,
         updated_at = NOW()`,
      [profileId, outcome]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Inject learning style into system prompt**

In `server/src/services/claude.js`, modify `buildSystemPrompt` to accept an optional `learningStyle` parameter and inject it:

At the beginning of `buildSystemPrompt`, before the return, add learning style injection. Change the function signature to accept a 4th parameter:

```js
function buildSystemPrompt(profile, subject, mode, learningStyle) {
```

Before the final `return prompt;` at the end of the function, add:

```js
  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions and imagery', score: learningStyle.visual },
      { name: 'real-world analogies', score: learningStyle.analogy },
      { name: 'concrete examples before theory', score: learningStyle.example_first },
      { name: 'spoken/audio explanations', score: learningStyle.auditory },
      { name: 'attempting questions before being taught', score: learningStyle.try_first },
    ]
      .filter((s) => s.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (styles.length > 0) {
      prompt += `\n\nLEARNING STYLE: This child learns best with ${styles.map((s) => s.name).join(' and ')}. Prioritize these in your explanations.`;
    }
  }

  return prompt;
```

- [ ] **Step 3: Update chat route to fetch and pass learning style**

In `server/src/routes/chat.js`, after fetching the profile, add:

```js
// Fetch learning style
let learningStyle = null;
const styleResult = await pool.query(
  'SELECT * FROM learning_style_profiles WHERE profile_id = $1',
  [profileId]
);
if (styleResult.rows.length > 0) {
  learningStyle = styleResult.rows[0];
}

const systemPrompt = buildSystemPrompt(profile, subject, mode, learningStyle);
```

Replace the existing `const systemPrompt = buildSystemPrompt(profile, subject, mode);` line.

- [ ] **Step 4: Mount route in index.js**

In `server/src/index.js`, add:

```js
const learningStyleRouter = require('./routes/learning-style');
```

And mount it:

```js
app.use('/api/learning-style', learningStyleRouter);
```

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/learning-style.js server/src/services/claude.js server/src/routes/chat.js server/src/index.js
git commit -m "feat: add Learning Style Detection tracking and system prompt injection"
```

---

### Task 9: Learning Style Detection — Client (Profile Radar Chart)

**Files:**
- Modify: `client/src/pages/ProfilePage.jsx`

- [ ] **Step 1: Add learning style radar chart to ProfilePage**

In `client/src/pages/ProfilePage.jsx`:

1. Add state: `const [learningStyle, setLearningStyle] = useState(null);`
2. In the `fetchStats` function, add a parallel fetch:

```js
async function fetchStats() {
  try {
    const [statsData, styleData] = await Promise.all([
      api(`/stats/${currentProfile._id || currentProfile.id}`).catch(() => null),
      api(`/learning-style/${currentProfile._id || currentProfile.id}`).catch(() => null),
    ]);
    setStats(statsData);
    if (styleData) setLearningStyle(styleData);
  } catch {
    setStats(null);
  } finally {
    setLoadingStats(false);
  }
}
```

3. Add a "How You Learn" section after the "Subject Mastery" section. Use a simple bar-chart style (no external chart library needed):

```jsx
{learningStyle && learningStyle.total_interactions >= 20 && (
  <motion.div
    className="bg-white rounded-2xl shadow-lg p-4 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45 }}
  >
    <h3 className="font-extrabold text-gray-800 mb-4">How You Learn Best</h3>
    <p className="text-xs text-gray-500 font-semibold mb-3">Based on {learningStyle.total_interactions} interactions</p>
    <div className="space-y-3">
      {[
        { label: 'Visual', key: 'visual', emoji: '\ud83d\uddbc\ufe0f' },
        { label: 'Analogies', key: 'analogy', emoji: '\ud83d\udd17' },
        { label: 'Examples First', key: 'example_first', emoji: '\ud83d\udca1' },
        { label: 'Listening', key: 'auditory', emoji: '\ud83d\udd0a' },
        { label: 'Try First', key: 'try_first', emoji: '\ud83e\uddea' },
      ].map(({ label, key, emoji }) => {
        const score = Math.round((learningStyle[key] || 0) * 100);
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-700">{emoji} {label}</span>
              <span className="font-bold text-purple-600">{score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
)}
```

- [ ] **Step 2: Build and verify**

Run: `cd client && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ProfilePage.jsx
git commit -m "feat: add Learning Style bar chart to profile page"
```

---

### Task 10: Integration — Wire LearnPage Quick Buttons to Learning Style Tracking

**Files:**
- Modify: `client/src/pages/LearnPage.jsx`

- [ ] **Step 1: Track explanation type usage in LearnPage**

In `client/src/pages/LearnPage.jsx`, modify the quick buttons to track which explanation type the child used. After the child sends a quick button message and gets a response, fire a tracking call.

1. Add a ref to track the last explanation type: `const lastExplainTypeRef = useRef(null);`

2. Update the quick button handler to map button labels to learning style types:

```js
const EXPLAIN_TYPE_MAP = {
  'Explain Simpler \u2728': 'visual',
  'Give Example \ud83d\udca1': 'example_first',
  'Quiz Me \ud83e\udde9': 'try_first',
};

function handleQuickButton(text) {
  lastExplainTypeRef.current = EXPLAIN_TYPE_MAP[text] || null;
  sendMessage(text);
}
```

3. After receiving a Nuri response in `sendMessage`, if the child's next answer is correct (hard to detect in Learn mode — simplify: track the button tap itself as an interaction), fire the tracking call:

```js
// At the end of the try block in sendMessage, after setOwlState('idle'):
if (lastExplainTypeRef.current) {
  api('/learning-style/track', {
    method: 'POST',
    body: {
      profileId: currentProfile._id || currentProfile.id,
      explanationType: lastExplainTypeRef.current,
      wasCorrect: true, // In learn mode, we assume the interaction was helpful
    },
  }).catch(() => {});
  lastExplainTypeRef.current = null;
}
```

4. Add an "I can teach this!" quick button that links to Explain It Back:

Add `useNavigate` is already imported. Add a new quick button:

```js
{ label: 'I Can Teach This! \ud83c\udf93', action: 'explain' },
```

And handle it:

```js
function handleQuickButton(text) {
  if (text === 'I Can Teach This! \ud83c\udf93') {
    const topic = selectedTopic || meta?.name;
    navigate(`/explain/${subject}`, { state: { topic } });
    return;
  }
  lastExplainTypeRef.current = EXPLAIN_TYPE_MAP[text] || null;
  sendMessage(text);
}
```

Update the quick buttons array to include the new button:

```jsx
{[
  { label: 'Explain Simpler \u2728' },
  { label: 'Give Example \ud83d\udca1' },
  { label: 'Quiz Me \ud83e\udde9' },
  { label: 'I Can Teach This! \ud83c\udf93' },
].map(({ label }) => (
```

- [ ] **Step 2: Build and verify**

Run: `cd client && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/LearnPage.jsx
git commit -m "feat: wire Learn mode quick buttons to learning style tracking + Teach Nuri shortcut"
```

---

### Task 11: Final Build Verification

- [ ] **Step 1: Full client build**

Run: `cd client && npm run build`
Expected: Build succeeds, no errors.

- [ ] **Step 2: Server syntax check**

Run: `cd server && node -e "require('./src/index')"`
Expected: Server starts without import/syntax errors (will show port binding message).

- [ ] **Step 3: Commit all remaining changes (if any)**

```bash
git status
# If any unstaged changes, add and commit
git add -A && git commit -m "chore: Phase 2 remaining features complete"
```
