# Snap & Learn + Homework Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let children photograph/upload homework, get Socratic guided solving per question, verify written answers on paper, and predict upcoming tests from homework patterns.

**Architecture:** Client captures images via camera/upload, sends base64 to server. Server uses Claude Vision to extract questions, then runs Socratic chat sessions per question. Verification step uses Vision again to check child's written work. Homework frequency data feeds test predictions.

**Tech Stack:** PostgreSQL, Express, React 18, Framer Motion, Tailwind CSS, Anthropic Claude API (Vision + Chat), Web Camera API

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `server/src/db/migrate-v5.js` | Create | homework_sessions, homework_questions, homework_topics_tracker |
| `server/src/db/schema.sql` | Modify | Add new tables |
| `server/src/services/homework.js` | Create | Vision analysis, verification, test prediction logic |
| `server/src/routes/homework.js` | Create | All homework endpoints |
| `server/src/index.js` | Modify | Mount homework route |
| `client/src/pages/HomeworkPage.jsx` | Create | Main homework page with tabs + chat |
| `client/src/components/HomeworkCamera.jsx` | Create | Camera capture component |
| `client/src/components/TestPredictionCard.jsx` | Create | Prediction alert for HomePage |
| `client/src/pages/HomePage.jsx` | Modify | Add Homework Help button + prediction card |
| `client/src/pages/SubjectPage.jsx` | Modify | Add Homework mode button |
| `client/src/App.jsx` | Modify | Add /homework route |

---

### Task 1: Database Migration (v5)

**Files:**
- Create: `server/src/db/migrate-v5.js`
- Modify: `server/src/db/schema.sql`

- [ ] **Step 1: Create the v5 migration file**

