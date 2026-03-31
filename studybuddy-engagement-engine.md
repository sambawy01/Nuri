# StudyBuddy — Engagement & Retention Engine
## The System That Makes Kids WANT to Come Back Every Day

*Extends studybuddy-spec.md*

**Version:** 1.0
**Date:** March 31, 2026
**Context:** Competitive analysis shows IXL has virtually no gamification or engagement mechanics beyond basic awards. Duolingo nails streaks and XP but feels repetitive. Prodigy gamifies well but is math-only. Nuri must out-Duolingo Duolingo on engagement while maintaining educational integrity across all 6 subjects.

---

## 1. The Engagement Stack

Engagement is not a single feature — it is a **layered system** where every layer reinforces the others. Each layer operates on a different time horizon, creating a continuous motivation loop that keeps kids coming back.

### 1.1 Stack Overview

```
LAYER 5: LONG-TERM (months)     ← Why they stay for a year
  Level progression, Nuri evolution, Story Mode chapters,
  mastery stars, badge collection, annual awards

LAYER 4: WEEKLY (7 days)        ← Why they stay consistent
  Weekly challenge, leaderboard position, weekly report,
  weekly sticker album page, class collaborative goals

LAYER 3: DAILY (24 hours)       ← Why they come back tomorrow
  Login bonus, daily challenge, voice note from Nuri,
  daily sticker, curiosity teaser from last session

LAYER 2: SESSION (per session)  ← Why they finish the session
  Session summary, streak maintenance, mystery box,
  session XP total, "best session" record

LAYER 1: IMMEDIATE (per action) ← Why they answer the next question
  XP animation, sticker drops, Nuri reactions,
  correct-answer celebration, streak counter tick
```

### 1.2 How the Layers Reinforce Each Other

| Trigger | Immediate Layer | Session Layer | Daily Layer | Weekly Layer | Long-Term Layer |
|---------|----------------|---------------|-------------|--------------|-----------------|
| Correct answer | +10 XP animation | Adds to session score | Counts toward daily challenge | Counts toward weekly challenge | XP feeds into level progression |
| 5-streak | Streak fire animation | Mystery box chance | Feeds streak counter | Leaderboard XP bonus | Mastery star progress |
| Session complete | Final XP burst | Summary card + tomorrow teaser | Streak maintained | Weekly progress bar fills | Story Mode chapter progress |
| Login | Welcome animation | — | Daily sticker + login bonus | Weekly login count | Nuri evolution anticipation |

### 1.3 Reward Frequency Targets

The goal is a **reward hit every 30-45 seconds** during active play. This matches the engagement cadence that keeps young children (5-11) in flow state without overwhelming them.

| Reward Type | Average Frequency | Purpose |
|-------------|------------------|---------|
| XP pop (+5 to +20) | Every question (30-60 sec) | Constant forward motion feeling |
| Nuri reaction | Every question (30-60 sec) | Emotional connection |
| Sticker drop | Every 3-5 questions (~2-4 min) | Surprise + collection drive |
| Streak milestone | Every 5 questions (~4-5 min) | Momentum + escalation |
| Mystery box | Every 8-10 questions (~8-10 min) | Anticipation + variable reward |
| Session summary | End of session (~12-18 min) | Closure + tomorrow hook |

---

## 2. Session Flow Design

A typical 15-minute session is designed as a **narrative arc** with rising engagement, emotional peaks, and a satisfying close. Every session follows this structure, though the specific rewards and reactions vary to prevent staleness.

### 2.1 The 15-Minute Session Arc

```
ENGAGEMENT
    ▲
    │         ★ "On fire!"
    │        ╱  moment
    │       ╱    ╲      ★ Session
    │   ★  ╱      ╲    ╱  summary
    │  ╱ ╲╱        ╲  ╱    + teaser
    │ ╱ Sticker     ╲╱
    │╱  drop         Mystery
    ★                box
    │
    Nuri
    greeting
    ├──────────────────────────────────► TIME
    0   2   4   6   8  10  12  14  16 min
```

### 2.2 Moment-by-Moment Flow

**SESSION START (0:00)**
```
Nuri flies onto screen with a personalized greeting:
  → "Good morning, Youssef! Day 12 of your streak — amazing! 🔥"
  → "I noticed you were crushing fractions yesterday. Want to keep going,
     or try something new?"
  → Shows: streak flame, today's daily challenge preview, XP bar

If returning after absence:
  → "Nuri missed you! Welcome back! Let's start with something fun."
  → Offers easy warm-up question to rebuild confidence
```

**QUESTION 1 (0:30)**
```
First question is ALWAYS within their comfort zone.
Never start with something they might get wrong.

On correct:
  → XP animation floats up: "+10 XP" with sparkle
  → Nuri: excited pose, "Yes! Great start!" (varies each session)
  → Streak counter: "1 🔥"

On incorrect (rare, since Q1 is easy):
  → Nuri: gentle encouragement, "Good try! Let me help..."
  → No penalty feeling — still get +5 XP for trying
```

**QUESTIONS 2-3 (1:00 - 2:30)**
```
Difficulty ramps slightly. Nuri reacts to every answer.

After Question 3 (correct):
  → Micro-celebration: Nuri does a little dance
  → Sticker drop chance: 20% probability
  → If sticker drops: "Ooh! You found a [Rare Cosmic Star] sticker! 🌟"
    → Sticker flies into collection with satisfying animation
    → If no drop: session continues normally (child doesn't know the roll happened)
```

**QUESTIONS 4-5 (3:00 - 5:00)**
```
Hit the stride. Questions at appropriate difficulty.

After Question 5:
  → Streak milestone check: if 5 correct in a row:
    → "5 in a row! You're on a roll!" + streak fire animation grows larger
    → +25 XP bonus (on top of per-question XP)
    → Mystery box UNLOCKED: golden box appears, shakes enticingly
    → Child taps to open → reveals one of:
      - Bonus XP (50-100 XP)
      - Rare sticker
      - Nuri costume piece
      - "Double XP for next 3 questions" power-up
  → If streak broke before 5: "Keep going! You're learning!" (no penalty)
```

**QUESTIONS 6-7 (5:30 - 8:00)**
```
Nuri drops a curriculum joke or fun fact between questions:
  → "Quick break! Did you know that 'zero' was invented in India?
     Imagine trying to do maths without it! 🤯"
  → Or: "Why was the equal sign so humble? Because it knew it
     wasn't greater than or less than anyone else! 😄"

This prevents fatigue and keeps the session feeling conversational,
not like a drill.
```

