# Snap & Learn + Homework Helper — Design Spec

**Goal:** Let children photograph, upload, or type homework questions. Nuri guides them through solving each one using Socratic dialogue — never giving the answer directly. Child writes answers on paper and snaps for verification. Sessions are recorded and used to predict upcoming tests.

---

## 1. Input Methods

Four ways to get homework into Nuri:

| Method | UI | Implementation |
|--------|-----|----------------|
| Camera snap | Live camera viewfinder, tap to capture | `navigator.mediaDevices.getUserMedia` + canvas capture |
| Upload photo | "Upload" button, opens file picker (image/*) | `<input type="file" accept="image/*">` |
| Upload file | Same picker, accepts PDF | `<input type="file" accept="image/*,.pdf">` |
| Type manually | Text input field | Plain text, no vision needed |

All image/PDF inputs get sent to Claude Vision for question extraction.

---

## 2. Homework Session Flow

### Step 1: Upload
- Child taps "Homework Help" on HomePage
- Chooses input method
- For images/PDFs: sent to `POST /api/homework/analyze`
- For typed: sent directly as text

### Step 2: Question Extraction
- Claude Vision analyzes the image/PDF
- Extracts individual questions as a numbered list
- Returns: subject (auto-detected), topic (auto-detected), array of question objects
- Nuri says: "I can see 5 questions! Let's work through them together. Ready for question 1?"

### Step 3: Socratic Guided Solving (per question)
- Nuri does NOT show or give the answer
- Uses the Socratic Teaching Engine approach:
  1. "What do you think the first step is?"
  2. Guides with hints if stuck: "What if we tried..."
  3. If child gives wrong reasoning, asks a revealing question
  4. Celebrates when child arrives at the answer themselves
- Multiple explanation approaches if stuck (analogy, visual, step-by-step, story)
- Adapts to child's learning style (from learning_style_profiles)
- Child can speak answers via mic or type

### Step 4: Write & Verify
- After solving each question through dialogue, Nuri says: "Great work! Now write your answer neatly on paper. When you're done, show me!"
- Child photographs their written answer
- Claude Vision checks:
  - Is the answer written? (not blank)
  - Does it match the correct answer?
  - Is the working shown (for maths)?
- Nuri responds: "Perfect! Your answer matches. Let's move to question 2!" or "Hmm, I see you wrote X but we worked out Y. Want to try writing it again?"

### Step 5: Session Complete
- Summary screen: questions completed, accuracy, time spent, XP earned
- Nuri's encouragement based on performance
- +20 XP per question solved correctly, +10 for attempted
- Badge triggers: homework completion counts

---

## 3. Database Schema

### `homework_sessions` table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| profile_id | INT FK → profiles | |
| subject | VARCHAR(50) | Auto-detected or manually set |
| topic | VARCHAR(100) | Auto-detected |
| source_type | VARCHAR(20) | 'camera', 'upload_image', 'upload_pdf', 'typed' |
| source_image_url | TEXT | Original image/file (base64 or stored path) |
| questions_detected | INT | Number of questions found |
| questions_completed | INT | Number completed in session |
| questions_correct | INT | Number verified correct |
| total_xp_earned | INT | |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| created_at | TIMESTAMP DEFAULT NOW() | |

### `homework_questions` table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| session_id | INT FK → homework_sessions | |
| question_number | INT | Order within session |
| question_text | TEXT | Extracted question |
| correct_answer | TEXT | The answer Nuri guided toward |
| child_answer | TEXT | What child wrote |
| verification_result | VARCHAR(20) | 'correct', 'incorrect', 'partial', 'skipped' |
| error_type | VARCHAR(30) | From Socratic engine classification |
| messages | JSONB | Full conversation for this question |
| time_spent_seconds | INT | |
| xp_earned | INT | |
| created_at | TIMESTAMP DEFAULT NOW() | |

### `homework_topics_tracker` table (for test prediction)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| profile_id | INT FK → profiles | |
| subject | VARCHAR(50) | |
| topic | VARCHAR(100) | |
| homework_date | DATE | |
| question_count | INT | How many questions on this topic |
| created_at | TIMESTAMP DEFAULT NOW() | |

---

## 4. Test Prediction Logic

After each homework session, update `homework_topics_tracker`. Then:

```
For each profile + subject:
  Get topics with 3+ homework appearances in the last 14 days
  If any found:
    → Flag as "likely upcoming test"
    → Show on HomePage: "Your teacher has been focusing on [topic]. A test might be coming!"
    → Auto-suggest a study plan (quiz + review of that topic)
```

Prediction shown on:
- HomePage — alert card below Mystery Challenge
- Subject page — banner on the predicted topic
- Nuri greeting — "I noticed you've had lots of fractions homework lately. Want to do some practice?"

---

## 5. Server Endpoints

### `POST /api/homework/analyze`
- Body: `{ profileId, image: base64, fileType: 'image'|'pdf' }`
- Sends to Claude Vision (claude-haiku-4-5 for speed)
- Returns: `{ subject, topic, questions: [{text, type}], sessionId }`
- Creates homework_session record

### `POST /api/homework/chat`
- Body: `{ profileId, sessionId, questionIndex, message }`
- Continues Socratic conversation for a specific question
- Uses Socratic engine prompt with error classification
- Returns: `{ reply, hint, questionComplete, correctAnswer (only when done) }`

### `POST /api/homework/verify`
- Body: `{ profileId, sessionId, questionIndex, image: base64 }`
- Sends child's written answer photo to Claude Vision
- Compares against expected answer
- Returns: `{ match: true|false, feedback, childAnswer (extracted) }`

### `POST /api/homework/complete`
- Body: `{ profileId, sessionId }`
- Finalizes session, calculates XP, triggers badge evaluation
- Updates homework_topics_tracker for test prediction
- Returns: summary stats

### `GET /api/homework/predictions/:profileId`
- Returns topics with 3+ homework appearances in 14 days
- Used by HomePage and SubjectPage for alerts

---

## 6. Client Components

### `HomeworkPage.jsx` — Main page at `/homework`
- Tab bar: Camera | Upload | Type
- Camera tab: live viewfinder with capture button
- Upload tab: drag-drop zone + file picker
- Type tab: textarea
- After analysis: question list with progress indicator
- Per-question: chat interface (reuses ChatBubble, MicButton)
- Verification step: camera snap of written work

### `HomeworkCamera.jsx` — Camera capture component
- Uses `getUserMedia` with rear camera preference
- Flash toggle, capture button
- Preview with retake/confirm
- Returns base64 image

### `TestPredictionCard.jsx` — Alert card for HomePage
- Shows when predictions exist
- "Your teacher seems to be testing [topic] soon. Want to prepare?"
- Tap → navigates to quiz/learn for that topic

### Navigation
- HomePage: "Homework Help" button in tools section (prominent, above Mystery Challenge)
- SubjectPage: "Homework" mode button alongside Learn/Quiz/Teach
- App.jsx: `/homework` and `/homework/:sessionId` routes

---

## 7. Socratic Engine Prompt

The homework chat uses a specialized system prompt that:
1. Receives the extracted question as context
2. Never reveals the answer
3. Asks "What do you think the first step is?"
4. Classifies errors in child's reasoning
5. Uses multiple explanation approaches
6. Celebrates when child arrives at the answer
7. Incorporates child's learning style from profile
8. For maths: insists on seeing working, not just final answer
9. For English/Arabic: focuses on grammar rules and patterns
10. For Science: connects to real-world observations

---

## 8. Architecture Summary

### New Files
- `server/src/db/migrate-v5.js` — homework_sessions, homework_questions, homework_topics_tracker
- `server/src/routes/homework.js` — all homework endpoints
- `server/src/services/homework.js` — question extraction, verification, test prediction
- `client/src/pages/HomeworkPage.jsx` — main homework page
- `client/src/components/HomeworkCamera.jsx` — camera capture
- `client/src/components/TestPredictionCard.jsx` — prediction alert

### Modified Files
- `server/src/db/schema.sql` — new tables
- `server/src/index.js` — mount homework route
- `server/src/services/claude.js` — add Vision API calls for image analysis
- `client/src/pages/HomePage.jsx` — Homework Help button + prediction card
- `client/src/pages/SubjectPage.jsx` — Homework mode button
- `client/src/App.jsx` — homework routes
