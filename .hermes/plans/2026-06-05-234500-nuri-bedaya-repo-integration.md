# Nuri & Bedaya — Repo Integration Assessment for Production-Grade Standard

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> **Goal:** Integrate or replace current code with open-source repo resources to reach production-grade quality.
> **Architecture:** 5 repos to integrate (ts-fsrs, OATutor, vercel/ai, SpeakerRecognition, DeepTutor patterns), 3 repos as design references (Antura, Open-TutorAi, VibeVoice).

**Reviewed:** June 5, 2026
**Current State:** Nuri v1 (22 pages, 33 components, 30 services), Bedaya v0.1 (4 pages, 2 components)

---

## CURRENT ARCHITECTURE — What Exists Today

### AI Layer
- `server/src/services/ai-provider.js` — manual Claude/Ollama switch (40 lines)
- `server/src/services/claude.js` — Anthropic SDK wrapper (25KB)
- `server/src/services/ollama.js` — Ollama REST wrapper (9.7KB)
- Both implement: `buildSystemPrompt`, `chat`, `generateQuizQuestion`, `buildExplainBackPrompt`

### Learner Intelligence (scoring/memory/mastery)
- `server/src/services/xp.js` — fixed XP values, linear level thresholds, streak tracking
- `server/src/services/session-memory.js` — flat CRUD: save/load last session, struggled topics
- `server/src/services/child-profile.js` — aggregates everything into a context string per child
- `server/src/services/objective-mastery.js` — star system (1-5), mastered at 3 stars
- `server/src/services/teaching-intelligence.js` — records approach effectiveness (3 layers)
- `server/src/services/learning-needs.js` — adaptation prompts
- `server/src/services/prerequisites.js` — dependency checking between topics
- `server/src/services/levels.js` — subject-level placement with diagnostic
- `server/src/services/diagnostic.js` — adaptive staircase placement (152 lines)

### Curriculum
- 8 curriculum files (maths, science, english, history, arabic, religion, religion-islamic, socialstudies)
- Cambridge + Egyptian National, Years 1-6

### Bedaya
- `bedaya/src/` — React 19 + Vite + Tailwind RTL
- `server/src/services/bedaya/` — lesson planning, letter sequencing, story generation
- `server/src/routes/bedaya.js` — REST API for learners/lessons/story

---

## REPO-BY-REPO ASSESSMENT

---

### 1. ts-fsrs (Spaced Repetition Scheduler) — ✓ INTEGRATE

| Field | Value |
|-------|-------|
| Repo | `open-spaced-repetition/ts-fsrs` |
| License | MIT |
| Stars | 682 · Forks 66 · 87 releases |
| Lang | TypeScript (80.8%), Rust binding (11.6%) |
| Version | FSRS v6 (latest) |
| npm | `ts-fsrs` + `@open-spaced-repetition/binding` |

**What it provides:**
- Memory-decay-based review scheduling — schedules review sessions based on individual forgetting curves
- Four rating outcomes: `Again(1)`, `Hard(2)`, `Good(3)`, `Easy(4)`
- `scheduler.repeat(card, now)` — preview all 4 outcomes
- `scheduler.next(card, now, rating)` — apply user's rating, get next review date
- Parameter optimizer (`@open-spaced-repetition/binding`) — trains custom parameters from review logs

**What Nuri currently has:**
- `server/src/services/review.js` (exists as a route) — manual review queue of mistakes
- No scheduling algorithm — review is triggered manually or by mistake count
- No memory decay model — same interval for everything

**Integration plan:**
1. `npm install ts-fsrs` in server
2. Create `server/src/services/spaced-repetition.js` wrapping FSRS
3. Add `review_cards` table to schema (card_id, profile_id, topic, state, due, stability, difficulty)
4. On quiz answer → call `scheduler.next()` → update card state
5. Replace `GET /api/review` with FSRS-scheduled queue (cards due today, sorted by retrievability)
6. Per-child parameters trainable over time via `@open-spaced-repetition/binding`

**Verdict:** Production-grade. 87 releases, 253 dependents on npm. Directly replaces our ad-hoc review system.

---

### 2. OATutor (Bayesian Knowledge Tracing) — ✓ INTEGRATE

| Field | Value |
|-------|-------|
| Repo | `CAHLR/OATutor` |
| License | MIT |
| Stars | 210 · Forks 137 |
| Lang | JavaScript (98.3%) |
| Research | CHI 2023, PLOS ONE 2024 |
| Latest Release | v1.7 (Jan 2026) |

