# NURI_PERFORMANCE_REPORT.md

## Overview

This report documents the evolution of Nuri's AI learning engine across 5 phases, tracking the integration of cognitive models (FSRS, BKT), memory architecture (L0-L3), and teaching intelligence. Last updated: June 2026.

---

## Phase 1: Foundation (commit 3797c74)

### Goals
- Unify AI service layer (`ai.js`)
- Implement FSRS spaced repetition
- Implement BKT (Bayesian Knowledge Tracing) for skill mastery tracking
- Add skill-memory L1 traces for DeepTutor

### Components
- **FSRS**: `server/src/services/spaced-repetition.js` — implements Free Spaced Repetition Scheduler
- **BKT**: `server/src/services/objective-mastery.js` — records skill attempts, calculates mastery probability
- **Skill Memory**: `server/src/services/skill-memory.js` — logs L1 traces (breakthroughs, struggles)
- **Unified AI**: `server/src/services/ai.js` — single entry point for all AI calls

### Status: ✅ COMPLETE

---

## Phase 2: DeepTutor L2/L3 (commit 6b92251)

### Goals
- Implement L2 working memory (session-level facts)
- Implement L3 cross-subject synthesis
- Add teaching personas
- Add voice login for Years 1-2

### Components
- **L2 Working Memory**: `server/src/services/session-memory.js` — extracts and stores working facts per session
- **L3 Synthesis**: `server/src/services/child-profile.js:getSynthesis()` — cross-subject pattern synthesis from BKT data
- **Teaching Personas**: `server/src/services/ai.js:buildPersonaPrompt()` — persona-based tone adjustment
- **Voice Login**: `server/src/routes/auth.js` — voiceprint-based authentication for young children

### Status: ✅ COMPLETE

---

## Phase 3: v15 Parent Dashboard (commit 9909d84)

### Goals
- Parent dashboard with progress overview
- Story mode for immersive learning
- Learning needs system (dyslexia, ADHD, autism, dyscalculia)

### Components
- **Parent Dashboard**: `server/src/routes/parent.js` — progress, badges, time spent, suggested actions
- **Story Mode**: `server/src/routes/story.js` — narrative-driven learning with branching
- **Learning Needs**: `server/src/services/learning-needs.js` — adaptation prompts, behavioral observations
- **Behavioral Observations**: `server/src/services/learning-needs.js:recordObservation()` — tracks patterns

### Status: ✅ COMPLETE

---

## Phase 4: Gap Analysis (June 2026)

### What Was Wired

| System | Injected | Where |
|--------|----------|-------|
| **L2 Working Memory** | Yes | `getChildProfile → getMemoryContext → getWorkingFacts` |
| **L3 Synthesis** | Yes | `getChildProfile → getSynthesis` |
| **Learning Style** | Yes | `ai.js:buildSystemPrompt` (learn mode), `getChildProfile` (all modes) |
| **Learning Adaptations** | Yes | `getChildProfile → buildAdaptationPrompt` |
| **Session Memory** | Yes | Via `getMemoryContext` in `getChildProfile` |
| **BKT Mastery** | Yes | `quiz.js:243-247`, `review.js:236-240` |
| **FSRS Review Cards** | Yes | `quiz.js:250-284`, `review.js:188-233` |
| **Skill Memory (L1)** | Yes | Logged in quiz + review routes |

### Gaps Identified

1. **Teaching Intelligence NOT in Quiz Mode** — Only built for `mode === 'learn'`
2. **Behavioral Observations NOT recorded** — `recordObservation()` existed but never called
3. **Pattern Analysis NOT triggered** — `analyzePatterns()` existed but never called
4. **Performance Report not saved** — This file didn't exist on disk

---

## Phase 5: Gap Fixes (June 2026)

### Fix 1: Teaching Context in Quiz Mode
**File**: `server/src/routes/chat.js`
- Added lite teaching context for quiz mode
- Strips golden explanations + error-fixes (heavy DB queries)
- Keeps only child's personal teaching profile

```javascript
const teachingContext = mode === 'learn' 
  ? await buildTeachingContext(...)
  : await buildTeachingContext(...).then(ctx => {
      // Strip golden explanations, keep only personal profile
      const lines = ctx.split('\n');
      const lite = lines.filter(l => 
        l.startsWith('TEACHING APPROACHES') || 
        l.startsWith('APPROACHES TO AVOID') ||
        l.startsWith('LAST BREAKTHROUGH')
      ).join('\n');
      return lite;
    });
```

### Fix 2: Wire Behavioral Observations
**File**: `server/src/routes/quiz.js`
- Added import for `recordObservation`
- Records 4 observation types:
  - `fast_guess`: answer time < 3s + wrong
  - `blind_spot`: confidence = 'knew_it' + wrong
  - `lucky_guess`: confidence = 'guessed'/'unsure' + correct
  - `repeated_mistake`: 3+ wrong answers on same topic in 1 hour

```javascript
const answerTime = req.body.answerTimeMs || 0;
if (answerTime > 0 && answerTime < 3000 && !isCorrect) {
  recordObservation(profileId, 'fast_guess', { topic, timeMs: answerTime }, 'quiz');
} else if (confidence === 'knew_it' && !isCorrect) {
  recordObservation(profileId, 'blind_spot', { topic }, 'quiz');
} // ... etc
```

### Fix 3: Periodic Pattern Analysis
**File**: `server/src/routes/chat.js`
- Triggers `analyzePatterns()` every 10 learn messages (~1 session)
- Stores detected flags in new `learning_need_flags` table for parent dashboard

**File**: `server/src/db/schema.sql`
- Added `learning_need_flags` table

```javascript
if (mode === 'learn' && msgCount > 0 && msgCount % 10 === 0) {
  analyzePatterns(profileId).then(flags => {
    if (flags.length > 0) {
      pool.query(`INSERT INTO learning_need_flags ...`);
    }
  });
}
```

### Fix 4: Save This Report
- Written to: `docs/NURI_PERFORMANCE_REPORT.md`

---

## Remaining Work

### Not Yet Wired (Future Phases)

| Gap | Description | Priority |
|-----|-------------|----------|
| Learning Need Flags UI | Parent dashboard needs to display `learning_need_flags` | Medium |
| Specialist Referral | Auto-referral to specialist when flags exceed threshold | Low |
| Cross-Device Sync | Sync session memory across devices | Low |
| Real-time Intervention | Pause session when disengagement detected | Low |

---

## Database Schema Summary

Key tables for AI context:
- `profiles` — child profiles (year_group, name, preferences)
- `session_memory` (L0) — short-term session events
- `skill_memory` (L1) — per-skill traces (breakthroughs, struggles)
- `working_facts` (L2) — aggregated session facts
- `bkt_skills` (L3) — cross-subject synthesis data
- `learning_needs` — dyslexia, ADHD, autism, dyscalculia flags
- `behavioral_observations` — raw observation data
- `learning_need_flags` — analyzed pattern flags (new)
- `golden_explanations` — proven teaching approaches
- `teaching_outcomes` — per-child teaching effectiveness
- `review_cards` — FSRS spaced repetition cards

---

## End of Report