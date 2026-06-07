# StudyBuddy — Socratic Teaching Engine
## The AI System That Makes Nuri Actually TEACH, Not Just Test

*Extends studybuddy-spec.md Section 5.1 (Learn Mode) and studybuddy-features-part3.md Feature 21 (Error Pattern Detection)*

**Version:** 1.0
**Last Updated:** 31 March 2026
**Priority:** P0 — This is Nuri's core competitive advantage

---

## Why This Exists

IXL has 17,000+ skills and a battle-tested adaptive algorithm. But it has a fatal flaw: **it cannot teach.** IXL is a practice platform — when a child gets something wrong, they see a static, one-size-fits-all explanation box. The same explanation. Every time. For every child. Regardless of WHY they got it wrong.

This is Nuri's single biggest opportunity.

The Socratic Teaching Engine is the AI system that makes Nuri a **tutor**, not a quiz machine. When a child struggles, Nuri does what a great human tutor does: figures out exactly where the misunderstanding is, chooses the right approach for this specific child, and walks them through it conversationally — adapting in real time based on their responses.

**The core principle:** Every wrong answer is a teaching opportunity, not a failure.

---

## 1. Core Philosophy

### 1.1 Conversation, Not Lectures

Nuri teaches through dialogue. There are no "explanation boxes" or "solution panels." When a child gets something wrong, Nuri starts a conversation. The child is an active participant, not a passive reader.

**IXL's approach:**
```
❌ Wrong!
The answer is 7/12.
To add fractions with different denominators, find the LCD.
1/3 = 4/12 and 1/4 = 3/12.
4/12 + 3/12 = 7/12.
[Next question →]
```

**Nuri's approach:**
```
Nuri: "Hmm, you said 2/7. I think I see what happened — let me ask you
something. If I eat 1/2 a pizza and then 1/2 another pizza, did I eat
2/4 of a pizza? Or a whole pizza?"

Child: "A whole pizza!"

Nuri: "Exactly! So if we just added the tops and bottoms, 1/2 + 1/2
would be 2/4 — which is actually just 1/2. That doesn't make sense,
right? The slices need to be the SAME SIZE before we can count them
together. Let's figure out how to make them the same size..."
```

### 1.2 Detect WHY, Not Just WHAT

Two children can both answer "2/7" to the question "What is 1/3 + 1/4?" — but for completely different reasons. One doesn't understand fractions at all. The other understands common denominators but made a multiplication slip. These two children need completely different responses.

The Socratic Engine classifies every wrong answer into an error type BEFORE responding.

### 1.3 Never Repeat the Same Explanation

If a child didn't understand approach A, repeating approach A louder doesn't help. Nuri always has a second (and third, and fourth) way to explain every concept. If the pizza analogy didn't land, try the number line. If the number line didn't land, try a step-by-step procedure. If the procedure didn't land, try a story.

### 1.4 Teach to the Edge of Understanding

Nuri finds exactly what the child DOES understand and builds from there. If they understand that fractions represent parts of a whole but don't understand common denominators, Nuri doesn't re-teach what fractions are — it starts at common denominators.

---

## 2. Error-Responsive Teaching

*Extends Feature 21 (Error Pattern Detection) from passive detection to active response*

Feature 21 classifies errors and detects patterns. The Socratic Engine takes the next step: once the error type is classified, it triggers a specific teaching strategy tailored to that error type. The response is fundamentally different for each category.

### 2.1 Error Classification System

When a child answers incorrectly, the AI classifies the error into one of five categories before generating a response:

| Error Type | Signal | Teaching Strategy |
|-----------|--------|-------------------|
| Conceptual | Answer reveals fundamental misunderstanding of the concept | Re-teach from scratch using a different approach |
| Procedural | Method partially correct but steps applied wrong | Guide through the procedure step by step |
| Calculation | Method and understanding correct, arithmetic slip | Quick correction, no re-teaching needed |
| Reading/Comprehension | Answer doesn't match the question asked | Re-read together, rephrase, highlight key words |
| Guessing | Random/instant/no-effort answer | Lower difficulty, rebuild confidence |

### 2.2 Conceptual Error — Full Re-Teach

**When this fires:** The child's answer reveals they don't understand the underlying concept. They aren't making a mistake in the method — they don't have the right method at all.

**Detection signals:**
- Answer follows a consistently wrong pattern (e.g., adding denominators)
- Answer is the result of applying a completely wrong operation
- Child's "Thinking Out Loud" explanation reveals incorrect mental model
- Error is structurally wrong, not just numerically wrong

**Teaching strategy:**
1. Do NOT say "that's wrong" or immediately correct
2. Go back to the concrete/real-world level
3. Use an analogy or physical scenario the child can visualize
4. Build the concept from scratch using a DIFFERENT approach than whatever they were originally taught
5. Check understanding with a SIMPLER version of the concept
6. Only return to the original question after the concept is solid

**Example dialogue — Maths (Adding fractions with unlike denominators):**

> **Question:** What is 1/3 + 1/4?
> **Child's answer:** 2/7
> **Error classification:** Conceptual — child added both numerators AND both denominators, revealing they don't understand that denominators represent slice size

```
Nuri: "I like that you tried! Let me ask you something fun. Imagine
you have a pizza cut into 3 big slices. You take 1 slice. Your friend
has a pizza cut into 4 smaller slices. She takes 1 slice. Now — are
your slices the same size?"

Child: "No"

Nuri: "Right! Your slice is bigger because the pizza was only cut into
3 pieces. So we can't just say '1 slice + 1 slice = 2 slices' — because
the slices are DIFFERENT SIZES. We need to cut both pizzas into the
same number of pieces first. What if we cut both into 12 pieces? Then
your 1/3 becomes... how many twelfths? 🤔"

Child: "4?"

Nuri: "Yes! 1/3 = 4/12. And 1/4 of 12 would be...?"

Child: "3!"

Nuri: "Brilliant! So now we have 4/12 + 3/12. The slices are the same
size! What's 4 + 3?"

Child: "7"

Nuri: "So 1/3 + 1/4 = 7/12! See — when the slices are the same size,
we just count them up. Let's try another one to make sure this clicks.
What's 1/2 + 1/4?"
```

**Example dialogue — Science (States of matter):**

> **Question:** What happens to water when it boils?
> **Child's answer:** "It disappears"
> **Error classification:** Conceptual — child doesn't understand that water transforms into steam (gas), thinks it ceases to exist

```
Nuri: "Interesting answer! Let me ask you this — have you ever seen
the bathroom mirror get all foggy after a hot shower?"

Child: "Yeah"

Nuri: "Where does that fog come from? It's actually the water! When
water gets really hot, it turns into an invisible gas called steam.
And when steam touches the cold mirror, it turns back into tiny water
droplets — that's the fog! So the water didn't disappear — it changed
into something we can't see. What state of matter do you think steam is?"

Child: "Gas?"

Nuri: "Exactly right! Water doesn't disappear when it boils — it
becomes a gas. It's still there, just in a different form. So what
happens to water when it boils?"

Child: "It turns into a gas?"

Nuri: "Perfect! It turns into water vapor — a gas. Let's check: if I
put a lid on the pot, what would I see on the lid after a while?"
```

**Example dialogue — English (Apostrophes):**

> **Question:** Which is correct: "The dog's are playing" or "The dogs are playing"?
> **Child's answer:** "The dog's are playing"
> **Error classification:** Conceptual — child thinks apostrophe-s means plural, not possession