**QUESTION 8 (8:30)**
```
The "ON FIRE" moment:
  → If accuracy is high (6+/8 correct):
    → Screen edges glow warm orange
    → Nuri: "YOU ARE ON FIRE! 🔥🔥🔥" (unique animation, not recycled)
    → XP bonus: +15 bonus XP
    → "Want to try a CHALLENGE question? +20 XP if you get it!"
      → Optional harder question for bonus reward
  → If accuracy is moderate (4-5/8):
    → Nuri: "You're doing great! Let's keep building!"
    → Offers a slightly easier question to rebuild momentum
  → If accuracy is low (<4/8):
    → Nuri: "I can see you're thinking hard! Let's slow down and
       review one thing together."
    → Switches to Learn Mode mini-lesson for the weakest topic
```

**QUESTIONS 9-10 (10:00 - 13:00)**
```
Final push. Questions feel achievable.
Nuri increases encouragement frequency.

After Question 10:
  → If 10-question streak: +50 XP bonus, legendary celebration
  → "Last question coming up! Make it count!"
```

**SESSION SUMMARY (13:00 - 15:00)**
```
Session Summary Card appears with satisfying "stamp" animation:

┌─────────────────────────────────┐
│    🦉 Great Session, Youssef!    │
│                                 │
│  Questions: 10                  │
│  Correct: 8/10 (80%)           │
│  XP Earned: +145 XP            │
│  Streak: 🔥 12 days             │
│  Stickers Found: 1 ⭐           │
│                                 │
│  Best Moment: 5 in a row! 🔥    │
│  Topic Strength: Fractions ↑    │
│                                 │
│  ── Tomorrow's Preview ──       │
│  "We're going to explore        │
│   something AMAZING about       │
│   how volcanoes work... 🌋"     │
│                                 │
│  [Share with Parent] [Done! 👋] │
└─────────────────────────────────┘

Nuri waves goodbye: "See you tomorrow! Don't forget —
your streak depends on it! 😉"
```

### 2.3 Session Variations

Not every session should feel identical. The system rotates through variations:

| Session Type | Frequency | Difference |
|-------------|-----------|------------|
| Standard quiz session | 60% | As described above |
| Daily challenge session | 15% | Starts with sealed envelope challenge |
| Story Mode session | 15% | Questions embedded in narrative context |
| Review session | 10% | Nuri suggests reviewing past mistakes |

---

## 3. Nuri's Personality as Engagement

Nuri is not a static mascot slapped onto a quiz app. Nuri is a **character with memory, moods, and evolving personality** — the single biggest differentiator from every competitor. Kids come back because they have a *relationship* with Nuri.

### 3.1 Nuri's Mood System

Nuri's mood changes based on time of day, child's recent performance, and session context. This makes interactions feel alive, not scripted.

| Mood | Trigger | Nuri's Behavior | Example Dialogue |
|------|---------|----------------|-----------------|
| **Excited** | Child on a streak, got hard question right | Bouncing, wings flapping, stars in eyes | "OH WOW! You got that one! I didn't think you'd get it so fast!" |
| **Curious** | New topic, child asks a question | Head tilted, one eyebrow raised, holds magnifying glass | "Hmm, interesting question! Let me think... actually, let's figure it out TOGETHER." |
| **Proud** | Child masters a topic, levels up | Chest puffed, wearing a tiny medal | "I'm SO proud of you right now. Seriously. You worked hard for this." |
| **Sleepy** | Early morning session (before 8am) | Half-closed eyes, tiny yawn, holding coffee mug | "*yawwwn* Oh! Good morning! You're up early! Let me wake up... okay, I'm ready! ☕" |
| **Encouraging** | Child struggling, got several wrong | Soft eyes, wing around child's avatar | "Hey, this stuff is tricky. But you know what? You're braver than most for trying." |
| **Playful** | Weekend session, after a streak milestone | Wearing silly hat, doing tricks | "Okay okay, before the next question... what do you call a sleeping dinosaur? A DINO-SNORE! 😂 ...okay NOW let's focus." |
| **Impressed** | Child uses advanced reasoning, Explain It Back | Wide eyes, drops whatever he's holding | "Wait... did you just explain that better than I could?! I'm taking notes!" |

**Mood transitions are animated:** Nuri doesn't snap between moods. If going from sleepy to excited, there's a "waking up and getting energized" animation sequence.

### 3.2 Nuri Remembers

Nuri maintains a **memory context** of the child's recent activity. This is pulled from the database and injected into the session greeting and mid-session dialogue.

**What Nuri remembers and references:**

```
Recent performance:
  → "Last time you nailed fractions! Let's see if you can do it again!"
  → "You struggled with long division on Tuesday. I've got a trick for you today."

Preferences:
  → "I know Science is your favorite — but we haven't done English in 5 days. Quick round?"
  → "You always pick hard mode. Fearless! 💪"

Personal milestones:
  → "You hit Level 10 last week! How do my new star orbit look? ✨"
  → "Your 30-day streak is coming up on Friday. THREE more days!"

Story Mode progress:
  → "We left off at Chapter 3 — the library was flooding and you needed to
     solve the riddle. Ready to go back?"

Past mistakes (encouraging):
  → "Remember when equivalent fractions were hard? Look at you now —
     you got 5 in a row! Growth!"
```

**Implementation:** The session greeting pulls from a `child_memory` table containing the last 10 sessions, recent milestones, current streaks, and active Story Mode chapter. This is summarized and injected into the Claude system prompt as context.

### 3.3 Nuri Challenges

Nuri doesn't just react — Nuri **provokes**. Well-timed challenges create a "bet you can't" dynamic that kids love.

| Challenge Type | Nuri Says | When |
|---------------|----------|------|
| Speed challenge | "I bet you can answer 3 questions in under 60 seconds. Ready... GO!" | Mid-session, when child is in flow |
| Accuracy dare | "I bet you can't get 5 in a row right now... 🤔" | After a wrong answer (rebuilds momentum) |
| Topic challenge | "You've never tried Year 4 fractions. Think you're ready? 💪" | When mastery on current level is high |
| Memory challenge | "Quick! What's the answer to that question you got wrong yesterday?" | Spaced repetition trigger |
| Confidence bet | "On a scale of 1-5, how sure are you? ...Now prove it!" | Before a hard question |

### 3.4 Nuri's Celebration Library

The same "Correct!" animation every time kills engagement fast. Nuri has a **library of 30+ celebration variants** that rotate based on context.

