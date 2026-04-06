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

## Enhanced Features — All 12

### 1. Virtual Guest Speakers
Mr. Helmy "invites" experts into the classroom via AI-simulated conversations. A marine biologist explains coral spawning. A hotel GM talks about what makes a great receptionist. Mr. Helmy interviews them, kids ask questions. Can be pre-built from real interviews or AI-generated personas. Eventually — live video calls with actual experts, Mr. Helmy translating/simplifying in real-time.

### 2. Digital Twin of Their Reef
Using photos kids take on field trips over months, build a living digital map of their local reef. Species spotted, coral health tracked, changes over seasons. Kids become citizen scientists — their data has real value. Mr. Helmy references it: "Remember when you photographed this coral in September? Look at it now — what changed?"

### 3. Tourism Simulation Mode
Mr. Helmy role-plays as different types of tourists — a German family, a Japanese diver, an American couple who've never snorkeled. Kids practice greeting in different languages, explaining reef rules, handling complaints, recommending activities, basic hospitality English. Real-world job training disguised as a game.

### 4. Peer Teaching
Older kids teach younger kids, with Mr. Helmy coaching them. An 11-year-old explains coral to a 6-year-old. Mr. Helmy watches via camera, gives the older kid feedback: "You used a great analogy there" or "She looked confused when you said 'photosynthesis' — try simpler words." Builds leadership, communication, and deepens understanding.

### 5. Story Mode — Red Sea Adventures
Interactive narrative lessons set on the coast. "A baby turtle hatched on the beach last night. She needs to reach the water, but there are dangers..." Kids make choices that teach science, conservation, and problem-solving. Each story generated dynamically based on current learning topics.

### 6. Daily Expedition Log
Every day starts with Mr. Helmy's "morning briefing" and ends with an expedition log. Kids dictate or write what they learned, what they saw, what they're curious about. Over time, each kid builds a personal journal — part diary, part science notebook, part portfolio. Parents and school owner can see it.

### 7. Weather & Environment Integration
Mr. Helmy checks actual local weather, tide times, water temperature, wind conditions. Teaches from it:
- "Wind is 25 knots — too rough for snorkeling. Let's talk about why wind creates waves..."
- "Spring tide today — reef flat will be exposed. Perfect for a rock pool expedition."
- "Water is 28°C — close to coral bleaching territory..."
Real data, real science, real relevance.

### 8. Language Buddy
Immersive English practice tied to their world:
- Label everything on the reef in English and Arabic
- Practice hotel check-in dialogues
- Describe field trip observations in English
- Voice recognition scores pronunciation
- Progress from simple words (fish, coral, beach) to full sentences ("Welcome to our resort, can I help you with your luggage?")

### 9. Parent/Community Dashboard
Beyond school owner — hotel owner parents can see:
- What their kid learned today
- Conservation knowledge relevant to their business
- Tourism skills their kid is developing
- Suggestions: "Ahmed learned about reef-safe sunscreen — your hotel could stock it"
The school becomes a bridge between education and the community's economy.

### 10. Seasonal Curriculum
Mr. Helmy adapts to what's happening in the environment right now:
- **Turtle nesting season** → turtle biology, night beach monitoring
- **Coral spawning** → reproduction, life cycles
- **Migration season** → whale sharks, dolphins, migratory birds
- **Tourist high season** → hospitality practice ramps up, English intensifies
- **Ramadan** → cultural awareness, adjusted schedule
The curriculum breathes with the coast.

### 11. Achievement Expeditions
Mastering milestones unlocks real-world reward expeditions:
- Master 20 fish species → guided snorkeling trip with camera mission
- Complete hospitality English level 3 → shadow a real hotel receptionist
- Finish coral health module → join an actual reef monitoring snorkel
Learning leads to real experiences, not just digital badges.

### 12. Inter-School Connections
When other schools adopt Horizon (or Nuri schools connect):
- Video-call students in Cairo, London, Tokyo — practice English, share their reef
- Compare environments: "We have coral reefs, what do you have?"
- Collaborative projects: coastal kids study marine pollution, city kids study river pollution — where does it connect?
Kids go from isolated to globally connected.