```
Nuri: "Okay! Let me show you something. An apostrophe with an 's'
means something BELONGS to someone. Like: 'The dog's bone' means
the bone belongs to the dog. But when we just want to say there are
MANY dogs, we just add an 's' — no apostrophe needed. So which one
means 'more than one dog is playing'?"

Child: "The dogs are playing?"

Nuri: "Yes! 'The dogs are playing' = many dogs playing. 'The dog's
toy' = a toy that belongs to the dog. Try this one: 'The cat__ are
sleeping.' Do we need an apostrophe?"

Child: "No — just 'cats'!"

Nuri: "You've got it! 🌟"
```

**Example dialogue — Arabic (Sun and moon letters):**

> **Question:** How do you say "the sun" in Arabic?
> **Child's answer:** "ال شمس — al-shams"
> **Error classification:** Conceptual — child pronounces the ل (lam) in ال before a sun letter, not understanding assimilation

```
Nuri: "Almost! You wrote it perfectly — الشمس — but listen carefully
to how it sounds. Try saying 'al-shams' fast. Does it feel natural?"

Child: "Not really"

Nuri: "That's because the 'l' sound disappears! With some letters in
Arabic — called sun letters — the 'l' blends into the next letter.
So الشمس is said 'ash-shams', not 'al-shams'. It's like how in
English we say 'gonna' instead of 'going to' — the sounds blend
together! The ش is a sun letter, so the ل takes on its sound. Can
you try saying 'ash-shams'?"

Child: "Ash-shams!"

Nuri: "Lovely! Now try this: how would you say النور — 'the light'?
Is the ن a sun letter? Does the 'l' disappear?"
```

### 2.3 Procedural Error — Step-by-Step Guidance

**When this fires:** The child understands the concept but applied the method incorrectly. They know WHAT to do but stumbled on HOW to do it.

**Detection signals:**
- Answer shows the right approach with a wrong step
- Intermediate work is partially correct
- Error is in execution, not understanding
- Child's explanation shows correct mental model but incorrect application

**Teaching strategy:**
1. Affirm that they have the right idea — "You're on the right track!"
2. Do NOT re-teach the concept — that would be patronizing and waste time
3. Walk through the steps one at a time, asking them to do each step
4. When you reach the step where they went wrong, pause and ask them to look carefully
5. Let them self-correct if possible

**Example dialogue — Maths (Fraction conversion):**

> **Question:** What is 1/3 + 1/4?
> **Child's answer:** 5/12
> **Error classification:** Procedural — child found LCD=12 correctly but converted 1/4 to 4/12 instead of 3/12

```
Nuri: "You had the right idea — common denominators! Let's walk through
it together. You said the common denominator is 12 — that's correct! ✅
Now, to change 1/3 to twelfths: we multiplied the bottom by what?"

Child: "4"

Nuri: "Right, 3 × 4 = 12. And we multiply the top by the same number.
1 × 4 = 4. So 1/3 = 4/12. ✅ Now for 1/4 — to make the bottom 12,
we multiply 4 by...?"

Child: "3!"

Nuri: "Yes! And the top? 1 × 3 = ?"

Child: "3! Oh — it should be 3/12, not 4/12!"

Nuri: "You got it! So 4/12 + 3/12 = ?"

Child: "7/12!"

Nuri: "Perfect. You totally understand the method — just needed to
slow down on that one step. Try this one: 1/2 + 1/5 = ?"
```

### 2.4 Calculation Error — Quick Fix

**When this fires:** The child's method is perfect but they made an arithmetic slip — adding wrong, multiplying wrong, or similar.

**Detection signals:**
- All conceptual steps are correct
- Only the final arithmetic is wrong
- Error is a simple miscalculation (4+3=8, 6×7=43, etc.)
- If voice mode: possible mis-speak

**Teaching strategy:**
1. Explicitly praise the method — make it clear they understand the concept
2. Point directly to the arithmetic error
3. Ask them to redo just the calculation
4. If calculation errors happen repeatedly (3+ times in a session), trigger a quick arithmetic warm-up
5. Never re-teach the concept — that wastes time and undermines confidence

**Example dialogue:**

> **Question:** What is 1/3 + 1/4?
> **Child's answer:** 8/12
> **Error classification:** Calculation — method is perfect (4/12 + 3/12) but 4+3 ≠ 8

```
Nuri: "Your method is spot on — 4/12 + 3/12, that's exactly right!
But check your adding at the end. What's 4 + 3? 🤔"

Child: "7!"

Nuri: "So the answer is...?"

Child: "7/12!"

Nuri: "Nailed it! Your fraction skills are solid — just watch those
little additions. 💪"
```

**Repeated calculation errors trigger (3+ in one session):**

```
Nuri: "Hey, I've noticed your methods are always right but the adding
and subtracting keeps tripping you up. Want to do a quick 60-second
number warm-up before we continue? It's like stretching before sports! 🏃"

[Quick fire: 5 rapid arithmetic questions at their level]
```

### 2.5 Reading/Comprehension Error — Re-Read Together

**When this fires:** The child answered a different question than the one asked, or misunderstood key terms in the question.

**Detection signals:**
- Answer would be correct for a different question
- Answer doesn't relate to what was asked
- Child seems confused about what the question wants
- Key terminology may have been misunderstood

**Teaching strategy:**
1. Don't comment on the answer being wrong
2. Re-read the question together
3. Highlight or rephrase the key words
4. Ask "What is the question asking us to find?"
5. Let them re-attempt with the correct understanding

**Example dialogue — Maths (Word problem):**

> **Question:** "Sarah has 24 sweets. She gives 1/3 to Tom. How many does Sarah have LEFT?"
> **Child's answer:** 8
> **Error classification:** Reading — child calculated 1/3 OF 24 (=8) but the question asks how many are LEFT

```
Nuri: "Let's read the question again together. 'How many does Sarah
have LEFT?' — that word 'left' is the key. You figured out that 1/3
of 24 is 8 — and that's right! But that's how many she GAVE AWAY.
The question asks how many she still HAS. If she started with 24
and gave away 8, how many does she have left?"

Child: "16!"

Nuri: "Exactly! You knew the maths — you just needed to read that
last part more carefully. I always look for key words like 'left',
'remaining', 'how many more'. They tell you what the question really
wants. 🔍"
```

**Example dialogue — Science:**

> **Question:** "Name one property of a solid."
> **Child's answer:** "A table"
> **Error classification:** Reading — child gave an EXAMPLE of a solid, not a PROPERTY of a solid

```
Nuri: "A table IS a solid — good thinking! But the question asks for
a PROPERTY — that means a description of what makes solids special.
Like, what can you tell me ABOUT solids? What makes them different
from liquids?"

Child: "They're hard?"

Nuri: "That's one! We could also say 'they hold their shape' or
'they don't flow.' Nice work — you knew about solids, you just
needed to spot that word 'property.' 👍"
```

### 2.6 Guessing — Rebuild Confidence

**When this fires:** The child submitted an answer that shows no attempt at reasoning — random number, instant submission, or clearly no effort.

**Detection signals:**
- Answer submitted in under 3 seconds (for non-trivial questions)
- Answer is wildly out of range (e.g., "150" for a single-digit addition)
- Multiple rapid wrong answers in succession
- Answer doesn't match any plausible reasoning path
- Child says "I don't know" repeatedly

**Teaching strategy:**
1. Don't criticize — guessing usually means the child is frustrated or overwhelmed
2. Lower the difficulty immediately
3. Give them a win — ask something they CAN answer
4. Build back up step by step
5. If persistent guessing (3+ in a row): suggest a break or switch to Learn Mode

**Example dialogue:**

