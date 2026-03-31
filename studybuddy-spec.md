# StudyBuddy — Full Product Specification
## AI-Powered Curriculum Tutor (Years 1–6)

**Version:** 1.0 MVP  
**Build with:** Claude Code on M4 Mac Mini  
**Deploy as:** Real website (React frontend + Node.js backend)  
**Target users:** Kids aged 5–11 (Years 1–6)  
**Curriculum:** Cambridge/British (academics) + Egyptian National (Religion + Arabic)

---

## 1. Product Vision

A fun, voice-enabled AI tutor that knows exactly what each child is studying based on their year group. Features a lovable owl mascot called **Nuri** (نوري — "my light"), two modes (Learn + Quiz), full gamification (XP, levels, streaks), and text-to-speech/speech-to-text in both English and Arabic.

---

## 2. User Profiles

- On first launch, child enters their **first name** and selects their **Year group** (1–6)
- Picks an **avatar color** (6 fun color options)
- Profile is saved to persistent storage — remembered across sessions
- Multiple profiles supported (siblings, classmates)
- Profile switcher on home screen

---

## 3. Mascot — Nuri the Owl

Animated SVG owl with expressive reactions:

| State | Nuri's Behavior |
|-------|----------------|
| Idle / Home screen | Gentle floating animation, blinks occasionally |
| Explaining (Learn Mode) | Thoughtful pose, tilts head, holds a tiny book |
| Asking question (Quiz) | Excited pose, leans forward |
| Correct answer | Celebrates! Jumps, stars burst around |
| Wrong answer | Encouraging look, slight head tilt, "try again" gesture |
| Streak milestone | Wears accessories (see Gamification) |
| Loading / thinking | Eyes spin or sparkle |

**Nuri evolves visually with levels:**
- Level 1–4: Basic Nuri (graduation cap)
- Level 5–9: Nuri gets a colorful scarf
- Level 10–14: Stars orbit around Nuri
- Level 15–19: Nuri gets tiny glasses
- Level 20+: Nuri gets golden wings

---

## 4. Subjects (6 per year group)

### Cambridge Curriculum Subjects

#### 4.1 MATHS

**Year 1 (Age 5–6):**
- Counting to 100, reading/writing numbers to 20
- Addition and subtraction within 20 (concrete objects, number lines)
- Counting in 2s, 5s, 10s
- Recognizing 1/2 and 1/4 of shapes/quantities
- Comparing lengths, weights, capacity (heavier/lighter, taller/shorter)
- Telling time to the hour and half past
- Recognizing and naming common 2D shapes (circle, triangle, square, rectangle) and 3D shapes (cube, cuboid, sphere, cylinder, cone)
- Describing position (above, below, between, left, right)
- Sorting objects and simple pictograms

**Year 2 (Age 6–7):**
- Place value in 2-digit numbers (tens and ones)
- Addition and subtraction of 2-digit numbers (mental and written)
- Multiplication and division: 2, 5, 10 times tables
- Recognizing 1/3, 1/4, 2/4, 3/4
- Choosing appropriate units of measurement (cm/m, g/kg, ml/l)
- Telling time to 5 minutes, understanding quarter past/to
- Identifying 2D shapes on 3D surfaces, lines of symmetry
- Interpreting block diagrams, tally charts, pictograms, tables

**Year 3 (Age 7–8):**
- Place value up to 1000
- Addition/subtraction with 3-digit numbers (column method)
- Multiplication tables: 3, 4, 8 (plus 2, 5, 10 from Y2)
- Unit and non-unit fractions, comparing fractions with same denominator
- Adding/subtracting fractions with same denominator
- Measuring in mm, cm, m; g, kg; ml, l
- Telling time to the nearest minute, 12-hour and 24-hour clocks
- Properties of 2D and 3D shapes, right angles, parallel/perpendicular lines
- Bar charts and pictograms (interpret and construct)

**Year 4 (Age 8–9):**
- Place value up to 10,000; rounding; negative numbers
- Formal written methods for all four operations
- All times tables up to 12×12
- Equivalent fractions, adding/subtracting fractions, decimal equivalents (tenths, hundredths)
- Converting between units (km/m, kg/g, l/ml)
- Area of rectangles, perimeter of rectilinear shapes
- Comparing and classifying angles (acute, obtuse, right)
- Coordinates in the first quadrant
- Line graphs, discrete and continuous data