---

## Research-Backed Implementation Priorities

Based on comprehensive research across homeschooling, online education, and AI-powered learning (see `horizon-paper-complete.md` for full paper).

### P0 — Must Have Day One

**1. Mastery-Based Adaptive Teaching Engine**
Per-child knowledge graph tracking every skill. Misconception detection (WHY they're wrong, not just THAT they're wrong). Multiple explanation strategies per concept. No grade levels — skill continuums per subject. A 7-year-old can be "grade 4" reading and "grade 2" math simultaneously. *Evidence: Bloom's 2-Sigma (1984), RAND mastery research (2023) showing 14% better college performance.*

**2. Voice-First Interaction**
Ages 5-7: Mr. Helmy reads everything aloud, kids answer by speaking or tapping. No typing. Ages 8-11: voice + text hybrid. Speech recognition tuned for children's pronunciation. *Evidence: 0.51 SD increase in comprehension with dialogic approaches (ACM CHI, 2024).*

**3. Active Learning Loop — Never Passive**
Mr. Helmy NEVER lectures more than 2-3 minutes without requiring a response. Every interaction = answer, predict, explain, draw, speak. Productive failure before instruction. Elaborative interrogation after every answer. No "watch this video" mode. *Evidence: COVID learning loss data — passive = 4.8 months behind. Active = 0.33-0.43 SD improvement.*

### P1 — Build Immediately After Core

**4. Mr. Helmy Character + Social Presence**
Consistent personality, stories, humor. Remembers everything about each child. Greets by name. Has opinions and preferences. Realistic illustration, not cartoon. Kids know he's AI but feel he's "their teacher." *Evidence: Social presence theory (Xu, 2026), parasocial relationship research (Gola et al., 2013).*

**5. Session Timing + Camera-Triggered Breaks**
15-20 min group lesson → 15-20 min individual practice → break → repeat. Camera detects attention drop and triggers early breaks. K-1: even shorter (10-15 min). *Evidence: Screen time research consensus for ages 5-11.*

**6. Spaced Repetition + Interleaving Engine**
Every mastered concept enters spaced repetition queue. Mr. Helmy weaves review into new lessons naturally. Mix topics within practice sessions. Track memory decay per concept per child. *Evidence: Duolingo's algorithm = 30% improvement. Roediger & Karpicke (2006, 2008).*

**7. Offline-First Architecture**
Local compute node runs compressed teaching engine without internet. Sync when connected, seamless when not. Kids never notice an outage. *Evidence: Remote community infrastructure reality.*

### P2 — Build Once Foundation Works

**8. Camera Integration (Face Recognition + Engagement)**
Automatic attendance, personalized greetings, engagement tracking, confusion detection, hand-raise detection, participation tracking. Feeds STRUCTURED DATA to Mr. Helmy, not raw video. Transparent to kids and parents. *Evidence: EduSense (Carnegie Mellon, 2019), social presence research.*

**9. Field Learning (Tablet Camera + Species ID)**
Camera as scientific instrument. Real-time species identification → teaching moment → expedition log → Digital Reef Twin. Cross-curricular by design: reef survey = science + math + English + conservation. *Evidence: Place-based learning research (Sobel, 2004; Gruenewald, 2003).*

**10. Peer Teaching Mode**
Mr. Helmy pairs older + younger kids for specific topics. Camera watches, coaches the older child on teaching technique. Older child earns XP for teaching. *Evidence: Protégé effect (Chase et al., 2009), multi-age classroom research.*

### P3 — Layer On Top

**11. Meaningful Gamification**
XP = real mastery demonstrated, never inflated. XP never decreases. Achievement Expeditions unlock real experiences. Progress visualization tied to skill growth. No competitive leaderboards. *Evidence: Gamification meta-analysis effect size 0.822, but only when meaningful (Frontiers, 2023).*

**12. Early Detection System**
Dyslexia, dyscalculia, ADHD, processing delays via camera + academic data. Anxiety, withdrawal, low self-esteem via behavioral patterns. Three-level response: adapt → flag → specialist report. *Evidence: AI early detection outperforms human observation timing (EdTech Hub, 2025).*