> **Question:** What is 1/3 + 1/4?
> **Child's answer:** "5" (submitted in 2 seconds)
> **Error classification:** Guessing — answer submitted instantly, doesn't represent any fraction

```
Nuri: "That's okay! This one's tricky. Let's start simpler and build
up. If you have 1/2 a pizza and 1/2 another pizza, how many pizzas
do you have altogether?"

Child: "1?"

Nuri: "Yes! 1/2 + 1/2 = 1 whole. See, you DO know about fractions!
Now what about 1/4 + 1/4?"

Child: "2/4?"

Nuri: "Exactly! When the bottom number is the same, you just add the
tops. Now let me show you what to do when the bottom numbers are
DIFFERENT..."
```

**Persistent guessing (3+ guesses in one session):**

```
Nuri: "Hey {name}, it seems like this topic is feeling really hard
right now. That's totally normal — everyone has those days. Want to:
  🔄 Switch to an easier topic to build up?
  📖 Go into Learn Mode so I can teach this from the start?
  ☕ Take a 5-minute break and come back fresh?
No wrong choice here!"
```

---

## 3. Multi-Approach Explanations

For every concept in the curriculum, the Socratic Engine has multiple explanation approaches. If approach 1 doesn't work, it switches to approach 2 — never repeating the same explanation.

### 3.1 Explanation Approach Types

| Approach | Description | Best For |
|----------|-------------|----------|
| Visual/Spatial | "Imagine a number line..." / "Picture a pizza cut into..." | Visual learners, concrete thinkers, younger children |
| Real-World Analogy | "It's like sharing sweets among friends..." | Making abstract concepts tangible |
| Step-by-Step Procedure | "First we... then we... finally..." | Procedural learners, children who want clear rules |
| Story-Based | "A farmer has 24 sheep and wants to put them in 4 equal fields..." | Engagement, making word problems relatable |
| Pattern-Based | "Look: 2×1=2, 2×2=4, 2×3=6... what do you notice?" | Mathematical thinking, older children |
| Contrast/Compare | "Solids are like ice cubes — liquids are like water — gases are like steam" | Distinguishing similar concepts |

### 3.2 Approach Selection Logic

```
When explaining a concept:

1. Check Learning Style Profile (from Feature 28):
   - If visual learner → start with Visual/Spatial
   - If verbal learner → start with Story-Based
   - If logical learner → start with Step-by-Step Procedure
   - If no profile data → start with Visual/Spatial (default for ages 5-11)

2. After first explanation → check understanding

3. If child didn't understand:
   - Pick a DIFFERENT approach type (never repeat)
   - Use simpler language
   - Track which approach was attempted (for future reference)

4. If child still didn't understand after approach 2:
   - Try approach 3 (step-by-step procedure if not tried yet)
   - Use even simpler language, shorter sentences
   - Consider breaking the concept into smaller pieces

5. After 3 failed approaches:
   - Gently provide the answer with the clearest explanation
   - Flag the concept for review in the next session
   - Move on — do not frustrate the child

6. Log which approach finally worked → update Learning Style Profile
```

### 3.3 Example: Multiplication as Repeated Addition (Year 2)

**Visual/Spatial approach:**
```
Nuri: "Imagine you have 3 bags, and each bag has 4 marbles inside.
Can you picture that? How many marbles altogether?"
[Shows simple illustration of 3 groups of 4]
```

**Real-World Analogy approach:**
```
Nuri: "You're having friends over for a party! 3 friends are coming,
and each one wants 4 biscuits. How many biscuits do you need to make?"
```

**Step-by-Step Procedure approach:**
```
Nuri: "3 × 4 means '3 groups of 4.' So we add: 4 + 4 + 4.
First: 4 + 4 = 8. Then: 8 + 4 = 12. So 3 × 4 = 12!"
```

**Story-Based approach:**
```
Nuri: "A spider has 4 legs on each side. Wait — actually, spiders
have 8 legs! But imagine a creature with 4 legs. If 3 of them
walked into a room, how many legs would be in the room?"
```

**Pattern-Based approach:**
```
Nuri: "Let's count in 4s: 4... 8... 12! That was three jumps.
So 3 × 4 = 12. Multiplication is just skip counting!"
```

### 3.4 Approach Tracking Data

```json
{
  "child_id": "child_abc",
  "concept": "fraction_addition_unlike_denominators",
  "approaches_tried": [
    {
      "approach_type": "visual_spatial",
      "description": "pizza_slices_analogy",
      "understood": false,
      "timestamp": "2026-03-31T14:22:00Z"
    },
    {
      "approach_type": "step_by_step",
      "description": "find_lcd_procedure",
      "understood": true,
      "timestamp": "2026-03-31T14:24:30Z"
    }
  ],
  "successful_approach": "step_by_step",
  "total_attempts": 2
}
```

---

## 4. Scaffolded Hint System

When a child is stuck on a question, IXL shows the answer. Nuri never shows the answer first — it scaffolds the child toward discovering the answer themselves, only revealing it as a last resort.

### 4.1 Four-Level Hint Progression

**Level 1 — Gentle Nudge (no information given)**

A general prompt to activate the child's memory. No specific clues.

```
Nuri: "Think about what we learned about common denominators... 🤔"
```

```
Nuri: "Remember how we talked about equivalent fractions earlier?"
```

```
Nuri: "This is similar to what we practiced yesterday. What was the
first step?"
```

**Level 2 — Specific Clue (points toward the method)**

Narrows the field without giving the answer. Names the relevant concept or rule.

```
Nuri: "To add fractions, the bottom numbers need to be the same first.
What number could both 3 and 4 divide into?"
```

```
Nuri: "Remember, an apostrophe means something BELONGS to someone.
Does anything belong to anyone in this sentence?"
```

```
Nuri: "The question is asking about properties of a material.
Properties are words that DESCRIBE something — like hard, soft,
shiny, rough..."
```

**Level 3 — Walk Through First Step (starts the problem with them)**

Does the first step, then hands it back to the child.

```
Nuri: "Let me help you start. 1/3 — to make the bottom number 12,
we multiply 3 by 4. So the bottom becomes 12. Now, what do we
multiply the top by?"
```

```
Nuri: "Let's break this sentence apart. The subject is 'the cat.'
What is the cat DOING? That's your verb."
```

```
Nuri: "I'll set up the first part. We know forces can be pushes
or pulls. When you kick a ball, is that a push or a pull?"
```

**Level 4 — Answer with Full Explanation (last resort)**

If the child hasn't gotten it after three hints, provide the answer — but ALWAYS with a clear explanation AND a follow-up question to verify they understood.

```
Nuri: "Okay! The answer is 7/12. Here's how:
We need 3 and 4 to have the same bottom number.
3 × 4 = 12 and 4 × 3 = 12, so we use 12.
1/3 = 4/12 (multiply top and bottom by 4)
1/4 = 3/12 (multiply top and bottom by 3)
4/12 + 3/12 = 7/12!

Now try this similar one yourself: What's 1/2 + 1/3?"
```

The follow-up question at Level 4 is critical. It is always a similar problem — slightly different numbers, same concept. This verifies the child actually understood the explanation rather than just reading the answer.

### 4.2 Hint Timing Logic

```
Child submits wrong answer → Error classification + appropriate response
  → If wrong again → Level 1 hint
  → If wrong again → Level 2 hint
  → If wrong again → Level 3 hint
  → If wrong again → Level 4 hint (answer + explanation + follow-up)
  → Follow-up question (if correct → move on, if wrong → flag for review)

Child clicks "I'm stuck" / "Help" button → Jump to Level 2 hint
Child clicks "I'm stuck" twice → Jump to Level 3 hint
Child is silent for 30+ seconds → Offer Level 1 hint proactively
```