| Context | Celebration | Animation |
|---------|------------|-----------|
| Normal correct | "Nice one!" / "You got it!" / "Correct!" | Nuri nods + thumbs up (3 variants) |
| Correct on first try | "First try! Brilliant!" | Nuri jumps + star burst |
| Correct after struggling | "YES! You figured it out!" | Nuri does backflip + confetti |
| Hard question correct | "That was a TOUGH one! Wow!" | Nuri's jaw drops + fireworks |
| Streak milestone (5) | "FIVE in a row! Unstoppable!" | Fire trail animation |
| Streak milestone (10) | "TEN! Are you even HUMAN?!" | Screen shakes + lightning |
| Mastery achieved | "You've MASTERED this topic!" | Gold star descends + trumpet sound |
| Level up | "LEVEL UP! Look at you grow!" | Full-screen confetti + Nuri evolution preview |
| Beat personal best | "NEW PERSONAL BEST! 🏆" | Trophy animation + record stamp |
| Came back after absence | "You're BACK! Let's goooo!" | Nuri runs and hugs child's avatar |

**Celebration fatigue prevention:** The system tracks which celebrations the child has seen recently and avoids repeating the same one within 5 sessions. Rarer celebrations (streak 10, mastery) are always shown in full because they are infrequent.

### 3.5 Nuri Tells Jokes

Curriculum-related humor delivered between questions. Creates breathing room and makes learning feel fun, not like a drill.

**Joke database structure:**
```json
{
  "subject": "maths",
  "topic": "fractions",
  "joke": "Why did the fraction go to the doctor? Because it was feeling improper! 😂",
  "year_range": [3, 6],
  "used_for_child": false
}
```

**Example jokes by subject:**

| Subject | Joke |
|---------|------|
| Maths | "Why was 6 afraid of 7? Because 7 8 9! 😱" |
| Maths | "What do you call friends who love maths? Algebros! 🤜🤛" |
| Science | "What did the volcano say to the other volcano? I lava you! 🌋" |
| Science | "Why can't you trust atoms? Because they make up everything! ⚛️" |
| English | "What's the longest word in the dictionary? 'Smiles' — there's a mile between the two S's! 😄" |
| History | "Why did the Ancient Egyptian go to the dentist? To get a new crown! 👑" |
| Arabic | "What's Nuri's favorite Arabic letter? ن — because it's Nuri's letter! ن = نوري" |

**Frequency:** Maximum 1 joke per session. Nuri tells a joke only when the child's engagement dip is detected (slower response times, lower accuracy) or at the natural mid-session break point (after question 6-7).

### 3.6 Nuri Evolves

Nuri's visual evolution (defined in the core spec) creates **long-term anticipation**. The engagement engine actively surfaces evolution progress.

**Evolution milestones (from core spec):**

| Level | Evolution | Visual Change |
|-------|----------|---------------|
| 1-4 | Basic Nuri | Graduation cap |
| 5-9 | Scarfed Nuri | Colorful scarf |
| 10-14 | Starry Nuri | Stars orbit around Nuri |
| 15-19 | Scholar Nuri | Tiny glasses |
| 20-24 | Golden Nuri | Golden wings |
| 25-29 | Rainbow Nuri | Rainbow trail |
| 30+ | Cosmic Nuri | Full glow effect |

**How evolution drives engagement:**

- **Progress preview:** "You're 200 XP away from Level 5! Nuri's going to get a colorful scarf! 🧣" — shown on home screen when within 20% of next evolution milestone.
- **Teaser animations:** At 90% progress to evolution, Nuri's upcoming accessory "flickers" briefly — the scarf appears for a split second, then vanishes. "Was that... did you see that? I think something's about to happen! 👀"
- **Evolution ceremony:** When a child hits an evolution level, the ENTIRE session pauses for a 10-second ceremony. Nuri transforms on screen with particle effects and a unique sound. "LOOK AT ME! I got a SCARF! Do you like it?! This is because of YOU!"
- **Retroactive reference:** After evolution, Nuri references the new look: "Do my glasses make me look smarter? I think they do. 🤓"

---

## 4. Retention Mechanics

These are the specific systems designed to prevent churn. Each mechanic targets a different drop-off point in the user lifecycle.

### 4.1 Streak System (Enhanced)

The streak is the single most powerful retention mechanic in consumer apps. Nuri's streak system takes what Duolingo does well and adds warmth, flexibility, and kid-appropriate design.

**Visual Design:**
- Flame icon with day count, displayed prominently on home screen
- Flame grows visually larger at milestones (small flame at 1-6, medium at 7-29, large at 30-99, blazing at 100+)
- Flame color changes: orange (1-6) → blue (7-29) → purple (30-99) → gold (100+)

**Streak Freeze:**
- 1 free streak freeze per week (auto-applied, no action needed)
- Earn additional freezes: complete 3 daily challenges in a week = +1 freeze
- Maximum 3 freezes banked at any time
- When a freeze is used: "Phew! Nuri used a streak freeze for you yesterday. Your streak is safe! 🛡️ You have 1 freeze left this week."

**Milestone Celebrations:**

| Days | Tier | Celebration |
|------|------|-------------|
| 3 | Starter | "3 days! You're building a habit! 🌱" |
| 7 | Bronze | Bronze badge + special Nuri hat + 50 bonus XP |
| 14 | Silver-Bronze | "Two weeks! Most kids don't make it this far!" |
| 21 | Silver | Silver badge + rare sticker drop |
| 30 | Silver-Gold | "ONE MONTH! Nuri does a special dance!" + 200 bonus XP |
| 60 | Gold | Gold badge + Nuri costume unlock + 500 bonus XP |
| 100 | Gold-Diamond | "100 DAYS! You're LEGENDARY!" + exclusive sticker set |
| 180 | Diamond | Diamond badge + secret Story Mode bonus chapter tease |
| 365 | Obsidian | "ONE YEAR! You're the greatest StudyBuddy EVER!" + Obsidian Nuri skin |

**Approaching Milestone Notifications:**
- At 2 days before a milestone: push notification + home screen banner
- "You're 2 days away from a 30-day streak! Nuri is practicing his special dance... 🕺"
- At 1 day before: "TOMORROW! Don't let Nuri down! (just kidding — no pressure! 😉)"

**Weekend Mode (parent option):**
- Toggle in Parent Settings: "Pause streaks on weekends"
- When enabled: Saturday and Sunday don't count as missed days
- Streak counter shows: "🔥 12 days (weekends off)" with a small pause icon
- Rationale: prevents weekend stress, respects family time, reduces parent frustration

**Comeback Mechanic (non-punitive):**
- When a streak breaks, Nuri NEVER says "You lost your streak"
- Instead:
  - "Nuri missed you! Let's start a new streak today! 🦉"
  - "Every champion starts fresh sometimes. Day 1 of your NEW streak!"
  - Shows previous best streak: "Your best streak was 23 days. Let's beat it!"