**What it provides:**
- **Bayesian Knowledge Tracing (BKT)** — probabilistic model of skill mastery
- Models each skill as a latent variable: P(know) = probability student has mastered
- Four parameters per skill: `p_guess`, `p_slip`, `p_learn`, `p_init`
- Updates after each answer: `P(mastered | correct) = P(correct | mastered) × P(mastered) / P(correct)`
- No fixed threshold — mastery is a probability, not a star count

**What Nuri currently has:**
- `server/src/services/objective-mastery.js` — simple star system:
  - Answer correct: +1 star (max 5)
  - 3+ stars → "mastered"
  - No differentiation between lucky guess vs. true understanding
  - No slip modeling (kid knows it but made a careless error)

**Integration plan:**
1. Create `server/src/services/bkt.js` — pure math, no dependencies
   - `initSkill(p_init=0.5)` → returns skill state
   - `updateSkill(skill, correct)` → returns new P(mastered)
   - `isMastered(skill, threshold=0.85)` → boolean
2. Add `bkt_skills` table: profile_id, subject, topic, p_know, p_guess, p_slip, p_learn, n_attempts
3. Replace `topic_mastery.stars` with BKT probabilities
4. Keep `stars` as a visual display only (kids/parents understand stars), derive stars from P(mastered):
   - ≥0.95 → 5 stars, ≥0.85 → 4, ≥0.70 → 3, ≥0.50 → 2, <0.50 → 1
5. Adaptive item selection: pick problems targeting skills with lowest P(mastered)

**Verdict:** Production-grade. Published at CHI 2023, classroom-tested through Fall 2024. Pure algorithm — no heavy dependencies. Replaces our star-counting heuristic with proper mastery modeling.

---

### 3. vercel/ai — ✓ REPLACE CURRENT AI LAYER

| Field | Value |
|-------|-------|
| Repo | `vercel/ai` |
| License | Apache-2.0 |
| Stars | 24.2k · 5000+ releases |
| Lang | TypeScript |

**What it provides:**
- `@ai-sdk/anthropic` — Claude streaming
- `@ai-sdk/ollama` — Ollama provider with same interface
- `generateText()`, `streamText()`, `generateObject()` with Zod schemas
- One-line provider swap
- Built-in retry, error handling, token counting

**What Nuri currently has:**
- `ai-provider.js` — manual switch, 40 lines of wiring
- `claude.js` — raw Anthropic SDK calls, manual prompt building (25KB)
- `ollama.js` — raw fetch() to Ollama API, duplicated prompt building (9.7KB)
- All prompt building duplicated between providers
- No streaming on Claude path

**Integration plan:**
1. `npm install ai @ai-sdk/anthropic @ai-sdk/ollama zod` in server
2. Create `server/src/services/ai.js` — unified AI service:
   ```js
   import { generateText, generateObject, streamText } from 'ai'
   import { anthropic } from '@ai-sdk/anthropic'
   import { ollama } from '@ai-sdk/ollama'
   import { z } from 'zod'

   const provider = process.env.AI_PROVIDER === 'ollama' ? ollama : anthropic
   const model = provider(process.env.AI_MODEL || 'claude-sonnet-4-20250514')
   ```
3. Delete `server/src/services/claude.js`, `server/src/services/ollama.js`, `server/src/services/ai-provider.js`
4. Migrate all current AI calls:
   - `chat()` → `generateText()` with system/user prompts
   - `generateQuizQuestion()` → `generateObject()` with Zod schema for question shape
   - `generateExplainBackPrompt()` → `streamText()` for real-time explanation feedback
5. All curriculum services import from single `ai.js`

**Verdict:** Production-grade. Vercel's official SDK. Cuts ~35KB of duplicated code down to one file. Enables streaming everywhere.

---

### 4. SpeakerRecognitionGroupProject — ✓ ADD VOICE LOGIN

| Field | Value |
|-------|-------|
| Repo | `sambawy01/SpeakerRecognitionGroupProject` |
| License | None (own repo) |
| Stack | ResNet50 + ArcFace + cosine similarity |
| Hardware | RPi4 |

**What it provides:**
- One-shot voice enrollment: kid says their name once → voiceprint stored
- >90% accuracy for speaker identification
- ResNet50 backbone for voice feature extraction, ArcFace for embedding, cosine similarity for matching

**What Nuri currently has:**
- Manual profile selection on WelcomePage — kid taps their name/avatar
- Web Speech API for answer input only
- No voice biometrics

**Integration plan:**
1. Deploy speaker recognition as a REST microservice (`POST /enroll`, `POST /identify`)
2. Add to Nuri client: "Who's learning today?" → listens → identifies → loads profile
3. Fallback: if confidence < threshold, show profile picker
4. Privacy: voiceprints stored locally, never leave the device unless parent opts in
5. The doc says this is a key differentiator — no login screen for kids

