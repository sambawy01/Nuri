# StudyBuddy — Extended Features (Part 2: Features 11–20)

*Extends studybuddy-spec.md*

---

### Feature 11: Difficulty Dial 🎚️

Let the kid choose their own challenge level before a quiz. Gives them ownership and agency.

**Options:**
- 🟢 **Easy** — Questions from 1 year below their level. Confidence builders.
- 🟡 **Medium** — Questions at their year level (default).
- 🔴 **Hard** — Questions from 1 year above their level. Stretch challenges.
- ⚫ **Challenge Me** — Nuri picks the hardest questions from their year + one year above. Timed. For kids who want to prove themselves.

**XP Scaling:**

| Difficulty | Correct XP | Streak Bonus |
|-----------|-----------|-------------|
| Easy | +5 XP | +10 at 5-streak |
| Medium | +10 XP | +25 at 5-streak |
| Hard | +15 XP | +40 at 5-streak |
| Challenge Me | +20 XP | +60 at 5-streak |

**Adaptive Suggestion:** If the child picks Easy and gets 10/10, Nuri says: "That was too easy for you! Want to try Medium? I think you're ready! 💪"
If they pick Hard and get 3/10: "No shame! Let's go back to Medium and build up. You'll get there! 🌟"

**Badge:** "Fearless" — Completed 10 quizzes on Challenge Me difficulty.

---

### Feature 12: Pre-Test Predictor 📅

Before a school test, the child tells Nuri what's coming. Nuri creates a personalized countdown study plan.

**Input Flow:**
1. Child taps "I have a test coming up! 📝"
2. Enters: Subject, Topic(s), Date
3. Nuri calculates days remaining and creates a plan

**Generated Study Plan Example:**
```
📝 Science Test: Forces & Magnets
📅 Thursday, April 3rd (4 days away)

Day 1 (Monday): Review — Gravity & Friction
  └ Learn Mode: 15 min
  └ Review mistakes in Forces: 3 items

Day 2 (Tuesday): Practice — Magnets & Poles
  └ Learn Mode: 10 min
  └ Quiz: 10 questions on magnets

Day 3 (Wednesday): Full Review + Weak Spots
  └ Review all mistakes from this topic
  └ Explain It Back: 2 concepts
  └ Mock Test: 15 mixed questions

Day 4 (Thursday — Test Day!): Quick Confidence Boost
  └ 5-minute rapid review of key terms
  └ Nuri pep talk: "You've prepared well. You've got this! 🌟"
```

**Features:**
- Push notification reminders: "Day 2 of your test prep! Time to practice magnets 🧲"
- Progress tracking: checkmarks as each day's plan is completed
- Auto-includes Mistake Journal items for that topic
- Adapts if they miss a day (redistributes to remaining days)
- Post-test: "How did it go?" → child rates 1-5 → Nuri responds encouragingly

**Multi-Test Support:** Can have multiple test countdowns running simultaneously. Dashboard shows all upcoming tests sorted by date.

---

## CATEGORY C: Making It Social and Fun

---

### Feature 13: Study Duels ⚔️

Two kids compete head-to-head on the same questions. Works for siblings, classmates, or async challenges.

**Live Duel (same room/time):**
1. Kid A creates a duel → picks subject → gets a 4-digit room code
2. Kid B enters the code on their device
3. Both see the same question simultaneously
4. First to answer correctly wins the round
5. Best of 5 rounds
6. Winner gets +50 XP, loser gets +20 XP (everyone wins something)

**Async Challenge (send and wait):**
1. Kid A creates a 5-question challenge in any subject
2. Shares a link/code with Kid B
3. Kid B answers whenever they can
4. Both see compared results: who got more right, who was faster
5. Can add a voice message: "Bet you can't beat my score! 😎"

**Fairness System:**
- If kids are in different year groups, questions adjust to each kid's level
- Year 3 kid gets a Year 3 question, Year 6 kid gets a Year 6 question, same topic
- Both questions are equivalent difficulty relative to their curriculum

