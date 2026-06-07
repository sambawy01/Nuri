# StudyBuddy — Anti-Anxiety Scoring System
## A Scoring Philosophy Designed to Build Confidence, Not Destroy It

*Extends studybuddy-spec.md (Section 7: Gamification System)*
*Informed by: ixl-competitive-analysis.md (SmartScore critique)*

**Version:** 1.0
**Date:** March 31, 2026
**Core Belief:** A child who is afraid to get something wrong will stop trying. A child who feels safe making mistakes will never stop learning.

---

## Table of Contents

1. [Core Principle: XP Never Decreases](#1-core-principle-xp-never-decreases)
2. [Effort-Based XP System](#2-effort-based-xp-system)
3. [Journey Map Visualization](#3-journey-map-visualization)
4. [Streak Protection](#4-streak-protection)
5. [Wrong Answer Experience](#5-wrong-answer-experience)
6. [Mastery System](#6-mastery-system)
7. [Comparison to IXL's SmartScore](#7-comparison-to-ixls-smartscore)
8. [Database Schema](#8-database-schema)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Core Principle: XP Never Decreases

### 1.1 The Golden Rule

**XP is cumulative and can NEVER go down. Not by one point. Not ever.**

This is the single most important design decision in Nuri's scoring system. IXL's SmartScore (rated 1.1/5 stars on Trustpilot) routinely drops children from 99 to 79 after a single wrong answer. Children report crying, panic attacks, and developing anxiety about the very subjects they are trying to learn. A Change.org petition exists specifically to change SmartScore. Parents describe their children as "devastated" and "feeling stupid."

Nuri does the opposite. Every interaction with Nuri makes your XP number go up or stay the same. It never goes down. Period.

### 1.2 No Fluctuating Score

There is no visible score out of 100 that bounces up and down. IXL shows a SmartScore that can swing wildly (75 to 50 after one wrong answer), which creates a gambling-like emotional volatility that is developmentally inappropriate for 5-11 year olds.

Instead, Nuri shows:
- **Total XP** — a single cumulative number that only ever increases (displayed on profile)
- **Journey Map** — a visual path that only moves forward (displayed on home screen)
- **Star Mastery** — per-topic stars that only light up, never dim (displayed on subject pages)

None of these metrics can decrease. A child can close the app, come back a week later, and everything is exactly where they left it or better.

### 1.3 Progress as a Journey, Not a Judgement

Progress is shown as Nuri flying across a beautiful illustrated map. The metaphor is deliberate: you are on a journey of learning. You can pause, you can rest, you can slow down -- but you never go backward. The path behind you stays colorful and complete. The path ahead is exciting, not threatening.

### 1.4 Why This Matters Developmentally

Children aged 5-11 are in Erikson's "Industry vs. Inferiority" stage. Their core psychological task is developing a sense of competence. A scoring system that punishes mistakes directly undermines this developmental need and can create lasting negative associations with learning. Nuri's scoring system is designed to reinforce the message: "You are capable. You are growing. Every effort counts."

---

## 2. Effort-Based XP System

### 2.1 Design Philosophy

The existing XP table (studybuddy-spec.md Section 7.1) already awards +5 XP for wrong answers. This spec replaces and significantly enhances that table with a comprehensive effort-based system that rewards the full spectrum of learning behaviors, not just correct answers.

The key insight: **getting the right answer is only ONE way to learn.** Asking for help, trying again, coming back to review a mistake, and explaining your thinking are all valuable learning behaviors that deserve recognition.

### 2.2 Enhanced XP Table

#### Quiz Mode XP

| Action | XP Earned | Rationale |
|--------|-----------|-----------|
| Correct on first try | +15 XP | Strong knowledge — celebrate it |
| Correct on first try (Hard/Challenge Me) | +20 / +25 XP | Extra reward for choosing difficulty (integrates with Difficulty Dial, Feature 11) |
| Correct on second try (after hint) | +10 XP | Used a resource and still got it — great learning |
| Correct after "Explain Simpler" | +12 XP | Asked for help, understood the simpler explanation, and applied it. This is LEARNING. |
| Wrong but attempted seriously | +5 XP | Showed up and tried. That matters. |
| Wrong but explained their reasoning | +7 XP | Even wrong reasoning shows engagement. Bonus for articulating thought process. |
| Used Confidence Meter honestly | +2 XP | Self-awareness is a skill worth rewarding (integrates with Feature 19) |

#### Streak and Consistency XP

| Action | XP Earned | Rationale |
|--------|-----------|-----------|
| 5-question streak (all correct) | +25 XP bonus | Sustained accuracy |
| 10-question streak (all correct) | +50 XP bonus | Exceptional run |
| Daily login | +5 XP | Showing up matters |
| Completed a full quiz (10+ questions) | +10 XP bonus | Finished what you started |

#### Learning Behavior XP

| Action | XP Earned | Rationale |
|--------|-----------|-----------|
| Completed a Learn Mode session (5+ messages) | +20 XP | Engaged with teaching content |
| Asked Nuri to explain more (curiosity) | +3 XP | Curiosity is the engine of learning |
| Asked "why?" or "how?" follow-up | +3 XP | Deeper thinking |
| Used Explain It Back successfully | +15 XP | Teaching is the highest form of understanding |
| Reviewed a Mistake Journal item | +5 XP | Revisiting errors takes courage |
| Resolved a Mistake Journal item (got it right on retry) | +10 XP | Redemption — came back and conquered it |
| Completed a topic they previously struggled with (< 50% accuracy, now > 70%) | +30 XP bonus | Perseverance bonus — the most meaningful XP in the system |

#### Weekly and Special XP

| Action | XP Earned | Rationale |
|--------|-----------|-----------|
| Weekly Challenge correct | +100 XP | Big reward for the weekly stretch goal |
| First time trying a new subject | +10 XP | Bravery bonus for exploring |
| Came back after 3+ days away | +15 XP | Welcome back — no penalty for the break |
| Completed study plan day (Pre-Test Predictor) | +20 XP | Staying on track for the test |

### 2.3 XP Multipliers

| Condition | Multiplier | Notes |
|-----------|-----------|-------|
| Active daily streak (7+ days) | 1.2x | Small bonus for consistency |
| Active daily streak (30+ days) | 1.5x | Significant bonus for dedication |
| Weekend study session | 1.3x | Studying when you don't have to? Extra credit. |
| Difficulty set to Hard | 1.3x | Stacks with base XP (integrated with Difficulty Dial) |
| Difficulty set to Challenge Me | 1.5x | Stacks with base XP |

### 2.4 XP Display Rules

- XP is always shown as a positive, growing number: "1,247 XP" with an upward arrow
- When XP is earned, a small "+15 XP" floats up from Nuri with a gentle sparkle animation
- The total never shows a minus sign. There is no mechanism to subtract XP.
- Level progress bar fills up smoothly. It never goes backward.
- Level thresholds remain as defined in studybuddy-spec.md Section 7.2

### 2.5 Anti-Gaming Protections

Since XP only goes up, we need to prevent exploitation:

- **Spam clicking:** XP for wrong answers only awards once per unique question. Answering the same question wrong repeatedly does not stack +5 XP.
- **Rapid random answers:** If 5+ answers are submitted in under 3 seconds each, flag as "rushing" — award +1 XP each instead of +5 XP. Nuri gently says: "Slow down! I can tell you're rushing. Take your time -- I'm not going anywhere!"
- **Easy mode farming:** Staying on Easy difficulty for 20+ consecutive quizzes triggers a gentle Nuri nudge (already handled by Difficulty Dial adaptive suggestions).
- **Curiosity XP farming:** "Explain more" and "Why?" XP caps at 5 per session (15 XP max from curiosity per session).
- **Session XP cap:** No hard cap on total session XP, but after 45 minutes, Nuri suggests a break (existing session management behavior).

---

## 3. Journey Map Visualization

### 3.1 Concept

Instead of showing a fluctuating number (like IXL's SmartScore), Nuri shows a beautiful illustrated world map. The child's progress is visualized as Nuri flying across this map, visiting different lands. Each subject is a themed "land" and each topic within that subject is a waypoint or stop along the path.

The map NEVER goes backward. Nuri can only fly forward or hover at the current position.

### 3.2 Subject Lands

| Subject | Land Name | Theme | Color Palette |
|---------|-----------|-------|---------------|
| Maths | The Number Peaks | Mountain range with geometric shapes carved into stone | Blues and silvers |
| English | Story Forest | Enchanted forest with giant books as trees, letters floating like leaves | Greens and golds |
| Science | Discovery Isles | Chain of islands connected by bridges, each with a different biome | Teals and oranges |
| Arabic | The Calligraphy Sands | Beautiful desert with sand dunes shaped like Arabic letters, oasis gardens | Warm golds and deep reds |
| Islamic Studies | The Crescent Gardens | Peaceful gardens with crescent-moon archways, fountains, and lanterns | Purples and moonlight silver |
| Social Studies (if applicable) | The Timeline Trail | Path through different historical eras, landmarks from various civilizations | Earthy browns and sunset hues |

### 3.3 Waypoint System

Each land contains **waypoints** corresponding to the topics within that subject for the child's year group.

**Example: Year 3 Maths — The Number Peaks**

```
Waypoint 1: Foothills of Place Value (Place value up to 1000)
Waypoint 2: Addition Bridge (3-digit addition/subtraction)
Waypoint 3: Times Tables Cave (3, 4, 8 tables)
Waypoint 4: Fraction Falls (unit and non-unit fractions)
Waypoint 5: Measurement Meadow (mm, cm, m, g, kg, ml, l)
Waypoint 6: Clock Tower (telling time to the nearest minute)
Waypoint 7: Shape Summit (2D/3D shapes, right angles)
Waypoint 8: Chart Clearing (bar charts and pictograms)
```

### 3.4 Visual States

Each waypoint has four visual states:

| State | Visual | Meaning |
|-------|--------|---------|
| **Locked** | Greyed out, slightly foggy | Not yet attempted |
| **In Progress** | Partially colored, Nuri flag planted | Currently working on this topic |
| **Completed** | Fully colored, vibrant, small Nuri footprint | Topic completed (3+ stars in mastery) |
| **Mastered** | Fully colored + golden glow + animated sparkle | Topic mastered (5 stars) |

### 3.5 How the Map Fills In

- When a child first opens a subject, the entire land is visible but greyed out — it looks like an old treasure map waiting to be explored
- As they complete topics, color blooms outward from each waypoint (like watercolor spreading)
- The path between waypoints fills with color as they travel
- Completed areas stay vibrant permanently — they never fade or grey out again
- Nuri is always visible on the map at their current position, gently bobbing

### 3.6 Landmarks and Milestones

Special landmarks unlock on the map at key milestones, providing visual rewards and a sense of discovery:

| Milestone | Landmark | Visual |
|-----------|----------|--------|
| Complete first topic in a subject | **Welcome Gate** | A decorated archway at the entrance to the land |
| Complete 25% of a subject's topics | **Bridge** | A beautiful bridge connecting two parts of the land |
| Complete 50% of a subject's topics | **Castle/Tower** | A small castle or lighthouse appears on the map |
| Complete 75% of a subject's topics | **Forest/Garden** | A magical forest or garden blooms in the landscape |
| Complete 100% of a subject's topics | **Golden Monument** | A grand structure unique to each land (pyramid, lighthouse, crystal tree, etc.) |
| Complete all topics in ALL subjects for a year | **Nuri's Palace** | A magnificent palace at the center of the entire map |
| Earn 5-star mastery on a topic | **Star Beacon** | A glowing beacon at that waypoint, visible from the full map view |

### 3.7 Map Interactions

- **Tap any waypoint:** Shows topic name, star mastery, and a "Study this!" button
- **Tap a landmark:** Shows a congratulatory message and the date it was earned
- **Pinch to zoom:** See the full map (all subjects) or zoom into a single land
- **Nuri's trail:** A dotted line shows the path Nuri has traveled — a visual history of everything learned
- **Share map:** Parent can screenshot or share the map as a progress snapshot

### 3.8 Map UI Placement

- The Journey Map replaces the color-coded progress bars currently described in Section 7.4 of the main spec
- Accessible from the home screen via a prominent "My Journey" button with Nuri's icon
- A mini-map thumbnail also appears on the home dashboard showing overall progress across all subjects
- Each subject page header shows a mini banner of that land's map segment

---

## 4. Streak Protection

### 4.1 The Problem with Streaks

Streaks are powerful motivators — Duolingo proved this. But losing a streak is emotionally devastating, especially for children. An 8-year-old who maintained a 45-day streak and loses it because the family went camping for the weekend should not feel punished. The existing spec (Section 7.3) already includes a basic streak freeze (1 free miss every 7 days). This section replaces and significantly enhances that system.

### 4.2 Generous Streak Protection System

#### Automatic Protections

| Protection | How It Works | Limit |
|------------|-------------|-------|
| **Weekly Streak Freeze** | One day per week is automatically forgiven if the child doesn't log in. No action required — it just happens silently. | 1 per week (resets every Monday) |
| **Weekend Mode** | Optional parent setting: weekends (Saturday/Sunday) do not count against the streak. The streak counter simply pauses and resumes on Monday. | Parent toggle in settings |
| **Holiday Mode** | Parent can activate "Holiday Mode" for up to 14 days. Streak freezes entirely and resumes when deactivated. | 14 days max, 3 uses per year |
| **Grace Period** | If a streak breaks, the child has until the NEXT midnight to do a session and retroactively save it. This covers "I forgot before bed" situations. | Automatic, always active |

#### Earned Protections

| Protection | How to Earn | Effect |
|------------|------------|--------|
| **Streak Shield** | Complete a 10-question quiz with 80%+ accuracy | Earns 1 Streak Shield (stackable, max 5) |
| **Bonus Freeze** | Reach a streak milestone (7, 14, 30 days) | Earns 1 additional freeze for the current streak period |
| **Nuri's Wing Guard** | Active at Level 10+ (golden wings Nuri) | Automatic extra freeze per week (2 total per week) |

### 4.3 When a Streak Does Break

Even with all protections, sometimes a streak will break. Here is exactly how Nuri handles it:

**What DOES NOT happen:**
- No dramatic "STREAK LOST!" screen
- No red warning or alarm animation
- No "you missed X days" guilt counter
- No "your X-day streak is gone" message
- No comparison to previous streak length

**What DOES happen:**

1. The child opens the app after a break
2. Nuri greets them warmly: "Hey [name]! I missed you! Ready to learn something cool today?"
3. No mention of the broken streak. At all.
4. The streak counter quietly resets to 1 when they complete their first session
5. The flame icon returns with "1" — fresh start, no drama
6. Their previous streak milestone badges are KEPT — "30-Day Streak (Silver)" stays in their badge collection forever
7. If they had a long previous streak (14+ days), Nuri quietly notes in the parent dashboard: "Streak reset after [X] days. Previous best: [Y] days."

### 4.4 Streak Milestones (Enhanced)

| Streak | Badge | Nuri Reaction | Reward |
|--------|-------|---------------|--------|
| 3 days | Spark | "You're on a roll!" | +10 XP bonus |
| 7 days | Bronze Flame | Nuri does a little dance | +25 XP bonus, 1 bonus freeze |
| 14 days | Silver Flame | Nuri wears a tiny medal | +50 XP bonus, 1 bonus freeze |
| 30 days | Gold Flame | Nuri gets sparkle trail | +100 XP bonus, 1 bonus freeze, 1 rare sticker |
| 60 days | Diamond Flame | Nuri's eyes glow | +200 XP bonus, 1 legendary sticker |
| 100 days | Eternal Flame | Special Nuri animation: fireworks | +500 XP bonus, unique "Century Learner" badge |
| 365 days | Phoenix Flame | Nuri transforms briefly into a phoenix | +2000 XP bonus, unique "Year of Learning" badge, exclusive Nuri accessory |

### 4.5 Streak Display

- Streak count shown on home screen with flame icon (as in existing spec)
- Protected days show a tiny shield icon on the flame
- Streak history visible in profile: "Best streak: 47 days" — this stat NEVER goes down
- The flame grows visually larger as the streak grows (subtle size increase every 7 days)

---

## 5. Wrong Answer Experience

### 5.1 The Critical Moment

The moment a child gets an answer wrong is the single most important UX moment in the entire application. IXL's approach — red X, score drops 10-20 points, visible setback — has been documented to cause crying, panic attacks, and math anxiety in children as young as 5 years old.

Nuri's approach is the exact opposite. A wrong answer is reframed as a natural, expected, and valuable part of learning.

### 5.2 The Wrong Answer Flow (Step by Step)

**Step 1: Immediate Visual Response (0-500ms)**

- NO red X. NO red color anywhere. NO buzzer sound. NO score dropping.
- The answer field gently pulses with a soft amber/warm-yellow glow (not red — red signals danger/failure)
- Nuri's expression changes: gentle head tilt, slight eyebrow raise, warm eyes — the "Hmm, not quite" face
- A soft, warm sound plays (a gentle "boop" — think the sound of a bubble, not a buzzer)

**Step 2: Nuri's Verbal Response (500ms-2s)**

Nuri responds with one of several encouraging phrases, randomly selected and never repeated consecutively:

| Category | Example Phrases |
|----------|----------------|
| Gentle redirect | "Hmm, not quite! Let's look at this together." |
| Normalizing | "That's a tricky one! Lots of people find this hard." |
| Growth-focused | "Good try! You're learning — that's what matters." |
| Encouraging | "Almost! You're so close. Let me show you." |
| Curious | "Interesting answer! Here's what's actually going on..." |
| Supportive | "That's okay! Let's figure this out together." |
| Effort-recognizing | "I can see you were thinking hard about that one!" |

For younger children (Years 1-2), Nuri speaks these aloud via TTS. For older children, they appear as text with Nuri's avatar animation.

**Step 3: Show the Correct Answer with Explanation (2-5s)**

- The correct answer appears in a friendly green box (green = growth, not judgement)
- Below it, a brief, age-appropriate explanation of WHY it is correct
- The explanation is tailored to the child's learning style (integrates with Feature 17: Learning Style Detection)
- For maths: shows the working/steps
- For English: shows the rule and an example
- For science: shows the concept with a simple analogy

**Example (Year 3 Maths):**

```
Question: What is 347 + 268?

Child answered: 515

Nuri: "Almost! You got the hundreds and tens right — nice work on those!
       Let's look at the ones column: 7 + 8 = 15, so we write 5 and
       carry the 1. That makes it 6 + 1 = 7 in the tens... then
       3 + 2 = 5 in the hundreds. So it's 615!"

       The answer is: 615 ✓
```

Notice: Nuri explicitly calls out what the child got RIGHT before addressing the mistake. This is deliberate — it shows the child that most of their thinking was correct.

**Step 4: Offer to Try Again (5-8s)**

A friendly prompt appears:

```
┌─────────────────────────────────────────────────┐
│  Want to try a similar question?                │
│                                                 │
│  [Yes, let me try!]     [Not now, next topic]   │
│                                                 │
│  +5 XP earned for trying!                       │
└─────────────────────────────────────────────────┘
```

If they choose "Yes, let me try!":
- Nuri generates a similar question (same concept, different numbers/words)
- If they get it right: "You got it! See? You learned from that last one!" (+10 XP, redemption moment)
- If they get it wrong again: "This is a tough one for you. No worries — I've saved it so we can practice later." (Saved to Mistake Journal, +5 XP)

**Step 5: XP Award (visible throughout)**

- "+5 XP" floats up from Nuri regardless of the answer being wrong
- The total XP counter ticks up
- If this was a retry after a wrong answer, "+10 XP" floats up with a small star animation

**Step 6: Mistake Journal Entry (background)**

- The question, the child's answer, the correct answer, and the explanation are automatically saved to the Mistake Journal (Feature 8)
- The entry is tagged with the topic, difficulty level, and whether a retry was attempted
- The Mistake Journal entry is framed positively: "Questions to revisit" — not "mistakes" in the UI
- A small notebook icon subtly animates in the corner to show something was saved

### 5.3 What the Child NEVER Sees on a Wrong Answer

- A number going down
- Red coloring on the screen
- A negative sound effect (buzzer, alarm, etc.)
- The word "wrong," "incorrect," "failed," or "error"
- A comparison to how they were doing before
- Any suggestion that this wrong answer has cost them something
- Their accuracy percentage (this is tracked internally for adaptive difficulty but never shown to the child)

### 5.4 What the Parent Sees

Parents do see accuracy data in the Parent Dashboard (Feature 15: Parent Highlights). This is important for parents to understand their child's progress. But this data is presented as:
- "Areas of strength" and "Areas to focus on" — not "right" and "wrong"
- Topic-level summaries: "Mastering fractions (85%), building skills in long division (45%)"
- The parent dashboard DOES show accuracy percentages, but these are never visible to the child

### 5.5 Repeated Wrong Answers on Same Topic

If a child gets 3+ questions wrong on the same topic in a single session:

1. Nuri does NOT say "you keep getting this wrong"
2. Instead: "This topic has some tricky parts! How about we switch to Learn Mode and I'll explain it step by step? Then we can come back and try again."
3. Offers to: switch to Learn Mode for that topic, try a different topic, or take a break
4. This integrates with the Difficulty Dial (Feature 11) — Nuri may suggest lowering the difficulty for this specific topic

---

## 6. Mastery System

### 6.1 Replacing IXL's SmartScore

IXL's SmartScore (0-100) is the single most criticized feature of their platform. It fluctuates wildly, punishes mistakes asymmetrically (1-2 points gained per correct answer vs. 3-20 points lost per wrong answer in the "Challenge Zone"), and creates extreme anxiety.

Nuri replaces this with a **Star Mastery System** per topic. Stars can only go UP. They never decrease, dim, or disappear.

### 6.2 Star Levels

| Stars | Requirement | Visual | Nuri Celebration |
|-------|-------------|--------|-----------------|
| No stars | Not yet attempted | Empty star outlines (grey) | -- |
| 1 star | Attempted the topic (answered at least 3 questions) | 1 star lights up, gentle gold glow | "You've started exploring [topic]! Great first step!" |
| 2 stars | 50%+ accuracy across all attempts on this topic | 2 stars lit, warm amber glow | "You're getting the hang of [topic]! Keep going!" |
| 3 stars | 70%+ accuracy across all attempts | 3 stars lit, bright gold glow | "You really understand [topic]! I'm proud of you!" |
| 4 stars | 85%+ accuracy on a spaced repetition review (minimum 10 questions, at least 3 days after initial learning) | 4 stars lit, sparkle animation | "Wow! You REMEMBERED [topic] even after time passed! That's real learning!" |
| 5 stars | 90%+ accuracy across 3+ separate sessions, spanning at least 7 days | 5 stars lit, rainbow shimmer, Nuri does a backflip | "You've MASTERED [topic]! This knowledge is yours forever!" |
| Golden star (bonus) | Maintained 5-star mastery for 30+ consecutive days (verified by spaced repetition reviews) | All 5 stars turn golden, permanent golden glow | "Golden mastery! You haven't just learned [topic] — you OWN it!" Special celebration animation with Nuri in golden wings |

### 6.3 Key Design Rules

1. **Stars never go down.** If a child earns 3 stars on a topic and then does poorly on a later session, they keep 3 stars. Their star level is based on their BEST performance, not their most recent.

2. **Stars are per-topic, not per-subject.** A child might have 5 stars on "Addition within 20" and 1 star on "Fractions." This is normal and visible on their subject page.

3. **Star progress is transparent.** Tapping a star rating shows: "You need 85%+ accuracy on a review quiz to earn your 4th star! You're currently at 78%. You're close!"

4. **4-star and 5-star requirements include TIME.** This is important — it means mastery cannot be achieved in a single cramming session. It requires spaced repetition across days, proving genuine retention. This is pedagogically sound and aligns with the Spaced Repetition Engine (Feature 7).

5. **Golden star is an aspirational goal.** Most children will not achieve golden stars on all topics, and that is fine. It exists to reward long-term dedication and gives high-achieving children something to strive for without penalizing average learners.

### 6.4 Star Animation Details

Each new star earned triggers a celebration sequence:

| Event | Animation | Sound | Duration |
|-------|-----------|-------|----------|
| 1st star | Star fades in with a gentle pulse | Soft chime | 1.5s |
| 2nd star | Star slides in from side, both stars pulse | Two-note ascending chime | 2s |
| 3rd star | Star drops in from above, all three do a wave | Three-note melody | 2.5s |
| 4th star | Star spirals in, all four rotate and glow | Triumphant short fanfare | 3s |
| 5th star | Star bursts in with particle effects, Nuri backflips, confetti | Full celebration jingle | 4s |
| Golden upgrade | All 5 stars transform to gold one by one, golden light radiates outward, Nuri glows | Grand ascending melody | 5s |

### 6.5 Subject-Level Mastery Summary

Each subject shows an aggregate mastery view:

```
The Number Peaks (Year 3 Maths)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Place Value up to 1000        ★★★★★ (Golden!)
3-Digit Addition/Subtraction  ★★★★☆
Times Tables (3, 4, 8)        ★★★☆☆
Fractions                     ★★☆☆☆
Measurement                   ★☆☆☆☆
Telling Time                  ☆☆☆☆☆ (Not started)
2D/3D Shapes                  ★★★☆☆
Bar Charts                    ★★☆☆☆

Overall: 23 / 40 stars earned
```

### 6.6 How Mastery Feeds the Journey Map

- 1 star on a topic: waypoint changes from "Locked" to "In Progress" on the Journey Map
- 3 stars on a topic: waypoint changes to "Completed" — full color bloom
- 5 stars on a topic: waypoint changes to "Mastered" — golden glow
- Golden star: a Star Beacon landmark appears at that waypoint

---

## 7. Comparison to IXL's SmartScore

### 7.1 Side-by-Side Comparison Table

| Dimension | IXL SmartScore | Nuri Anti-Anxiety System |
|-----------|---------------|--------------------------|
| **Score direction** | Goes UP and DOWN | XP only goes UP, stars only go UP |
| **Wrong answer penalty** | Lose 3-20 points (one wrong answer at score 99 can drop to 79) | Earn +5 XP effort points. Score never decreases. |
| **Score range** | 0-100 fluctuating number | Cumulative XP (no upper limit) + 1-5 star mastery per topic |
| **Visual metaphor** | A number on screen that bounces | A journey map that only moves forward |
| **Mistake framing** | Punishment: "your score dropped" | Opportunity: "let's learn from this together" |
| **Color on wrong answer** | Red X | Warm amber glow — no red |
| **Sound on wrong answer** | None (silence feels like judgment) | Soft, warm "boop" — neutral, not negative |
| **Recovery from mistake** | Must answer multiple questions correctly to regain lost points | No recovery needed — nothing was lost |
| **Challenge Zone (90-100)** | Gains: 1-2 pts. Losses: 3-8 pts. Asymmetrically punishing. | No equivalent. Higher difficulty = higher XP earned. No penalty scaling. |
| **Streak loss** | N/A (IXL has no streaks) | Quiet reset, no dramatic notification, previous badges kept |
| **Emotional design** | Anxiety-inducing (documented: children crying, panic attacks) | Confidence-building (every interaction is positive or neutral) |
| **Mastery proof** | Hit SmartScore 100 in one session (can be lost immediately) | 5 stars requires 90%+ across 3+ sessions over 7+ days (genuine retention) |
| **Teaching on wrong answer** | Shows step-by-step explanation (good) | Shows explanation + highlights what child got RIGHT + offers retry + awards XP (better) |
| **Parent visibility** | Parents see SmartScore per skill | Parents see mastery stars + accuracy data (child never sees raw accuracy %) |
| **Developmental appropriateness** | Same system for age 5 and age 18 | Designed specifically for 5-11 year olds' emotional regulation capacity |

### 7.2 The Core Difference in One Sentence

**IXL asks: "How many did you get right?"
Nuri asks: "What did you learn today?"**

### 7.3 What We Deliberately Took from IXL (Credit Where Due)

IXL is not all bad. These elements are worth learning from:

| IXL Feature | Our Adaptation |
|-------------|---------------|
| Adaptive difficulty based on performance | Yes — integrated via Difficulty Dial (Feature 11) and AI-driven question selection |
| Granular per-skill tracking | Yes — per-topic mastery stars with transparent progress |
| Step-by-step explanations on wrong answers | Yes — enhanced with "what you got right" framing and retry option |
| Spaced repetition concept (skills revisited) | Yes — full Spaced Repetition Engine (Feature 7) |
| Diagnostic assessments | Yes — Placement Test (studybuddy-placement-spec.md) |
| Data for parents/teachers | Yes — Parent Highlights (Feature 15) with rich analytics |

---

## 8. Database Schema

### 8.1 New Tables

```sql
-- Journey map progress per child
CREATE TABLE journey_map (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  waypoint_state TEXT DEFAULT 'locked', -- locked, in_progress, completed, mastered
  color_unlocked_at TIMESTAMP,
  mastered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, subject, topic)
);

-- Landmark unlocks on the journey map
CREATE TABLE journey_landmarks (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT, -- NULL if cross-subject landmark (e.g., Nuri's Palace)
  landmark_type TEXT NOT NULL, -- welcome_gate, bridge, castle, forest, golden_monument, nuris_palace, star_beacon
  milestone_pct INT, -- 0, 25, 50, 75, 100
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, subject, landmark_type)
);

-- Per-topic star mastery tracking
CREATE TABLE topic_mastery (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  star_level INT DEFAULT 0, -- 0-5
  is_golden BOOLEAN DEFAULT FALSE,
  golden_since DATE, -- date when 5-star was first achieved (for 30-day golden tracking)
  total_attempts INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  best_accuracy FLOAT DEFAULT 0, -- best session accuracy (never decreases)
  sessions_at_90_plus INT DEFAULT 0, -- count of sessions with 90%+ accuracy
  first_90_plus_date DATE, -- for tracking 7-day span requirement
  last_review_date DATE,
  last_review_accuracy FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, subject, topic)
);

-- Detailed XP event log (for audit trail and analytics)
CREATE TABLE xp_events (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  xp_amount INT NOT NULL, -- always positive
  xp_type TEXT NOT NULL, -- correct_first_try, correct_after_hint, wrong_attempt, curiosity, redemption, perseverance, streak_bonus, daily_login, learn_session, etc.
  multiplier FLOAT DEFAULT 1.0,
  subject TEXT,
  topic TEXT,
  question_id INT, -- NULL for non-question XP (login, session completion)
  session_id TEXT, -- links to quiz/learn session
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streak protection tracking
CREATE TABLE streak_protections (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  protection_type TEXT NOT NULL, -- weekly_freeze, earned_shield, bonus_freeze, wing_guard, holiday_mode, grace_period
  earned_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP, -- NULL if not yet used
  expires_at TIMESTAMP, -- NULL if no expiry
  week_number INT -- for weekly freeze tracking (ISO week)
);

-- Streak history (preserves records of past streaks)
CREATE TABLE streak_history (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  streak_length INT NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE NOT NULL,
  ended_reason TEXT, -- missed_day, manual_reset, system
  badges_earned TEXT[], -- badges earned during this streak
  created_at TIMESTAMP DEFAULT NOW()
);

-- Anti-gaming tracking
CREATE TABLE answer_rate_log (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  session_id TEXT,
  question_hash TEXT, -- hash of question to detect repeats
  answer_time_ms INT, -- milliseconds to answer
  flagged_rushing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Holiday mode settings
CREATE TABLE holiday_mode (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  activated_at TIMESTAMP NOT NULL,
  deactivated_at TIMESTAMP, -- NULL if still active
  max_days INT DEFAULT 14,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8.2 Modified Existing Tables

```sql
-- Add to existing profiles table
ALTER TABLE profiles ADD COLUMN weekend_mode BOOLEAN DEFAULT FALSE; -- parent setting
ALTER TABLE profiles ADD COLUMN best_streak INT DEFAULT 0; -- never decreases
ALTER TABLE profiles ADD COLUMN current_streak INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN streak_last_active DATE;

-- Add to existing quiz_results or equivalent session tracking table
ALTER TABLE quiz_sessions ADD COLUMN difficulty TEXT DEFAULT 'medium'; -- easy, medium, hard, challenge_me
ALTER TABLE quiz_sessions ADD COLUMN xp_multiplier FLOAT DEFAULT 1.0;
ALTER TABLE quiz_sessions ADD COLUMN total_xp_earned INT DEFAULT 0;
```

### 8.3 Indexes

```sql
-- Journey map lookups
CREATE INDEX idx_journey_map_profile ON journey_map(profile_id);
CREATE INDEX idx_journey_map_profile_subject ON journey_map(profile_id, subject);

-- Star mastery lookups
CREATE INDEX idx_topic_mastery_profile ON topic_mastery(profile_id);
CREATE INDEX idx_topic_mastery_profile_subject ON topic_mastery(profile_id, subject);
CREATE INDEX idx_topic_mastery_golden ON topic_mastery(profile_id) WHERE is_golden = TRUE;

-- XP event lookups
CREATE INDEX idx_xp_events_profile ON xp_events(profile_id);
CREATE INDEX idx_xp_events_profile_date ON xp_events(profile_id, created_at);
CREATE INDEX idx_xp_events_type ON xp_events(xp_type);

-- Streak protection lookups
CREATE INDEX idx_streak_protections_profile ON streak_protections(profile_id);
CREATE INDEX idx_streak_protections_unused ON streak_protections(profile_id) WHERE used_at IS NULL;

-- Anti-gaming
CREATE INDEX idx_answer_rate_session ON answer_rate_log(session_id);
CREATE INDEX idx_answer_rate_profile_date ON answer_rate_log(profile_id, created_at);
```

---

## 9. Implementation Notes

### 9.1 Integration with Existing XP/Level System (Section 7 of Main Spec)

**What stays the same:**
- Level thresholds (Section 7.2) remain unchanged: Level 1 = 0 XP, Level 2 = 100 XP, etc.
- Nuri evolution visuals at level milestones remain unchanged
- Level-up triggers (confetti, Nuri celebration, sound effect) remain unchanged
- The cumulative XP model is already in place — this spec enhances it

**What changes:**
- The XP table (Section 7.1) is replaced by the enhanced Effort-Based XP Table (Section 2.2 of this spec)
- The "+5 XP for attempted but wrong" row is preserved but now part of a richer system
- XP multipliers (Section 2.3) are a new addition
- The `xp_events` table replaces any simple XP tracking with a full event log for analytics and audit
- The Subject Mastery display (Section 7.4: color-coded progress bars) is replaced by the Star Mastery System (Section 6) and Journey Map (Section 3)

**Migration path:**
- Any existing XP earned by a child is preserved (XP never decreases, even during system migration)
- Existing mastery percentages can seed initial star levels: 50%+ = 2 stars, 70%+ = 3 stars
- The Journey Map is additive — it layers on top of the existing subject selection UI

### 9.2 Integration with Difficulty Dial (Feature 11)

The Difficulty Dial (studybuddy-features-part2.md, Feature 11) sets the challenge level for quizzes. This spec integrates with it in three ways:

1. **XP scaling by difficulty.** The Effort-Based XP Table (Section 2.2) includes difficulty-specific XP values. These stack with the Difficulty Dial's own XP table. The final values should be:

| Difficulty | Correct (First Try) | Correct (After Hint) | Wrong (Attempted) |
|-----------|---------------------|---------------------|-------------------|
| Easy | +8 XP | +5 XP | +3 XP |
| Medium | +15 XP | +10 XP | +5 XP |
| Hard | +20 XP | +13 XP | +7 XP |
| Challenge Me | +25 XP | +16 XP | +9 XP |

These are the canonical XP values and supersede both the existing Section 7.1 table and Feature 11's XP table.

2. **Automatic difficulty suggestion on repeated wrong answers.** If a child gets 3+ wrong in a row on the same topic at Medium or above, Nuri suggests lowering the difficulty — but NEVER automatically downgrades it. The child always chooses. Nuri says: "This is a tough topic at this level! Want to try it on Easy first to build your confidence?"

3. **Star mastery and difficulty.** Questions answered on Easy difficulty count toward star progress but at a reduced weight (0.7x). This prevents children from achieving 5-star mastery by only answering Easy questions. Medium = 1.0x weight, Hard = 1.2x weight, Challenge Me = 1.5x weight. This weighting is internal and never shown to the child.

### 9.3 Integration with Confidence Meter (Feature 19)

The Confidence Meter (studybuddy-features-part2.md, Feature 19) asks "How sure were you?" after each answer. This spec integrates with it in four ways:

1. **Curiosity XP.** Completing the Confidence Meter earns +2 XP per question (Section 2.2). This encourages self-reflection.

2. **Honest self-assessment detection.** If a child consistently rates themselves "Knew it" but gets answers wrong (the "dangerous blind spot" from Feature 19's tracking matrix), this feeds into the mastery system. A topic cannot reach 5 stars if the child has 3+ "confident but wrong" answers in recent sessions — they need to demonstrate genuine understanding, not just pattern-matching.

3. **Mastery acceleration.** If a child rates "Knew it" and IS correct (true mastery from Feature 19's matrix), the spaced repetition interval for that question extends further — Nuri trusts their self-assessment and waits longer before re-testing.

4. **Wrong answer experience.** When a child rates "Knew it" but gets it wrong, Nuri's response is specifically calibrated (per Feature 19): "Hmm, you were sure about that one but the answer was actually... Let's make sure we clear this up!" This is gentler than a standard wrong-answer response because the child's confidence makes the moment more emotionally charged.

### 9.4 Integration with Mistake Journal (Feature 8)

- Every wrong answer automatically creates a Mistake Journal entry (Section 5.2, Step 6)
- Mistake Journal entries are labeled "Questions to Revisit" in the child-facing UI — never "Mistakes"
- Reviewing a Mistake Journal item earns +5 XP (curiosity/effort)
- Successfully resolving a Mistake Journal item (getting the question right on retry) earns +10 XP (redemption)
- The "Perseverance Bonus" (+30 XP) triggers when a child's accuracy on a topic they previously struggled with crosses from below 50% to above 70%, which is tracked through Mistake Journal resolution rates

### 9.5 Integration with Spaced Repetition Engine (Feature 7)

- 4-star mastery requires passing a spaced repetition review (minimum 3 days after initial learning)
- 5-star mastery requires 90%+ accuracy across 3+ sessions spanning 7+ days — this naturally aligns with spaced repetition intervals
- Golden star maintenance is verified through spaced repetition reviews — if a golden-star topic comes up in spaced repetition and the child scores below 80%, the golden status is NOT removed but the topic is flagged for more frequent review
- Spaced repetition review sessions earn standard XP (never negative, even if review performance is poor)

### 9.6 Technical Implementation Priorities

**Phase 2 (Smart Learning Engine):**
- Core XP event logging (`xp_events` table)
- Enhanced wrong answer flow (Section 5)
- Anti-gaming protections (Section 2.5)
- Basic star mastery tracking (`topic_mastery` table)

**Phase 3 (Gamification):**
- Full star mastery system with animations (Section 6)
- Journey Map UI (Section 3) — initial implementation with one subject
- Enhanced streak protection system (Section 4)
- Streak history preservation (`streak_history` table)

**Phase 4 (Engagement Features):**
- Full Journey Map across all subjects with landmarks
- Golden star tracking and 30-day verification
- Map sharing for parents
- Holiday mode

### 9.7 Frontend Components

| Component | Description | Key Library |
|-----------|-------------|-------------|
| `<JourneyMap />` | Full-screen illustrated map with zoom/pan | React + Framer Motion + SVG |
| `<SubjectLand />` | Single subject's portion of the map | SVG with CSS animations |
| `<Waypoint />` | Individual topic marker on the map | SVG + Framer Motion |
| `<Landmark />` | Milestone landmark with unlock animation | Framer Motion |
| `<StarMastery />` | 5-star display with progress and animation | Framer Motion |
| `<XPFloater />` | "+15 XP" floating animation on earn | Framer Motion |
| `<WrongAnswerFlow />` | Full wrong-answer UX sequence | React + Framer Motion + TTS |
| `<StreakFlame />` | Streak counter with flame icon and shield | SVG + CSS |
| `<MiniMap />` | Thumbnail map for home dashboard | SVG |

### 9.8 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/journey/:profileId` | Get full journey map state for a child |
| GET | `/api/journey/:profileId/:subject` | Get journey map for a specific subject |
| POST | `/api/xp/award` | Award XP (body: profileId, xpType, amount, context) |
| GET | `/api/mastery/:profileId` | Get all topic mastery stars |
| GET | `/api/mastery/:profileId/:subject` | Get mastery stars for a subject |
| POST | `/api/mastery/check` | Recalculate mastery level after a session |
| GET | `/api/streak/:profileId` | Get current streak, protections, and history |
| POST | `/api/streak/freeze` | Use a streak freeze/shield |
| POST | `/api/streak/holiday` | Activate/deactivate holiday mode |
| GET | `/api/streak/protections/:profileId` | Get available streak protections |

---

*This spec is part of the StudyBuddy (Nuri) product documentation.*

*Related documents:*
- *studybuddy-spec.md — Core app, Section 7 (Gamification System) is enhanced by this spec*
- *studybuddy-features-part2.md — Feature 11 (Difficulty Dial), Feature 19 (Confidence Meter)*
- *studybuddy-features-part1.md — Feature 7 (Spaced Repetition), Feature 8 (Mistake Journal)*
- *ixl-competitive-analysis.md — SmartScore critique that motivates this spec*
- *studybuddy-placement-spec.md — Initial assessment that seeds star mastery levels*

*Spec created: March 31, 2026*
*Philosophy: Every child who opens Nuri should feel braver when they close it.*