**13. Tourism Simulation + Language Buddy**
Mr. Helmy role-plays tourists. Immersive English tied to their world. Pronunciation scoring. Hotel check-in dialogues. *Career-relevant but not day-one essential.*

### P4 — Polish and Scale

**14. Digital Reef Twin, Weather Integration, Seasonal Curriculum, Inter-School Connections, Virtual Guest Speakers**
Powerful features that build on the working foundation. Each adds depth but none are blocking for launch.

### Critical Non-Software Requirement

**15. Human Facilitator — Not Optional**
A caring adult in the room. Not a trained teacher — a present, supportive person who handles safety, comfort, field trips, conflict, and the moments AI cannot touch. Mr. Helmy does pedagogy. The facilitator does humanity. *Evidence: Attachment theory (Bowlby, 1969), AI over-reliance research (Taylor & Francis, 2025).*

---

## Daily Schedule

### Cool Season (Oct-Apr) — Standard Day: 7:30-11:45 (4 hours 15 min)

| Time | Block | Duration | Mode | Details |
|------|-------|----------|------|---------|
| **7:30** | Morning Circle | 15 min | Projector, group | Camera greets kids by name. Mr. Helmy's Morning Briefing: weather, tides, water temp, yesterday review, today's plan. |
| **7:45** | Core Academic Block 1 | 45 min | Group → Individual | 20 min group lesson on projector (new concept, interactive) → 20 min individual practice on tablets (mastery-level adapted) → 5 min check-out. Camera releases young kids to tablets early if attention drops. |
| **8:30** | Movement Break | 15 min | Outdoor, facilitator-led | Physical play, running, stretching. Mr. Helmy is OFF. Human time. |
| **8:45** | Field Learning (MWF) *or* Core Block 2 (TuTh) | 60 min / 45 min | Tablets outdoors *or* group + individual | **MWF:** Mission briefing → field work at reef/beach/hotel with tablets → debrief. **TuTh:** Second core subject (Science or Social Studies). |
| **9:45** | Snack Break | 20 min | Social, facilitator-led | Food, water, conversation. Mr. Helmy is OFF. |
| **10:05** | Local Subjects Block | 40 min | Group → Project work | Conservation (MWF) or Tourism/Hospitality (TuTh). Connect field observations to theory. Project work: expedition logs, species profiles, tourism brochures, data analysis. |
| **10:45** | Creative Break | 15 min | Facilitator-led | Art, drawing, building, music. Can be learning-related or free. |
| **11:00** | Core Block 3 (Review) | 30 min | Mixed | Spaced repetition review, quiz games, reading/story time. Lighter intensity for end of day. |
| **11:30** | Expedition Log + Closing | 15 min | Individual → Group | Kids write/dictate daily log. Mr. Helmy celebrates achievements, previews tomorrow. Ends on a high note. |
| **11:45** | **Day Ends** | | | |

### Weekly Subject Rotation

| Day | Field Trip | Core 1 (7:45) | Core 2 (8:45) | Local Subject (10:05) |
|-----|-----------|---------------|---------------|----------------------|
| Monday | Conservation (reef/beach) | Math | — | Conservation |
| Tuesday | — (indoor) | English | Science | Tourism/Hospitality |
| Wednesday | Tourism (hotel/town) | Math | — | Conservation |
| Thursday | — (indoor) | English | Social Studies | Tourism/Hospitality |
| Friday | Free exploration | English | — | Peer teaching + log review |

### Hot Season Adjustment (May-Sep)

Flip for 40°C+ heat:
- **7:00-8:30**: Field learning (cool morning)
- **8:30-11:30**: Indoor academics (AC classroom during hottest hours)
- **11:30**: Day ends

Mr. Helmy announces the shift: "Summer schedule starts tomorrow — reef at 7:00 while it's cool, then inside for brain work."

### Special Days

- **Monthly Community Day** (last Friday): Kids present work to parents, hotel staff, community. Mr. Helmy hosts but kids lead.
- **Achievement Expedition Day** (seasonal): Milestone rewards — deep snorkeling mission, hotel shadow day, guided desert hike. Full day, fully experiential.
- **Ramadan**: Shorter day (7:30-10:30), lighter workload, focus on reading, story mode, creative projects, reflection.