**Duel Stats:**
- Win/loss record per opponent
- Most dueled subject
- Longest win streak
- "Duel Champion" badge at 10 wins
- "Friendly Rival" badge after 20 duels with the same person

---

### Feature 14: Teach a Friend Mode 👩‍🏫

Kid becomes the teacher. They pick a topic they know well and create a mini-lesson for a friend.

**Flow:**
1. Child selects "Teach a Friend" from a mastered topic (green mastery bar)
2. Nuri helps them structure a mini-lesson:
   - "What's the most important thing about this topic?"
   - "Can you think of a good example?"
   - "What question would you ask to check if someone understood?"
3. The child writes/speaks their explanation + creates 3 quiz questions
4. AI reviews for accuracy — flags anything incorrect
5. Packaged as a shareable mini-lesson with a link/code
6. Friend opens it → reads the lesson → takes the 3-question quiz
7. Results sent back to the "teacher": "Sara got 3/3 on your lesson! 🎉"

**Why This Works:** Teaching is the highest form of learning (Bloom's taxonomy). Forces deep understanding. Also builds confidence.

**Gamification:**
- "Teacher in Training" badge: created 5 lessons
- "Professor" badge: created 20 lessons
- "Inspiring Teacher" badge: a friend scored 100% on your lesson
- +30 XP for creating a lesson, +10 XP when someone completes it

---

### Feature 15: Parent Highlights 📬

Not a full dashboard — a simple daily summary notification/message for parents.

**Daily "Nuri's Note to Parents":**
```
🦉 Nuri's Note — March 30, 2026

Today Carla studied for 18 minutes:
• Maths: Fractions quiz — 8/10 ✅
• Science: Learn Mode — The Water Cycle

💡 She's struggling with: equivalent fractions
🌟 She's strong at: times tables, plant biology

Tip: Practice fractions with pizza slices at dinner! 🍕

Streak: 🔥 12 days
```

**Delivery:** Push notification to parent's phone, or email, or WhatsApp message (configurable).

**Weekly Summary (every Sunday):**
```
🦉 Nuri's Weekly Report — Week of March 24

Total study time: 1hr 42min
Subjects covered: 5 of 6 (skipped History this week)
Questions answered: 87 (71% correct)
XP earned: 340 | Level: 7 → 8 🎉
Streak: 🔥 12 days

Top subject: Science (89% accuracy)
Needs work: Arabic (52% accuracy)
Mistakes resolved: 9 of 14

Recommendation: Encourage 10 min of Arabic this week!
```

**Privacy:** Only sent to verified parent account. Child can't see the parent report (so they don't feel surveilled). Parent sets up with a PIN during onboarding.

---

### Feature 16: Voice Notes from Nuri 🔊

Morning push notifications with a 10-second audio message from Nuri. Curiosity hooks that pull kids back.

**Example Messages:**
- "Good morning! Did you know octopuses have THREE hearts? Come learn more in Science! 🐙"
- "Hey {name}! I found a really cool riddle for you today. Open the app to hear it! 🧩"
- "Your streak is at 7 days! Don't break it now — just one quick quiz! 🔥"
- "Fun fact: the word 'algebra' comes from Arabic! الجبر — al-jabr. Come practice! ✨"
- "I learned a new joke! Why did the fraction go to the doctor? Because it was feeling improper! 😂"

**Timing:** Default 7:30am (before school). Configurable by parent.

**Generation:** AI generates unique messages daily based on:
- Child's current subjects and topics
- Their streak status
- Unfinished Story Mode chapters
- Upcoming test prep (if any)
- Random fun facts from their curriculum

**TTS:** Generated text → spoken by the selected Nuri voice → delivered as audio notification.

**Opt-out:** Parent can disable in settings. Child can mute.

---

## CATEGORY D: Making the AI Smarter

---

### Feature 17: Learning Style Detection 🔍

Track HOW the child learns best. Over time, Nuri adapts teaching to their preferred learning style.

**What Gets Tracked:**

