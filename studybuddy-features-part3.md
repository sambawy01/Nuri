# StudyBuddy — Extended Features (Part 3: Features 21–35)
## Deep Learning Intelligence, Emotional Adaptation & Accessibility

*Extends studybuddy-spec.md*

---

## CATEGORY E: Understanding How the Child Thinks

---

### Feature 21: Error Pattern Detection 🔍

Don't just track THAT they got it wrong — track WHY. Detect the root misconception and fix it.

**How It Works:**

Every wrong answer is analyzed not just for correctness but for the TYPE of error:

| Error Type | Example | What It Reveals |
|-----------|---------|-----------------|
| Conceptual | 1/3 + 1/4 = 2/7 | Child adds both numerators AND denominators — doesn't understand common denominator |
| Procedural | 1/3 + 1/4 → LCD=12 → 4/12 + 4/12 | Knows the method but applied it wrong (should be 3/12 not 4/12) |
| Calculation | 4/12 + 3/12 = 8/12 | Understands the concept but made an arithmetic slip (4+3≠8) |
| Reading | Answers a different question | Misread or misunderstood what was being asked |
| Guessing | Random/nonsensical answer | Didn't attempt real reasoning |

**Pattern Detection Algorithm:**
```
For each child + topic:
  Track last 10 wrong answers
  Classify each error type
  If 3+ errors share same type → PATTERN DETECTED
  
  Trigger targeted intervention:
    - Conceptual error pattern → re-teach the underlying concept from scratch
    - Procedural error pattern → walk through the steps slowly, one at a time
    - Calculation error pattern → arithmetic drills, suggest scratch paper
    - Reading error pattern → have them re-read aloud, underline key words
    - Guessing pattern → reduce difficulty, rebuild confidence
```

**Nuri's Response to Detected Patterns:**

Conceptual: "I've noticed something interesting! Every time you add fractions, you're adding the bottom numbers too. Let me show you WHY that doesn't work — imagine you have 1 slice of a pizza cut into 3 pieces, and 1 slice of a pizza cut into 4 pieces. The slices are DIFFERENT SIZES, so we can't just count them together..."

Calculation: "Your method is perfect — you totally understand fractions! But I've noticed your adding and subtracting sometimes slips. Let's do a quick number warm-up before we continue. What's 7+8? And 13-6? Great — now back to fractions!"

**Data stored per error:**
```json
{
  "question_id": "q_123",
  "child_answer": "2/7",
  "correct_answer": "7/12",
  "error_type": "conceptual",
  "error_subtype": "fraction_addition_adding_denominators",
  "pattern_count": 3,
  "intervention_triggered": true
}
```

**Integration:**
- Feeds into Mistake Journal with error type tags
- Spaced repetition prioritizes conceptual errors over calculation errors
- Parent Highlights mentions: "Carla understands the method but keeps making multiplication errors — times table practice would help"
- Learning Style Detection uses this to adjust teaching approach

---

### Feature 22: Thinking Out Loud Protocol 🗣️

Before answering, the child explains their reasoning. Catches wrong understanding even when answers are accidentally correct.

**How It Works:**

In Quiz Mode and Homework Helper, Nuri periodically (not every question — that would be exhausting) asks:

> "Before you give me your answer — talk me through what you're thinking. How are you going to solve this?"

**Frequency:** Every 3rd-4th question, or whenever:
- The question is hard (above current accuracy rate)
- The child has been guessing (fast answers, low accuracy)
- The topic is new (first time seeing this concept)
- A pattern error was recently detected

**What Nuri Listens For:**

| Scenario | Child Says | Nuri's Response |
|----------|-----------|-----------------|
| Right logic, right answer | "I need to find a common denominator, so 3×4=12, then..." | "Perfect reasoning! You really understand this! ✅" |
| Right logic, wrong answer | "Common denominator is 12, so 1/3 becomes 4/12... and 1/4 becomes 4/12" | "Great method! But check: if the denominator went from 3 to 12, what did we multiply by? And what should we multiply the numerator by?" |
| Wrong logic, right answer | "I just added 1+1=2 and 3+4=7... wait that's 2/7... no, let me guess... 7/12?" | "You got the right answer! But I want to make sure you know WHY it's 7/12. Walk me through it — how did we get 12 on the bottom?" |
| Wrong logic, wrong answer | "I added the tops and the bottoms" | "Interesting approach! Let me ask you this — if I eat 1/2 of a pizza and 1/2 of a pizza, did I eat 2/4 of a pizza? Or a whole pizza? 🍕" |
| No reasoning | "I don't know" | "That's okay! Let's figure it out together. What's the first thing you notice about this question?" |

**Voice-Optimized:** This works best in voice mode. The child talks naturally, Nuri listens and responds. In text mode, a simplified version: "What's your first step?" before they answer.

**Gamification:**
- "Deep Thinker" badge — explained reasoning 30 times
- +5 XP bonus when they explain their reasoning before answering
- Nuri: "I love when you tell me your thinking — it helps me help you better!"

---

### Feature 23: Misconception Library 📚

A curated database of the most common misconceptions per topic per year, with targeted mini-lessons to break each one.