### Why This Schedule Works

| Principle | Implementation |
|-----------|---------------|
| 15-25 min sessions | No block exceeds 20 min of same-mode activity |
| Active, never passive | Every block has interaction, questions, doing |
| Field = core | 3 field trips/week built into the rhythm |
| Climate-aware | Outdoor in cool hours, indoor during heat |
| Mixed-age friendly | Group with differentiation, individual at own level |
| Spaced repetition | Morning review + Block 3 dedicated review + weekly cycle |
| Bookended | Morning briefing opens, expedition log closes — daily metacognition |
| Human time | Two breaks where Mr. Helmy is OFF and facilitator leads |
| Short day | 4 hours total — research supports shorter, intensive sessions for this age |

---

## The Facilitator — Horizon's Human Heart

### Who They Are
Someone already in the community. Not a hired teacher from Cairo. Most likely: a hotel employee, a parent, a semi-retired staff member, or the school owner's appointee. Does NOT need a teaching degree, curriculum experience, or fluent English. DOES need: genuine care for the kids, reliability, patience, physical fitness for field trips, basic first aid, comfort around water.

**Mr. Helmy is the brain. The facilitator is the body and the heart.**

### What They Do — By Block

| Time | Block | Facilitator's Role |
|------|-------|-------------------|
| 7:15 | Pre-arrival | Opens classroom, checks Facilitator Dashboard for flags/field trip prep, sets out tablets |
| 7:30 | Morning Circle | Be present and warm. Watch the room — read human signals the camera misses. Sit next to any distressed child. |
| 7:45 | Core Block 1 | During group lesson: sit WITH kids, help young ones focus, manage physical disruptions. During individual practice: circulate, help with tablet issues, encourage stuck kids, watch for frustration. |
| 8:30 | Movement Break | **Lead this. Mr. Helmy is OFF.** Take kids outside. Play WITH them. This is where trust is built. Also: private check-ins with kids who seemed off. |
| 8:45 | Field Learning (MWF) | **Irreplaceable.** Check safety gear, make weather calls, lead the group physically, manage water safety, count heads, handle the unexpected (injuries, weather changes, curious tourists). Mr. Helmy teaches through tablets; facilitator handles the physical world. |
| 8:45 | Core Block 2 (TuTh) | Same as Block 1. For science experiments: be the hands (help with equipment, pouring, measuring). |
| 9:45 | Snack Break | **Second human time.** Eat WITH the kids. Notice who has no food. Learn about their lives. |
| 10:05 | Local Subjects | Help with physical project work. Play supporting roles in tourism simulations. Manage peer teaching pairings. |
| 10:45 | Creative Break | Lead creative activities — drawing, building, music. No tablets. Hands and materials. |
| 11:00 | Core Block 3 | Lightest block. Check dashboard, prep for tomorrow, respond to parent messages. |
| 11:30 | Closing | Help young kids with expedition logs. Add personal touch: "I'm proud of how you worked together today." High-fives at the door. |
| 11:45 | After kids leave | Lock tablets, review Mr. Helmy's End of Day Report, flag serious concerns to school owner/parents. |

### The Facilitator Dashboard (Arabic-first)

| Section | What It Shows |
|---------|--------------|
| Today's Plan | Schedule, field trip details, equipment needed, weather |
| Kid Alerts | Flags from yesterday: emotional state, struggles, "check in with Sara" |
| During Class | Real-time engagement: green/yellow/red dots next to each child's name |
| Parent Messages | Overnight messages: "Ahmed didn't sleep well", "Layla has dentist at 10" |
| End of Day | Summary per child, flags, recommended actions for tomorrow |

### Training — 2 Weeks, Not a Degree

**Week 1 — Orientation:**
- Day 1: What Horizon is, what Mr. Helmy does, what YOU do
- Day 2: Facilitator Dashboard — how to read it, what to act on
- Day 3: Tablet basics — power, charging, troubleshooting, waterproof cases
- Day 4: First aid — reef injuries, heat exhaustion, basic CPR
- Day 5: Water safety — reef supervision, rip currents, head counts, life vests