```js
// server/src/db/migrate-v5.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

async function migrateV5() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Running v5 migration (Homework Helper)...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_sessions (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50),
        topic VARCHAR(100),
        source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('camera', 'upload_image', 'upload_pdf', 'typed')),
        questions_detected INT DEFAULT 0,
        questions_completed INT DEFAULT 0,
        questions_correct INT DEFAULT 0,
        total_xp_earned INT DEFAULT 0,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_sessions_profile ON homework_sessions(profile_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_questions (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES homework_sessions(id) ON DELETE CASCADE,
        question_number INT NOT NULL,
        question_text TEXT NOT NULL,
        correct_answer TEXT,
        child_answer TEXT,
        verification_result VARCHAR(20) CHECK (verification_result IN ('correct', 'incorrect', 'partial', 'skipped')),
        error_type VARCHAR(30),
        messages JSONB DEFAULT '[]',
        time_spent_seconds INT DEFAULT 0,
        xp_earned INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_questions_session ON homework_questions(session_id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS homework_topics_tracker (
        id SERIAL PRIMARY KEY,
        profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        homework_date DATE NOT NULL,
        question_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_homework_tracker_profile ON homework_topics_tracker(profile_id, subject);
      CREATE INDEX IF NOT EXISTS idx_homework_tracker_recent ON homework_topics_tracker(profile_id, homework_date);
    `);

    console.log('v5 migration completed successfully.');
  } catch (err) {
    console.error('v5 migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV5();
```

- [ ] **Step 2: Update schema.sql**

Append the three table definitions and indexes to the end of `server/src/db/schema.sql`.

- [ ] **Step 3: Commit**

```bash
git add server/src/db/migrate-v5.js server/src/db/schema.sql
git commit -m "feat: add v5 migration for homework sessions, questions, topics tracker"
```

---

### Task 2: Homework Service (Vision + Verification + Prediction)

**Files:**
- Create: `server/src/services/homework.js`

- [ ] **Step 1: Create the homework service**

```js
// server/src/services/homework.js
const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db/connection');

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Analyze an image/PDF and extract homework questions using Claude Vision
 */
async function analyzeHomework(base64Image, mediaType) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this homework image. Extract each individual question.

Respond with ONLY valid JSON:
{
  "subject": "maths",
  "topic": "best guess topic name",
  "questions": [
    {"number": 1, "text": "full question text", "type": "multiple_choice|short_answer|word_problem|fill_blank"},
    ...
  ]
}

Rules:
- Extract EVERY question you can see
- For maths: include all numbers, operators, and units exactly as shown
- For English: include the full sentence or passage reference
- If you can't read something clearly, note it as [illegible]
- Detect subject automatically from content`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse homework analysis');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Verify a child's written answer photo against expected answer
 */
async function verifyWrittenAnswer(base64Image, mediaType, questionText, expectedAnswer) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `The student was solving this question: "${questionText}"
The correct answer is: "${expectedAnswer}"

Look at the student's written work in the image. Respond with ONLY valid JSON:
{
  "childAnswer": "what they wrote (extract from image)",
  "isCorrect": true/false,
  "hasWorking": true/false,
  "feedback": "brief encouraging feedback"
}

Be lenient with handwriting. If the answer is mathematically/factually equivalent, mark as correct.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse verification');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Build Socratic prompt for homework question guidance
 */
function buildHomeworkPrompt(profile, subject, questionText, learningStyle) {
  let styleNote = '';
  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions', score: learningStyle.visual },
      { name: 'real-world analogies', score: learningStyle.analogy },
      { name: 'examples before theory', score: learningStyle.example_first },
    ].filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).slice(0, 2);
    if (styles.length > 0) {
      styleNote = `\nThis child learns best with ${styles.map(s => s.name).join(' and ')}.`;
    }
  }

  return `You are Nuri, a wise owl tutor helping ${profile.name} (Year ${profile.year_group}) solve a homework question.

THE QUESTION: "${questionText}"
SUBJECT: ${subject}
${styleNote}

SOCRATIC RULES — FOLLOW EXACTLY:
1. NEVER give the answer directly. Guide the child to discover it themselves.
2. Start by asking: "What do you think the first step is?" or "What do you notice about this question?"
3. If they're stuck, give a HINT — not the answer. "What if we tried..."
4. If they give wrong reasoning, ask a revealing question: "But if that were true, then..."
5. If they're really stuck after 3 hints, break it into a simpler sub-problem
6. When they arrive at the correct answer, celebrate: "You figured it out!"
7. For maths: always ask them to show their working, not just the final answer
8. Keep responses SHORT — 2-3 sentences max per turn
9. Be warm, encouraging, use their name
10. NEVER say "wrong" — say "not quite" or "almost" or "let's think about this differently"

When the child has arrived at the correct answer, respond with JSON:
{"reply": "celebration message", "questionComplete": true, "correctAnswer": "the answer"}

Otherwise respond with JSON:
{"reply": "your guiding message", "questionComplete": false}`;
}

/**
 * Get test predictions based on homework frequency
 */
async function getTestPredictions(profileId) {
  const result = await pool.query(
    `SELECT subject, topic, COUNT(*) as appearances, MAX(homework_date) as last_seen
     FROM homework_topics_tracker
     WHERE profile_id = $1 AND homework_date >= CURRENT_DATE - INTERVAL '14 days'
     GROUP BY subject, topic
     HAVING COUNT(*) >= 3
     ORDER BY appearances DESC`,
    [profileId]
  );
  return result.rows;
}

/**
 * Track homework topic for prediction
 */