- "Comeback Bonus": +50 XP for first session after a break of 3+ days
- "Streak Memory": the app remembers their longest-ever streak and displays it as a record, so breaking a streak doesn't erase their achievement

### 4.2 Daily Hooks

Multiple reasons to open the app every single day, even if they don't feel like studying.

**Daily Mystery Challenge:**
- Sealed envelope icon on home screen, refreshes every 24 hours
- Tap to reveal: a single challenge question, harder than normal, from a random subject
- Completing it (right or wrong) earns a **Mystery Challenge Sticker** (unique daily design)
- Getting it right: +30 XP bonus
- Getting it wrong: Nuri explains the answer, +10 XP for trying
- 7 consecutive daily challenges completed: "Challenger" badge

**"What Did Nuri Learn Today?":**
- Daily fun fact related to the child's current curriculum topics
- Appears on home screen as a speech bubble from Nuri
- Examples:
  - "Did you know honey never goes bad? Archaeologists found 3,000-year-old honey in Egyptian tombs and it was still edible! 🍯"
  - "The word 'hundred' comes from the Old Norse word 'hundrath,' which actually meant 120! 🤯"
- Tapping it expands into a 30-second mini-lesson (optional)
- New fact every day — sourced from their year group's curriculum

**Daily Sticker:**
- Log in and receive one free sticker for collection
- No quiz required — just opening the app
- Sticker rarity: Common (70%), Uncommon (20%), Rare (8%), Legendary (2%)
- Creates a daily "what will I get?" anticipation loop
- Missing a day means missing that day's sticker (gentle FOMO, not punitive)

**Unfinished Business:**
- If a child ended a session mid-topic or scored below 60% on a topic:
  - Home screen banner: "You were SO close to mastering fractions yesterday. One more try? 🎯"
  - Tapping it loads a 5-question mini-quiz on that specific weak topic
  - Completing it: "You did it! Fractions: CONQUERED! ⚔️"

### 4.3 Curiosity Hooks

These mechanics exploit the **Zeigarnik effect** — the psychological tendency to remember unfinished tasks. By creating open loops, kids feel pulled back to close them.

**End-of-Session Teasers:**
- Every session summary includes a "Tomorrow's Preview"
- These are AI-generated based on the child's next logical topic
- Examples:
  - "Tomorrow we're going to learn something AMAZING about how volcanoes actually explode... 🌋"
  - "I found a really tricky riddle for you. I'm not even sure YOU can solve it... 🤔"
  - "Next time, Chapter 4 of the Lost Books is waiting. The heroes just found a secret door..."
- The teaser is stored and referenced when the child returns: "Remember that volcano thing I mentioned? Let's dive in!"

**Unlock Previews:**
- When a child is close to unlocking something, surface it:
  - "2 more quizzes until you unlock Chapter 3 of the Lost Books! 📚"
  - "Complete 1 more Science topic to unlock the Volcano Experiment in Nuri's World! 🧪"
  - "150 more XP until Level 10 — Nuri gets STARS orbiting around him! ⭐"
- Shown on home screen and at end of sessions
- Progress bar fills visually so the child can see how close they are

**Nuri's Morning Voice Note (Feature 16 integration):**
- Daily push notification with a 10-second AI-generated audio message
- Content is a curiosity hook designed to make the child open the app
- Delivery time: configurable by parent (default 7:30am, before school)
- Examples:
  - "Psst! Youssef! I figured out why the moon changes shape every night. Want to know? Open the app! 🌙"
  - "I found the HARDEST question about times tables. Nobody's solved it yet. Think you can? 💪"
- Audio uses the child's selected Nuri voice (from TTS settings)

### 4.4 Loss Aversion (Gentle, Kid-Appropriate)

Loss aversion is powerful, but with children it must be handled with extreme care. Nuri NEVER punishes, shames, or makes a child feel bad. Instead, Nuri highlights what's **almost complete** — creating pull, not push.

**What Nuri does (appropriate):**
- "Your sticker book is 80% complete! Just 4 more stickers to fill this page... 📖"
- "Nuri's scarf is almost unlocked! 200 more XP to go! 🧣"
- "You've mastered 5 out of 6 subjects this month. Just Arabic left! Can you do it? 🌟"
- "Chapter 3 ends on a HUGE cliffhanger. You're 1 quiz away from getting there!"