**Year 5 (Age 9–10):**
- Place value up to 1,000,000; rounding to any degree
- Long multiplication and short division
- Fractions: mixed numbers, improper fractions, multiplying fractions by whole numbers
- Decimals up to 3 places, percentages
- Converting between metric units
- Area of compound shapes, volume of cubes/cuboids
- Angles on a straight line (180°), around a point (360°), within shapes
- Reflection and translation on coordinate grids
- Tables, line graphs, timetables

**Year 6 (Age 10–11):**
- Numbers up to 10,000,000; BIDMAS/order of operations
- Long division, multi-step problems
- Fractions: all operations, simplifying, ordering
- Fraction/decimal/percentage equivalence and conversions
- Ratio and proportion
- Algebra: simple formulae, linear sequences, one-step equations
- Area of triangles and parallelograms, volume of cuboids
- Angles in triangles, missing angles
- Pie charts, mean
- Coordinates in four quadrants

---

#### 4.2 SCIENCE

**Year 1:**
- Plants: identifying common plants, deciduous vs evergreen, basic structure (roots, stem, leaves, flowers)
- Animals: identifying common animals, carnivores/herbivores/omnivores, animal body parts
- Everyday materials: distinguishing objects from materials, describing properties
- Seasonal changes: four seasons, weather, day length

**Year 2:**
- Living things and habitats: alive/dead/never alive, habitats, food chains, microhabitats
- Plants: growth from seeds and bulbs, what plants need (light, water, temperature)
- Animals including humans: basic needs, importance of exercise, hygiene, diet
- Uses of everyday materials: suitability of materials, changing shape

**Year 3:**
- Plants: functions of parts, water transport, pollination, seed dispersal
- Animals including humans: nutrition, skeletons, muscles
- Rocks: types, fossils, soils
- Light: sources, shadows, reflections, sun safety
- Forces and magnets: surfaces, attraction/repulsion, magnetic poles

**Year 4:**
- Living things: classification keys, changing environments
- Animals including humans: digestive system, teeth, food chains
- States of matter: solids, liquids, gases, changes of state, water cycle
- Sound: vibrations, pitch, volume, how sound travels
- Electricity: simple circuits, conductors/insulators, switches

**Year 5:**
- Living things: life cycles (mammal, amphibian, insect, bird, plant), reproduction
- Animals including humans: human development (birth to old age)
- Properties of materials: hardness, solubility, conductivity, magnetic properties; dissolving, separating mixtures; reversible/irreversible changes
- Earth and space: solar system, Earth's rotation (day/night), Moon phases
- Forces: gravity, air resistance, water resistance, friction; mechanisms (levers, pulleys, gears)

**Year 6:**
- Living things: classification (Carl Linnaeus), microorganisms
- Animals including humans: circulatory system, heart, blood vessels, diet and exercise impact, drugs/alcohol effects
- Evolution and inheritance: fossils as evidence, adaptation, Darwin
- Light: travels in straight lines, how we see, shadows, refraction
- Electricity: circuit diagrams, voltage, components (motors, buzzers, lamps)

---

#### 4.3 ENGLISH

**Year 1:**
- Phonics: Phase 5 graphemes, reading by blending
- Common exception words (the, said, one, etc.)
- Writing simple sentences with capital letters, full stops, exclamation/question marks
- Joining words with "and"
- Sequencing sentences to form short narratives
- Listening to stories, poems, non-fiction; retelling

**Year 2:**
- Reading fluency and comprehension, predicting, making inferences
- Expanded noun phrases (the blue butterfly)
- Subordination (when, if, that, because) and coordination (and, but, or)
- Present and past tense, progressive form
- Apostrophes for contracting and possession
- Writing for different purposes: narratives, poetry, diary entries, letters

**Year 3:**
- Reading comprehension: inference, prediction, summarizing
- Prefixes (un-, dis-, mis-, re-) and suffixes (-ly, -ness, -ment)
- Paragraphing and organizing writing
- Speech marks/inverted commas
- Present perfect tense (She has gone)
- Conjunctions: when, before, after, while, so, yet
- Adverbs and prepositions
- Writing: stories, poetry, non-chronological reports, letters

