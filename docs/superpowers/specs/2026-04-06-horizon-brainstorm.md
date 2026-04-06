# Horizon — AI School for the Red Sea Coast

> Living brainstorm document. Updated as decisions are made and school owner answers come in.

## What Is Horizon?

An adaptation of Nuri into a full AI school teacher platform for a small homeschool on the South Coast of the Red Sea (Egypt). The school serves children of hotel owners and senior tourism employees in the Wadi Gimel / Honkorab / Kolan area. There are no traditional schools nearby — Horizon is an experiment in AI-powered education to give these kids a proper schooling.

## Core Decisions

### The Character: Mr. Helmy
- **Inspired by:** A real pioneer developer and environmentalist from the south coast
- **Persona:** Human male character (not an animal/mascot like Nuri the owl)
- **Tone:** Inspiring mentor + fun and energetic
  - Pushes kids to dream big — "When I started here there was nothing but sand and sea — look what we built. Now it's your turn."
  - Cracks jokes, turns lessons into adventures
  - Tells stories from his experience building the coast
  - High expectations with full support
- **Teaching philosophy:** Same evidence-based engine as Nuri (Bloom's 2-Sigma, productive failure, metacognition) but delivered through a different voice

### The School
| Detail | Decision |
|--------|----------|
| **Students** | 6-10 kids |
| **Ages** | Grades K-5 (ages 5-11) |
| **Who they are** | Children of hotel owners and senior tourism employees |
| **Location** | South Red Sea coast, Egypt — near protected areas |
| **Format** | In-person school + potential for online |

### Curriculum
| Subject | Source |
|---------|--------|
| **Core academics** | American curriculum (standard TBD — awaiting school owner input) |
| **Marine Conservation** | Local: reef ecosystems, protected areas, coastal/desert environment, sustainability |
| **Tourism & Hospitality** | Local: hospitality skills, English for tourism, Airbnb/hotel concepts, customer service, tour guiding, cultural exchange, business basics |

### Delivery Model
- **Group lessons (projector/screen):** Mr. Helmy leads the class. Interactive — asks questions, kids participate together. Used for introducing new topics.
- **Individual practice (tablets):** Each kid works at their own level on their own device. Closer to current Nuri 1-on-1 tutoring. Used for practice and reinforcement.
- **Field trips (tablet cameras):** Reef, desert, hotels become interactive classrooms. Kids point cameras at things, Mr. Helmy identifies and teaches in real-time.

### Camera System

#### Classroom Fixed Camera (Face Recognition)
- **Automatic attendance** — kids walk in, Mr. Helmy greets them by name
- **Personalized group lessons** — knows who's in the room, adjusts content to the group's needs
- **Individual engagement tracking** — detects confusion, distraction, fatigue per student
- **Participation tracking** — who answered, who hasn't spoken, who needs encouragement
- **Mood/energy detection** — facial expression analysis, Mr. Helmy adapts pace
- **No login needed** — face recognition = zero friction for 6-10 kids
- **Privacy:** Parent consent required. Face data stored locally only, never uploaded.

#### Tablet Cameras (Field Learning)
- **Species identification** — point at fish, coral, plant → Mr. Helmy teaches about it
- **Living species journal** — track what each kid has found and identified, gamify it
- **Environment assessment** — photograph trash, damaged coral → conservation lesson
- **Tourism training** — scan a hotel room, menu, sign → hospitality lesson
- **Handwriting recognition** — Arabic and English practice
- **Homework/worksheet scanning** — OCR + Socratic help (inherited from Nuri)

#### Shared Camera Layer (Built in Nuri Core)
The camera engine lives in Nuri's core codebase so both products benefit:
```
Nuri (core)
├── Camera Layer (shared)
│   ├── Object identification
│   ├── Text/handwriting OCR
│   ├── Scene understanding
│   └── "What am I looking at?" → teaching moment
│
├── Nuri (individual tutor) → homework, handwriting, general learning
│
└── Horizon (school) → extends with:
    ├── Marine species ID
    ├── Coral/ecosystem assessment
    ├── Hotel/hospitality scenarios
    └── Classroom face recognition + engagement tracking
```

### Field Trips
- **Supervised** — adult takes kids out, each with a tablet
- **Structured missions** — Mr. Helmy assigns objectives beforehand (e.g., "Find and photograph 5 types of coral")
- **Free exploration** — real-time guided discovery with Mr. Helmy as field guide
- Reef, beach, desert, hotels, boats — all are classrooms

### Adaptive Intelligence — Mr. Helmy Gets Smarter Over Time

Mr. Helmy isn't static. Every interaction makes him a better teacher for these specific kids in this specific environment.

#### What He Learns About Each Kid

**Academic profile (builds over weeks):**
- Actual grade level vs age (a 9-year-old might read at grade 2)
- Subject strengths and weaknesses
- Specific misconceptions — "Sara always confuses multiplication with addition"
- Learning speed per topic area

**Behavioral profile (builds over weeks):**
- Attention span patterns — "Youssef loses focus after 12 minutes"
- Emotional patterns — "Mona shuts down after two wrong answers in a row"
- Motivation triggers — competition, collaboration, praise, independence
- Topic passions — "Ahmed lights up at anything marine life"

**Learning style (inherits Nuri's 5-dimension model):**
- Visual, analogy, example-first, auditory, try-first
- Deepened with Horizon-specific data: field vs classroom, group vs individual

#### What He Learns About The Group (New — Nuri Only Teaches Individuals)

- **Group energy patterns** — Mondays are slow, Thursdays they're fired up
- **Optimal lesson length** — data shows this group's max before engagement drops
- **Best subject sequencing** — conservation after math works better than before
- **Group dynamics** — which kids work well paired, who gets distracted by whom
- **Pacing calibration** — how fast to move through new material for this mix

#### Growth Timeline

| Period | Mr. Helmy's Capability |
|--------|----------------------|
| **Week 1** | Follows curriculum plan. Generic pacing, standard approach. Learning names and faces. |
| **Month 1** | Knows each kid's level. Starts differentiating — harder questions for advanced kids, more support for struggling ones, within the same group lesson. |
| **Month 3** | Identified each kid's learning style, motivation triggers, attention patterns. Lessons are tailored. Knows "If I tell a reef story first, this group pays attention 40% longer." |
| **Month 6** | Built a library of tested explanations — knows which ones click and which don't. Starts **predicting** where kids will struggle before they get there. |
| **Year 1** | Deep profile on every child. Knows growth trajectories. Generates report cards backed by thousands of data points. Can tell the school owner "Youssef grew 2 grade levels in math but needs more English reading support." |

#### Intelligence Infrastructure (Inherited + New)

**Inherited from Nuri's core:**
- `teaching_outcomes` — tracks which teaching approach worked per topic
- `golden_explanations` — stores explanations that proved effective
- `error_fix_patterns` — maps error types to successful fix approaches
- `learning_style_profiles` — tracks what works per kid
- `session_memory` — remembers mood, struggles, breakthroughs

**New for Horizon:**
- **Group intelligence** — learning about the class as a unit, not just individuals
- **Temporal patterns** — time of day, day of week, seasonal trends
- **Cross-kid learning** — "The explanation that worked for Sara also works for kids with similar profiles"
- **Curriculum adaptation** — reshapes lesson sequence based on what actually works for these kids
- **Environment correlation** — connects field trip observations to classroom performance

#### The Flywheel: Cross-School Learning

Critically, what Mr. Helmy learns feeds back into Nuri's core:
- Golden explanations discovered in Horizon improve Nuri for all users
- Teaching approach effectiveness data enriches the shared engine
- If a second Horizon school opens, it starts with everything the first school taught Mr. Helmy

A human teacher's knowledge retires when they do. Mr. Helmy's knowledge compounds forever.

### Early Detection — Learning Difficulties & Mental Health

These children are in a remote area with zero access to school psychologists, special education specialists, or learning support teams. Mr. Helmy becomes the early detection system they would otherwise never have.

#### What He Can Detect

**Learning difficulties:**
- **Dyslexia** — letter/number reversals in handwriting (camera), slow reading, avoids reading aloud
- **Dyscalculia** — struggles with number sense despite repeated teaching, can't estimate, confuses operations
- **ADHD patterns** — camera sees fidgeting, looking away. Data shows short focus bursts then dropout. Impulsive answers.
- **Processing delays** — consistently needs more time than peers. Understands eventually but slowly.
- **Speech/language issues** — voice recognition detects pronunciation patterns, limited vocabulary for age, avoids speaking

**Mental health / emotional:**
- **Anxiety** — camera detects tension, avoidance. Performance drops when put on the spot. Confidence meter consistently says "guessed" even when correct.
- **Withdrawal** — participation declining over days/weeks. Less eye contact. Shorter answers.
- **Low self-esteem** — "I'm stupid", "I can't do this" in voice/text. Gives up quickly.
- **Trauma indicators** — sudden behavioral change. Was engaged, now isn't.
- **Social difficulties** — camera sees isolation during group activities. Doesn't interact with peers.
- **Fatigue/hunger** — camera detects drowsiness, low energy at consistent times. Could indicate home situation.

#### Signal Sources

| Source | What It Captures |
|---|---|
| **Classroom camera** | Engagement, eye contact, expressions, fidgeting, posture, drowsiness, social interaction |
| **Tablet camera** | Handwriting patterns (reversals, spacing), drawing content |
| **Voice** | Speech patterns, pronunciation, hesitation, tone, vocabulary range |
| **Academic data** | Error patterns, response times, topic-specific struggles, regression |
| **Behavioral data** | Session length tolerance, time-of-day patterns, subject avoidance, confidence levels |
| **Interaction patterns** | Response to mistakes, handling difficulty, self-talk |

Detection is based on **patterns over time**, not single moments.

#### Response Protocol — Three Levels

**Level 1 — Adapt (Automatic, Invisible):**
Mr. Helmy quietly adjusts teaching. Kid shows anxiety? Stops putting them on the spot in group lessons. Attention drops after 10 minutes? Builds in breaks. The kid never knows — it just feels like Mr. Helmy "gets them."

**Level 2 — Flag (School Owner Dashboard):**
When patterns persist over 2+ weeks, Mr. Helmy generates an observation report:
> "Sara has shown consistent signs of reading difficulty over the past 3 weeks: letter reversals in 60% of handwriting samples, avoids reading aloud, reading speed 40% below expected for age. This may indicate dyslexia. Recommended: professional screening."

No alarm bells. No labels. Data and a gentle recommendation.

**Level 3 — Specialist Report (Exportable):**
Inherits Nuri's specialist report system but richer — includes:
- Camera-based behavioral data over months
- Comparison against peer group (not just age norms)
- Specific examples with timestamps
- Clear narrative a professional can act on remotely

Can be shared with a visiting specialist, a doctor in the nearest city, or used for telemedicine consultation.

#### Why This Matters Here

In a city, a teacher notices something and refers to the school counselor. On the Red Sea coast, there's nobody to refer to. Mr. Helmy provides specialist-grade observation data that a remote professional can act on — giving these kids access to early detection they'd otherwise never receive.

### Repo Strategy
- Separate branch or fork from Nuri main repo (TBD — likely branch for shared camera layer, fork or directory for Horizon-specific code)

---

## Awaiting School Owner Answers

Questions sent to school owner covering:
1. Schedule structure (fixed timetable vs flexible)
2. Hours per day, days per week
3. Human supervisor presence
4. Which American curriculum standard
5. Core subjects list
6. Conservation specifics
7. Tourism/hospitality specifics
8. Teaching languages
9. Kids' current skill levels
10. Tech experience
11. Home language
12. Available devices
13. Internet reliability
14. Electricity reliability
15. Formal testing/certification needs
16. Dashboard/progress tracking needs
17. Success metrics (6 months, 1 year)
18. Start date
19. Hardware budget
20. Possibility of visit/video call

---

## Open Questions (For Us)

- **American curriculum standard:** Need to know which one before building curriculum data files
- **Offline capability:** Red Sea coast may have unreliable internet — how much should work offline?
- **Arabic language support:** Are we teaching English as a foreign language, or is instruction bilingual?
- **Mr. Helmy's visual design:** What does he look like? Photo-realistic, illustrated, animated?
- **Assessment/grading:** Does Horizon need formal report cards, or is Nuri-style XP/mastery sufficient?
- **Parent/guardian dashboard:** Adapt Nuri's parent dashboard for a school supervisor view?
- **Multi-grade group lessons:** How does Mr. Helmy handle a room with a 5-year-old and an 11-year-old in the same lesson?

---

## Platform Name & Branding

| Element | Value |
|---------|-------|
| **Platform name** | Horizon |
| **Character name** | Mr. Helmy |
| **Tagline energy** | "Look further. Learn more. Build the future." |
| **Visual identity** | TBD — should reflect the Red Sea coast, blue/teal tones likely |