**Verdict:** Adds magic UX. One-shot enrollment. Own repo so no license issue. Needs testing for child voice accuracy (higher pitch).

---

### 5. DeepTutor — ✓ ADOPT ARCHITECTURE PATTERNS (not code)

| Field | Value |
|-------|-------|
| Repo | `HKUDS/DeepTutor` |
| License | Apache-2.0 |
| Stars | 24.6k · Forks 3.3k |
| Stack | Python + Next.js (not compatible with Nuri's stack) |

**Cannot directly integrate — different stack (Python backend, not Node).** But three patterns are worth adopting:

**Pattern A: Three-Layer Memory**
- Nuri's current: `session-memory.js` is flat CRUD, `child-profile.js` builds context string
- DeepTutor's L1 (append-only traces), L2 (per-surface curated facts), L3 (cross-surface synthesis)
- Adopt by: rename session-memory → L2, add L1 trace table (all interactions), child-profile becomes L3

**Pattern B: TutorBot Soul Templates (SKILL.md)**
- Nuri's current: hardcoded system prompt in ollama.js/claude.js
- DeepTutor: editable SKILL.md files per persona
- Adopt by: create `server/src/services/persona.js` with profiles like `nuri-maths.md`, `nuri-science.md`

**Pattern C: Skill injection for curriculum switching**
- Nuri's current: all subjects use same prompt pattern
- DeepTutor: different Skills loaded per context
- Adopt by: subject-specific teaching styles injected into prompt

**Integration plan:**
1. Add `skill_memory` table — L1 traces of every interaction
2. Refactor `session-memory.js` into L2 curated facts
3. Refactor `child-profile.js` into L3 synthesis
4. Create `server/personas/` directory with subject-specific Nuri personas
5. Load persona template into each prompt

**Verdict:** Patterns only, not code. The 3-layer memory architecture is what Nuri needs to go from "remembers last session" to "remembers everything intelligently."

---

### 6. Antura — ✗ REFERENCE ONLY

| Field | Value |
|-------|-------|
| Repo | `vgwb/Antura` |
| License | BSD-2-Clause (code), CC BY 4.0 (assets) |
| Stars | 113 |
| Stack | Unity 6.x, C# 97% |

**Cannot integrate — Unity game engine, not web.** Zero code reuse possible.

**What to reference:**
- Arabic letter introduction order — Antura's proven sequencing
- Difficulty curve for letter shapes (distinguishing similar glyphs)
- Mini-game progression patterns — warm-up → practice → reward loop

**Verdict:** Design reference for Bedaya's Arabic sequencing. Compare Bedaya's letter order against Antura's to validate.

---

### 7. Open-TutorAi CE — ✗ REFERENCE ONLY

| Field | Value |
|-------|-------|
| Repo | `Open-TutorAi/open-tutor-ai-CE` |
| License | BSD-3-Clause |
| Stars | 64 |
| Stack | Svelte + Python (different stack) |

**Cannot integrate — different frontend + backend stack.**

**What to reference:**
- Avatar-powered voice discussion mode pattern
- RBAC for teacher/student/parent roles
- Multi-model conversation pattern (future feature)

**Verdict:** Design reference for future voice/avatar features. CE edition is small (64 stars, 10 contributors). Nuri's custom NuriOwl component already serves this role.

---

### 8. VibeVoice — ✗ FUTURE ONLY (R&D)

| Field | Value |
|-------|-------|
| Repo | `microsoft/VibeVoice` |
| License | MIT |
| Stars | 33k |
| Status | ICLR 2026 Oral — R&D only |

**Microsoft explicitly says: not production without further testing.** Integration now is premature.

**What it could eventually provide:**
- 300ms streaming Arabic TTS (replaces Web Speech API)
- 60-min ASR with speaker diarization and hotword injection
- Phonics recognition loop for Bedaya (validate child's letter pronunciation)

**Verdict:** Watch. When production-ready, replaces Web Speech API entirely. Current Web Speech API is adequate for MVP.

---

## PRIORITY ROADMAP

### Phase 1 — Core Intelligence (Week 1-2)
These three repos replace the engine of Nuri:

| # | Task | Repo | Effort |
|---|------|------|--------|
| 1 | Install vercel/ai, create unified `ai.js`, delete claude.js/ollama.js/ai-provider.js | vercel/ai | 4h |
| 2 | Migrate all AI calls to `generateText`/`generateObject`/`streamText` | vercel/ai | 8h |
| 3 | Add `ts-fsrs`, create `spaced-repetition.js`, add review_cards table | ts-fsrs | 6h |
| 4 | Replace review route with FSRS scheduling | ts-fsrs | 4h |
| 5 | Create `bkt.js`, port BKT algorithm from OATutor paper | OATutor | 4h |
| 6 | Add `bkt_skills` table, migrate from stars to probability | OATutor | 6h |
| 7 | Update objective-mastery.js to use BKT as source of truth | OATutor | 4h |

### Phase 2 — Memory & Persona (Week 2-3)

| # | Task | Repo | Effort |
|---|------|------|--------|
| 8 | Add `skill_memory` L1 trace table | DeepTutor patterns | 3h |
| 9 | Refactor session-memory.js into L2 curated facts | DeepTutor patterns | 4h |
| 10 | Upgrade child-profile.js to L3 cross-surface synthesis | DeepTutor patterns | 6h |
| 11 | Create `server/personas/nuri-maths.md`, `nuri-science.md`, etc. | DeepTutor patterns | 4h |
| 12 | Wire persona loading into ai.js prompt pipeline | DeepTutor patterns | 2h |

### Phase 3 — Voice & UX (Week 3-4)

| # | Task | Repo | Effort |
|---|------|------|--------|
| 13 | Deploy speaker-recognition as REST service | SpeakerRecognition | 8h |
| 14 | Add voice enrollment/identification to WelcomePage | SpeakerRecognition | 6h |
| 15 | Validate Bedaya letter order against Antura | Antura (ref) | 2h |
| 16 | Add FSRS scheduling to Bedaya lesson plans | ts-fsrs | 4h |

### Phase 4 — Future (post-MVP)

| # | Task | Repo | Effort |
|---|------|------|--------|
| 17 | VibeVoice TTS/ASR integration when production-ready | VibeVoice | TBD |
| 18 | Avatar discussion mode (reference Open-TutorAi pattern) | Open-TutorAi (ref) | TBD |

---

## FILES THAT CHANGE

### Created:
- `server/src/services/ai.js` — unified AI service (replaces claude.js + ollama.js + ai-provider.js)
- `server/src/services/spaced-repetition.js` — FSRS wrapper
- `server/src/services/bkt.js` — Bayesian Knowledge Tracing
- `server/src/services/persona.js` — persona loader
- `server/personas/nuri-default.md` — default Nuri soul template
- `server/personas/nuri-maths.md` — maths-specific persona
- `server/personas/nuri-science.md` — science-specific persona
- `server/personas/nuri-arabic.md` — Arabic/RTL persona
- `server/src/db/migrate-v13.js` — adds `review_cards`, `bkt_skills`, `skill_memory` tables

### Modified:
- `server/src/services/objective-mastery.js` — BKT integration
- `server/src/services/session-memory.js` — L2 refactor
- `server/src/services/child-profile.js` — L3 synthesis
- `server/src/services/teaching-intelligence.js` — wire into new memory layers
- `server/src/routes/review.js` — FSRS scheduling
- `server/src/routes/bedaya.js` — FSRS for lessons
- `client/src/pages/WelcomePage.jsx` — voice ID
- `server/package.json` — add `ai`, `@ai-sdk/anthropic`, `@ai-sdk/ollama`, `ts-fsrs`, `zod`

### Deleted:
- `server/src/services/claude.js` — replaced by `ai.js`
- `server/src/services/ollama.js` — replaced by `ai.js`
- `server/src/services/ai-provider.js` — replaced by `ai.js`

### Kept (reference):
- `server/src/services/curriculum*.js` — curriculum data is Nuri's own, no repo replaces it
- `server/src/services/xp.js` — gamification layer, BKT handles mastery but XP stays for motivation
- `server/src/services/diagnostic.js` — adaptive placement stays, BKT enhances it

---

## RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| vercel/ai migration could break all AI calls | Create `ai.js` alongside existing files, test in parallel before deleting old ones |
| FSRS parameters need per-child tuning | Start with defaults, run optimizer weekly on review logs |
| BKT cold start (no data for new skills) | Seed p_init=0.5 (standard), use curriculum year group as prior |
| Speaker recognition accuracy on children | Test with actual child voices, fallback to profile picker on low confidence |
| Bedaya already has letter ordering | Compare against Antura, adjust if significantly different |

---

## VERIFICATION

After each phase:
1. Run existing test suite (if any)
2. Manually test: complete a quiz → verify BKT probability updates
3. Manually test: answer cards in review → verify FSRS schedules future review
4. Manually test: switch `AI_PROVIDER=ollama` → verify streaming works via vercel/ai
5. Load test: 100 concurrent quiz generations → verify no regression