### 4.3 Hint Level Tracking

Every hint interaction is logged for learning profile data:

| Metric | What It Tells Us |
|--------|-----------------|
| Average hint level needed per topic | How well the child understands the topic |
| Hint level trend over time | Whether they're improving (needing fewer hints) |
| Topics where Level 4 was needed | Candidates for re-teaching in Learn Mode |
| Frequency of "I'm stuck" clicks | Confidence indicator |
| Time between question and first attempt | Engagement/effort indicator |

---

## 5. Teach-Check-Adapt Loop

*Enhances Section 5.1 of studybuddy-spec.md with a detailed algorithmic specification*

The core loop from Section 5.1 (Hook → Explain → Check → Respond → Recap) is preserved. The Socratic Engine adds precise branching logic, error-responsive teaching, and adaptive pacing.

### 5.1 The Complete Algorithm

```
TEACH-CHECK-ADAPT LOOP (for any topic)

PHASE 1: HOOK
├── Open with a fun question or real-life scenario
├── Connect to something the child already knows or experiences
├── Goal: curiosity and engagement, NOT teaching yet
└── Example: "Have you ever wondered why the sky is blue
    but sunsets are orange? 🤔"

PHASE 2: TEACH ONE MICRO-CONCEPT
├── Maximum 2-3 sentences
├── One idea only — never bundle concepts
├── Use age-appropriate language
├── Relate to the child's world
└── Example: "Light from the sun is actually made up of ALL
    the colors mixed together — like a rainbow hiding inside
    a beam of light!"

PHASE 3: CHECK UNDERSTANDING
├── Ask ONE check-in question about what was just taught
├── Question types (vary these):
│   ├── Fill in the blank: "So sunlight is made of all the ___"
│   ├── True or false: "True or false: sunlight is only yellow"
│   ├── Prediction: "What do you think happens when light hits air?"
│   └── In their own words: "Can you tell me what I just said,
│       but in YOUR words?"
└── Wait for child's response

PHASE 4: RESPOND AND ADAPT
├── IF CORRECT:
│   ├── Praise effort/understanding (growth mindset language)
│   ├── Track: correct_streak++
│   ├── IF correct_streak >= 3:
│   │   ├── Speed up — combine next 2 micro-concepts into 1
│   │   ├── Ask harder follow-ups
│   │   └── Say: "You're flying through this! Let's kick it
│   │       up a notch 🚀"
│   └── Advance to next micro-concept → PHASE 2
│
├── IF WRONG (first attempt):
│   ├── Classify error type (Section 2)
│   ├── Respond with error-appropriate teaching (Section 2.2-2.6)
│   ├── Ask the SAME concept differently (new wording, new angle)
│   └── Track: wrong_count = 1 for this concept
│
├── IF WRONG (second attempt, same concept):
│   ├── Try a completely different explanation approach (Section 3)
│   ├── Simplify language further
│   ├── Break the micro-concept into even smaller pieces
│   ├── Consider using a different modality:
│   │   ├── If text → suggest drawing
│   │   ├── If abstract → go concrete
│   │   └── If procedure → go visual
│   └── Track: wrong_count = 2 for this concept
│
├── IF WRONG (third attempt, same concept):
│   ├── Gently provide the answer
│   ├── Explain clearly with the simplest possible language
│   ├── Do NOT make them feel bad — normalize difficulty
│   ├── Say: "This is a really tricky one. Even I had to think
│   │   hard about it! Here's how it works..."
│   ├── Flag concept for review (added to spaced repetition queue)
│   ├── Move on to next concept — do NOT keep drilling
│   └── Track: wrong_count = 3, flagged_for_review = true

PHASE 5: MINI-RECAP (every 3-4 concepts)
├── Pause teaching and do a quick review
├── "Let's check what we've covered so far!"
├── Ask 2-3 rapid questions covering the last 3-4 concepts
├── IF all correct → "Brilliant! You really get this. Let's keep going!"
├── IF 1 wrong → briefly re-explain just that concept, then continue
└── IF 2+ wrong → slow down, re-teach the weakest concept, adjust pace

PHASE 6: MASTERY CHECK (end of topic)
├── "Okay, let's see if you've got this topic down! Three quick questions."
├── 3 questions covering the full topic, mixed difficulty
├── IF 3/3 correct → "You MASTERED this! 🌟" + mastery badge
├── IF 2/3 correct → "Almost there! Let's review [wrong one] quickly"
│   └── Brief re-teach → 1 more check question
├── IF 1/3 or 0/3 correct → "This topic needs more practice.
│   That's okay — we'll come back to it!"
│   └── Flag entire topic for review
│   └── Suggest related Learn Mode session
└── Log mastery score for this topic
```

### 5.2 Pacing Rules

| Signal | Adaptation |
|--------|-----------|
| 3+ correct in a row | Speed up: combine micro-concepts, harder questions |
| 2+ wrong on same concept | Slow down: simpler language, more analogies, smaller steps |
| Child asks "can you explain that again?" | Re-explain with a different approach, same difficulty |
| Child clicks "Explain Simpler" | Re-explain with simpler language and more concrete examples |
| Child answers correctly but slowly (15+ seconds) | Maintain current pace — they're thinking, which is good |
| Child answers wrong but their reasoning is partially correct | Acknowledge what they got right before correcting |
| Session exceeds 15 minutes on one topic | Suggest a break: "Great focus! Want to take a quick break?" |

### 5.3 Topic Completion Logging

```json
{
  "child_id": "child_abc",
  "topic": "adding_fractions_unlike_denominators",
  "session_id": "sess_456",
  "started_at": "2026-03-31T14:00:00Z",
  "completed_at": "2026-03-31T14:18:00Z",
  "micro_concepts_taught": 5,
  "check_questions_asked": 8,
  "correct_first_try": 3,
  "needed_re_explanation": 2,
  "needed_hint": 2,
  "needed_answer_given": 1,
  "approaches_used": ["visual_spatial", "step_by_step", "real_world"],
  "mastery_check_score": "2/3",
  "mastery_status": "partial",
  "flagged_for_review": true,
  "error_types_encountered": {
    "conceptual": 2,
    "procedural": 1,
    "calculation": 1
  },
  "pace_adjustments": [
    {"at_concept": 3, "action": "slowed_down", "reason": "2_wrong_same_concept"},
    {"at_concept": 5, "action": "sped_up", "reason": "3_correct_streak"}
  ]
}
```

---

## 6. Subject-Specific Teaching Strategies

The Socratic Engine adapts its teaching approach based on the subject. Each subject has a pedagogical framework that shapes how Nuri explains, questions, and scaffolds.

### 6.1 Maths — Concrete → Pictorial → Abstract (CPA)

Following the proven Singapore Maths / Mastery approach, Nuri teaches maths concepts in three stages:

**Stage 1 — Concrete (real objects and scenarios):**
```
Nuri: "You have 12 sweets and want to share them equally between
3 friends. Can you imagine dividing them up? How many does each
friend get?"
```

**Stage 2 — Pictorial (visual representations):**
```
Nuri: "Let's draw it. 12 sweets → 3 groups.
🍬🍬🍬🍬 | 🍬🍬🍬🍬 | 🍬🍬🍬🍬
Each group has 4!"
```

**Stage 3 — Abstract (numbers and symbols):**
```
Nuri: "So 12 ÷ 3 = 4. Division means splitting into equal groups."
```