**Week 2 — Practice with real kids:**
- Days 6-7: Shadow the school owner running a Horizon day
- Days 8-9: Co-lead (take over breaks and field trips)
- Day 10: Solo lead with school owner observing

**Ongoing:** Dashboard gives daily guidance. Monthly check-in with school owner. Mr. Helmy answers facilitator questions in Arabic.

### Rules

| Never | Why |
|-------|-----|
| Teach content or correct Mr. Helmy | AI handles pedagogy. Facilitator handles humanity. |
| Override difficulty settings | The adaptive engine knows each kid's level better. |
| Punish disengagement | Mr. Helmy adapts. Facilitator encourages. Neither punishes. |
| Skip field trips | Field learning is core curriculum, not optional. |
| Be on their phone during class | They need to see what the camera cannot. |
| Share learning data beyond parents/owner | Privacy. |

### The One-Line Job Description

> Mr. Helmy can teach a child to multiply fractions. He cannot teach a child that they matter. That's the facilitator's job.

---

## Language Model — Decided

### The Rule
**English is the language of instruction for ALL subjects except Arabic.** Mr. Helmy teaches Math, Science, English Language Arts, Social Studies, Conservation, and Tourism/Hospitality entirely in English.

### Understanding First, Language Second
When a child can't follow in English — not just a tricky word, but genuinely lost — Mr. Helmy switches fully to Arabic until understanding clicks, then transitions back to English. This is not a brief hint. If a child needs the entire concept explained in Arabic, Mr. Helmy does it. Understanding the subject always comes before maintaining English.

The Arabic-to-English ratio is **per-child and adaptive**:
- A 5-year-old in month 1 might hear 80% Arabic with English vocabulary layered on
- The same child by mid-year might be 50/50
- A 10-year-old with some English exposure might start at 30% Arabic
- Mr. Helmy tracks comprehension per child and adjusts automatically

> "So if we have 3 groups of 4... OK Layla, خليني أشرحلك بالعربي — لو عندنا ٣ مجموعات، كل مجموعة فيها ٤ حاجات، يبقى المجموع كام؟... ١٢! Exactly — 3 times 4 equals 12. That's multiplication."

Over time, the data shows each child's English comprehension trajectory. The shift to English happens naturally — not on a forced timeline — because the child's understanding is building for real.

### Arabic as a Subject — Dual Register
When teaching Arabic class, Mr. Helmy mixes two registers like a real Egyptian teacher:

- **Egyptian colloquial (عامية)** — for framing, explanations, jokes, making kids comfortable: "طيب يا جماعة النهاردة هنتعلم عن..."
- **Modern Standard Arabic (فصحى)** — for formal content: reading, writing, grammar, dictation, literature

Mr. Helmy models natural code-switching: amiya to chat, fusha to teach. This is exactly how every Egyptian classroom works.

### Arabic Curriculum (2-3 sessions/week)

| Year | Focus |
|------|-------|
| K-Y1 | Alphabet recognition, letter formation, connecting letters, short vowels (tashkeel), basic reading |
| Y2-Y3 | Reading fluency, simple composition, MSA grammar basics, dictation |
| Y4-Y5 | Formal grammar (nahw/sarf basics), essay writing, reading literature, comprehension |
| Y6 | Advanced composition, formal letters, reading news, public speaking in Arabic |

Handwriting practice via tablet camera — Arabic script needs physical practice. Mr. Helmy reads aloud in fusha, discusses in amiya.

### Tourism Language Tasters
Fun, non-formal exposure to languages tourists speak: Italian ("Buongiorno!"), German ("Guten Morgen!"), French ("Bonjour!"). Not a curriculum — a weekly 5-minute fun segment during Tourism/Hospitality block. Incredibly useful for future hospitality careers.

### Summary