**Year 4:**
- Reading: identifying themes, conventions, author's language choices
- Fronted adverbials (Later that day, ...)
- Paragraphs: organizing around a theme
- Possessive apostrophes for plural nouns
- Standard English verb forms
- Noun phrases expanded with modifying adjectives, prepositional phrases
- Writing: narratives, persuasive texts, newspaper reports, poetry

**Year 5:**
- Reading: inference, summarizing, evaluating, comparing
- Relative clauses (who, which, where, when, whose, that)
- Modal verbs (could, should, might, will, must)
- Parenthesis: brackets, dashes, commas
- Cohesive devices within paragraphs
- Converting speech: direct to reported
- Writing: balanced arguments, biographies, narrative, formal letters, poetry analysis

**Year 6:**
- Reading: comprehension, inference, critical evaluation, comparing across texts
- Passive vs active voice
- Subjunctive mood (If I were..., It is essential that he attend)
- Semi-colons, colons, dashes for sentence structure
- Formal/informal register
- Cohesion across paragraphs (adverbials, pronouns, synonyms)
- Writing: discursive essays, short stories, scripts, formal reports, poetry
- SATs preparation: reading comprehension, GPS (grammar, punctuation, spelling)

---

#### 4.4 HISTORY

**Year 1:**
- Changes within living memory (comparing childhood now vs grandparents)
- Significant individuals: Florence Nightingale, Mary Seacole, Neil Armstrong, Rosa Parks
- Events beyond living memory: Great Fire of London, first airplane flight

**Year 2:**
- Events beyond living memory: Gunpowder Plot, Titanic
- Significant people: Christopher Columbus, Ibn Battuta, Amelia Earhart
- Local history study
- Comparison: comparing aspects of life in different periods

**Year 3:**
- Changes in Britain from Stone Age to Iron Age
- Ancient Egypt: pharaohs, pyramids, hieroglyphics, mummification, River Nile, daily life, gods and goddesses

**Year 4:**
- Roman Empire and its impact on Britain
- Britain's settlement by Anglo-Saxons and Scots
- Viking and Anglo-Saxon struggle for the Kingdom of England

**Year 5:**
- Ancient Greece: democracy, city-states, Greek life, legacy in art/architecture/philosophy/Olympics
- A non-European society: early Islamic civilization (Baghdad, House of Wisdom), OR Mayan civilization, OR Benin (West Africa)

**Year 6:**
- A local history study
- A study of a theme in British history extending beyond 1066: crime and punishment, leisure, or a significant turning point
- World War I or World War II overview (causes, key events, impact)

---

### Egyptian National Curriculum Subjects

#### 4.5 CHRISTIAN RELIGION (التربية المسيحية — Tarbiya Masihiya)

**Year 1:**
- God as Creator: the creation story, thanking God for the world
- Jesus loves children: stories of Jesus's kindness
- Basic prayers: The Lord's Prayer (أبانا الذي في السماوات), morning and bedtime prayers
- Good behavior: sharing, honesty, helping others
- Church: what is a church, why we go, the cross as a symbol
- Christmas: the birth of Jesus (simple nativity story)
- Easter: Jesus loves us (age-appropriate, focus on joy of resurrection)

**Year 2:**
- Old Testament stories: Noah's Ark, Abraham's faith, baby Moses, David and Goliath
- Jesus's miracles: feeding 5000, calming the storm, healing the sick
- The Good Samaritan, The Prodigal Son (parables of love)
- Christian values: forgiveness, gratitude, courage, obedience to parents
- Church calendar: Advent, Christmas, Lent, Palm Sunday, Easter
- Saints: simple introduction to Egyptian saints (St. Mark, St. George)
- Psalms: Psalm 23 (The Lord is my Shepherd) — simplified