**Nuri starts at Concrete for younger years (1-3) and new concepts, and at Pictorial or Abstract for older years (4-6) and review topics.** If a child struggles at the Abstract level, Nuri drops back to Pictorial. If they struggle at Pictorial, Nuri drops back to Concrete.

**Key Maths teaching rules:**
- Never say "just memorize it" — always explain WHY
- Times tables: use patterns, grouping, and skip counting before memorization
- Word problems: always ask "what is the question asking?" before solving
- Fractions: always ground in visual models before procedures
- When a child asks "why do we carry the 1?" — actually explain place value

### 6.2 Science — Hypothesis → Experiment → Observation

Nuri teaches science by encouraging the child to think like a scientist:

**Step 1 — Observe/Wonder:**
```
Nuri: "Have you ever noticed that puddles disappear after it stops
raining? Where does the water go? What do YOU think happens?"
```

**Step 2 — Hypothesize:**
```
Nuri: "Interesting guess! So your hypothesis is that the water soaks
into the ground. Let's think about this — what about puddles on
concrete? Concrete is pretty solid..."
```

**Step 3 — Investigate:**
```
Nuri: "Here's a clue: on a hot day, puddles disappear faster. On a
cold day, they stay longer. What does temperature have to do with it?"
```

**Step 4 — Conclude:**
```
Nuri: "The water actually goes into the AIR! It turns into an invisible
gas called water vapor. That's called evaporation. Heat makes it happen
faster. So you were partly right — some water does soak in, but a lot
of it evaporates!"
```

**Step 5 — Extend:**
```
Nuri: "So what do you think would happen if you left a cup of water
on a sunny windowsill for a week? Let's predict..."
```

**Key Science teaching rules:**
- Always ask what they think BEFORE explaining — activate prior knowledge
- Encourage predictions even if wrong — "wrong predictions are how real scientists learn"
- Use "have you noticed..." to connect to everyday observations
- Experiments they can try at home get suggested via Real World Missions (Feature 24)
- Never present science as "facts to memorize" — present it as "things we discovered"

### 6.3 English — Model → Guide → Independent

Nuri teaches English language skills using the "I do, we do, you do" framework:

**Step 1 — Model (I do):**
```
Nuri: "Watch how I write a sentence with a fronted adverbial:
'Carefully, the cat crept across the garden.' See how 'Carefully'
comes BEFORE the main sentence? And there's a comma after it!"
```

**Step 2 — Guide (We do):**
```
Nuri: "Now let's try one together. I'll give you the main sentence:
'the dog ran across the park.' Can you add a fronted adverbial?
It could describe HOW or WHEN. Like 'Quickly,...' or 'Early in
the morning,...'"
```

**Step 3 — Independent (You do):**
```
Nuri: "Now write your OWN full sentence with a fronted adverbial.
You pick the subject, the action, and the adverbial. Go!"
```

**Key English teaching rules:**
- Reading comprehension: always ask the child to find evidence IN the text
- Spelling: teach patterns and rules, not just memorization (e.g., "i before e...")
- Grammar: teach through examples and sentence manipulation, not definitions
- Writing: praise creativity and ideas FIRST, then address technical accuracy
- Vocabulary: always give a word in context, never as a standalone definition

### 6.4 Arabic — Pattern → Practice → Production

Given that most children's Arabic is weak (noted in spec Section 4.6), Nuri uses a scaffolded approach:

**Step 1 — Pattern Recognition:**
```
Nuri: "Look at these words: كَتَبَ (kataba — he wrote), كَاتِب
(kaatib — writer), كِتَاب (kitaab — book), مَكْتَبَة (maktaba —
library). Do you notice something? They ALL have the letters
ك-ت-ب! In Arabic, three root letters carry the core meaning —
in this case, anything related to writing!"
```

**Step 2 — Guided Practice:**
```
Nuri: "Now, the root ع-ل-م means 'knowledge.' عَلِمَ (alima) means
'he knew.' Can you guess what مُعَلِّم (mu'allim) might mean? Hint:
it's someone who gives knowledge..."
```

**Step 3 — Production:**
```
Nuri: "Can you use the word مُعَلِّم in a short sentence? Remember,
Arabic sentences can start with the verb. Try: المُعَلِّم + a verb
+ something."
```

**Key Arabic teaching rules:**
- ALL explanations in English (as per spec Section 4.6)
- Always show: Arabic script → transliteration → English meaning
- Praise any attempt at Arabic — building confidence matters more than accuracy
- For reading: start with fully voweled (مُشَكَّل) text, gradually remove vowel marks
- For speaking: accept approximate pronunciation with gentle correction
- Connect to words they already know (e.g., names, greetings, religious terms)

### 6.5 History — Story → Cause/Effect → Critical Thinking

Nuri teaches history as stories with consequences, not dates to memorize:

**Step 1 — Story (engagement hook):**
```
Nuri: "Imagine it's 1666 and you're a baker on Pudding Lane in London.
It's late at night. You go to bed and forget to put out the fire in
your oven. You wake up to flames everywhere... This is exactly what
happened to Thomas Farriner. And it started the GREAT FIRE OF LONDON."
```

**Step 2 — Cause and Effect:**
```
Nuri: "So the fire started in a bakery. But WHY did it spread so
quickly? The houses were all made of... what do you think?"

Child: "Wood?"

Nuri: "Exactly! And they were built really close together. If YOUR
house was made of wood and your neighbor's house caught fire,
what would happen?"
```

**Step 3 — Critical Thinking:**
```
Nuri: "After the fire, they rebuilt London with stone buildings and
wider streets. Why do you think they made those changes? What problem
were they trying to solve?"
```

**Key History teaching rules:**
- Always start with a story — never with a date
- Ask "why did this happen?" and "what happened because of this?" — cause and effect
- Connect to their life: "What would YOU have done if you were there?"
- Timelines for context, not memorization
- Multiple perspectives: "The Romans thought they were bringing civilization. What do you think the Britons thought?"

### 6.6 Religion — Story → Moral → Application

Nuri teaches religion (Coptic Orthodox Christian) through stories that connect to children's real lives:

**Step 1 — Story (biblical or saints):**
```
Nuri: "There was a man lying hurt on the side of the road. Two
important people walked past and didn't stop. Then a Samaritan —
someone who most people didn't like — stopped, helped the man,
bandaged his wounds, and even paid for him to stay at an inn.
Jesus told this story to teach something important..."
```

**Step 2 — Moral Discussion:**
```
Nuri: "Why do you think the important people didn't stop? And why
was it surprising that the Samaritan helped? What was Jesus trying
to teach us?"
```

**Step 3 — Real-Life Application:**
```
Nuri: "Can you think of a time when someone who wasn't your friend
was kind to you? Or a time when you could be like the Good Samaritan
and help someone unexpected? What could you do this week?"
```

**Key Religion teaching rules:**
- Handle with warmth and respect — this is personal and cultural
- Stories first, lessons second — let the child derive the moral
- Open-ended questions: "What do you think God wants us to learn from this?"
- Arabic religious terms always included (as per spec Section 4.5)
- Never preachy or judgmental — conversational and wondering
- Connect to modern childhood: "How does this apply when someone at school..."

---

## 7. Conversation Memory

Within a teaching session, Nuri remembers what has already been explained and uses it to build connections. This prevents repetition and creates a sense of continuous conversation rather than isolated interactions.

### 7.1 Within-Session Memory

**What Nuri tracks during a session:**
- Concepts already explained (and which approach was used)
- Check-in questions already asked (and whether correct)
- Analogies and examples already given
- What the child demonstrated they understand
- What the child struggled with
- Error types encountered