| Context | Language |
|---------|----------|
| Math, Science, ELA, Social Studies, Conservation, Tourism | **English** (with brief Arabic hints for young kids when stuck) |
| Arabic class | **Arabic** — amiya for framing + fusha for content |
| Facilitator Dashboard | **Arabic-first** |
| Field trips | **English** narration via tablets, Arabic between kids naturally |
| Tourism simulation | **English** (that's the whole point) |
| Parent/Community Dashboard | **Arabic + English** |

---

## Certification — Decided: Option C (Clonlara + Iowa Assessments)

### Accredited Transcripts: Clonlara School
- **Accreditation:** MSA-CESS (Middle States Association) — recognized worldwide
- **Program:** Off-Campus Program — use your own curriculum, Clonlara certifies
- **Cost:** ~$1,460/student/year + $210 registration (first year)
- **How it works:** Mr. Helmy auto-generates 2 progress reports per year from mastery data, portfolio work, and expedition logs. Clonlara reviews and issues official accredited transcripts showing grade completion.
- **Students in 80+ countries.** Explicitly designed for families/schools using their own curriculum.
- **Transcripts can be Apostilled** (Egypt is Hague Convention member) for legal recognition.
- **Website:** clonlara.org

### Standardized Testing: Iowa Assessments via Seton Testing
- **Test:** IOWA E Online Complete
- **Cost:** ~$50/student/year
- **How it works:** Kids take the test online on their tablets. Facilitator proctors. Results show nationally-normed percentile scores and grade-level equivalency.
- **Mr. Helmy adds Iowa prep module** 2-3 weeks before test date.
- **Website:** setontesting.com

### What Mr. Helmy Auto-Generates for Certification

| Certification Task | Mr. Helmy's Role |
|-------------------|-----------------|
| Progress reports (2/year) | Auto-generated from mastery data, portfolios, expedition logs |
| Portfolio documentation | Every lesson, assessment, project, field trip already logged |
| Standardized test prep | Iowa prep module activated 2-3 weeks before test |
| Test administration | Kids take Iowa E Online on tablets, facilitator proctors |
| Transcript data mapping | Maps each child's mastery to American grade-level standards |

### Total Annual Cost for 8 Kids
- Clonlara: ~$13,000
- Iowa Assessments: ~$400
- **Total: ~$13,400/year for full international certification**

### The Path for These Kids

```
Ages 5-11: Horizon School (Grades K-5)
├── Daily: Mr. Helmy teaches American curriculum + Conservation + Tourism
├── Yearly: Clonlara issues accredited transcript per grade
├── Yearly: Iowa Assessment confirms grade-level performance
└── Portfolio: Rich evidence (species guides, projects, presentations)

Ages 11-12+: Secondary school options
├── International school in Egypt (El Gouna, Cairo) — transcripts accepted
├── International school abroad — Clonlara + Iowa scores accepted globally
├── Online secondary school (Bridgeway, IVLA, Laurel Springs)
└── Or: Horizon expands to cover secondary grades
```

### Long-Term: Direct Cognia Accreditation
When Horizon grows past 15-20 students or opens more schools, pursue Cognia accreditation directly ($5,000-15,000 setup). "Horizon School" on the transcript instead of Clonlara. Year 2-3 goal, not launch requirement.

### Action Items
1. Contact Clonlara (clonlara.org) — ask about enrolling 6-10 students from a small school in Egypt, group pricing
2. Order Iowa E Online from Seton Testing (setontesting.com) for baseline assessment
3. Contact NWEA about MAP Growth school account (optional — more recognized internationally than Iowa, ~$10-15/student/test)

---

## Open Questions (For Us)

- **Curriculum standard:** School owner said "Macmillan" — need to identify exact program. Awaiting: photo of textbook covers, which subjects covered, which grade levels. Mr. Helmy's skill graph architecture works with any curriculum — just need the specific scope and sequence to build from.
- **Mr. Helmy's visual design:** What does he look like? Photo-realistic, illustrated, animated?
- **Multi-grade group lessons:** How does Mr. Helmy handle a room with a 5-year-old and an 11-year-old in the same lesson?

---

## Platform Name & Branding

| Element | Value |
|---------|-------|
| **Platform name** | Horizon |
| **Character name** | Mr. Helmy |
| **Tagline energy** | "Look further. Learn more. Build the future." |
| **Visual identity** | TBD — should reflect the Red Sea coast, blue/teal tones likely |