| Signal | Measured By |
|--------|------------|
| Visual learner | Higher accuracy after diagram/image-based explanations |
| Verbal/reading learner | Higher accuracy after text explanations |
| Auditory learner | Higher accuracy when TTS is used |
| Example-first learner | Higher accuracy when "Give Example" is tapped before explanation |
| Try-first learner | Higher accuracy when they attempt a question before being taught |
| Analogy learner | Higher accuracy after real-world analogy explanations |

**Detection Method:**
- Track accuracy after different explanation types over 50+ interactions
- Build a simple preference profile: `{ visual: 0.7, analogy: 0.9, example_first: 0.8, auditory: 0.6 }`
- Profile updates continuously as more data is collected

**Adaptation:**
- System prompt includes: "This child learns best with {top_styles}. Prioritize {style1} and {style2} in your explanations."
- Nuri adjusts automatically:
  - High visual score → more "imagine this picture..." descriptions
  - High analogy score → more "it's like when you..." comparisons
  - High try-first score → quiz question BEFORE explanation
  - High auditory score → auto-enable TTS for all explanations

**Transparency (optional):**
- In Profile: "Nuri's Notes About Your Learning: I've noticed you learn best when I give you real-world examples! 🧠"
- Child can see their style profile as a fun radar chart

---

### Feature 18: Cross-Subject Connections 🔗

When teaching one subject, Nuri points out connections to other subjects. Builds holistic understanding.

**How It Works:**
- AI has a connection map between curriculum topics across subjects
- When explaining Topic A, if a link exists to Topic B in another subject, Nuri mentions it

**Example Connections:**

| Studying This | Nuri Says | Links To |
|---------------|-----------|----------|
| Fractions (Maths) | "By the way, in Arabic the word for fraction is كسر (kasr)!" | Arabic |
| Water Cycle (Science) | "Remember in History when we learned about the Nile? The water cycle is why it floods!" | History |
| Nouns (English) | "In Arabic grammar, nouns work differently — المبتدأ والخبر. Want to compare?" | Arabic |
| Ancient Egypt (History) | "The Egyptians used early chemistry to mummify bodies! That's Science crossover 🔬" | Science |
| Creation story (Religion) | "Scientists study how the universe began too — in Science you'll learn about the Big Bang" | Science |
| Measuring (Maths) | "In Science lab, you'll use these exact same units — ml, cm, g" | Science |
| Adjectives (English) | "In Arabic, adjectives come AFTER the noun, not before! Opposite to English 🤯" | Arabic |
| Roman numerals (Maths) | "You'll see these in History — Roman Empire used them for everything!" | History |

**Implementation:**
- Curated connection map stored in database (200+ connections across Years 1-6)
- System prompt includes: "When relevant, mention connections to other subjects the child is studying"
- Connections only trigger if the child has studied (or will study) the linked topic

**Gamification:** "Connector" badge — discovered 20 cross-subject connections. "Big Picture Thinker" badge — connections found across all 6 subjects.

---

### Feature 19: Confidence Meter 📊

After each answer, optional quick self-assessment. Tracks not just right/wrong but HOW SURE they were.

**UI:** After answering, subtle prompt appears:
```
How sure were you?
😬 Guessed  |  🤔 Unsure  |  😊 Pretty sure  |  💪 Knew it
```

**Tracking Matrix:**

| | Correct | Wrong |
|---|---------|-------|
| 💪 Knew it | True mastery ✅ | Dangerous blind spot ⚠️ |
| 😊 Pretty sure | Strong knowledge | Normal mistake |
| 🤔 Unsure | Lucky guess — needs review | Expected — needs teaching |
| 😬 Guessed | Lucky guess — needs review | Expected — needs teaching |

**How It's Used:**
- **Dangerous blind spots** (confident + wrong) → highest priority for re-teaching. Nuri: "Hmm, you were sure about that one but the answer was actually... Let's make sure we clear this up! 🔍"
- **Lucky guesses** (unsure + right) → still enters spaced repetition. Not truly learned yet.
- **True mastery** (confident + right) → moves through spaced repetition faster
- **Expected mistakes** (unsure + wrong) → normal teaching flow