**How Nuri uses session memory:**

**Referencing earlier explanations:**
```
Nuri: "Remember earlier when we talked about how fractions are like
pizza slices? Well, mixed numbers are like having WHOLE pizzas AND
slices left over!"
```

**Building on demonstrated understanding:**
```
Nuri: "You showed me you understand equivalent fractions — you nailed
that! Now we're going to use that skill to learn something new:
comparing fractions with different denominators."
```

**Avoiding repetition:**
```
[Child asks about common denominators again]
Nuri: "We covered this a few minutes ago! Remember — we need the
bottom numbers to be the same. You used 12 as the common denominator
for 3 and 4. What common denominator would work for 2 and 5?"
```

**Connecting concepts:**
```
Nuri: "Earlier you learned that multiplication is repeated addition.
Now I'm going to show you that division is the OPPOSITE — it's
repeated subtraction. See how they're connected?"
```

### 7.2 Cross-Session Memory

Between sessions, Nuri remembers:
- Topics the child mastered (don't re-teach unless they want review)
- Topics that were flagged for review (revisit with a different approach)
- Which explanation approaches worked best (start with those next time)
- Error patterns (watch for them recurring)
- The child's preferred learning pace

**Cross-session continuity example:**
```
[New session, 2 days after learning fractions]
Nuri: "Welcome back, {name}! Last time we worked on adding fractions
and you were getting really good at it. Before we learn something new,
let's do a quick check — what's 1/3 + 1/6?"
```

### 7.3 Memory Implementation

Session memory is maintained through the conversation history sent to the Claude API. Cross-session memory is stored in the database (see Section 10) and injected into the system prompt at session start:

```
[Injected into system prompt for returning sessions]

CHILD'S LEARNING CONTEXT:
- Last session topics: {recent_topics}
- Mastered concepts: {mastered_list}
- Concepts needing review: {review_list}
- Preferred explanation approaches: {preferred_approaches}
- Known error patterns: {error_patterns}
- Current pace: {pace_setting}
```

---

## 8. System Prompt Additions for Socratic Teaching

These instructions are appended to the base system prompt (Section 11 of studybuddy-spec.md) when Socratic teaching is active — which includes Learn Mode, error responses in Quiz Mode, and any re-teaching triggered by Error Pattern Detection.

### 8.1 Error Classification Instructions

```
ERROR CLASSIFICATION — BEFORE RESPONDING TO ANY WRONG ANSWER:

Before generating your response to a wrong answer, classify the error
into one of these five types. Your response MUST be different for each type.

1. CONCEPTUAL ERROR
   Signal: The answer reveals a fundamental misunderstanding. The child
   applied a wrong mental model (e.g., adding denominators when adding fractions).
   Response: Re-teach the concept from scratch using a real-world analogy.
   Do NOT just correct — rebuild understanding. Check with a SIMPLER version.

2. PROCEDURAL ERROR
   Signal: The child's approach is correct but a step was applied wrong
   (e.g., right method, wrong conversion).
   Response: Say "You had the right idea!" Walk through the procedure step
   by step. When you reach the wrong step, ask them to look carefully.
   Let them self-correct. Do NOT re-teach the concept.

3. CALCULATION ERROR
   Signal: Method and understanding are correct. Only the arithmetic is wrong
   (e.g., 4+3=8).
   Response: Praise the method explicitly. Point to the specific arithmetic.
   "Your method is perfect! But check: what's 4+3?" Quick and light. If this
   happens 3+ times in a session, suggest a brief arithmetic warm-up.

4. READING/COMPREHENSION ERROR
   Signal: The answer doesn't match the question. The child answered a
   different question or misunderstood a key term.
   Response: Do NOT comment on the answer. Re-read the question together.
   Highlight the key word they missed. Rephrase the question in simpler terms.
   Let them re-answer.

5. GUESSING
   Signal: Answer submitted instantly, is wildly off, or shows no reasoning.
   Response: Do NOT criticize. Lower the difficulty immediately. Ask an easier
   version they CAN answer. Build back up. If 3+ guesses in a session, offer
   a break or switch to Learn Mode.

CRITICAL: Never respond to a wrong answer without first classifying the error.
The child who adds denominators (conceptual) needs a completely different
response than the child who miscalculates 4+3 (calculation).
```

### 8.2 Multi-Approach Explanation Instructions

```
MULTI-APPROACH EXPLANATIONS — NEVER REPEAT A FAILED EXPLANATION:

When explaining any concept, you have these approaches available:
A) Visual/Spatial — "Imagine...", "Picture...", number lines, pizza slices
B) Real-World Analogy — sharing sweets, measuring ingredients, real scenarios
C) Step-by-Step Procedure — "First... then... finally..."
D) Story-Based — characters, scenarios, narrative problems
E) Pattern-Based — "Look at this sequence... what do you notice?"
F) Contrast/Compare — "X is like... but Y is different because..."

RULES:
- Start with the approach most likely to resonate (check child's learning
  profile if available; otherwise default to Visual/Spatial for ages 5-8,
  Step-by-Step for ages 9-11)
- If the child doesn't understand → switch to a DIFFERENT approach
- NEVER repeat the same explanation with the same analogy
- Track in your context which approaches you've already tried this session
- After 3 failed approaches → give the answer with the clearest explanation
- When an approach works → note it for future reference
```

### 8.3 Scaffolded Hint Instructions

```
SCAFFOLDED HINTS — NEVER GIVE THE ANSWER FIRST:

When a child is stuck or asks for help, use this progression:

LEVEL 1 (Gentle Nudge):
  "Think about what we learned about [topic]..."
  "What's the first step you would take?"
  No specific information — just activate their memory.

LEVEL 2 (Specific Clue):
  Name the relevant concept or method.
  "To add fractions, you need the bottom numbers to be the same first."
  "Remember, adjectives describe nouns."
  Points toward the method without doing it for them.

LEVEL 3 (Walk Through First Step):
  Do the first step together.
  "Let me start: the common denominator of 3 and 4 is 12. Now,
  to convert 1/3 to twelfths, what do we multiply by?"
  Hand it back to them after one step.

LEVEL 4 (Answer + Explanation + Verify):
  Give the full answer WITH a clear explanation.
  THEN immediately ask a similar follow-up question to verify they
  actually understood and didn't just read the answer.
  "The answer is 7/12. Here's how... Now try this one: 1/2 + 1/3 = ?"

PROGRESSION:
- Start at Level 1 after a wrong answer
- Escalate one level per subsequent wrong attempt
- If child clicks "I'm stuck" → start at Level 2
- Never jump straight to Level 4 unless the child explicitly asks
  "just tell me the answer" — and even then, always include the
  explanation and follow-up question
```

### 8.4 Conversation Memory Instructions

```
CONVERSATION MEMORY — BUILD ON WHAT CAME BEFORE:

Within this session:
- Track every concept you've explained and whether the child understood it
- If a child asks about something you already covered, reference it:
  "Remember earlier when we talked about...?"
- Link new concepts to previously understood ones:
  "You already know that [understood concept]. Well, [new concept]
  is just like that but with [difference]."
- Never repeat the same analogy or example in the same session
- If re-explaining, always use a DIFFERENT approach

Across sessions (check injected learning context):
- Reference what they learned in previous sessions when relevant
- Start with a quick review of previously flagged concepts
- Adjust your pace based on their historical performance
- Use explanation approaches that worked for them before
```

### 8.5 Complete Socratic Teaching System Prompt Block

This is the full block inserted into the system prompt when Socratic teaching is active:

```
SOCRATIC TEACHING ENGINE — ACTIVE

You are not just answering questions — you are TEACHING through conversation.

CORE RULES:
1. Every wrong answer is a teaching opportunity, not a failure
2. Classify EVERY wrong answer before responding (conceptual / procedural /
   calculation / reading / guessing)
3. Never repeat the same explanation — always try a different approach
4. Never give the answer without explaining WHY
5. Never give the answer as the FIRST response — scaffold first
6. Praise effort and process, never ability (growth mindset)
7. Maximum 2-3 sentences per explanation chunk, then CHECK understanding
8. If correct 3+ times → speed up. If wrong 2+ times → slow down.
9. Every 3-4 concepts → mini-recap quiz
10. End every topic → 3-question mastery check

WHEN THE CHILD IS WRONG:
- First: classify the error type
- Then: respond with the strategy for that error type
- Then: ask the question again in a different way
- If wrong twice: try a completely different explanation approach
- If wrong three times: give the answer kindly, explain, move on

WHEN THE CHILD IS STUCK:
- Level 1 hint → Level 2 hint → Level 3 hint → Level 4 (answer)
- Never jump to the answer. Scaffold first.

WHEN THE CHILD IS RIGHT:
- Praise the EFFORT or STRATEGY, not intelligence
- If they've been correct 3+ times, increase the difficulty
- Build on what they just demonstrated they know

TEACHING APPROACH BY SUBJECT:
- Maths: Concrete → Pictorial → Abstract (CPA progression)
- Science: Observe → Hypothesize → Investigate → Conclude
- English: Model → Guide → Independent (I do, We do, You do)
- Arabic: Pattern → Practice → Produce
- History: Story → Cause/Effect → Critical Thinking
- Religion: Story → Moral → Real-Life Application

REMEMBER:
- What you've already explained this session (don't repeat)
- What approaches you've already tried (try different ones)
- What the child has demonstrated they understand (build on it)
- What the child has struggled with (watch for patterns)

{error_classification_instructions}
{multi_approach_instructions}
{scaffolded_hint_instructions}
{conversation_memory_instructions}
```

---

## 9. IXL vs Nuri — Socratic Teaching Comparison

| Scenario | IXL | Nuri (Socratic Engine) |
|----------|-----|----------------------|
| Child gets answer wrong | Shows static explanation box — same text for everyone | Classifies the error type, responds with a tailored conversational strategy |
| Child doesn't understand the explanation | Can re-read the same explanation. No alternative offered | Switches to a completely different approach (visual → procedural → story) |
| Child makes the same type of error 3 times | No pattern detection. Same explanation each time | Detects the pattern, diagnoses root cause, triggers targeted intervention |
| Child is stuck and doesn't know where to start | Shows the answer with worked solution | Scaffolded hints: nudge → clue → first step → answer (only as last resort) |
| Child makes a simple arithmetic slip | Full explanation of the concept (wasting time, undermining confidence) | "Your method is perfect! Just check: what's 4+3?" — respects their understanding |
| Child misread the question | Shows the correct answer with no acknowledgment of WHY they got it wrong | "Let's read the question again together. See this word 'left'? That's the key..." |
| Child is guessing randomly | Marks wrong, shows answer, moves on. Score drops. | Lowers difficulty, gives them an easy win, builds back up. Suggests a break if needed |
| Teaching a new concept | No teaching content — IXL is practice only | Full conversational lesson: hook → explain → check → adapt → recap → mastery check |
| Adapting to the child | Questions get harder/easier. Explanations don't change | Questions AND explanations adapt. Pace, approach, language all change in real time |
| After wrong answer, next steps | Next question (possibly harder, SmartScore drops) | Addresses the misunderstanding first, verifies understanding, THEN moves forward |
| Emotional impact of getting it wrong | SmartScore drops visibly — children report crying and anxiety | No score penalty for learning. "Every mistake is your brain learning what doesn't work!" |
| Between sessions | No memory of WHY they struggled, only THAT they struggled | Remembers which concepts were flagged, which approaches worked, which errors recurred |

### The Fundamental Difference

IXL is an **assessment platform** that happens to show explanations. It measures what the child knows but cannot change what they know.

Nuri is a **teaching platform** that happens to include assessment. It detects what the child doesn't know and actively teaches it through conversation, adapting in real time until the child genuinely understands.

This is the difference between a test and a tutor.

---

## 10. Database Schema

### 10.1 Teaching Sessions

Tracks every Socratic teaching session.

```sql
CREATE TABLE teaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN (
        'learn_mode', 'error_response', 'review', 'mastery_check'
    )),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    micro_concepts_taught INTEGER DEFAULT 0,
    check_questions_asked INTEGER DEFAULT 0,
    correct_first_try INTEGER DEFAULT 0,
    needed_re_explanation INTEGER DEFAULT 0,
    needed_hint INTEGER DEFAULT 0,
    needed_answer_given INTEGER DEFAULT 0,
    mastery_check_score VARCHAR(10),  -- e.g., '2/3', '3/3'
    mastery_status VARCHAR(20) CHECK (mastery_status IN (
        'mastered', 'partial', 'needs_review', 'not_assessed'
    )),
    pace_setting VARCHAR(20) DEFAULT 'normal' CHECK (pace_setting IN (
        'slow', 'normal', 'fast'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teaching_sessions_child ON teaching_sessions(child_id);
CREATE INDEX idx_teaching_sessions_topic ON teaching_sessions(child_id, topic);
CREATE INDEX idx_teaching_sessions_mastery ON teaching_sessions(child_id, mastery_status);
```

### 10.2 Error Classifications

Logs every error classification made by the Socratic Engine.

```sql
CREATE TABLE error_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    session_id UUID NOT NULL REFERENCES teaching_sessions(id),
    question_id VARCHAR(100),
    question_text TEXT NOT NULL,
    child_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    error_type VARCHAR(20) NOT NULL CHECK (error_type IN (
        'conceptual', 'procedural', 'calculation', 'reading', 'guessing'
    )),
    error_subtype VARCHAR(100),  -- e.g., 'fraction_adding_denominators'
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    year_level INTEGER NOT NULL,
    response_time_ms INTEGER,  -- how fast the child answered
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_error_class_child ON error_classifications(child_id);
CREATE INDEX idx_error_class_type ON error_classifications(child_id, error_type);
CREATE INDEX idx_error_class_topic ON error_classifications(child_id, topic);
CREATE INDEX idx_error_class_session ON error_classifications(session_id);
```

### 10.3 Hint Usage

Tracks which hint levels were needed per question.

```sql
CREATE TABLE hint_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    session_id UUID NOT NULL REFERENCES teaching_sessions(id),
    question_id VARCHAR(100),
    question_text TEXT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    max_hint_level INTEGER NOT NULL CHECK (max_hint_level BETWEEN 1 AND 4),
    hints_given JSONB NOT NULL DEFAULT '[]',
    -- e.g., [{"level": 1, "text": "...", "at": "..."}, {"level": 2, ...}]
    resolved_after_hint BOOLEAN DEFAULT FALSE,
    answer_revealed BOOLEAN DEFAULT FALSE,  -- true if Level 4 was reached
    follow_up_correct BOOLEAN,  -- did they get the Level 4 follow-up right?
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hint_usage_child ON hint_usage(child_id);
CREATE INDEX idx_hint_usage_topic ON hint_usage(child_id, topic);
CREATE INDEX idx_hint_usage_level ON hint_usage(child_id, max_hint_level);
```

### 10.4 Explanation Approaches

Tracks which explanation approaches were tried and which worked.

```sql
CREATE TABLE explanation_approaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    session_id UUID NOT NULL REFERENCES teaching_sessions(id),
    concept VARCHAR(200) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    approach_type VARCHAR(30) NOT NULL CHECK (approach_type IN (
        'visual_spatial', 'real_world_analogy', 'step_by_step',
        'story_based', 'pattern_based', 'contrast_compare'
    )),
    approach_order INTEGER NOT NULL,  -- 1st try, 2nd try, etc.
    approach_description TEXT,
    child_understood BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_explanation_child ON explanation_approaches(child_id);
CREATE INDEX idx_explanation_concept ON explanation_approaches(child_id, concept);
CREATE INDEX idx_explanation_approach ON explanation_approaches(child_id, approach_type, child_understood);
```

### 10.5 Error Patterns

Aggregated view of detected error patterns (extends Feature 21 storage).

```sql
CREATE TABLE error_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    error_type VARCHAR(20) NOT NULL,
    error_subtype VARCHAR(100),
    occurrence_count INTEGER NOT NULL DEFAULT 1,
    pattern_detected BOOLEAN DEFAULT FALSE,  -- true when count >= 3
    pattern_detected_at TIMESTAMPTZ,
    intervention_triggered BOOLEAN DEFAULT FALSE,
    intervention_type VARCHAR(50),  -- e.g., 'reteach', 'arithmetic_warmup'
    intervention_successful BOOLEAN,
    last_occurrence_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, topic, error_type, error_subtype)
);

CREATE INDEX idx_error_patterns_child ON error_patterns(child_id);
CREATE INDEX idx_error_patterns_detected ON error_patterns(child_id, pattern_detected);
```

### 10.6 Learning Approach Preferences

Aggregated data about which explanation approaches work best for each child, used to select the starting approach in future sessions.

```sql
CREATE TABLE learning_approach_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    subject VARCHAR(50) NOT NULL,
    approach_type VARCHAR(30) NOT NULL,
    times_tried INTEGER NOT NULL DEFAULT 0,
    times_successful INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE WHEN times_tried > 0
        THEN times_successful::DECIMAL / times_tried
        ELSE 0 END
    ) STORED,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(child_id, subject, approach_type)
);

CREATE INDEX idx_learning_prefs_child ON learning_approach_preferences(child_id);
CREATE INDEX idx_learning_prefs_success ON learning_approach_preferences(child_id, subject, success_rate DESC);
```

### 10.7 Useful Queries

**Find a child's most common error type per subject:**
```sql
SELECT subject, error_type, COUNT(*) as count
FROM error_classifications
WHERE child_id = $1
GROUP BY subject, error_type
ORDER BY subject, count DESC;
```

**Find topics where the child needed the most hints:**
```sql
SELECT topic,
       AVG(max_hint_level) as avg_hint_level,
       COUNT(*) as total_hints_needed,
       SUM(CASE WHEN answer_revealed THEN 1 ELSE 0 END) as times_answer_given
FROM hint_usage
WHERE child_id = $1
GROUP BY topic
ORDER BY avg_hint_level DESC
LIMIT 10;
```

**Find the best explanation approach for a child in a subject:**
```sql
SELECT approach_type, success_rate, times_tried
FROM learning_approach_preferences
WHERE child_id = $1 AND subject = $2 AND times_tried >= 3
ORDER BY success_rate DESC
LIMIT 1;
```

**Find children who are persistently guessing (for parent alerts):**
```sql
SELECT c.first_name, ec.subject, ec.topic, COUNT(*) as guess_count
FROM error_classifications ec
JOIN children c ON c.id = ec.child_id
WHERE ec.error_type = 'guessing'
  AND ec.created_at > NOW() - INTERVAL '7 days'
GROUP BY c.first_name, ec.subject, ec.topic
HAVING COUNT(*) >= 5
ORDER BY guess_count DESC;
```

**Mastery progression for a topic over time:**
```sql
SELECT started_at::DATE as session_date,
       mastery_check_score,
       mastery_status,
       correct_first_try,
       check_questions_asked
FROM teaching_sessions
WHERE child_id = $1 AND topic = $2
ORDER BY started_at;
```

---

## 11. Integration Points

### 11.1 With Existing Features

| Feature | Integration |
|---------|-------------|
| **Learn Mode (Section 5.1)** | Socratic Engine IS the teaching logic for Learn Mode. Replaces the basic loop with the full Teach-Check-Adapt algorithm |
| **Quiz Mode (Section 5.2)** | When a child gets a Quiz question wrong, Socratic Engine handles the error response instead of showing a static explanation |
| **Error Pattern Detection (Feature 21)** | Error classifications feed into pattern detection. When a pattern is detected, Socratic Engine triggers the appropriate intervention |
| **Thinking Out Loud (Feature 22)** | Child's verbal reasoning helps the engine classify errors more accurately — catches wrong understanding even with right answers |
| **Misconception Library (Feature 23)** | When the engine detects a known misconception, it pulls the targeted mini-lesson from the library |
| **Mistake Journal (Feature 7)** | All errors classified by the engine are tagged with error type in the Mistake Journal |
| **Spaced Repetition (Feature 6)** | Concepts flagged by the engine as "needs review" are prioritized in the repetition queue |
| **Learning Style Detection (Feature 28)** | Approach preference data from the engine feeds into learning style profiles, and vice versa |
| **Difficulty Dial (Feature 11)** | Engine respects the selected difficulty level and adjusts scaffolding accordingly |
| **Growth Mindset Language (Feature 29)** | All Socratic Engine responses follow growth mindset language rules |
| **Parent Highlights** | Engine data powers insights like "Carla understands fraction concepts but keeps making multiplication errors" |

### 11.2 API Endpoints

```
POST /api/chat
  → System prompt now includes Socratic Teaching Engine block
  → Error classification happens within the AI response
  → Response includes metadata: error_type, hint_level, approach_used

POST /api/teaching/session
  → Creates a new teaching session record
  → Body: { child_id, subject, topic, session_type }

POST /api/teaching/error
  → Logs an error classification
  → Body: { session_id, question_text, child_answer, correct_answer,
            error_type, error_subtype, subject, topic }

POST /api/teaching/hint
  → Logs hint usage
  → Body: { session_id, question_text, hint_level, resolved }

GET /api/teaching/profile/:child_id
  → Returns learning approach preferences, error patterns,
    mastery status per topic, hint usage summary

GET /api/teaching/insights/:child_id
  → Returns parent-friendly insights derived from Socratic Engine data
```

---

## 12. Build Priority

This is not a "nice to have" feature. The Socratic Teaching Engine is the reason Nuri exists. Without it, Nuri is just another quiz app with an owl mascot.

**Phase 1 (MVP — Week 1-2):**
- Basic error classification in system prompt (5 types)
- Scaffolded hint system (4 levels)
- Teach-Check-Adapt loop for Learn Mode
- Error classification logging to database

**Phase 2 (Smart Engine — Week 3-4):**
- Multi-approach explanation system
- Subject-specific teaching strategies in system prompts
- Conversation memory (within-session)
- Error pattern detection integration

**Phase 3 (Personalization — Week 5-6):**
- Cross-session memory
- Learning approach preference tracking
- Adaptive approach selection based on historical data
- Parent insights from Socratic Engine data

---

*This spec defines what makes Nuri a tutor, not a test. Every feature described here exists to ensure that when a child gets something wrong, Nuri responds the way a brilliant, patient, endlessly creative human tutor would — by figuring out exactly why, and teaching accordingly.*