**Year 3:**
- Creation in more detail, stewardship of the earth
- Moses: the Exodus, Ten Commandments (simplified), crossing the Red Sea
- Life of Jesus: birth, baptism, calling the disciples, Sermon on the Mount (key teachings)
- Parables: The Sower, The Lost Sheep, The Mustard Seed
- Prayer life: types of prayer (thanks, asking, sorry)
- The Sacraments: introduction to Baptism and Communion
- Coptic heritage: St. Mark bringing Christianity to Egypt
- Key Arabic religious terms: صلاة (salah/prayer), كنيسة (kanisa/church), إنجيل (Ingil/Gospel), معمودية (ma'mudiya/baptism)

**Year 4:**
- Old Testament prophets: Elijah, Isaiah, Jeremiah (key stories and messages)
- The life of Jesus in depth: temptation, transfiguration, key miracles and teachings
- Beatitudes (Sermon on the Mount, Matthew 5)
- The Last Supper, Crucifixion, Resurrection — told in full
- The early Church: Acts of the Apostles, Paul's journeys
- Sacraments: Communion (القداس الإلهي), Confession
- Christian ethics: honesty in difficult situations, standing up for what's right
- The Creed (قانون الإيمان): introduction
- Church history in Egypt: Monastery of St. Anthony, Desert Fathers

**Year 5:**
- Old Testament deep dive: Joseph's story, Ruth, Daniel, Esther
- Jesus's parables in context: The Talents, The Rich Man and Lazarus, The Pharisee and Tax Collector
- The Gospel of John: key passages (I am the Light, I am the Bread of Life)
- The spread of Christianity: from Jerusalem to Rome to Alexandria
- Coptic Orthodox Church: structure, the Pope of Alexandria, liturgical traditions
- Christian response to moral dilemmas: peer pressure, honesty, compassion
- Comparative understanding: how Christians and Muslims live as neighbors in Egypt (respect, shared values)
- Key Arabic terms: التوبة (al-tawba/repentance), الروح القدس (al-Ruh al-Qudus/Holy Spirit), القيامة (al-Qiyama/Resurrection), الصوم الكبير (al-Sawm al-Kabir/Great Lent)

**Year 6:**
- Full Bible literacy: navigating Old and New Testament, books, chapters, verses
- Theology basics: Trinity (الثالوث القدوس), nature of God, grace, salvation
- Church history: ecumenical councils, persecution of early Christians, modern Coptic martyrs
- Sacraments in depth: all seven sacraments of the Coptic Orthodox Church
- Ethics and modern life: social media, materialism, environmental stewardship from a Christian perspective
- Apologetics (age-appropriate): why we believe, faith and science, questions about suffering
- Comparative religion: respect and understanding of Islam (shared prophets, shared values, peaceful coexistence)
- Preparation for communion/confirmation where applicable
- Key passages for memorization: Psalm 23, Psalm 91, Lord's Prayer, Beatitudes, 1 Corinthians 13

---

#### 4.6 ARABIC LANGUAGE (اللغة العربية — Lugha Arabiya)

**Note on approach:** Kids' Arabic is weak. All explanations in English. Arabic script displayed in proper RTL with transliteration and English meaning. Builds gradually from letters to sentences to paragraphs.

**Year 1:**
- Arabic alphabet: all 28 letters — recognition, naming, basic sound
- Letter forms: initial, medial, final, isolated (how letters change shape)
- Short vowels (حركات): fatha (َ), kasra (ِ), damma (ُ), sukun (ْ)
- Reading simple 3-letter words (CVC): كَتَبَ، جَلَسَ
- Writing practice: tracing and copying letters
- Basic greetings: مرحبا، سلام، صباح الخير، شكراً
- Numbers 1–10 in Arabic (١٢٣٤٥٦٧٨٩١٠)
- Colors, animals, family members in Arabic vocabulary

**Year 2:**
- Long vowels: alif (ا), waw (و), ya (ي) — how they extend sounds
- Tanween (تنوين): -an, -in, -un endings
- Reading short sentences (3–5 words)
- Definite article: ال (al-) and sun/moon letters
- Simple questions: ما هذا؟ (What is this?) — من هذا؟ (Who is this?)
- Vocabulary themes: school, home, body parts, food, clothes
- Simple handwriting: forming connected letters in short words
- Listening comprehension: following simple stories read aloud

**Year 3:**
- Reading passages of 3–5 short sentences
- Shaddah (شدّة) — doubled consonant
- Hamza (همزة): introduction on alif
- Vocabulary building: 200+ word target (themed lists)
- Simple sentence structure: subject + verb + object
- Masculine and feminine nouns (مذكر ومؤنث)
- Singular and plural (basic sound plurals)
- Writing: copying short passages, filling in missing words
- Comprehension: answering who/what/where questions about a short text

**Year 4:**
- Introduction to إعراب (i'rab — grammatical case): المبتدأ والخبر (subject and predicate in nominal sentences)
- Verb types: past (فعل ماضٍ) and present (فعل مضارع)
- الفعل والفاعل (verb and doer) in verbal sentences
- Attached pronouns: ـه، ـها، ـهم، ـك (his, her, their, your)
- Dictation: writing from spoken Arabic
- Reading comprehension: passages with 5–8 sentences, inference questions
- Creative writing: writing 3–5 sentences about a topic (my family, my school)
- Poetry: memorizing short, classic Arabic poems (2–4 lines)

**Year 5:**
- إعراب in more depth: signs of case (الضمة، الفتحة، الكسرة)
- Types of خبر: single word, sentence, semi-sentence (prepositional/adverbial)
- إن وأخواتها (inna and its sisters): إنّ، أنّ، لكنّ، كأنّ
- Verb conjugation: past and present for common verbs across pronouns
- أسلوب النفي (negation): لا، لم، ليس
- Reading: longer passages, identifying main idea, extracting details
- Writing: structured paragraphs (introduction, body, conclusion)
- Poetry appreciation: identifying rhyme, rhythm, imagery in age-appropriate poems
- Morphology introduction: root letters (جذر الكلمة) — how Arabic words are built from 3-letter roots

**Year 6:**
- كان وأخواتها (kana and its sisters): كان، أصبح، صار، ليس
- الحال (hal — adverbial state) and التمييز (tamyiz — specification)
- Active and passive participles (اسم الفاعل واسم المفعول) — introduction
- Verb forms: command/imperative (فعل أمر)
- الأساليب: أسلوب التعجب (exclamation), أسلوب النداء (calling/addressing), أسلوب الاستفهام (questioning)
- Reading: fiction and non-fiction passages, critical comprehension, opinion questions
- Writing: essays (150+ words), letters (formal/informal), descriptive writing
- Poetry: deeper appreciation, memorization of 3–4 poems, basic analysis
- Grammar review and consolidation for end-of-primary exams
- Arabic calligraphy: naskh script basics (awareness/appreciation)

---

## 5. App Modes

### 5.1 Learn Mode (💡) — Interactive Teaching

Nuri NEVER lectures. Every explanation is a conversation — teach a small chunk, then check understanding before moving on. The child must actively participate.

**The Teaching Loop (applies to ALL explanations, not just Snap & Learn):**

1. **HOOK** — Nuri opens with a fun question or real-life connection before explaining anything
2. **EXPLAIN** — One small concept only (2-3 sentences max), then STOP
3. **CHECK** — Ask a quick question to confirm they understood before moving on
4. **RESPOND** — If correct: praise + move to next concept. If wrong: rephrase with a different analogy, ask again simpler
5. **RECAP** — After every 3-4 concepts, mini-recap. At the end, 3-question summary check.

**Rules:**
- NEVER explain more than one concept without a check-in question
- If child gets 3+ checks right in a row → speed up, combine concepts, ask harder follow-ups
- If child struggles with 2+ checks → slow down, use simpler language, more analogies
- Use the child's name: "Great job {name}!"
- Relate to their life: "You know when the bathroom mirror gets foggy? That's actually..."
- Challenge playfully: "I bet you can't guess what happens next... 🤔"
- Track which concepts they struggled with → feeds into mastery system

**Buttons always available:**
- **"Explain Simpler"** — re-explains at an even simpler level
- **"Give me an example"** — provides a concrete real-world example
- **"Quiz me on this"** — transitions to a quick quiz on what was just explained

**Nuri behavior:** Thoughtful pose while explaining, leans forward when asking check-in questions, celebrates when they answer correctly
**Curriculum scope:** Stays strictly within year level — if asked beyond, says "Great question! You'll learn that in Year [X]. For now, let's focus on..."
**Voice:** Nuri reads explanations aloud (TTS). Reads questions with upward intonation. Child can tap mic to answer verbally (STT)

### 5.2 Quiz Mode (🧩)

- AI generates ONE question at a time from the child's curriculum
- Question types (mixed):
  - Multiple choice (A/B/C/D)
  - True/False
  - Fill in the blank
  - Short answer
- Immediate feedback: correct/wrong with explanation
- Nuri celebrates correct answers, encourages on wrong answers
- Difficulty progression: starts easy, gets harder within the session
- **Quick Quiz:** 5 questions, timed
- **Practice Quiz:** Unlimited, no timer, focused on a topic they pick
- **Weekly Challenge:** 1 special harder question per week, bonus XP
- Voice: Nuri reads questions aloud. Child can speak answers via mic.

---

## 6. Voice System

### 6.1 Text-to-Speech (Nuri speaks)

- Uses Web Speech Synthesis API (free, built into browsers)
- **English voice:** Used for all Cambridge subjects and English explanations
- **Arabic voice:** Auto-activates for Arabic Language subject and when reading Arabic terms/verses in Religion
- Voice picker in settings: child can choose from available system voices
- Speed control: Normal / Slow (helpful for younger kids and Arabic)
- Mute button always visible (for use in class/library)

### 6.2 Speech-to-Text (Child speaks)

- Uses Web Speech Recognition API
- Mic button in chat input area — tap to talk, tap again to stop
- Language auto-switches based on current subject:
  - Arabic Language / Religion Arabic terms → Arabic recognition
  - All other subjects → English recognition
- Visual feedback: animated mic icon while listening, waveform animation
- Fallback: always show text input alongside mic (in case STT fails or environment is noisy)

### 6.3 Arabic Text Display

- All Arabic text rendered RTL with proper font (Noto Naskh Arabic or Amiri)
- Key terms always displayed as: **Arabic — transliteration — English meaning**
- Example: **التوبة — al-tawba — repentance**
- Arabic Language quizzes show Arabic script prominently with English scaffolding below

---

## 7. Gamification System

### 7.1 XP (Experience Points)

| Action | XP Earned |
|--------|-----------|
| Correct answer (Quiz) | +10 XP |
| Correct on first try | +15 XP |
| Attempted but wrong | +5 XP |
| Completed a Learn Mode session (5+ messages) | +20 XP |
| 5-question streak (all correct) | +25 XP bonus |
| 10-question streak | +50 XP bonus |
| Weekly Challenge correct | +100 XP |
| Daily login | +5 XP |

### 7.2 Levels

| Level | XP Required (Cumulative) | Nuri Evolution |
|-------|-------------------------|----------------|
| 1 | 0 | Basic Nuri (graduation cap) |
| 2 | 100 | — |
| 3 | 250 | — |
| 4 | 500 | — |
| 5 | 800 | Nuri gets a colorful scarf |
| 6 | 1,200 | — |
| 7 | 1,700 | — |
| 8 | 2,300 | — |
| 9 | 3,000 | — |
| 10 | 4,000 | Stars orbit around Nuri |
| 15 | 8,000 | Nuri gets tiny glasses |
| 20 | 15,000 | Nuri gets golden wings |
| 25 | 25,000 | Nuri gets a rainbow trail |
| 30 | 40,000 | Nuri becomes Cosmic Nuri (full glow) |

Level-up triggers: confetti animation, Nuri celebration, sound effect

### 7.3 Streaks

- **Daily streak:** Consecutive days with at least 1 quiz or learn session
- Visual: flame icon with day count (🔥 7 days!)
- Streak freeze: 1 free miss every 7 days (auto-applied)
- Streak milestones: 7 days (Bronze badge), 30 days (Silver), 100 days (Gold)

### 7.4 Subject Mastery

- Per-subject progress bar on home screen
- Fills based on topics covered and quiz accuracy
- Color-coded: Red (0–30%), Yellow (30–60%), Green (60–90%), Gold (90%+)
- Tapping a subject shows which topics are strong vs need work

---

## 8. Technical Architecture

### 8.1 Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Fonts:** Nunito or Baloo 2 (English), Noto Naskh Arabic or Amiri (Arabic)
- **Animations:** Framer Motion (Nuri, transitions, celebrations)
- **Voice:** Web Speech API (SpeechSynthesis + SpeechRecognition)
- **State management:** React Context + useReducer
- **Local caching:** IndexedDB for offline quiz question cache

### 8.2 Backend
- **Runtime:** Node.js + Express
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
  - System prompts dynamically built per year + subject + mode
  - Conversation history maintained per session
- **Database:** PostgreSQL (user profiles, XP, streaks, quiz history)
- **Auth:** Simple name + PIN (no email needed for kids)
- **API endpoints:**
  - POST /api/chat — send message, get AI response
  - GET /api/profile/:id — get user profile and stats
  - POST /api/profile — create/update profile
  - GET /api/leaderboard — top XP earners (optional)

### 8.3 Deployment
- Host on Mac Mini (local network first, then Cloudflare Tunnel or similar for external access)
- Or deploy to Vercel/Railway for public access
- Environment variables: ANTHROPIC_API_KEY

---

## 9. UI Screens

1. **Welcome / Login** — Enter name, select year, pick avatar color
2. **Home Dashboard** — Nuri greeting, subject grid (6 subjects), XP bar, streak counter, level badge
3. **Subject Screen** — Choose Learn or Quiz mode, see mastery progress for this subject
4. **Learn Mode Chat** — Chat interface with Nuri, voice buttons, "Explain Simpler" / "Example" / "Quiz Me" buttons
5. **Quiz Mode** — Question card with Nuri, answer input (type or speak), immediate feedback, score tracker
6. **Profile / Stats** — Total XP, level, streak, per-subject mastery bars, badges earned
7. **Settings** — Voice picker, speed control, mute toggle, profile switcher

---

## 10. Design Direction

- **Aesthetic:** Fun, colorful, playful — NOT gamified to the point of distraction
- **Background:** Warm gradient (cream/peach/soft blue), subtle floating shapes
- **Cards:** White with rounded corners (16-20px radius), soft shadows
- **Colors:**
  - Primary gradient: Orange (#F97316) → Purple (#A855F7)
  - Maths: Blue (#3B82F6)
  - Science: Green (#10B981)
  - English: Purple (#8B5CF6)
  - History: Amber (#F59E0B)
  - Religion: Rose (#F43F5E)
  - Arabic: Teal (#14B8A6)
- **Typography:** Rounded, friendly — Nunito 700/800 for headings, 400/600 for body
- **Arabic text:** Noto Naskh Arabic, slightly larger font size for readability

---

## 11. System Prompt Template

```
You are Nuri, a friendly owl tutor helping a {year_label} ({age_range}) student 
studying the {curriculum_type} curriculum.

Subject: {subject_name}
Topics for this year group: {topic_list}

RULES:
- ONLY help with topics in the {year_label} {subject_name} curriculum listed above
- If asked about something beyond their year, say: "Great question! You'll learn 
  about that in Year [X]. For now, let's focus on..."
- Use age-appropriate language for {age_range} students
- Be encouraging, warm, patient, and fun
- Use emojis sparingly but effectively
- Keep responses concise (max 3-4 short paragraphs)
- Use real-world examples kids relate to
- For Arabic content, show terms as: Arabic — transliteration — English meaning
- For Religion content, reference the Coptic Orthodox tradition

{mode_specific_instructions}
```

**Learn Mode specific instructions (inserted via {mode_specific_instructions}):**
```
INTERACTIVE TEACHING MODE — CRITICAL RULES:
- You are having a CONVERSATION, not giving a lecture
- NEVER explain more than ONE concept (2-3 sentences) without asking a check-in question
- After every explanation chunk, STOP and ask: a comprehension question, a "fill in the blank", 
  a "true or false", or a "what do you think happens when..." question
- Wait for the child to answer before continuing
- If they answer correctly: enthusiastic praise using their name, then move to next concept
- If they answer wrong: do NOT say "wrong" — rephrase using a different analogy, then ask again simpler
- If stuck after 2 attempts: gently give the answer with a clear explanation, encourage, move on
- Every 3-4 concepts, do a quick recap: "Let's check — can you tell me the steps we covered?"
- END every topic with a 3-question summary check
- Start each new topic with a fun HOOK question that connects to their daily life
- Use "imagine you are..." scenarios to make abstract concepts tangible
- Challenge playfully: "I bet you can't guess..." / "Here's a tricky one..."
- Adapt: if 3+ correct in a row, go faster and harder. If 2+ wrong, slow down and simplify.
- Use the child's name frequently for engagement
```

---

## 12. NOT Building Yet (Future Versions)

- Parent dashboard (view child's progress, time spent, weak topics)
- Sibling challenge mode (quiz each other across year groups)
- Homework photo scanner (photograph a question, AI walks through solution)
- Progress reports (weekly email to parents)
- Offline mode (cached questions, no AI needed)
- Classroom mode (teacher creates a class, assigns quizzes)
- Multiplayer quiz (classmates compete in real-time)
- Integration with actual school timetable
- Arabic handwriting recognition (for Arabic Language input)

---

## 13. Build Order (UPDATED — 10-Week Plan)

**Phase 1 — Core + Voice + Homework Helper (Week 1-2):**
The foundation and the killer feature ship together.
- Profile creation and storage (name, year group, avatar color)
- Home dashboard with subject grid
- Voice system: TTS (Nuri speaks) + STT (child speaks) in English + Arabic
- Nuri SVG mascot with animated states (idle, talking, thinking, celebrating)
- 📸 Snap & Learn: camera capture + Claude Vision analysis
- 📝 Homework Helper: voice-first Socratic tutor (THE killer feature)
- Learn Mode with interactive teaching loop (voice-enabled)
- Quiz Mode with question generation
- Basic XP tracking

**Phase 2 — Smart Learning Engine (Week 3-4):**
Make the AI genuinely better at teaching.
- Spaced Repetition Engine (review queue, memory scores)
- Mistake Journal (auto-save wrong answers, review mode)
- Explain It Back (child teaches Nuri, AI evaluates)
- Difficulty Dial (Easy/Medium/Hard/Challenge Me)
- Learning Style Detection (track and adapt)
- Confidence Meter (how sure were you?)

**Phase 3 — Gamification (Week 5-6):**
Make kids want to come back every day.
- Full XP/Level/Streak system with all tables
- Daily Mystery Challenge (sealed envelope, costume rewards)
- Achievement Badges Wall (40+ badges across categories)
- Collectible Nuri Stickers (5 rarity tiers, sticker book)
- Nuri evolution visuals (scarf → stars → glasses → wings → cosmic)

**Phase 4 — Engagement Features (Week 7-8):**
Deepen the experience.
- Story Mode: The 7 Lost Books of Knowledge (7 chapters × 5 stages)
- Nuri's World (virtual treehouse, earned items)
- Mind Maps (visual concept connections)
- Pre-Test Predictor (study plan with countdown)
- Cross-Subject Connections (AI links topics across subjects)

**Phase 5 — Social + Parents (Week 9-10):**
Bring in classmates and family.
- Study Duels (live + async head-to-head quizzes)
- Teach a Friend Mode (child creates mini-lessons)
- Parent Highlights (daily note + weekly report)
- Weekly Class Leaderboard (opt-in, Monday reset)
- Voice Notes from Nuri (daily audio push notifications)
- Exam Pattern Recognition (past paper analysis)
- Deploy, test with real kids, iterate

---

## 14. Complete Spec Document Map

| File | Contents |
|------|----------|
| studybuddy-spec.md | Core app, Years 1-6 curriculum, architecture, Nuri mascot, gamification, voice system |
| studybuddy-snap-and-learn-spec.md | Camera feature, interactive explain mode, quiz from photo, homework helper mode |
| studybuddy-homework-helper-spec.md | Voice-first Socratic tutor, conversation engine, per-subject guidance, session UI |
| studybuddy-features-part1.md | Features 1-10: Mystery Challenge, Nuri's World, Badges, Leaderboard, Stickers, Story Mode, Spaced Repetition, Mistake Journal, Explain It Back, Mind Maps |
| studybuddy-features-part2.md | Features 11-20: Difficulty Dial, Pre-Test Predictor, Study Duels, Teach a Friend, Parent Highlights, Voice Notes, Learning Style, Cross-Subject, Confidence Meter, Exam Patterns + full DB schema + build phases |
| nuri-character-prompts.md | 5 Gemini prompts for character design (sheet, expressions, evolution, icon, subjects) |

---

*Spec created: March 30, 2026*
*Updated: March 31, 2026 — Homework Helper added as Phase 1 priority*
*Ready to build in Claude Code*