**Insight for the child:** "You got 8/10 this quiz, but your confidence says you only TRULY knew 5 of them. Let's solidify the other 3!"

**Optional:** Can be turned off if the child finds it annoying. Nuri asks once: "Want me to keep asking how sure you are? It helps me teach you better!"

---

### Feature 20: Exam Pattern Recognition 📝

Feed in past exam papers. Nuri learns what types of questions actually appear and weights practice accordingly.

**How It Works:**
1. Parent or child uploads past Cambridge/Egyptian exam papers (Snap & Learn camera or PDF upload)
2. AI analyzes: question types, topic frequency, marks distribution, command words used
3. Builds an "exam profile" for each subject/year

**Analysis Output Example:**
```
Year 6 Maths — Cambridge End-of-Year Pattern:

Topic Frequency:
  Fractions/Decimals/Percentages: 28% of marks
  Algebra: 18% of marks
  Geometry: 15% of marks
  Statistics: 12% of marks
  Ratio: 10% of marks
  Other: 17%

Question Types:
  Multiple choice: 20%
  Short calculation: 40%
  Word problems: 25%
  Explain/reason: 15%

Common Command Words:
  "Calculate", "Show your working", "Explain why",
  "Estimate", "Write as a fraction"
```

**Impact on Quiz Mode:**
- Quiz questions now mirror real exam frequency and format
- 28% of maths quiz questions are about fractions (matching exam weight)
- Questions use the same command words as real exams
- "Exam Practice" mode: generates a full mock exam matching the real format and timing

**Exam Countdown Integration:**
- Combined with Pre-Test Predictor (Feature 12)
- Study plan prioritizes high-frequency exam topics
- Mock exam 2 days before the real test

**Nuri's Exam Tips:**
- "This type of question appears A LOT in exams — let's practice extra! 📝"
- "Exams love asking 'explain why' questions. Let's practice explaining your reasoning!"
- "Based on past papers, I'd focus on fractions and algebra — they're worth the most marks!"

---

## Feature Priority Matrix (UPDATED)

Homework Helper with voice conversation is now the #1 priority — it's the killer feature.

### Phase 1 (Core + Voice — Week 1-2):
**The foundation everything else depends on.**
- Core app: profiles, subject selection, home dashboard
- Voice system: TTS (Nuri speaks) + STT (child speaks) in English and Arabic
- Nuri SVG mascot with basic animations (idle, talking, celebrating)
- 📸 Snap & Learn: camera capture + AI image analysis
- 📝 **Homework Helper (voice-first Socratic tutor)** — THE killer feature
- Learn Mode with interactive teaching loop (voice-enabled)
- Quiz Mode with basic question generation

### Phase 2 (Smart Learning Engine — Week 3-4):
**Make the AI genuinely better at teaching.**
- Feature 7: Spaced Repetition Engine
- Feature 8: Mistake Journal
- Feature 9: Explain It Back
- Feature 11: Difficulty Dial
- Feature 17: Learning Style Detection
- Feature 19: Confidence Meter

### Phase 3 (Gamification — Week 5-6):
**Make kids want to come back every day.**
- Full XP/Level/Streak system
- Feature 1: Daily Mystery Challenge
- Feature 3: Achievement Badges Wall
- Feature 5: Collectible Nuri Stickers
- Nuri evolution visuals (scarf → stars → glasses → golden wings → cosmic)

### Phase 4 (Engagement Features — Week 7-8):
**Deepen the experience.**
- Feature 6: Story Mode — The 7 Lost Books of Knowledge
- Feature 2: Nuri's World (virtual treehouse)
- Feature 10: Mind Maps
- Feature 12: Pre-Test Predictor
- Feature 18: Cross-Subject Connections

### Phase 5 (Social + Parents — Week 9-10):
**Bring in classmates and family.**
- Feature 13: Study Duels
- Feature 14: Teach a Friend Mode
- Feature 15: Parent Highlights (daily/weekly reports)
- Feature 4: Weekly Class Leaderboard
- Feature 16: Voice Notes from Nuri (push notifications)
- Feature 20: Exam Pattern Recognition

