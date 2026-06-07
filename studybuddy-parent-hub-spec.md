# StudyBuddy — Nuri Parent Hub Specification
## AI-Powered Parent Interface (Beyond Twinkl)

**Version:** 1.0
**Extends:** studybuddy-spec.md (Section 15: Parent Highlights → replaced by Parent Hub)
**Date:** March 31, 2026

---

## 1. Product Vision

The Parent Hub is Nuri's parent-facing interface — a companion app/section that gives parents superpowers to support their child's learning. Unlike Twinkl (which sells static, one-size-fits-all worksheets), Nuri's Parent Hub generates **personalized, AI-powered resources** based on each child's actual performance, curriculum, year level, and weak spots.

**The headline:** "Twinkl gives every Year 3 student the same fractions worksheet. Nuri gives YOUR child a worksheet focused on the exact fractions they got wrong last week."

---

## 2. Core Philosophy

- Parents want to help but often don't know HOW or WHERE their child is struggling
- Parents shouldn't need to be teachers — Nuri does the heavy lifting
- Every resource is personalized to THIS child, not generic
- Arabic + English bilingual resources generated on demand — no other platform does this
- Parents feel informed, not surveilled; children feel supported, not watched
- Printable resources complement (not replace) screen-based learning

---

## 3. Parent Hub Features

### 3.1 Smart Dashboard (Daily Overview)

The landing page parents see when they open the Parent Hub.

**What's Displayed:**

```
┌─────────────────────────────────────────────┐
│ 🦉 Nuri's Note — March 31, 2026            │
│                                              │
│ Today Carla studied for 18 minutes:          │
│ • Maths: Fractions quiz — 8/10 ✅           │
│ • Science: Learn Mode — The Water Cycle      │
│                                              │
│ 💡 Struggling with: equivalent fractions     │
│ 🌟 Strong at: times tables, plant biology    │
│                                              │
│ Streak: 🔥 12 days | Level: 8 | XP: 2,340   │
│                                              │
│ [Generate Practice Sheet] [This Week's Plan] │
└─────────────────────────────────────────────┘
```