**What Nuri NEVER does (inappropriate):**
- NEVER: "You lost your streak! Now you have to start over." (IXL-style punishment)
- NEVER: "Your friends are all ahead of you." (social shame)
- NEVER: "You haven't practiced in 3 days. You're falling behind." (guilt)
- NEVER: removing earned rewards or progress for inactivity
- NEVER: showing score drops or "you got dumber" metrics (IXL's SmartScore problem)

**Story Mode Cliffhangers:**
- Each Story Mode chapter ends on a cliffhanger
- "The ancient door is opening... but what's behind it? Complete 2 more Science topics to find out!"
- The cliffhanger is displayed on the home screen with a locked preview image
- This creates narrative tension that pulls kids back — not obligation, but genuine curiosity

---

## 5. Engagement Metrics & Targets

### 5.1 North Star Metrics

| Metric | Target | Industry Benchmark | Notes |
|--------|--------|-------------------|-------|
| **DAU/MAU** | 40%+ | Duolingo: ~30%, IXL: ~20% | Story Mode + Nuri personality should push beyond Duolingo |
| **Average session length** | 12-18 minutes | IXL: 8-12 min, Duolingo: 5-10 min | Longer because sessions are varied and story-driven |
| **Sessions per week** | 4-5 | IXL: 3-4, Duolingo: 4-5 | Daily hooks + streak system drive consistency |
| **Questions per session** | 10-15 | IXL: 15-20 (but shorter questions) | Quality over quantity — deeper engagement per question |

### 5.2 Retention Targets

| Metric | Target | Duolingo Benchmark | IXL Benchmark |
|--------|--------|-------------------|---------------|
| **Day 1 retention** | 80% | 70% | 60% |
| **Day 7 retention** | 50% | 40% | 30% |
| **Day 30 retention** | 30% | 20% | 15% |
| **Day 90 retention** | 20% | 12% | 8% |
| **Day 365 retention** | 10% | 5% | 3% |

**Why we can beat benchmarks:** Nuri has three engagement layers competitors lack: (1) evolving character relationship, (2) narrative Story Mode with cliffhangers, (3) full curriculum coverage that makes it a daily school companion, not just a practice app.

### 5.3 Feature-Specific Metrics

| Feature | Metric | Target |
|---------|--------|--------|
| Streaks | % of active users maintaining a streak | 60%+ |
| Streaks | Average streak length | 14+ days |
| Daily Challenge | Completion rate (of daily active users) | 50%+ |
| Story Mode | % of users who start Chapter 2 (after completing Chapter 1) | 70%+ |
| Sticker Collection | % of users who view their sticker book weekly | 40%+ |
| Mystery Box | Tap-through rate when offered | 90%+ |
| Morning Voice Note | Notification → app open rate | 25%+ |
| Session Completion | % of sessions where child answers 8+ questions | 75%+ |
| Re-engagement | % of churned users (7+ days) who return within 30 days | 30%+ |

### 5.4 Engagement Health Dashboard (Internal)

Track these signals to detect engagement problems early:

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Avg questions per session | 10+ | 5-9 | <5 |
| Session completion rate | >75% | 50-75% | <50% |
| Streak break → comeback rate | >60% | 40-60% | <40% |
| Sticker collection engagement | Growing | Flat | Declining |
| Push notification opt-out rate | <10% | 10-20% | >20% |
| Parent-reported complaints | 0-1/month | 2-5/month | >5/month |

---

## 6. Re-engagement System

When a child stops using the app, the re-engagement system activates in escalating stages. The core principle: **warmth and welcome, NEVER guilt or shame.**

### 6.1 Re-engagement Timeline

```
Day 0: Last active session
  └─ Normal. No action.

Day 1 missed: Nothing.
  └─ Many kids skip a day. This is normal. No notification.
  └─ Streak freeze auto-applied if available.

Day 2 missed: Gentle nudge to child.
  └─ Push notification from Nuri:
     "Miss you! Nuri found a cool new riddle today 🦉"
  └─ Notification links directly to the Daily Challenge (low commitment).

Day 3 missed: Parent notification.
  └─ To child: "Nuri's been practicing jokes while you were gone.
     Want to hear one? 😄" (low-pressure)
  └─ To parent: "Youssef hasn't practiced in 3 days.
     A quick 5-minute session could help maintain momentum! 📊"

Day 5 missed: Welcome-back bonus queued.
  └─ When they return: "WELCOME BACK! 🎉 Here's 50 bonus XP
     just for showing up! Nuri saved some stickers for you too!"
  └─ First session back is easy (confidence rebuilder).
  └─ No mention of missed days or broken streak.

Day 7+ missed: Easy warm-up + comeback bonus.
  └─ "Nuri's been waiting for you! 🦉"
  └─ Session starts with 3 easy warm-up questions (review of mastered topics).
  └─ +100 comeback XP bonus.
  └─ "Look what's new since you were away!" — highlight any new content,
     stickers, or Story Mode chapters added.
  └─ Streak resets with encouragement: "Day 1 of a NEW streak!
     Your record is 23 days. Let's beat it! 🔥"

Day 14+ missed: "A lot has changed" summary.
  └─ Push notification: "Nuri has been learning new things!
     Come see what's new 🦉✨"
  └─ On return: mini re-onboarding:
     - "Let's do a quick warm-up to remember where you were!"
     - 5-question placement-style assessment (but framed as "Nuri's quiz")
     - Adjusts difficulty based on results (they may have forgotten some material)
  └─ Shows accumulated daily stickers they missed: "Look! These were
     waiting for you!" (gives them 3 bonus stickers, not all missed ones)

Day 30+ missed: Full re-onboarding.
  └─ "A LOT has happened while you were away! 🌟"
  └─ Re-onboarding flow:
     1. Nuri greets warmly, references their previous achievements
     2. Quick 8-question adaptive assessment across subjects
     3. "Welcome Back" sticker set (exclusive to returning users)
     4. Difficulty recalibrated based on assessment
     5. Story Mode recap: "Last time in the Lost Books, you were at..."
     6. Fresh streak, fresh goals, fresh start
  └─ Parent notification: "Youssef is back on StudyBuddy! Here's
     a summary of where they are now."
```

### 6.2 Notification Rules

| Rule | Detail |
|------|--------|
| Maximum notifications per week | 3 (child) + 1 (parent) |
| Quiet hours | No notifications before 7am or after 8pm (configurable) |
| Opt-out respected immediately | If parent disables notifications, stop completely |
| COPPA compliant | All notifications go through parent-approved channels |
| Tone | Always warm, never urgent, never guilt-inducing |
| Personalization | Use child's name, reference their interests/strengths |

### 6.3 Re-engagement Content Rotation

Push notifications rotate through templates to avoid staleness:

```
Pool A (Curiosity): "Nuri found out something amazing about [topic]!"
Pool B (Challenge): "Can you solve this? [emoji riddle]"
Pool C (Social): "Your class answered 500 questions this week!"
Pool D (Progress): "You're 2 quizzes away from mastering [subject]!"
Pool E (Warmth): "Nuri drew you a picture. Come see! 🎨"
```

Each notification is tagged and tracked. If a child consistently opens Pool B notifications but ignores Pool A, the system shifts to send more Pool B-style messages.

---

## 7. Story-Driven Progression

### 7.1 Why Story Beats Drill

IXL's approach: do a drill, see a score, do another drill. This works for compliant children but creates no intrinsic motivation. Kids don't *want* to go back — they're told to.

Nuri's approach: learning is embedded in a **narrative** that the child cares about. They don't practice fractions because they should — they practice fractions because the story characters need fractions to split treasure.

**The 7 Lost Books of Knowledge** (from Feature 6 in studybuddy-features-part1.md) provides the narrative backbone:

```
The Story:
  Long ago, 7 magical Books of Knowledge were scattered across the world.
  Each book holds the wisdom of a different domain. Nuri and the child
  must find them all to restore the Great Library.

  Book 1: The Book of Numbers (Maths-heavy, with Science puzzles)
  Book 2: The Book of Words (English-heavy, with History context)
  Book 3: The Book of Nature (Science-heavy, with Maths calculations)
  Book 4: The Book of Time (History-heavy, with English reading)
  Book 5: The Book of Light (Arabic-heavy, with Religion context)
  Book 6: The Book of Stars (cross-subject, all disciplines)
  Book 7: The Final Book (master challenge, requires mastery across all subjects)

  Each book = 1 chapter = 5 stages
  Each stage requires passing topic-specific quizzes to progress
```

### 7.2 How Story Creates Retention

| Retention Mechanic | How Story Mode Implements It |
|-------------------|-------------------------------|
| **Cliffhangers** | Each chapter ends mid-action: "The door is opening... but what's inside? Complete 2 more topics to find out!" |
| **Character investment** | Story characters reference the child by name and remember their contributions: "Remember when you helped us cross the river using division? We need you again!" |
| **Curriculum integration** | Story puzzles ARE the quiz questions: "The ancient lock has 3 sections. Each section needs a fraction that adds up to 1. What fractions could work?" |
| **Cross-subject motivation** | Each chapter requires mastery in multiple subjects, preventing kids from only doing their favorite: "To open Book 3, you need to pass a Science quiz AND a Maths quiz." |
| **Progression visibility** | Story map shows all 7 books, with completed ones glowing and upcoming ones greyed out. Creates a visual "collecting" motivation. |
| **Exclusive rewards** | Story Mode unlocks exclusive stickers, Nuri costumes, and badges that can't be earned any other way. Status symbols in the profile. |

### 7.3 Story Mode Session Integration

Story Mode is not a separate silo — it integrates into the daily engagement loop:

- **Home screen:** If a Story Mode chapter is in progress, a banner shows: "Chapter 3, Stage 2 — The heroes need your help! 📖"
- **Session suggestion:** Nuri occasionally suggests a Story Mode session: "Want to take a break from regular quizzes and continue the adventure? 🗺️"
- **Post-mastery hook:** When a child masters a topic required for Story Mode: "You just mastered the topic needed for Chapter 4! Ready to unlock it? 🔓"
- **Voice Note hook:** Morning voice notes can reference the story: "The heroes are stuck at a locked door. I think YOU know the maths to open it... come help! 🚪"

---

## 8. Social Engagement (Years 4-6)

Social features are available only for older children (ages 8-11, Years 4-6) and require parental opt-in. All social features are designed to be collaborative and supportive, never toxic or exclusionary.

### 8.1 Class Leaderboard

**Design principles:**
- **Opt-in only** — parent must enable, child must agree
- **Weekly reset every Monday** — prevents permanent hierarchies where the same kid is always #1
- **Shows top 10 + child's own position** — if they're #47, they see #47, not a wall of names above them
- **Multiple leaderboards** — XP, streak, questions answered, subjects mastered. Different kids can be #1 on different boards.
- **No public shaming** — bottom positions are not highlighted

**Leaderboard mechanics:**

| Feature | Detail |
|---------|--------|
| Reset cycle | Every Monday at 6am |
| Ranking metric | Total XP earned that week |
| Display | Top 10 + "Your position: #X" |
| Rewards | #1: Gold crown badge for that week + 100 XP. #2-3: Silver badge + 50 XP. #4-10: Bronze badge + 25 XP. |
| Anti-gaming | Max countable XP per day = 500 (prevents obsessive grinding) |
| Class setup | Teacher or parent creates a class with a join code |

### 8.2 Study Duels (Async Challenges)

Extended from Feature 13 (Study Duels) in studybuddy-features-part2.md, with engagement-specific enhancements:

- **Challenge a Friend:** Create a 5-question quiz in any subject, send via code or link
- **"Duel of the Week":** Every Monday, Nuri suggests a themed duel topic. Kids who participate get bonus XP.
- **Duel streaks:** Track consecutive weeks of dueling the same friend. "Friendly Rival" badge at 10 weeks.
- **Voice taunts (kid-safe):** Record a 5-second voice message attached to your challenge: "Bet you can't beat my score! 😎" — AI-moderated for appropriate content.

### 8.3 "Teach a Friend" Lessons

Extended from Feature 14 (Teach a Friend) in studybuddy-features-part2.md:

- Child creates a mini-lesson on a mastered topic
- Shared via code — friend opens and takes the 3-question quiz
- **Engagement hook:** "3 friends completed your lesson! Your teaching score: 4.5/5 ⭐"
- **Reciprocal engagement:** "Sara made a lesson for YOU! Want to try it?"

### 8.4 Achievement Sharing

- Child can share specific achievements with parental approval
- Shareable moments: level ups, streak milestones, mastery achievements, Story Mode chapter completions
- Share format: a card image (auto-generated) suitable for WhatsApp or family group chat
- "Proud Moment" card includes: achievement name, Nuri celebration, child's avatar (NOT real photo)

### 8.5 Collaborative Goals

- **Class goals:** "Your class answered 1,000 questions this week! 🎉"
- **Progress bar:** visible on each child's home screen if class is set up
- **Milestone rewards:** When class hits the goal, ALL members get a bonus: shared sticker, bonus XP, or unlock a class-only Nuri costume
- **Encouragement:** "Your class needs 47 more questions to hit the goal! Can you contribute? 💪"
- **No individual blame:** Never shows who contributed least. Only celebrates contributions.

---

## 9. Anti-Addiction Safeguards

Engagement must not become addiction. Nuri is designed to help children learn and grow, not to exploit dopamine loops. These safeguards are non-negotiable.

### 9.1 Session Time Limits

| Setting | Default | Parent-Configurable Range |
|---------|---------|--------------------------|
| Max session length | 30 minutes | 15-60 minutes |
| Break suggestion | After 20 minutes | After 10-45 minutes |
| Daily total limit | 60 minutes | 30-120 minutes |
| Sessions per day | No hard limit | 1-5 (optional) |

**When time limit is reached:**
```
Nuri: "Great job today! You've been learning for 30 minutes —
that's awesome! Time to take a break and play outside! 🌳☀️"

[Session saves automatically]
[No more questions can be started]
[Child can view their profile/stickers but not start new quizzes]
[Resets after parent-configured cooldown (default: 2 hours)]
```

**The limit message is ALWAYS positive.** It celebrates what they did, not what they can't do.

### 9.2 Design Constraints

| Constraint | Rationale |
|-----------|-----------|
| No infinite scrolling | Sessions have a defined end. No "just one more" trap. |
| No bottomless content feed | Home screen shows specific, bounded options, not an endless stream. |
| No real-money purchases by children | All in-app items are earned through learning. Parent account only for subscription. |
| No loot boxes with real money | Mystery boxes are earned through learning, never purchased. |
| No artificial urgency | "Limited time offer!" or countdown timers are not used. Daily challenges expire naturally at midnight. |
| No social comparison pressure | Leaderboards are opt-in, weekly-reset, and never show a child at the bottom. |
| No dark patterns | Unsubscribe is easy. "Are you sure?" is asked once, not three times. |
| No streak guilt | Breaking a streak is acknowledged warmly, never punitively. |

### 9.3 COPPA Compliance

| Requirement | Implementation |
|-------------|---------------|
| Parental consent | Required before account creation. Parent enters email + verifies. |
| No personal data collection from children | Name (first only), year group, learning data. No email, photo, location. |
| Notification consent | Parent explicitly opts in to push notifications. |
| Data deletion | Parent can request full data deletion from settings. |
| No targeted advertising | App is subscription-funded, no ads ever. |
| No direct contact with children | Nuri is AI, not a human. No chat with strangers. |
| Privacy policy | Plain-language, parent-friendly. Available at signup. |

### 9.4 Parental Controls Dashboard

| Control | Options |
|---------|---------|
| Daily time limit | 15/30/45/60/90/120 minutes |
| Session time limit | 15/20/30/45/60 minutes |
| Break reminder interval | Every 10/15/20/30 minutes |
| Social features | On/Off per feature |
| Push notifications (child) | On/Off + quiet hours |
| Push notifications (parent) | On/Off + frequency |
| Weekend mode (streaks) | On/Off |
| Leaderboard participation | On/Off |
| Achievement sharing | On/Off |
| Voice notes from Nuri | On/Off + delivery time |

---

## 10. A/B Testing Framework

Not every engagement mechanic will work perfectly on launch. The following elements should be systematically A/B tested to optimize engagement without compromising educational integrity.

### 10.1 Test Priority Matrix

| Test | Variants | Metric | Priority | Hypothesis |
|------|----------|--------|----------|------------|
| **Sticker drop rate** | 10% vs 20% vs 30% after Q3 | Session completion rate, DAU | P0 | 20% is the sweet spot — 10% feels stingy, 30% devalues stickers |
| **XP per correct answer** | +5 vs +10 vs +15 | Questions per session, level-up satisfaction | P0 | +10 is baseline; +15 may accelerate levels too fast |
| **First celebration timing** | After Q1 vs Q2 vs Q3 | Session dropout at Q1-Q3 | P0 | Earlier celebration = lower early dropout |
| **Notification wording** | Curiosity vs Challenge vs Warmth | Push notification → app open rate | P1 | Curiosity ("want to know?") beats warmth ("miss you") |
| **Notification timing** | 7am vs 7:30am vs 3:30pm (after school) | Push notification → app open rate | P1 | After-school may outperform morning |
| **Session length before break** | 10 vs 15 vs 20 questions | Average session length, completion rate | P1 | 10-12 is optimal for ages 5-8, 15 for ages 9-11 |
| **Mystery box frequency** | Every 5 vs 8 vs 10 correct | XP per session, return rate | P1 | Every 5 may feel too frequent; 10 may be too far for younger kids |
| **Streak freeze policy** | 1/week vs 2/week vs earn-only | Streak length, streak break → churn rate | P2 | 1/week + earn extras is the balance between safety net and scarcity |
| **Nuri joke frequency** | Every session vs every 2nd vs every 3rd | Session satisfaction (thumbs up/down), session length | P2 | Every session for ages 5-7, every 2nd for 8-11 |
| **Level-up XP curve** | Current vs 20% faster vs 20% slower | Level-up frequency, long-term retention | P2 | Faster for young kids (instant gratification), slower for older kids (earned achievement) |

### 10.2 Testing Rules

| Rule | Detail |
|------|--------|
| Minimum sample size | 500 users per variant before drawing conclusions |
| Test duration | Minimum 2 weeks (to capture weekly patterns) |
| One test at a time per user | No stacking — user is in one test group only |
| Educational metrics must not decline | If a variant increases engagement but decreases learning outcomes (accuracy, mastery rate), it is rejected regardless of engagement lift |
| Parental transparency | A/B tests are disclosed in privacy policy ("We may test different configurations to improve the experience") |
| No testing on safeguards | Anti-addiction safeguards (time limits, no dark patterns) are NEVER A/B tested. They are fixed. |

### 10.3 Age-Segmented Testing

Different engagement mechanics may work differently across age groups. All A/B tests should be segmented:

| Segment | Ages | Year Groups | Key Differences |
|---------|------|-------------|----------------|
| Young learners | 5-7 | Years 1-2 | Need more frequent rewards, simpler celebrations, shorter sessions |
| Middle learners | 7-9 | Years 3-4 | Balance of fun and challenge, Story Mode becomes key driver |
| Older learners | 9-11 | Years 5-6 | Social features matter more, can handle longer sessions, respond to competition |

---

## 11. Comparison to Competitors

### 11.1 Engagement Mechanics Comparison

| Mechanic | IXL | Duolingo | Prodigy | Khan Academy | **Nuri** |
|----------|-----|----------|---------|-------------|---------|
| **XP / Points** | Awards (basic) | XP (strong) | Gold coins | Energy points | XP with layered bonuses + difficulty scaling |
| **Streaks** | None | Streaks (strong, but punitive) | None | None | Enhanced streaks with freezes, weekend mode, warm comeback |
| **Mascot / Character** | None | Duo (reactive) | RPG avatar | Animal characters (kids only) | Nuri with moods, memory, evolution, jokes, challenges |
| **Story / Narrative** | None | Stories (language) | RPG quests (math only) | None | 7 Lost Books across ALL 6 subjects |
| **Sticker/Collection** | Certificates | None | Pets, items | Badges | 5-tier sticker book, daily drops, rare finds |
| **Leaderboard** | None | Leagues (aggressive) | None | None | Weekly-reset, opt-in, multi-category, collaborative goals |
| **Social features** | None | Friends list | Multiplayer battles | None | Duels, Teach a Friend, class goals, sharing |
| **Re-engagement** | Email reminders | Aggressive push + streak guilt | Basic push | Basic email | Warm 6-stage system, never punitive |
| **Voice / Personality** | None | Duo speaks (limited) | None | None | Full voice, morning notes, jokes, memory, moods |
| **Anti-addiction** | None (infinite drill) | Session reminders | None (infinite play) | None | Full parental controls, time limits, COPPA |
| **Subjects** | Math, ELA, Science, SS | Languages only | Math (primary) | Math, reading, coding | 6 subjects incl. Arabic + Religion |

### 11.2 Why Kids Hate IXL (and Why They'll Love Nuri)

| IXL Problem | What It Feels Like to a Kid | Nuri's Solution |
|-------------|---------------------------|-----------------|
| SmartScore drops on wrong answer | "I got punished for trying!" | XP only goes UP. Wrong answers earn +5 XP for effort. |
| No mascot or personality | "It's boring and feels like a test." | Nuri is a friend who jokes, challenges, remembers, and celebrates. |
| No narrative or story | "Why am I even doing this?" | Story Mode gives PURPOSE to every quiz. |
| No streaks or daily hooks | "There's no reason to come back tomorrow." | Streaks, daily stickers, mystery challenges, voice notes. |
| Repetitive drill format | "Same thing over and over." | Varied session types, Nuri's mood changes, rotating celebrations. |
| Score-focused (not effort) | "I'm scared to get things wrong." | Effort-based XP. Nuri encourages after wrong answers. |
| No customization or rewards | "Nothing fun to earn." | Sticker book, Nuri costumes, world items, badges, Story Mode unlocks. |

### 11.3 Where Nuri Beats Duolingo

| Duolingo Strength | How Nuri Matches It | How Nuri Goes Further |
|------------------|--------------------|-----------------------|
| Streaks | Enhanced streaks with same flame icon energy | Weekend mode, warm comebacks, streak memory (best-ever record) |
| XP + Leagues | XP with difficulty scaling | Multi-category leaderboards, weekly reset, no permanent hierarchies |
| Push notifications | Personality-driven nudges | AI-generated, curriculum-specific, voice notes (not just text) |
| Hearts / Lives | Not copied — hearts create anxiety | No penalty system. Only upward progression. |
| Duo the owl reacts | Nuri reacts with moods, memory, and personality | Nuri evolves visually, tells jokes, issues challenges, remembers past sessions |

### 11.4 Where Nuri Beats Prodigy

| Prodigy Strength | Nuri's Advantage |
|-----------------|------------------|
| RPG game world | Story Mode with cross-subject narrative (not math-only) |
| Pets and items | Nuri evolution (deeper attachment to ONE character) + sticker collection |
| Multiplayer battles | Study Duels + Teach a Friend + collaborative class goals |
| Math engagement | 6 subjects including Arabic and Religion — full curriculum companion |

---

## 12. Data Model (Engagement Tables)

These tables extend the core database schema from studybuddy-features-part2.md.

```sql
-- Streak tracking
CREATE TABLE streaks (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  streak_freezes_available INTEGER DEFAULT 1,
  streak_freezes_used_this_week INTEGER DEFAULT 0,
  weekend_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily engagement tracking
CREATE TABLE daily_engagement (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  date DATE NOT NULL,
  logged_in BOOLEAN DEFAULT false,
  daily_challenge_completed BOOLEAN DEFAULT false,
  daily_sticker_claimed BOOLEAN DEFAULT false,
  daily_fact_viewed BOOLEAN DEFAULT false,
  session_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  UNIQUE(child_id, date)
);

-- Sticker collection
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary', 'exclusive')),
  category VARCHAR(50), -- 'daily', 'achievement', 'story_mode', 'streak', 'seasonal'
  image_url VARCHAR(255),
  subject VARCHAR(50) -- NULL for general stickers
);

CREATE TABLE child_stickers (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  sticker_id INTEGER REFERENCES stickers(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50) -- 'daily_login', 'sticker_drop', 'mystery_box', 'achievement', 'comeback'
);

-- Session tracking for engagement analysis
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  session_type VARCHAR(30) CHECK (session_type IN ('standard', 'daily_challenge', 'story_mode', 'review', 'duel', 'teach')),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  stickers_dropped INTEGER DEFAULT 0,
  mystery_boxes_opened INTEGER DEFAULT 0,
  session_completed BOOLEAN DEFAULT false,
  nuri_mood VARCHAR(20),
  celebration_ids TEXT[] -- array of celebration types shown
);

-- Mystery box log
CREATE TABLE mystery_box_opens (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  session_id INTEGER REFERENCES sessions(id),
  reward_type VARCHAR(30) CHECK (reward_type IN ('bonus_xp', 'rare_sticker', 'nuri_costume', 'double_xp_powerup')),
  reward_value INTEGER, -- XP amount or item ID
  opened_at TIMESTAMP DEFAULT NOW()
);

-- Re-engagement tracking
CREATE TABLE reengagement_events (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  days_inactive INTEGER,
  notification_type VARCHAR(30), -- 'child_nudge', 'parent_alert', 'welcome_back'
  notification_sent_at TIMESTAMP,
  app_opened_after BOOLEAN DEFAULT false,
  opened_at TIMESTAMP,
  template_pool VARCHAR(10) -- 'A' through 'E' for A/B tracking
);

-- A/B test assignments
CREATE TABLE ab_test_assignments (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  test_name VARCHAR(100) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, test_name)
);

-- Celebration tracking (to prevent repeats)
CREATE TABLE celebration_log (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  celebration_type VARCHAR(50),
  shown_at TIMESTAMP DEFAULT NOW()
);

-- Nuri memory context
CREATE TABLE child_memory (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES children(id),
  memory_type VARCHAR(30) CHECK (memory_type IN ('achievement', 'struggle', 'preference', 'milestone', 'story_progress', 'joke_told')),
  content TEXT NOT NULL, -- natural language memory: "Mastered fractions on March 28"
  subject VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- some memories fade (old struggles after mastery)
);
```

---

## 13. Implementation Priority

This maps to the existing build phases in the core spec.

**Phase 3 (Week 5-6) — Core Engagement:**
- XP/Level/Streak system with enhanced streak mechanics
- Sticker drops + sticker book
- Nuri celebration library (15+ variants)
- Daily login bonus + daily sticker
- Session summary with tomorrow teaser
- Basic Nuri mood system (3 moods: excited, encouraging, curious)

**Phase 4 (Week 7-8) — Deep Engagement:**
- Full Nuri mood system (all 7 moods)
- Nuri memory context (remembers past sessions)
- Mystery box system
- Daily challenge (sealed envelope)
- Story Mode engagement integration
- Nuri evolution preview/teaser system
- Curiosity hooks (end-of-session teasers, unlock previews)

**Phase 5 (Week 9-10) — Social + Re-engagement:**
- Re-engagement notification system (6-stage timeline)
- Morning voice notes (Feature 16 integration)
- Class leaderboard (weekly reset)
- Collaborative class goals
- Anti-addiction safeguards + parental controls dashboard
- A/B testing framework (infrastructure)

**Post-Launch (Week 11+):**
- A/B tests begin (sticker drop rate, notification timing first)
- Engagement health dashboard (internal)
- Nuri joke database expansion
- Seasonal engagement events (Ramadan challenge, summer learning)
- Achievement sharing cards

---

*This spec defines the complete Engagement & Retention Engine for StudyBuddy (Nuri). Every mechanic is designed to serve one purpose: make kids genuinely WANT to learn, every single day — not because they're told to, but because Nuri, the story, and the rewards make it irresistible.*

*Spec created: March 31, 2026*
*Companion to: studybuddy-spec.md, studybuddy-features-part1.md, studybuddy-features-part2.md*