---

## Updated Database Schema Additions

```sql
-- Spaced repetition
CREATE TABLE review_items (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT,
  topic TEXT,
  question_text TEXT,
  correct_answer TEXT,
  memory_score INT DEFAULT 0,
  next_review_date DATE,
  times_reviewed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mistake journal
CREATE TABLE mistakes (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT,
  topic TEXT,
  question_text TEXT,
  child_answer TEXT,
  correct_answer TEXT,
  explanation TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  badge_key TEXT UNIQUE,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Nuri's World items
CREATE TABLE room_items (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  item_key TEXT,
  position_slot INT,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Study duels
CREATE TABLE duels (
  id SERIAL PRIMARY KEY,
  room_code TEXT UNIQUE,
  player_a INT REFERENCES profiles(id),
  player_b INT REFERENCES profiles(id),
  subject TEXT,
  status TEXT DEFAULT 'waiting',
  winner_id INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test prep
CREATE TABLE test_prep (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT,
  topics TEXT[],
  test_date DATE,
  study_plan JSONB,
  days_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Confidence tracking
CREATE TABLE confidence_logs (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  question_id INT,
  was_correct BOOLEAN,
  confidence_level TEXT, -- guessed, unsure, pretty_sure, knew_it
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning style
CREATE TABLE learning_profiles (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) UNIQUE,
  visual_score FLOAT DEFAULT 0.5,
  analogy_score FLOAT DEFAULT 0.5,
  example_first_score FLOAT DEFAULT 0.5,
  auditory_score FLOAT DEFAULT 0.5,
  try_first_score FLOAT DEFAULT 0.5,
  interactions_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sticker collection
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  sticker_key TEXT,
  rarity TEXT,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Story mode progress
CREATE TABLE story_progress (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  chapter INT,
  stage INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP
);

-- Exam patterns
CREATE TABLE exam_patterns (
  id SERIAL PRIMARY KEY,
  year_group INT,
  subject TEXT,
  topic_weights JSONB,
  question_types JSONB,
  command_words TEXT[],
  source_paper TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Homework sessions
CREATE TABLE homework_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT,
  topic TEXT,
  image_url TEXT,
  total_questions INT,
  questions_completed INT DEFAULT 0,
  questions_skipped INT DEFAULT 0,
  hints_used INT DEFAULT 0,
  independent_solves INT DEFAULT 0,
  duration_seconds INT,
  conversation_log JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Per-question tracking within homework sessions
CREATE TABLE homework_questions (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES homework_sessions(id),
  question_number INT,
  question_text TEXT,
  status TEXT DEFAULT 'pending', -- pending, solved, skipped
  hints_used INT DEFAULT 0,
  escalation_level_reached INT DEFAULT 0,
  transfer_check_passed BOOLEAN,
  explain_back_passed BOOLEAN,
  time_spent_seconds INT,
  concepts_struggled TEXT[],
  completed_at TIMESTAMP
);

-- Voice conversation logs (for learning style detection)
CREATE TABLE voice_logs (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  session_type TEXT, -- homework, learn, quiz
  session_id INT,
  total_child_speech_seconds INT,
  total_nuri_speech_seconds INT,
  language TEXT, -- en, ar
  stt_confidence_avg FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

*Complete feature set: 20 features + Homework Helper (voice-first Socratic tutor)*
*5 spec documents total:*
*1. studybuddy-spec.md — Core app, curriculum, architecture*
*2. studybuddy-snap-and-learn-spec.md — Camera + explain/quiz*
*3. studybuddy-features-part1.md — Features 1–10*
*4. studybuddy-features-part2.md — Features 11–20 + DB schema + build phases*
*5. studybuddy-homework-helper-spec.md — Voice homework tutor (killer feature)*
*+ nuri-character-prompts.md — Gemini prompts for Nuri art*