**Structure:**
```json
{
  "id": "sci_y5_heavy_fall_faster",
  "subject": "science",
  "year_levels": [4, 5, 6],
  "topic": "Forces — Gravity",
  "misconception": "Heavier objects fall faster than lighter objects",
  "correct_understanding": "All objects fall at the same rate due to gravity (ignoring air resistance). Galileo proved this.",
  "detection_triggers": [
    "child says 'heavier things fall faster'",
    "child predicts heavy ball hits ground first",
    "child answers that mass affects fall speed"
  ],
  "mini_lesson": {
    "hook": "If I dropped a bowling ball and a basketball from the same height — which hits the ground first? Most people say the bowling ball... but what if I told you they land at EXACTLY the same time?",
    "explanation": "Gravity pulls everything equally. The reason a feather falls slower than a rock isn't because it's lighter — it's because air pushes against it more. In a vacuum (no air), a feather and a bowling ball land together!",
    "visual_example": "Imagine the Moon — there's no air there. An astronaut dropped a hammer and a feather and they hit the ground at the same time!",
    "check_question": "So if I dropped a heavy book and a light pencil in a room with no air, what would happen?"
  }
}
```

**Coverage:** 200+ misconceptions across all subjects and years:

| Subject | Example Misconceptions |
|---------|----------------------|
| Maths | "Multiplying always makes bigger" / "0.5 > 0.35 because 5>35" / "Bigger denominator = bigger fraction" |
| Science | "Heavy falls faster" / "Seasons caused by distance from sun" / "Plants get food from soil" / "Cold is a thing (vs absence of heat)" |
| English | "More letters = longer sound" / "Every sentence needs 'and'" / "Paragraphs need exactly 5 sentences" |
| History | "People in the past were less intelligent" / "Everyone in medieval times was poor" |
| Religion | Age-appropriate theological misconceptions handled with sensitivity |
| Arabic | "All Arabic letters connect" (some don't) / "Hamza is a vowel" / "Masculine is default for everything" |

**When Triggered:**
- AI detects misconception in child's answer or "Thinking Out Loud" response
- Nuri says: "Ooh, interesting! A LOT of people think that. But here's something cool..." → launches mini-lesson
- After mini-lesson: check question to verify the misconception is corrected
- If still held: different approach, different analogy, try again
- Logged in Mistake Journal with tag "misconception"

---

## CATEGORY F: Making Learning Stick Beyond the App

---

### Feature 24: Real World Missions 🌍

Weekly challenges that take learning OFF the screen into their actual life.

**How Missions Work:**
- Every Monday, Nuri presents 1-2 missions based on what they studied last week
- Missions require going into the real world, observing, doing, creating
- Child submits evidence: photo, voice recording, or text description
- Nuri reviews the submission with encouragement and follow-up questions

**Mission Examples by Subject:**

**Maths:**
- "Find 5 fractions in your kitchen (food labels, recipes, measuring cups). Photo each one!" 
- "Measure the length of 10 objects in your room in cm. Which is longest?"
- "Go to a shop and calculate the total of 3 items. Were you right at the checkout?"
- "Find all the symmetrical objects in your house. How many can you find?"

**Science:**
- "Find something in your home that's a solid, a liquid, and a gas. Photo all three!"
- "Plant a seed in a cup. Take a photo every 3 days. Predict when it'll sprout!"
- "Make a shadow puppet. Why does the shadow get bigger when your hand gets closer to the light?"
- "Build the tallest tower you can from household items. What forces make it stay up? What makes it fall?"

**English:**
- "Write a 5-sentence story about something that happened to you today"
- "Interview a family member: ask 3 questions, write down their answers"
- "Find 5 adjectives on food packaging in your kitchen"
- "Read a sign or poster in your neighborhood — what persuasive language does it use?"

**History:**
- "Ask a grandparent or older relative: what was different when they were your age? Record their answer"
- "Find something in your home that's older than you. How old is it? What's its history?"

**Religion:**
- "Do one kind thing for someone today without being asked. Tell Nuri about it"
- "Ask a family member about their favorite prayer or Bible story. Why is it their favorite?"

**Arabic:**
- "Find 5 Arabic words around your home or neighborhood (signs, products, etc.). Photo them!"
- "Teach one Arabic word to a family member. Record them saying it!"
- "Write your name in Arabic calligraphy. Use the S Pen on your tablet!"

**Submission & Review:**
- Child taps "Submit Mission" → camera for photo or mic for voice
- AI reviews: validates the submission, asks a follow-up question
- "Great find! That's 1/4 on the measuring cup. What would 3/4 look like?"
- Completed missions → +40 XP + "Explorer" sticker

**Gamification:**
- "Field Researcher" badge — completed 10 missions
- "Real World Scholar" badge — completed missions in all 6 subjects
- Mission streaks tracked separately (weekly)

---

### Feature 25: Parent Co-Learning Moments 👨‍👩‍👧‍👦

Short, specific activities parents can do WITH their kids that reinforce what was studied. Sent via Parent Highlights.

**Daily Co-Learning Suggestion (in parent notification):**

```
🦉 Tonight's Co-Learning Moment (5 minutes):

Your son studied the WATER CYCLE today in Science.

🧪 Try This Together:
Boil a kettle. Hold a cold plate 30cm above the steam. 
Watch water droplets form on the plate!

💬 Ask Him:
"Can you explain what's happening to the water?"
(He should mention: evaporation, condensation)

🌟 Bonus Challenge:
"Where else does this happen in real life?"
(Answer: clouds, bathroom mirror, cold drink glass)
```

**Rules:**
- NEVER feels like homework for the parent
- Max 5 minutes
- Uses stuff already in the house
- Fun enough that the parent enjoys it too
- Tied directly to what was studied TODAY
- Clear expected answers so the parent can guide even if they don't know the topic

**Subject Examples:**

| Subject | Co-Learning Moment |
|---------|-------------------|
| Maths (fractions) | "Cut a pizza/bread into fractions. Ask: which is bigger, 1/3 or 1/4? Let them hold the pieces!" |
| Science (magnets) | "Grab a fridge magnet. Walk around the house — what does it stick to? What doesn't it stick to? Why?" |
| English (adjectives) | "Play 'describe it' at dinner — someone picks an object, everyone gives 3 adjectives. Funniest one wins!" |
| History (Ancient Egypt) | "Watch a 5-min YouTube clip about pyramids together. Ask: how do you think they built them without machines?" |
| Religion | "At bedtime, each share one thing you're grateful for today. Connect to the lesson about thankfulness." |
| Arabic | "Learn one Arabic word together as a family. Use it at dinner. See who remembers it tomorrow!" |

---

### Feature 26: Memory Palace Technique 🏰

Teach kids HOW to memorize using the evidence-based Method of Loci.

**What It Is:**
The child imagines walking through a familiar place (their house, school, a route they know). At each location, they place a vivid, silly image linked to what they need to remember. The spatial memory + visual absurdity makes it stick.

**How Nuri Teaches It:**

> **Nuri:** "I'm going to teach you a secret memory trick that ancient Greek scholars used! It's called a Memory Palace. Here's how it works:
>
> Think of your house. Imagine walking through the front door. At each room, we're going to put something CRAZY that helps you remember.
>
> Let's memorize the 7 times table:
>
> Front door: 7 giant cats are blocking the door (7×1=7). You have to squeeze past them!
> Hallway: 14 shoes are scattered EVERYWHERE (7×2=14). You're tripping over them!
> Kitchen: 21 bananas are falling from the ceiling (7×3=21). Bonk! Bonk! Bonk!
> Living room: 28 parrots are sitting on the sofa watching TV (7×4=28). They're eating popcorn!
>
> Now close your eyes and walk through your house. Tell me what you see at each room..."

**Subjects Where This Works Best:**
- Maths: Times tables, formulas, order of operations
- Science: Planets in order, parts of a cell, states of matter
- History: Key dates, order of events, kings/pharaohs
- Religion: Ten Commandments, books of the Bible, sacraments
- Arabic: Vocabulary lists, verb conjugation patterns, grammar rules
- English: Spelling of tricky words, literary devices, Shakespeare quotes

**Voice-First:** This works best as a voice conversation. Nuri guides them through building the palace, they describe what they "see," Nuri helps make the images more vivid and absurd (the sillier, the more memorable).

**Review:** Next session, Nuri says "Let's walk through your Memory Palace! What do you see at the front door?" — tests recall through the spatial journey.

**Gamification:**
- "Memory Architect" badge — built 5 memory palaces
- "Palace Master" badge — successfully recalled a full palace 1 week later

---

### Feature 27: Sleep & Timing Optimization 🌙

Research shows studying before sleep improves retention. Track when they study and optimize.

**Implementation:**

**Pre-Sleep Review Suggestion:**
- If it's after 7pm and they open the app: "Perfect timing! Studying before sleep helps your brain remember better. Want to do a quick 5-minute review of today's topics? 🌙"
- Shows a "Bedtime Review" mode: short, gentle, no timers, no pressure
- 5 items from spaced repetition queue
- Nuri speaks softly (lower volume, slower pace)

**Personal Best Time Detection:**
- Track accuracy by time of day over weeks
- Build a profile: "Carla performs best between 4-5pm for Maths, and 7-8pm for Arabic"
- Nuri suggests: "I've noticed you're sharpest at Maths in the afternoon! Want to schedule your practice then?"
- Optional: integrate with device calendar/reminders

**Weekly Pattern Insight (in Parent Highlights):**
```
📊 Best Study Times This Week:
  Morning (before school): 82% accuracy
  Afternoon (after school): 91% accuracy ← best!
  Evening (after dinner): 78% accuracy
  
💡 Suggestion: Prioritize harder subjects in the afternoon.
   Use evenings for gentle review before bed.
```

**Sleep Reminder:**
- After 9pm for Years 1-3, after 9:30pm for Years 4-6:
- "Hey {name}, it's getting late! Your brain needs sleep to store everything you learned today. Time to rest — I'll be here tomorrow! 🌙💤"
- Can be configured/disabled by parent

---

## CATEGORY G: Emotional & Motivational Intelligence

---

### Feature 28: Mood Check-In 😊

At session start, quick emotional pulse. Nuri adapts the entire session based on how they're feeling.

**UI:** Simple emoji tap at the start of each session:

```
How are you feeling right now?

  😊        😐        😔        😤        😴
 Happy    Okay      Sad     Frustrated  Tired
```

Optional follow-up (only for 😔 and 😤):
- 😔: "Want to tell me about it? Or should we just do something fun together?"
- 😤: "That's okay! Let's start with something you're great at to get the good vibes going!"

**How Nuri Adapts:**

| Mood | Session Adjustments |
|------|-------------------|
| 😊 Happy | Normal or slightly harder. Push them. "You're in a great mood — let's tackle something challenging!" |
| 😐 Okay | Standard session. Warm, encouraging. |
| 😔 Sad | Extra gentle. Shorter session. More praise. Easier questions to start. Option to just chat with Nuri (no studying). "We don't have to study today if you don't want to. Want to just talk?" |
| 😤 Frustrated | Start with their STRONGEST subject (confidence builder). No timed questions. Extra patience. "Let's do something you're awesome at first!" |
| 😴 Tired | Micro-session: 5 questions maximum. No hard topics. "Quick and easy today! Just 5 questions and you're done. Deal? 🤝" |

**System Prompt Addition:**
```
MOOD CONTEXT: The child selected "{mood}" at the start of this session.
{if sad}
- Be extra warm and gentle. Prioritize their emotional wellbeing over learning today.
- Offer to just chat if they want. Don't push.
- More frequent praise. Celebrate even small efforts.
- Shorter responses. Calmer tone.
- If they want to study, start with easy wins.
{/if}
{if frustrated}
- Start with a subject/topic they have HIGH accuracy in — rebuild confidence first.
- No timers. No pressure. No "challenge me" difficulty.
- Extra patience with wrong answers.
- "It's okay to feel frustrated. Let's do something that feels good."
{/if}
{if tired}
- Maximum 5 questions this session. Then suggest stopping.
- Easiest difficulty. No complex explanations.
- "You showed up even when you're tired. That's impressive! 💪"
{/if}
```

**Tracking:**
- Mood logged per session with timestamp
- Over time, detect patterns: "Always tired on Monday evenings" / "Frustrated after Arabic sessions"
- Parent Highlights: "This week Carla was 😊 3 times, 😐 twice, 😴 once, and 😤 once (after Arabic). Consider lighter Arabic sessions on tired days."
- If 😔 3+ times in a week: Parent gets a gentle flag (not alarmist): "Your child seemed a bit down a few times this week. A chat might help! ❤️"

**Critical Safety Note:**
- If mood is consistently 😔 over multiple weeks, suggest (in Parent Highlights): "If {name} seems persistently low, consider speaking with their teacher or a professional. Nuri is here to help with studying, but emotional wellbeing comes first. ❤️"
- Nuri NEVER acts as a therapist. Keeps it warm and supportive but knows its limits.

---

### Feature 29: Growth Mindset Language Engine 🌱

Every word Nuri says is carefully designed around Carol Dweck's growth mindset research.

**Core Principle:** Praise EFFORT and PROCESS, never ability or intelligence.

**Language Rules (hardcoded into ALL system prompts):**

```
GROWTH MINDSET LANGUAGE — MANDATORY FOR ALL RESPONSES:

NEVER SAY:
- "You're so smart!" → SAY: "You worked really hard on that!"
- "You're a natural!" → SAY: "Your practice is really paying off!"  
- "That's easy!" → SAY: "You've gotten really good at this through practice!"
- "You're the best!" → SAY: "Look how much you've improved!"
- "Not everyone gets maths" → SAY: "This is hard right now, and that's exactly how your brain grows"
- "You're gifted" → SAY: "Your effort and curiosity are your superpowers"
- "I knew you could do it" → SAY: "You didn't give up, and that's what made the difference"

WHEN THEY SUCCEED:
- Highlight the PROCESS: "The way you broke that into steps was really clever"
- Highlight the EFFORT: "You spent 3 minutes on that and didn't give up — that's why you got it"
- Highlight the GROWTH: "Last week this type of question was really hard for you. Look at you now!"
- Highlight the STRATEGY: "I noticed you drew a picture to help you think. Smart strategy!"

WHEN THEY FAIL:
- Normalize struggle: "This is supposed to be hard. That's how your brain builds new connections"
- Reframe mistakes: "Every mistake is your brain learning what DOESN'T work — that's progress!"
- Emphasize "yet": "You don't understand this YET. The word 'yet' is really powerful"
- Show the path: "You got steps 1 and 2 right. That's progress. Let's figure out step 3 together"
- Historical examples: "Did you know Einstein failed his first college entrance exam? And look what happened!"

WHEN THEY COMPARE TO OTHERS:
- "Everyone's brain learns differently. Your job isn't to be like anyone else — it's to be better than YOU were yesterday"
- "Some people find this easier, some find it harder. What matters is that you're TRYING"

WHEN THEY WANT TO GIVE UP:
- "I know it feels impossible right now. But 10 minutes ago, step 1 felt impossible too, and you nailed it"
- "Let's just try ONE more step. If it's still too hard, we'll come back to it later. No shame in that"
- "The hardest problems are the ones that teach you the most. Your brain is growing right now, even if it doesn't feel like it"
```

---

### Feature 30: Micro-Celebrations for Effort 🎊

Celebrate not just correct answers but the behaviors that lead to learning.

**Celebration Triggers:**

| Behavior | Nuri's Response | XP | Animation |
|----------|---------------|-----|-----------|
| Attempted a hard question (even if wrong) | "You didn't skip it — that takes guts! 💪" | +5 | Nuri nods approvingly |
| Spent 5+ minutes on one problem without quitting | "Your persistence is incredible. That's a real scholar's mindset!" | +10 | Nuri wears a tiny medal |
| Came back to a topic they previously struggled with | "You came back to face this again. That's REAL courage! 🦁" | +10 | Nuri flexes |
| Chose a harder difficulty | "Ooh, going for the challenge! I respect that! 🔥" | +5 | Nuri puts on sunglasses |
| Studied a subject they usually avoid | "Arabic today? That's stepping outside your comfort zone. Proud of you! ✨" | +10 | Nuri high-fives |
| Asked "why?" or "can you explain more?" | "I LOVE that you asked why! Curious minds go far! 🧠" | +5 | Nuri's eyes light up |
| Used "Explain It Back" voluntarily | "Teaching it back to me? That's what the best learners do! 🎓" | +10 | Nuri bows |
| Logged in on a weekend | "Studying on a weekend? Your future self will thank you! 🌟" | +5 | Nuri in pajamas |
| Corrected their own mistake before Nuri pointed it out | "Wait — you caught your OWN mistake! That's expert-level thinking! 🔥" | +15 | Confetti burst |

---

## CATEGORY H: Making Them Self-Directed Learners

---

### Feature 31: Weekly Goal Setting 🎯

Every Monday, the child sets their own learning goals. Friday, they review. Builds ownership of their education.

**Monday Goal-Setting Session:**

> **Nuri:** "New week! Let's set some goals. What do you want to accomplish this week? Pick 1-3 goals! 🎯"

**Suggested Goals (AI-generated based on their data):**
- "Get my times tables streak to 10" (based on current streak: 6)
- "Learn 15 new Arabic words" (based on current rate: ~10/week)
- "Finish Story Mode Chapter 2, Stage 3" (in progress)
- "Resolve 5 items from my Mistake Journal" (currently 8 unresolved)
- "Do 3 homework sessions with zero hints" (current avg: 1.5 hints/question)

**Custom Goals:** Child can type their own: "I want to get better at long division"

**Tracking:**
- Goals visible on home dashboard with progress bar
- Nuri mentions goals during sessions: "This question counts toward your 'times tables streak' goal! You're at 8 out of 10! 🔥"
- Wednesday mid-week check: "How are your goals going? You've done 1 of 3 — still time!"

**Friday Review:**

> **Nuri:** "Week's over! Let's see how you did:
> ✅ Times tables streak: 10! NAILED IT! 🎉
> 🟡 Arabic words: 12 out of 15 — so close!
> ❌ Story Mode: didn't get to it — want to carry this over to next week?
> 
> 1 out of 3 completed. You're building great habits! Next week will be even better! 💪"

**Gamification:**
- All goals met in a week: +100 XP bonus + "Goal Crusher" badge
- 4 consecutive weeks with 2+ goals met: "Consistent Achiever" badge

---

### Feature 32: Self-Assessment Before Results 🤔

After a quiz, BEFORE seeing results, the child predicts how they did.

**Flow:**
1. Child completes a 10-question quiz
2. Screen says: "Before I show your results... how do you think you did? 🤔"
3. Options: "Aced it! 💪" / "Pretty good 😊" / "Not sure 😬" / "Struggled 😅"
4. Then results reveal with comparison

**The Gap Tracking:**

| Self-Assessment | Actual | Meaning | Nuri's Response |
|----------------|--------|---------|-----------------|
| "Aced it" | 9/10 | Accurate self-awareness ✅ | "You know yourself well! And you were right — amazing score!" |
| "Aced it" | 4/10 | Overconfident — blind spots ⚠️ | "Hmm, you felt really confident but some tricky ones slipped through. Let's look at which ones surprised you" |
| "Struggled" | 8/10 | Underconfident — needs encouragement | "You said you struggled but look — 8 out of 10! You're better than you think! Trust yourself more 🌟" |
| "Struggled" | 3/10 | Accurate awareness | "You knew it was tough, and that's honest. Now we know exactly what to work on — that's actually really useful!" |

**Over Time:**
- Track calibration score: how accurately does the child predict their performance?
- If consistently overconfident → more "Thinking Out Loud" checks, more Confidence Meter usage
- If consistently underconfident → more praise, highlight past successes, "Look at your improvement!" moments
- Share calibration trend in Parent Highlights: "Carla is getting better at knowing what she knows!"

---

### Feature 33: Learning Journal 📓

End-of-session 30-second reflection. One sentence about what they learned today.

**Flow:**
At end of every session (optional but encouraged):

> **Nuri:** "Before you go — what's ONE thing you learned today? Just one sentence!"

Child types or speaks: "I learned that fractions need the same denominator before you add them"

**Saved to journal with:**
- Date and time
- Subject studied
- Their own words (exactly as spoken/typed)
- Session stats (questions answered, accuracy)

**Monthly Review:**

> **Nuri:** "Look at everything you learned this month! 📓
> 
> March 1: 'I learned that plants drink water through their roots'
> March 3: 'Fractions need same bottom number to add'
> March 5: 'The word for school in Arabic is madrasa'
> March 8: 'Normans conquered England in 1066'
> March 10: 'Jesus told the story of the Good Samaritan to teach about kindness'
> ...
> 
> That's 18 things you learned! Your brain grew SO much this month! 🧠✨"

**Why This Works:**
- Forces metacognition: the child must IDENTIFY what they learned (not just passively receive it)
- Creates a tangible record of progress they can see and feel proud of
- Reading back their OWN words about their OWN learning is incredibly empowering
- Parent Highlights can share favorite journal entries

**Gamification:**
- "Reflective Learner" badge — 10 journal entries
- "Historian of Knowledge" badge — 50 entries
- "365 Learner" badge — a journal entry for every day of a full year

---

## CATEGORY I: Accessibility & Inclusion

---

### Feature 34: Dyslexia-Friendly Mode 📖

A comprehensive accessibility mode that transforms the ENTIRE app experience for dyslexic learners.

**Activation:** Settings → Accessibility → Dyslexia-Friendly Mode → ON

**What Changes:**

#### Typography
- **Font:** Switches to **OpenDyslexic** (free, designed for dyslexia) or **Lexie Readable**
  - These fonts weight letters at the bottom to prevent visual "flipping" (b/d, p/q confusion)
  - Fallback: if custom font fails to load, use Comic Sans (actually recommended by dyslexia researchers for its distinct letterforms)
- **Size:** Base font increases from 14px to 18px (all text scales proportionally)
- **Line spacing:** Increases from 1.5 to 2.0 (more space between lines reduces "crowding effect")
- **Letter spacing:** Increases by 0.05em (letters don't blur together)
- **Word spacing:** Increases by 0.1em
- **Paragraph width:** Maximum 70 characters per line (prevents tracking errors)
- **NO justified text** — always left-aligned (ragged right edge is easier to track)
- **NO italics** — replaced with bold (italics are very hard for dyslexic readers)
- **NO ALL CAPS** — word shapes become unrecognizable in caps

#### Colors & Contrast
- **Background tint options** (user selects their preferred):
  - Cream/off-white (#FFF8E7) — most commonly preferred
  - Pale yellow (#FFFDE7)
  - Pale blue (#E3F2FD)
  - Pale green (#E8F5E9)
  - Pale pink (#FCE4EC)
  - Custom color picker
- **Never pure white (#FFFFFF) background** — too much contrast causes "washout" for many dyslexic readers
- **Never pure black (#000000) text** — use dark gray (#333333) instead
- **High contrast mode** option for those who need it (dark background, light text)
- **Colored overlay simulation** — entire screen tint (mimics physical colored overlays used in classrooms)

#### Reading Support
- **Text-to-speech auto-enabled** for ALL text — every question, every explanation, every button label
- **Word highlighting during TTS** — as Nuri reads aloud, each word highlights in sequence (karaoke-style) so the child can follow along
- **Reading ruler** — a movable semi-transparent bar that masks everything except the current line (reduces visual distraction). Child drags it down the screen.
- **Syllable breakdown** — long words can be tapped to show syllable splits: "com·pre·hen·sion"
- **"Read to me" button** on every single text element — tap any text and Nuri reads it aloud

#### Quiz & Assessment Adjustments
- **Extra time** — all timed quizzes get 2x time (or option to remove timer entirely)
- **One question at a time** — never show multiple questions on screen
- **Larger answer buttons** — easier to tap, more space between options
- **Audio questions** — Nuri reads every question aloud automatically (child doesn't have to read)
- **Voice answers** — speech-to-text always available as primary input (typing is hard for many dyslexic learners)
- **No spelling penalties** — in text input, accept phonetically reasonable misspellings as correct
  - Example: "becoz" for "because" → marked correct in a science quiz (we're testing science, not spelling)
  - Exception: Spelling-specific English quizzes do test spelling, but with extra support

#### Specific Dyslexia Support for Arabic
- **Extra large diacritics (تشكيل)** — vowel marks displayed at 1.5x normal size
- **Letter spacing increased further** for Arabic (connected script is especially hard)
- **Word-by-word Arabic TTS** — slower pace with pauses between words
- **Letter form helper** — tap any Arabic letter to see all 4 forms (initial, medial, final, isolated) with highlighting of which form is being used
- **Color-coded letter connections** — in Arabic words, each letter-connection highlighted in a different shade to show where letters begin and end

#### Visual & Layout
- **Minimal visual clutter** — reduced animations, no background patterns, clean layout
- **Consistent navigation** — buttons always in the same place, predictable layout
- **Icons alongside ALL text labels** (never text-only buttons)
- **Breadcrumbs** — always show where they are in the app (Home > Maths > Fractions > Quiz)

**Technical Implementation:**
```javascript
// In React, wrap entire app with accessibility context
const AccessibilityContext = createContext({
  dyslexiaMode: false,
  adhdMode: false,
  bgTint: '#FFF8E7',
  fontSize: 18,
  lineHeight: 2.0,
  letterSpacing: '0.05em',
  fontFamily: 'OpenDyslexic',
  autoTTS: true,
  timerMultiplier: 2,
  spellingLeniency: true,
});

// Apply globally via CSS variables
:root[data-dyslexia="true"] {
  --font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif;
  --font-size-base: 18px;
  --line-height: 2.0;
  --letter-spacing: 0.05em;
  --word-spacing: 0.1em;
  --bg-color: var(--user-selected-tint, #FFF8E7);
  --text-color: #333333;
  --max-line-width: 70ch;
}
```

---

### Feature 35: ADHD-Friendly Mode ⚡

A comprehensive mode designed around ADHD research — shorter bursts, less distraction, more dopamine, more movement.

**Activation:** Settings → Accessibility → ADHD-Friendly Mode → ON

**What Changes:**

#### Session Structure
- **Maximum session length: 10 minutes** — then mandatory break prompt
  - "You've been going for 10 minutes! Time for a 2-minute brain break! 🧠"
  - Break activities (child picks):
    - "Do 10 jumping jacks! 🏃" (movement helps ADHD focus)
    - "Look out the window and count 5 things you can see 👀"
    - "Take 5 deep breaths with me... in... out... 🌬️"
    - "Stretch your arms above your head and wiggle your fingers! ✋"
    - "Get a glass of water! Hydration helps your brain! 💧"
  - After break: "Ready to go again? Just 10 more minutes, you've got this!"
- **Micro-sessions available** — "I only have 5 minutes" option on home screen
  - 5 quick questions, no explanation mode, pure rapid quiz
  - Still earns XP (important for dopamine)
- **Session timer visible** — shows remaining time as a color bar (green→yellow→red)
  - BUT: can be hidden if the child finds it stressful (toggle in settings)

#### Focus & Distraction Management
- **One thing on screen at a time** — STRICT
  - One question displayed. No sidebar. No other subjects visible.
  - "Next" button only appears after they've answered
  - No scrolling — everything fits on one screen
- **Reduced visual elements:**
  - Nuri still present but smaller and less animated (less visual noise)
  - No floating stars, sparkles, or background particles
  - Solid background colors (no gradients)
  - No autoplay animations — animations only on direct interaction
- **Reduced audio distractions:**
  - No background music
  - Sound effects limited to: correct answer ding, wrong answer gentle buzz, level up chime
  - Option to disable ALL sounds except Nuri's voice
- **"Focus mode" overlay** — dims everything except the current question area
  - Like a spotlight effect — reduces peripheral distraction
- **No "skip" button visible by default** — reduces impulse to skip
  - Appears only after 30 seconds on a question
  - Prevents rapid skip-through without engaging

#### Reward & Dopamine Optimization
ADHD brains need MORE frequent, FASTER rewards:
- **XP earned after EVERY question** (not just at session end)
  - Visual: XP counter ticks up immediately with satisfying animation
  - Sound: quick "cha-ching" reward sound
- **Streak counter visible and prominent** — "🔥 3 in a row!"
  - Resets frequently (every 5, not every 20) — more frequent "wins"
- **Instant gratification moments:**
  - Correct answer → immediate green flash + Nuri thumbs up (0.5s delay, not 2s)
  - 3-streak → confetti burst (brief, 1 second)
  - 5-streak → "UNSTOPPABLE!" text flash
- **Progress bar per session** — "3 of 8 questions done!" (seeing progress prevents the "when will this end" feeling)
- **"Quick win" option** — if they haven't studied in a while: "Want a quick confidence boost? 3 easy questions, 30 seconds!" (Low barrier to re-engagement)

#### Task Switching & Variety
ADHD brains get bored with repetition:
- **Auto-switch subjects** option — after 5 questions in one subject, suggest switching
  - "Want to keep going with Maths, or switch to something else?"
- **Mixed Quiz Mode** — questions from random subjects (variety = engagement)
- **"Surprise Me" button** — Nuri picks a random activity: quiz, learn, mission, duel, story
- **Question type variety enforced** — never 3 of the same type in a row
  - Multiple choice → True/False → Fill-in-blank → Short answer (rotating)

#### Homework Helper Adjustments
- Break homework into even smaller sub-tasks
- After each sub-task (not each question): "Mini-celebration! One step done! ✅"
- More frequent check-ins: "Still with me? You're doing great!"
- Voice mode strongly encouraged (less executive function needed than typing)
- If stuck for 2+ minutes: proactive hint (don't wait for frustration to build)

#### Organization Support
ADHD often comes with executive function challenges:
- **Visual daily schedule** on home screen:
  ```
  Today's Plan:
  ☐ 5 min Maths review
  ☐ Daily Mystery Challenge
  ☐ 5 min Arabic vocabulary
  Done for today! 🎉
  ```
- **Simplified home screen** — max 4 large buttons, not a grid of 12 options
  - "Continue where you left off" (biggest button)
  - "Quick Quiz"
  - "Homework Helper"
  - "Something fun" (random activity)
- **Auto-save everything** — if they close the app mid-session, they can resume exactly where they left off (ADHD = frequent interruptions)
- **No punishment for incomplete sessions** — XP earned for whatever they completed
  - "You answered 4 questions today! Every bit counts! 🌟"

#### Transition Warnings
- **2-minute warning before session end** — "Almost done! 2 more questions!"
- **Clear transitions** between activities — "Okay, we're done with Maths! Next up: Arabic. Ready?"
- **Countdown for breaks** — "Break time! 2 minutes... 1:30... 1:00..."
- **"What's next" preview** — always show what comes after the current activity

**System Prompt Addition for ADHD Mode:**
```
ADHD-FRIENDLY MODE IS ACTIVE. CRITICAL ADJUSTMENTS:

1. Keep ALL responses SHORT. Maximum 2 sentences per response. Then wait.
2. ONE idea per message. Never combine multiple concepts.
3. Give immediate, specific praise after EVERY correct answer. Fast reward.
4. For explanations: even smaller chunks than normal. One sentence → check → one sentence → check.
5. Vary question types constantly. Never repeat the same format twice in a row.
6. If they seem to be rushing/not reading: "Hey, take a breath! Read this one carefully 😊"
7. If engagement drops (long pauses, random answers): "Want to switch subjects? Or take a quick break?"
8. Be extra energetic and upbeat. Match their pace. Quick, punchy, fun.
9. Use their name MORE frequently — helps recapture attention.
10. NEVER long explanations. If something needs a long explanation, break it into 4-5 separate short messages with check-ins between each.
```

---

### Combining Dyslexia + ADHD Modes

Many children have BOTH. If both modes are enabled:
- All dyslexia accommodations apply (font, spacing, colors, TTS)
- All ADHD accommodations apply (short sessions, frequent rewards, one thing at a time)
- Session length caps at 8 minutes (shorter than ADHD-only)
- Voice mode becomes the strong default (reduces reading AND executive function load)
- Maximum question complexity reduced (don't test reading ability in non-English/non-reading subjects)
- Extra patience built into AI responses
- Parent Highlights includes combined insights

---

### Feature 34/35 — Database Additions

```sql
-- Accessibility settings per profile
CREATE TABLE accessibility_settings (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) UNIQUE,
  dyslexia_mode BOOLEAN DEFAULT FALSE,
  adhd_mode BOOLEAN DEFAULT FALSE,
  -- Dyslexia settings
  font_choice TEXT DEFAULT 'OpenDyslexic', -- OpenDyslexic, LexieReadable, ComicSans, default
  bg_tint TEXT DEFAULT '#FFF8E7',
  font_size_multiplier FLOAT DEFAULT 1.3,
  line_height FLOAT DEFAULT 2.0,
  reading_ruler BOOLEAN DEFAULT FALSE,
  word_highlight_tts BOOLEAN DEFAULT TRUE,
  spelling_leniency BOOLEAN DEFAULT TRUE,
  timer_multiplier FLOAT DEFAULT 2.0,
  -- ADHD settings
  max_session_minutes INT DEFAULT 10,
  break_activity_pref TEXT DEFAULT 'movement', -- movement, visual, breathing, hydration
  focus_overlay BOOLEAN DEFAULT TRUE,
  reduced_animations BOOLEAN DEFAULT TRUE,
  auto_subject_switch BOOLEAN DEFAULT TRUE,
  simplified_home BOOLEAN DEFAULT TRUE,
  instant_xp_display BOOLEAN DEFAULT TRUE,
  -- General
  auto_tts_all_text BOOLEAN DEFAULT FALSE,
  voice_input_preferred BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mood tracking
CREATE TABLE mood_logs (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  mood TEXT, -- happy, okay, sad, frustrated, tired
  session_type TEXT,
  follow_up_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Error pattern tracking  
CREATE TABLE error_patterns (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  subject TEXT,
  topic TEXT,
  error_type TEXT, -- conceptual, procedural, calculation, reading, guessing
  error_subtype TEXT,
  pattern_count INT DEFAULT 1,
  intervention_triggered BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning journal
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  entry_text TEXT,
  subject TEXT,
  session_accuracy FLOAT,
  voice_entry BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly goals
CREATE TABLE weekly_goals (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  week_start DATE,
  goal_text TEXT,
  goal_type TEXT, -- suggested, custom
  target_value INT,
  current_value INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Real world missions
CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  mission_text TEXT,
  subject TEXT,
  submission_type TEXT, -- photo, voice, text
  submission_data TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  nuri_feedback TEXT,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Self-assessment calibration
CREATE TABLE self_assessments (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id),
  quiz_id INT,
  predicted TEXT, -- aced, pretty_good, not_sure, struggled
  actual_score FLOAT,
  calibration_gap FLOAT, -- positive = overconfident, negative = underconfident
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Updated Build Phase Integration

These 15 features slot into the existing 10-week plan:

**Phase 1 (Week 1-2) — ADD:**
- Mood Check-In (Feature 28) — simple to build, immediately impactful
- Growth Mindset Language (Feature 29) — built into ALL system prompts from day one
- Dyslexia Mode basics (Feature 34) — font, spacing, colors, auto-TTS
- ADHD Mode basics (Feature 35) — session timer, one-question-at-a-time, break prompts

**Phase 2 (Week 3-4) — ADD:**
- Error Pattern Detection (Feature 21)
- Thinking Out Loud Protocol (Feature 22)
- Misconception Library (Feature 23) — start with 50 misconceptions, grow over time
- Micro-Celebrations for Effort (Feature 30)
- Self-Assessment Before Results (Feature 32)

**Phase 3 (Week 5-6) — ADD:**
- Weekly Goal Setting (Feature 31)
- Learning Journal (Feature 33)

**Phase 4 (Week 7-8) — ADD:**
- Real World Missions (Feature 24)
- Parent Co-Learning Moments (Feature 25)
- Memory Palace Technique (Feature 26)
- Sleep & Timing Optimization (Feature 27)
- Full Dyslexia Mode (reading ruler, syllable breakdown, Arabic support)
- Full ADHD Mode (focus overlay, dopamine optimization, organization support)

---

*Features 21-35 complete.*
*Total feature count: 35 features + Homework Helper + Snap & Learn + Placement Test*
*7 spec documents: core, snap-and-learn, homework-helper, features-part1, features-part2, features-part3, placement*
*+ nuri-character-prompts.md*
*This is a full EdTech product specification.*