async function trackHomeworkTopic(profileId, subject, topic, questionCount) {
  const today = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO homework_topics_tracker (profile_id, subject, topic, homework_date, question_count)
     VALUES ($1, $2, $3, $4, $5)`,
    [profileId, subject, topic, today, questionCount]
  );
}

module.exports = {
  analyzeHomework,
  verifyWrittenAnswer,
  buildHomeworkPrompt,
  getTestPredictions,
  trackHomeworkTopic,
};
```

- [ ] **Step 2: Commit**

```bash
git add server/src/services/homework.js
git commit -m "feat: add homework service with Vision analysis, verification, and test prediction"
```

---

### Task 3: Homework Routes

**Files:**
- Create: `server/src/routes/homework.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: Create the homework route**

```js
// server/src/routes/homework.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { analyzeHomework, verifyWrittenAnswer, buildHomeworkPrompt, getTestPredictions, trackHomeworkTopic } = require('../services/homework');
const { chat } = require('../services/ai-provider');
const { awardXP } = require('../services/xp');
const { evaluateBadges } = require('../services/badges');

// POST /api/homework/analyze — analyze homework image/text
router.post('/analyze', async (req, res, next) => {
  try {
    const { profileId, image, mediaType, text, sourceType } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, error: 'profileId required' });
    }
    if (!image && !text) {
      return res.status(400).json({ success: false, error: 'image or text required' });
    }

    let analysis;
    if (text) {
      // Typed input — wrap as a single question
      analysis = {
        subject: 'general',
        topic: 'homework',
        questions: [{ number: 1, text, type: 'short_answer' }],
      };
    } else {
      // Image/PDF — use Vision
      analysis = await analyzeHomework(image, mediaType || 'image/jpeg');
    }

    // Create session
    const sessionResult = await pool.query(
      `INSERT INTO homework_sessions (profile_id, subject, topic, source_type, questions_detected)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [profileId, analysis.subject, analysis.topic, sourceType || 'upload_image', analysis.questions?.length || 0]
    );
    const sessionId = sessionResult.rows[0].id;

    // Insert detected questions
    for (const q of (analysis.questions || [])) {
      await pool.query(
        `INSERT INTO homework_questions (session_id, question_number, question_text)
         VALUES ($1, $2, $3)`,
        [sessionId, q.number, q.text]
      );
    }

    res.json({
      success: true,
      data: {
        sessionId,
        subject: analysis.subject,
        topic: analysis.topic,
        questions: analysis.questions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/chat — Socratic conversation for a question
router.post('/chat', async (req, res, next) => {
  try {
    const { profileId, sessionId, questionIndex, message } = req.body;

    if (!profileId || !sessionId || questionIndex === undefined || !message) {
      return res.status(400).json({ success: false, error: 'profileId, sessionId, questionIndex, and message required' });
    }

    // Get profile
    const profileResult = await pool.query('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    const profile = profileResult.rows[0];

    // Get the question
    const questionResult = await pool.query(
      'SELECT * FROM homework_questions WHERE session_id = $1 AND question_number = $2',
      [sessionId, questionIndex]
    );
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    const question = questionResult.rows[0];

    // Get session for subject
    const sessionResult = await pool.query('SELECT subject FROM homework_sessions WHERE id = $1', [sessionId]);
    const subject = sessionResult.rows[0]?.subject || 'general';

    // Get learning style
    let learningStyle = null;
    const styleResult = await pool.query('SELECT * FROM learning_style_profiles WHERE profile_id = $1', [profileId]);
    if (styleResult.rows.length > 0) learningStyle = styleResult.rows[0];

    // Build messages from history
    const existingMessages = question.messages || [];
    existingMessages.push({ role: 'user', content: message });

    const systemPrompt = buildHomeworkPrompt(profile, subject, question.question_text, learningStyle);
    const responseText = await chat(existingMessages, systemPrompt);

    // Parse response
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = { reply: responseText, questionComplete: false };
    }

    existingMessages.push({ role: 'assistant', content: responseText });

    // Update question messages
    await pool.query(
      'UPDATE homework_questions SET messages = $1 WHERE id = $2',
      [JSON.stringify(existingMessages), question.id]
    );

    // If question complete, store answer
    if (parsed.questionComplete && parsed.correctAnswer) {
      await pool.query(
        'UPDATE homework_questions SET correct_answer = $1 WHERE id = $2',
        [parsed.correctAnswer, question.id]
      );
    }

    res.json({
      success: true,
      data: {
        reply: parsed.reply,
        questionComplete: parsed.questionComplete || false,
        correctAnswer: parsed.questionComplete ? parsed.correctAnswer : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/verify — verify child's written answer
router.post('/verify', async (req, res, next) => {
  try {
    const { profileId, sessionId, questionIndex, image, mediaType } = req.body;

    if (!profileId || !sessionId || questionIndex === undefined || !image) {
      return res.status(400).json({ success: false, error: 'profileId, sessionId, questionIndex, and image required' });
    }

    // Get the question
    const questionResult = await pool.query(
      'SELECT * FROM homework_questions WHERE session_id = $1 AND question_number = $2',
      [sessionId, questionIndex]
    );
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    const question = questionResult.rows[0];

    if (!question.correct_answer) {
      return res.status(400).json({ success: false, error: 'Question not yet solved through chat' });
    }

    const verification = await verifyWrittenAnswer(
      image,
      mediaType || 'image/jpeg',
      question.question_text,
      question.correct_answer
    );

    const result = verification.isCorrect ? 'correct' : 'incorrect';
    const xpAmount = verification.isCorrect ? 20 : 10;

    // Update question
    await pool.query(
      `UPDATE homework_questions
       SET child_answer = $1, verification_result = $2, xp_earned = $3
       WHERE id = $4`,
      [verification.childAnswer, result, xpAmount, question.id]
    );

    // Award XP
    await awardXP(profileId, verification.isCorrect ? 'correct_first_try' : 'wrong_but_tried', null, null);

    // Update session counters
    await pool.query(
      `UPDATE homework_sessions
       SET questions_completed = questions_completed + 1,
           questions_correct = questions_correct + CASE WHEN $1 = 'correct' THEN 1 ELSE 0 END,
           total_xp_earned = total_xp_earned + $2
       WHERE id = $3`,
      [result, xpAmount, sessionId]
    );

    res.json({
      success: true,
      data: {
        match: verification.isCorrect,
        childAnswer: verification.childAnswer,
        hasWorking: verification.hasWorking,
        feedback: verification.feedback,
        xpEarned: xpAmount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/homework/complete — finalize session
router.post('/complete', async (req, res, next) => {
  try {
    const { profileId, sessionId } = req.body;

    if (!profileId || !sessionId) {
      return res.status(400).json({ success: false, error: 'profileId and sessionId required' });
    }

    // Mark session complete
    await pool.query(
      'UPDATE homework_sessions SET completed_at = NOW() WHERE id = $1',
      [sessionId]
    );

    // Get session data for tracking
    const session = await pool.query('SELECT * FROM homework_sessions WHERE id = $1', [sessionId]);
    if (session.rows.length > 0) {
      const s = session.rows[0];
      if (s.subject && s.topic) {
        await trackHomeworkTopic(profileId, s.subject, s.topic, s.questions_detected);
      }
    }

    // Evaluate badges
    const newBadges = await evaluateBadges(profileId);

    // Get summary
    const summary = await pool.query(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE verification_result = 'correct')::int as correct,
         SUM(xp_earned)::int as xp,
         SUM(time_spent_seconds)::int as time_seconds
       FROM homework_questions WHERE session_id = $1`,
      [sessionId]
    );

    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        newBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/homework/predictions/:profileId — test predictions
router.get('/predictions/:profileId', async (req, res, next) => {
  try {
    const predictions = await getTestPredictions(req.params.profileId);
    res.json({ success: true, data: predictions });
  } catch (err) {
    next(err);
  }
});

// GET /api/homework/sessions/:profileId — homework history
router.get('/sessions/:profileId', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM homework_sessions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.params.profileId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount in index.js**

Add import: `const homeworkRouter = require('./routes/homework');`
Add mount: `app.use('/api/homework', homeworkRouter);`

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/homework.js server/src/index.js
git commit -m "feat: add homework helper routes with analyze, chat, verify, predict"
```

---

### Task 4: Camera Capture Component

**Files:**
- Create: `client/src/components/HomeworkCamera.jsx`

- [ ] **Step 1: Create the camera component**

```jsx
// client/src/components/HomeworkCamera.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

export default function HomeworkCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError('Camera access denied. Please allow camera access.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
  }

  function confirm() {
    if (preview) {
      // Extract base64 data without the data URL prefix
      const base64 = preview.split(',')[1];
      onCapture(base64, 'image/jpeg');
    }
  }

  function retake() {
    setPreview(null);
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Camera size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-red-500 font-semibold text-sm mb-4">{error}</p>
        <button onClick={onClose} className="text-purple-600 font-bold text-sm underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="hidden" />

      {preview ? (
        <div>
          <img src={preview} alt="Captured homework" className="w-full rounded-2xl" />
          <div className="flex gap-3 mt-4">
            <motion.button
              onClick={retake}
              className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 font-bold text-gray-700 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw size={18} /> Retake
            </motion.button>
            <motion.button
              onClick={confirm}
              className="flex-1 py-3 rounded-xl gradient-bg text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              whileTap={{ scale: 0.97 }}
            >
              <Check size={18} /> Use Photo
            </motion.button>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <motion.button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500"
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
            <motion.button
              onClick={capture}
              className="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-purple-500 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera size={28} className="text-purple-600" />
            </motion.button>
            <motion.button
              onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500"
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/HomeworkCamera.jsx
git commit -m "feat: add HomeworkCamera component with capture, preview, retake"
```

---

### Task 5: Homework Page (Main UI)

**Files:**
- Create: `client/src/pages/HomeworkPage.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create HomeworkPage**

This is the largest component. It has 4 phases: input, question list, Socratic chat per question, verification.

```jsx
// client/src/pages/HomeworkPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Keyboard, Send, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import NuriOwl from '../components/NuriOwl';
import MicButton from '../components/MicButton';
import HomeworkCamera from '../components/HomeworkCamera';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { currentProfile, updateXP } = useProfile();

  // Phase: input | analyzing | questions | chat | verify | summary
  const [phase, setPhase] = useState('input');
  const [inputTab, setInputTab] = useState('upload'); // camera | upload | type
  const [typedText, setTypedText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionComplete, setQuestionComplete] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentProfile) navigate('/');
  }, [currentProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Input handlers ──

  async function handleImageCapture(base64, mediaType) {
    await analyzeInput(base64, mediaType, 'camera');
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const mediaType = file.type || 'image/jpeg';
      const sourceType = file.type === 'application/pdf' ? 'upload_pdf' : 'upload_image';
      await analyzeInput(base64, mediaType, sourceType);
    };
    reader.readAsDataURL(file);
  }

  async function handleTypedSubmit() {
    if (!typedText.trim()) return;
    setPhase('analyzing');
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/analyze', {
        method: 'POST',
        body: { profileId: pid, text: typedText.trim(), sourceType: 'typed' },
      });
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setSubject(data.subject);
      setPhase('questions');
    } catch {
      setPhase('input');
    }
  }

  async function analyzeInput(base64, mediaType, sourceType) {
    setPhase('analyzing');
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/analyze', {
        method: 'POST',
        body: { profileId: pid, image: base64, mediaType, sourceType },
      });
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setSubject(data.subject);
      setPhase('questions');
    } catch {
      setPhase('input');
    }
  }

  // ── Chat handlers ──

  function startQuestion(idx) {
    setCurrentQ(idx);
    setMessages([{
      text: `Let's work on question ${idx + 1}: "${questions[idx].text}"\n\nWhat do you think the first step is?`,
      isNuri: true,
    }]);
    setQuestionComplete(false);
    setCorrectAnswer(null);
    setVerifyResult(null);
    setPhase('chat');
  }

  async function sendChat(text) {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { text: text.trim(), isNuri: false }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/chat', {
        method: 'POST',
        body: { profileId: pid, sessionId, questionIndex: questions[currentQ].number, message: text.trim() },
      });
      setMessages(prev => [...prev, { text: data.reply, isNuri: true }]);
      if (data.questionComplete) {
        setQuestionComplete(true);
        setCorrectAnswer(data.correctAnswer);
      }
    } catch {
      setMessages(prev => [...prev, { text: "Oops, let me think again... Try rephrasing?", isNuri: true }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── Verify handlers ──

  async function handleVerifyCapture(base64, mediaType) {
    setIsLoading(true);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/verify', {
        method: 'POST',
        body: { profileId: pid, sessionId, questionIndex: questions[currentQ].number, image: base64, mediaType },
      });
      setVerifyResult(data);
      if (data.xpEarned) updateXP(data.xpEarned);
      // Mark question as done in local state
      setQuestions(prev => prev.map((q, i) =>
        i === currentQ ? { ...q, done: true, correct: data.match } : q
      ));
    } catch {
      setVerifyResult({ match: false, feedback: "Couldn't read your answer. Try again?" });
    } finally {
      setIsLoading(false);
    }
  }

  function nextQuestion() {
    const nextIdx = questions.findIndex((q, i) => i > currentQ && !q.done);
    if (nextIdx >= 0) {
      startQuestion(nextIdx);
    } else {
      completeSession();
    }
  }

  async function completeSession() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/complete', {
        method: 'POST',
        body: { profileId: pid, sessionId },
      });
      setSummaryData(data.summary);
      setPhase('summary');
    } catch {
      setPhase('questions');
    }
  }

  if (!currentProfile) return null;

  const pid = currentProfile._id || currentProfile.id;

  // ── RENDER ──
  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <motion.div
        className="px-4 py-3 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => phase === 'input' ? navigate('/home') : setPhase('input')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <NuriOwl size="sm" state={isLoading ? 'thinking' : 'idle'} level={currentProfile?.level || 1} />
        <div>
          <p className="font-bold text-gray-800 text-sm">Homework Helper</p>
          <p className="text-xs text-gray-500 font-semibold">Nuri helps you solve it</p>
        </div>
      </motion.div>

      {/* ── INPUT PHASE ── */}
      {phase === 'input' && (
        <div className="flex-1 p-4">
          <div className="flex gap-2 mb-6">
            {[
              { key: 'camera', icon: Camera, label: 'Camera' },
              { key: 'upload', icon: Upload, label: 'Upload' },
              { key: 'type', icon: Keyboard, label: 'Type' },
            ].map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setInputTab(key)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  inputTab === key ? 'gradient-bg text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={16} /> {label}
              </motion.button>
            ))}
          </div>

          {inputTab === 'camera' && (
            <HomeworkCamera onCapture={handleImageCapture} onClose={() => setInputTab('upload')} />
          )}

          {inputTab === 'upload' && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Upload size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-bold text-gray-700 mb-1">Upload homework photo or PDF</p>
              <p className="text-sm text-gray-400 mb-4">From your gallery, email, or files</p>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="gradient-bg text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                whileTap={{ scale: 0.97 }}
              >
                Choose File
              </motion.button>
            </motion.div>
          )}

          {inputTab === 'type' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type or paste your homework question here..."
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm font-semibold h-40 resize-none focus:outline-none focus:border-purple-400"
              />
              <motion.button
                onClick={handleTypedSubmit}
                disabled={!typedText.trim()}
                className="w-full mt-3 gradient-bg text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                Analyze Question
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {/* ── ANALYZING PHASE ── */}
      {phase === 'analyzing' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <NuriOwl size="lg" state="thinking" level={currentProfile?.level || 1} />
            <p className="text-lg font-extrabold text-gray-800 mt-4">Nuri is reading your homework...</p>
            <Loader2 size={24} className="mx-auto mt-3 text-purple-500 animate-spin" />
          </motion.div>
        </div>
      )}

      {/* ── QUESTIONS LIST PHASE ── */}
      {phase === 'questions' && (
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-4">
            <NuriOwl size="sm" state="excited" level={currentProfile?.level || 1} />
            <div>
              <p className="font-bold text-gray-800">I found {questions.length} question{questions.length !== 1 ? 's' : ''}!</p>
              <p className="text-xs text-gray-500 font-semibold capitalize">{subject}</p>
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((q, i) => (
              <motion.button
                key={i}
                onClick={() => !q.done && startQuestion(i)}
                className={`w-full bg-white rounded-xl p-4 shadow text-left flex items-start gap-3 ${q.done ? 'opacity-60' : 'hover:shadow-md'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={!q.done ? { scale: 0.98 } : {}}
              >
                {q.done ? (
                  <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${q.correct ? 'text-green-500' : 'text-orange-400'}`} />
                ) : (
                  <Circle size={20} className="shrink-0 mt-0.5 text-gray-300" />
                )}
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">Question {q.number}</p>
                  <p className="text-sm font-semibold text-gray-700">{q.text}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {questions.every(q => q.done) && (
            <motion.button
              onClick={completeSession}
              className="w-full mt-4 gradient-bg text-white font-bold py-4 rounded-xl shadow-lg text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
            >
              Finish Homework
            </motion.button>
          )}
        </div>
      )}

      {/* ── CHAT PHASE ── */}
      {phase === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg.text} isNuri={msg.isNuri} subjectColor="#A855F7" />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {questionComplete && !verifyResult && (
            <div className="px-4 pb-2">
              <motion.div
                className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-bold text-green-800 mb-2">Now write your answer on paper and show me!</p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setPhase('verify')}
                    className="flex-1 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Camera size={16} /> Show My Work
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      // Skip verification, mark as done
                      setQuestions(prev => prev.map((q, i) => i === currentQ ? { ...q, done: true, correct: true } : q));
                      nextQuestion();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm text-gray-500"
                    whileTap={{ scale: 0.97 }}
                  >
                    Skip
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {verifyResult && (
            <div className="px-4 pb-2">
              <motion.div
                className={`rounded-2xl p-4 text-center ${verifyResult.match ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className={`font-bold ${verifyResult.match ? 'text-green-800' : 'text-orange-800'}`}>
                  {verifyResult.feedback}
                </p>
                <p className="text-sm text-gray-500 mt-1">+{verifyResult.xpEarned || 0} XP</p>
                <motion.button
                  onClick={nextQuestion}
                  className="mt-3 gradient-bg text-white font-bold py-2.5 px-6 rounded-xl shadow-md"
                  whileTap={{ scale: 0.97 }}
                >
                  {questions.filter(q => !q.done).length > 1 ? 'Next Question' : 'Finish'}
                </motion.button>
              </motion.div>
            </div>
          )}

          {!questionComplete && (
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="flex gap-2 items-center">
                <MicButton onResult={(text) => sendChat(text)} lang="en-US" disabled={isLoading} size={44} />
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat(chatInput)}
                  placeholder="Type your answer..."
                  className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-400"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={() => sendChat(chatInput)}
                  disabled={!chatInput.trim() || isLoading}
                  className="w-12 h-12 rounded-2xl gradient-bg text-white flex items-center justify-center disabled:opacity-50 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── VERIFY PHASE (camera) ── */}
      {phase === 'verify' && (
        <div className="flex-1 p-4">
          <p className="font-bold text-gray-800 mb-4 text-center">Take a photo of your written answer</p>
          <HomeworkCamera
            onCapture={handleVerifyCapture}
            onClose={() => setPhase('chat')}
          />
          {isLoading && (
            <div className="text-center mt-4">
              <Loader2 size={24} className="mx-auto text-purple-500 animate-spin" />
              <p className="text-sm text-gray-500 font-semibold mt-2">Checking your work...</p>
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY PHASE ── */}
      {phase === 'summary' && summaryData && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div className="w-full text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <NuriOwl size="lg" state="celebrating" level={currentProfile?.level || 1} />
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">Homework Done!</h2>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-gray-800">{summaryData.total}</p>
                <p className="text-xs text-gray-500 font-semibold">Questions</p>
              </div>
              <div className="bg-green-50 rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-green-600">{summaryData.correct}</p>
                <p className="text-xs text-gray-500 font-semibold">Correct</p>
              </div>
              <div className="bg-purple-50 rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-purple-600">+{summaryData.xp || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">XP</p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/home')}
              className="mt-6 gradient-bg text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-lg"
              whileTap={{ scale: 0.98 }}
            >
              Back Home
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.jsx**

Add import: `import HomeworkPage from './pages/HomeworkPage';`
Add route: `<Route path="/homework" element={<HomeworkPage />} />`

- [ ] **Step 3: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/HomeworkPage.jsx client/src/App.jsx
git commit -m "feat: add Homework Helper page with camera, upload, chat, verify phases"
```

---

### Task 6: Test Prediction Card + HomePage/SubjectPage Integration

**Files:**
- Create: `client/src/components/TestPredictionCard.jsx`
- Modify: `client/src/pages/HomePage.jsx`
- Modify: `client/src/pages/SubjectPage.jsx`

- [ ] **Step 1: Create TestPredictionCard**

```jsx
// client/src/components/TestPredictionCard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

export default function TestPredictionCard({ profileId }) {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (profileId) {
      api(`/homework/predictions/${profileId}`)
        .then(setPredictions)
        .catch(() => setPredictions([]));
    }
  }, [profileId]);

  if (predictions.length === 0) return null;

  const top = predictions[0];

  return (
    <motion.button
      onClick={() => navigate(`/subject/${top.subject}`)}
      className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-left flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-amber-800 text-sm">Test coming soon?</p>
        <p className="text-xs text-amber-600 font-semibold">
          {top.topic} appeared {top.appearances} times in homework recently. Tap to practice!
        </p>
      </div>
      <BookOpen size={18} className="text-amber-400 shrink-0" />
    </motion.button>
  );
}
```

- [ ] **Step 2: Add Homework Help button + prediction card to HomePage**

In `client/src/pages/HomePage.jsx`:

1. Add imports: `import { Camera } from 'lucide-react';` and `import TestPredictionCard from '../components/TestPredictionCard';`

2. Add the Homework Help button at the VERY TOP of the Tools section (before Mystery Challenge):

```jsx
<motion.button
  onClick={() => navigate('/homework')}
  className="w-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl p-4 shadow-lg text-left flex items-center gap-4 cursor-pointer text-white"
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 shrink-0">
    <Camera size={24} />
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-bold">Homework Helper</p>
    <p className="text-sm opacity-80 font-semibold">Snap, upload, or type — Nuri helps you solve it!</p>
  </div>
</motion.button>
```

3. Add TestPredictionCard above the Tools section heading:

```jsx
<TestPredictionCard profileId={currentProfile._id || currentProfile.id} />
```

- [ ] **Step 3: Add Homework mode button to SubjectPage**

In `client/src/pages/SubjectPage.jsx`, in the mode buttons grid, change from `grid-cols-3` to `grid-cols-2 sm:grid-cols-4` and add a 4th button:

```jsx
<motion.button
  onClick={() => navigate('/homework')}
  className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow group"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  whileHover={{ y: -3 }}
  whileTap={{ scale: 0.97 }}
>
  <div
    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
    style={{ backgroundColor: `${meta.color}15` }}
  >
    <Camera size={24} style={{ color: meta.color }} />
  </div>
  <h3 className="text-sm font-extrabold text-gray-800">Help</h3>
  <p className="text-gray-400 text-xs font-semibold mt-0.5">Homework</p>
</motion.button>
```

Add `Camera` to the lucide-react imports if not already there.

- [ ] **Step 4: Build and verify**

Run: `cd client && npm run build`

- [ ] **Step 5: Commit**

```bash
git add client/src/components/TestPredictionCard.jsx client/src/pages/HomePage.jsx client/src/pages/SubjectPage.jsx
git commit -m "feat: add Homework Helper button, test prediction card on HomePage and SubjectPage"
```

---

### Task 7: Run Migration + Final Build + Deploy

- [ ] **Step 1: Run v5 migration on Supabase**

Use the Supabase MCP tool to apply the migration SQL (same DDL as migrate-v5.js).

- [ ] **Step 2: Full client build**

Run: `cd client && npm run build`

- [ ] **Step 3: Deploy**

Run: `vercel --prod`

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A && git commit -m "feat: Homework Helper complete — snap, solve, verify, predict"
```