**Data Sources:**
- Quiz results (accuracy per topic)
- Learn Mode sessions (topics covered, check-in results)
- Mistake Journal (unresolved mistakes)
- Spaced Repetition queue (what's due for review)
- Confidence Meter data (blind spots: confident + wrong)
- Error Pattern Detection (conceptual vs procedural vs calculation errors)

**Nuri's Daily Tip:**
AI-generated, specific to the child's current learning. Examples:
- "Carla keeps adding numerators AND denominators when adding fractions. Try using pizza slices at dinner to show why different-sized pieces can't just be counted together! 🍕"
- "Youssef reads Arabic letters well but struggles with tanween endings. Practice pointing out -an/-in/-un sounds when reading Arabic signs or menus together!"

---

### 3.2 AI Worksheet Generator 📝

**The killer feature.** Parents tap a button and get a printable worksheet personalized to their child.

**How It Works:**

1. Parent opens Parent Hub → taps "Generate Worksheet"
2. Chooses subject (or accepts Nuri's recommendation)
3. Options appear:

```
Subject: Maths
Topic: [Auto-suggested: Equivalent Fractions — your child needs practice]
       [Or pick from: Times Tables, Addition, Shapes, Measurement...]

Difficulty:
  ○ Confidence Builder (slightly below their level)
  ● At Their Level (default)
  ○ Challenge (slightly above)

Number of Questions: [10] [15] [20]

Include:
  ☑ Answer key (separate page)
  ☑ Worked examples at the top
  ☐ Hints alongside questions
  ☑ Fun illustrations
```

4. Nuri generates the worksheet via Claude API
5. Output: Beautifully formatted PDF with:
   - Child's name at the top ("Carla's Maths Practice")
   - Nuri mascot illustrations
   - Questions targeted at their specific weak areas
   - Answer key on a separate page
   - "How did I do?" self-assessment section at the bottom

**Generation Logic:**

```
System prompt includes:
- Child's year level
- Child's placement assessment results
- Last 20 quiz results for this topic
- Specific error patterns detected
- Mistake Journal entries for this topic

Example: If error pattern = "conceptual: adding denominators"
→ Generate questions that specifically require finding common denominators
→ Include 2 worked examples showing WHY you can't add denominators
→ Progress from simple (same denominator) to complex (different denominators)
→ Include a "spot the mistake" question where the mistake matches their error pattern
```

**PDF Output Styling:**
- A4 and US Letter size options
- Nuri branding: owl mascot, orange-purple gradient header
- Clear, child-friendly font (Nunito)
- For Arabic worksheets: RTL layout, Noto Naskh Arabic font, proper tashkeel
- Bilingual worksheets available: Arabic on right side, English scaffolding on left

**Technical Implementation:**
- Claude API generates the content (questions, examples, answers)
- ReportLab (Python) or react-pdf renders the PDF
- Cached templates for common layouts (maths grid, reading comprehension, Arabic practice)
- Generated PDFs stored temporarily (7 days) for re-download

---

### 3.3 Bilingual Arabic + English Resources 🌍

**What makes this unique:** No competitor generates bilingual Arabic/English educational resources dynamically.

**Resource Types:**

| Resource | Description | Example |
|----------|-------------|---------|
| **Arabic Vocabulary Cards** | Flashcard-style printables with Arabic word + transliteration + English + image | كِتَاب — kitaab — book — [book image] |
| **Arabic Reading Passages** | Short passages at the child's Arabic level with comprehension questions in English | Year 3 Arabic passage with "What happened?" questions in English |
| **Bilingual Worksheets** | Side-by-side Arabic/English for any subject | Maths word problems: Arabic on right, English on left |
| **Tashkeel Practice Sheets** | Arabic words without vowel marks — child adds them | حركات practice matching the child's year level |
| **Grammar Worksheets** | المبتدأ والخبر, إعراب etc. with English explanations | Arabic grammar at their ACTUAL level (not school year) |
| **Religion Study Sheets** | Key terms, prayers, Bible passages in Arabic + English | القيامة — al-Qiyama — Resurrection + context |

**Smart Arabic Level Handling:**
- Uses Placement Assessment data: child might be Year 6 in school but Year 3 in Arabic
- All Arabic resources generated at their ACTUAL Arabic level, not school year
- English scaffolding adjusts: more English support for weaker Arabic readers
- Tashkeel (vowel marks) included for Years 1-3, gradually removed for Years 4+
- Transliteration included for Years 1-4, optional for Years 5-6

---

### 3.4 Smart Weekly Practice Plan 📅

Every Sunday, Nuri auto-generates a personalized weekly practice plan based on the child's data.

**What Gets Analyzed:**
- Quiz performance over the past 2 weeks
- Topics due for spaced repetition review
- Mistake Journal unresolved items
- Confidence Meter blind spots (confident but wrong)
- Upcoming test prep (if any Pre-Test Predictor is active)
- Subject balance (did they skip any subject last week?)

**Generated Plan Example:**

```
🦉 Carla's Week — March 31 to April 6

📊 Last Week: Studied 5/6 subjects (skipped History)
              72% quiz accuracy (target: 80%)
              9 unresolved mistakes

This Week's Focus:
─────────────────
Monday:    Maths — Equivalent Fractions (review mistakes)
           📝 [Download Practice Sheet: 15 questions]

Tuesday:   Arabic — Sun & Moon Letters (spaced repetition due)
           📝 [Download Vocabulary Cards: 20 words]

Wednesday: Science — Water Cycle (new topic from class)
           💡 Suggest: Learn Mode session (15 min)

Thursday:  History — Ancient Egypt (skipped last week!)
           💡 Suggest: Quick quiz (10 questions)

Friday:    Maths — Fractions review + English spelling test
           📝 [Download Bilingual Worksheet]

Weekend:   Free choice! Nuri recommends Story Mode Chapter 3 🎮

Daily: 5 min Arabic reading practice (reading level building)
```

**Parent Controls:**
- Can adjust the plan (swap days, skip subjects)
- Set preferred study days and times
- Mark items as "done at school" (removes from plan)
- Add custom practice requests ("extra times tables this week")

---

### 3.5 Homework Photo → Parent Explainer 📸

**Already in the spec as Snap & Learn, but with a parent-specific mode.**

**Child Mode (existing):** Child photographs homework → Nuri guides them through it Socratically (never gives answers)

**Parent Mode (new):** Parent photographs the same homework → gets a clear, adult-level explanation of:

1. **What the question is asking** (decoded from the photo)
2. **The concept behind it** (explained for an adult, not a child)
3. **How to explain it to your child** (age-appropriate analogy suggestions)
4. **Common mistakes to watch for** (from Error Pattern Detection data)
5. **The correct answer with working** (so the parent can verify)

**Example:**

Parent scans a Year 4 fractions worksheet.

```
🦉 Parent Explainer

Question: "Write 3/4 as an equivalent fraction with denominator 12"

📖 The Concept:
Equivalent fractions are different fractions that represent the same
amount. To convert 3/4 to a denominator of 12, you multiply both the
numerator and denominator by the same number (12÷4 = 3, so multiply
both by 3).

Answer: 3/4 = 9/12 (because 3×3 = 9 and 4×3 = 12)

🗣️ How to explain to Carla:
"Imagine cutting a pizza into 4 slices and eating 3. Now imagine cutting
the SAME pizza into 12 smaller slices — you'd eat 9 of the smaller
slices, but it's still the same amount of pizza!"

⚠️ Watch out:
Carla tends to multiply only the numerator and forget the denominator.
Remind her: "Whatever you do to the bottom, you must do to the top!"
```

**Language Support:**
- Works for Arabic homework too
- Parent explanation always in English (parents' stronger language)
- Shows the Arabic text from the homework with transliteration
- Explains Arabic grammar concepts in English with clear examples

---

### 3.6 Personalized Printable Activity Packs 🎒

**Auto-generated weekly activity packs** that parents can print for offline practice, car journeys, or screen-free time.

**Pack Contents (auto-curated per child):**

| Component | Pages | Description |
|-----------|-------|-------------|
| Cover page | 1 | "{Child's name}'s Activity Pack — Week of April 1" with Nuri illustration |
| Maths practice | 2-3 | Problems focused on current topics + review of weak areas |
| Reading passage | 1-2 | English reading comprehension at their level |
| Arabic practice | 1-2 | Vocabulary, reading, or grammar at their ACTUAL Arabic level |
| Word search / crossword | 1 | Vocabulary from current curriculum topics |
| Fun facts page | 1 | Science or History facts connected to what they're studying |
| Coloring / drawing page | 1 | For younger years (Y1-Y3): topic-related coloring |
| Answer key | 1-2 | Separate pages parents can keep |
| **Total** | **8-12 pages** | Personalized PDF, ready to print |

**Generation Frequency:**
- Auto-generated every Sunday
- Parents notified: "Carla's new activity pack is ready! 📥"
- Can also generate on-demand packs for specific subjects/topics
- Holiday packs: longer packs for school breaks (20+ pages, revision-focused)

---

### 3.7 Progress Reports 📊

**Two types:**

#### Daily Nuri's Note (Push Notification)
Short, specific, actionable. Sent at a time the parent configures (default: 7pm).

```
🦉 Today Carla practiced for 14 minutes:
• Maths quiz: 7/10 (struggled with division word problems)
• Arabic: reviewed 12 vocabulary cards

💡 Tip: "Division word problems confuse her because she doesn't
know which number to divide by which. Try asking: 'Who is sharing?
How many people are sharing?' to help her set up the problem."

🔥 Streak: 13 days
```

#### Weekly Summary Report (Email or In-App)

```
🦉 Nuri's Weekly Report — Week of March 24

STUDY TIME: 1hr 42min (target: 1hr 45min ✅)
SUBJECTS: 5 of 6 covered (skipped: History)
QUESTIONS: 87 answered (71% correct — up from 68% last week 📈)
XP EARNED: 340 | Level: 7 → 8 🎉
STREAK: 🔥 12 days

SUBJECT BREAKDOWN:
  ★ Science: 89% accuracy (strongest subject!)
  ★ Maths: 74% accuracy (improving — was 65% last month)
  ▲ English: 72% accuracy (steady)
  ▲ Religion: 70% accuracy
  ▽ Arabic: 52% accuracy (needs attention)
  ✗ History: not practiced this week

MISTAKES RESOLVED: 9 of 14 (5 still in review queue)

BLIND SPOTS DETECTED:
  ⚠️ Confident but wrong on: place value in 4-digit numbers
  ⚠️ Lucky guesses on: apostrophes for possession

RECOMMENDATION:
"Focus 10 minutes on Arabic daily this week. Carla's listening
comprehension is strong (Year 4 level) but her reading is at Year 2.
I've added Arabic reading cards to this week's practice plan."

[Download This Week's Activity Pack] [View Detailed Analytics]
```

#### Term Report (End of Each School Term)
Comprehensive PDF report covering:
- Overall progress across all subjects
- Placement assessment comparison (start of term vs now)
- Topics mastered and topics still in progress
- Learning style profile update
- Nuri's recommendations for next term
- Graphs showing accuracy trends over time

---

### 3.8 Parent Learning Corner 🎓

Short, digestible content that helps parents understand what their child is learning and how to support them.

**Content Types:**

| Type | Example | Format |
|------|---------|--------|
| **"What they're learning this week"** | "This week in Year 4 Maths, your child is studying equivalent fractions. Here's what that means and why it matters..." | 2-minute read |
| **"How to help at home"** | "5 ways to practice fractions at home without any worksheets — using pizza, chocolate bars, and LEGO" | Tips card |
| **"Understanding the curriculum"** | "Cambridge Maths vs Egyptian Maths: what's the same and what's different in Year 3" | Article |
| **"Arabic for non-Arabic parents"** | "Your child is learning المبتدأ والخبر — here's what that means in English and how to help" | Explainer |
| **"When to worry, when to relax"** | "Your child's Arabic is 2 years below school level — here's why that's normal for international school kids and what to do" | Reassurance guide |

**Generation:** AI-generated based on the child's current curriculum and placement level. Proactively triggered when the child starts a new topic or when a significant gap is detected.

---

## 4. Parent Hub vs Twinkl — Feature Comparison

| Feature | Twinkl | Nuri Parent Hub |
|---------|--------|-----------------|
| Worksheet library | 1M+ static resources | ∞ AI-generated, personalized per child |
| Personalization | None — same worksheet for every child | Based on child's performance, mistakes, and level |
| Arabic resources | Limited, static | Full bilingual generation with tashkeel, transliteration |
| Egyptian curriculum | No | Yes — Religion, Arabic Language |
| British curriculum | Yes (strong) | Yes |
| Progress tracking | No | Full dashboard with daily/weekly/term reports |
| Smart recommendations | No | AI suggests what to practice based on data |
| Homework help for parents | No | Photo scan → parent-level explanation |
| Price | £5-15/month for static library | Included in Nuri subscription |
| Requires teacher expertise | Yes — parent must pick the right resource | No — Nuri picks for you |

**Key advantage:** Twinkl requires parents to know what their child needs and find the right resource from 1M+ options. Nuri knows what the child needs and generates the exact right resource automatically.

---

## 5. Technical Architecture

### 5.1 API Endpoints (New)

```
# Parent Hub Dashboard
GET    /api/parent/dashboard/:profileId        — Daily overview, tips, stats
GET    /api/parent/weekly-report/:profileId     — Weekly summary data

# Worksheet Generator
POST   /api/parent/worksheet/generate           — Generate personalized worksheet
GET    /api/parent/worksheet/:id/pdf            — Download generated PDF
GET    /api/parent/worksheets/:profileId        — List generated worksheets

# Activity Packs
POST   /api/parent/activity-pack/generate       — Generate weekly activity pack
GET    /api/parent/activity-pack/:id/pdf        — Download activity pack PDF
GET    /api/parent/activity-packs/:profileId    — List available packs

# Practice Plan
GET    /api/parent/practice-plan/:profileId     — Get weekly practice plan
PUT    /api/parent/practice-plan/:id            — Modify practice plan

# Homework Explainer
POST   /api/parent/homework/explain             — Upload photo + get parent explanation

# Progress Reports
GET    /api/parent/reports/daily/:profileId     — Daily Nuri's Note
GET    /api/parent/reports/weekly/:profileId    — Weekly summary
GET    /api/parent/reports/term/:profileId      — Term report PDF

# Learning Corner
GET    /api/parent/learning-corner/:profileId   — Curated articles for parent
```

### 5.2 Database Additions

```sql
-- Generated worksheets
CREATE TABLE worksheets (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT DEFAULT 'at_level',
  num_questions INT,
  content JSONB,  -- questions, answers, worked examples
  pdf_url TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Activity packs
CREATE TABLE activity_packs (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  week_start DATE,
  pack_type TEXT DEFAULT 'weekly',  -- weekly, holiday, on_demand
  content JSONB,
  pdf_url TEXT,
  downloaded BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Practice plans
CREATE TABLE practice_plans (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  week_start DATE,
  plan JSONB,  -- daily breakdown with tasks and resources
  parent_modifications JSONB,  -- parent overrides
  items_completed INT DEFAULT 0,
  items_total INT,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Parent homework scans
CREATE TABLE parent_homework_scans (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  image_url TEXT,
  subject TEXT,
  topic TEXT,
  parent_explanation JSONB,  -- concept, how_to_explain, common_mistakes, answer
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Parent notifications
CREATE TABLE parent_notifications (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  parent_id INT REFERENCES parents(id),
  type TEXT,  -- daily_note, weekly_report, pack_ready, milestone
  content JSONB,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Parent accounts
CREATE TABLE parents (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  pin_hash TEXT,
  notification_time TIME DEFAULT '19:00',
  notification_method TEXT DEFAULT 'push',  -- push, email, whatsapp
  children INT[],  -- array of profile_ids
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 PDF Generation Pipeline

```
1. Parent requests worksheet/pack
2. Server builds Claude prompt with:
   - Child's curriculum data (year + subject + topic list)
   - Performance data (last 20 quiz results for topic)
   - Error patterns (from Error Pattern Detection)
   - Mistake Journal entries
   - Placement level (especially for Arabic)
3. Claude generates structured JSON:
   {
     "title": "Carla's Fractions Practice",
     "worked_examples": [...],
     "questions": [...],
     "answers": [...],
     "hints": [...],
     "difficulty_notes": "..."
   }
4. PDF renderer (ReportLab or puppeteer) applies template:
   - Select template based on subject + type
   - Insert Nuri branding + child's name
   - Handle RTL for Arabic content
   - Generate answer key on separate pages
5. PDF stored in object storage (S3/Supabase Storage)
6. URL returned to parent for download/print
7. PDF auto-expires after 7 days
```

---

## 6. Build Phase & Priority

### What's Already Planned (from existing spec):
- Parent Highlights (daily note + weekly report) — Phase 5
- Snap & Learn (homework photo scanning) — Phase 1

### New Parent Hub Features — Suggested Phasing:

| Feature | Add to Phase | Effort | Dependencies |
|---------|-------------|--------|--------------|
| Smart Dashboard | Phase 2 (with learning engine) | 1 week | Quiz data, mistake journal |
| Progress Reports (daily/weekly) | Phase 2 | 1 week | Dashboard data |
| AI Worksheet Generator | Phase 3 (with gamification) | 2 weeks | Claude API, PDF generation |
| Bilingual Arabic Resources | Phase 3 | 1 week | Arabic placement, RTL rendering |
| Smart Weekly Practice Plan | Phase 3 | 1 week | Spaced repetition engine |
| Activity Packs | Phase 4 | 1 week | Worksheet generator |
| Homework Parent Explainer | Phase 4 | 1 week | Snap & Learn (Phase 1) |
| Parent Learning Corner | Phase 5 | 3-4 days | Curriculum data |
| Term Reports | Phase 5 | 1 week | All data sources |

**Total incremental effort: ~10-11 weeks** spread across Phases 2-5, not a separate build.

---

## 7. Monetization Impact

The Parent Hub strengthens the subscription model significantly:

| Tier | What Parents Get | Impact |
|------|-----------------|--------|
| **Free** | Basic dashboard (today's session summary only) | Gives parents a taste — drives upgrade |
| **Standard** | Full dashboard, daily notes, 2 worksheets/week, weekly report | Core value |
| **Family/Premium** | Unlimited worksheets, activity packs, homework explainer, term reports, practice plans | High-value upsell |

**Key insight:** Parents are the ones who pay. The child uses the tutoring features; the parent uses the Parent Hub. By making the Parent Hub genuinely useful, you justify the subscription to the person holding the credit card.

**Competitive pricing advantage:** Twinkl charges £5-15/month JUST for static worksheets. Nuri includes personalized worksheets, AI tutoring, gamification, and voice interaction — all in one subscription. Parents get far more value per dollar.

---

## 8. Complete Spec Document Map (Updated)

| File | Contents |
|------|----------|
| studybuddy-spec.md | Core app, Years 1-6 curriculum, architecture, Nuri mascot, gamification, voice system |
| studybuddy-features-part2.md | Features 11-20 + DB schema + build phases |
| studybuddy-features-part3.md | Features 21-35: Error patterns, thinking aloud, emotional adaptation, accessibility |
| studybuddy-placement-spec.md | Placement Assessment: adaptive English + Arabic assessment at registration |
| **studybuddy-parent-hub-spec.md** | **Parent Hub: AI worksheet generator, bilingual resources, smart plans, homework explainer, progress reports** |

---

*Spec created: March 31, 2026*
*This replaces the simpler "Parent Highlights" feature (Feature 15) with a comprehensive Parent Hub.*
*The Parent Hub is Nuri's answer to Twinkl — but personalized, bilingual, and AI-powered.*
