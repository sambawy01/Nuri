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
