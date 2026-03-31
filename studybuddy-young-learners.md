# StudyBuddy — Young Learners Experience (Years 1-2)
## Dominating the 5-7 Age Group Where IXL Is Weakest

*Extends studybuddy-spec.md*

**Version:** 1.0
**Target age group:** 5-7 years old (Years 1-2)
**Strategic goal:** Make Nuri the undisputed best AI tutor for early learners by being voice-first, emotionally safe, and visually delightful -- everything IXL is not for this age group.

---

## Why This Age Group Matters

IXL's weakest segment is children aged 5-7. Their product is:
- **Text-heavy** -- a 5-year-old who can barely read is expected to navigate walls of text
- **No voice interaction** -- everything must be read and typed
- **No mascot or personality** -- cold, utilitarian interface
- **Punitive scoring** -- SmartScore drops on wrong answers, causing anxiety in young children
- **Complex input fields** -- text boxes and dropdowns designed for older kids

Nuri must own this age group completely. A child who starts with Nuri at age 5 stays with Nuri through age 11. Early lock-in through emotional attachment to the mascot is the strategy.

---

## 1. Voice-First Interface for Ages 5-7

Children aged 5-7 are pre-readers or early readers. They cannot navigate a text-based app. The entire experience must be voice-first -- not voice-optional, not tap-to-hear. Voice is the DEFAULT.

### 1.1 Nuri Reads Everything Aloud

Every piece of text on screen is automatically spoken by Nuri. There is no "tap to hear" button -- audio plays as content appears.

| Element | Voice Behavior |
|---------|---------------|
| Question text | Nuri reads the full question aloud as it appears on screen |
| Answer options | Nuri reads each option aloud, highlighting each one as it's spoken |
| Feedback | Nuri speaks the feedback ("Great job!" / "Almost! Let's try...") |
| Navigation labels | Nuri reads button labels when the child hovers or taps ("This is the Home button!") |
| Instructions | Nuri explains what to do before the child needs to act ("Tap the picture that shows three apples!") |
| Transition screens | Nuri narrates what's happening ("Loading your next question... here it comes!") |

**Repeat button:** A small ear icon in the corner lets the child hear Nuri repeat the question at any time. But the first read-aloud is automatic -- always.

**Speed control (parent setting):** Parents can adjust Nuri's speaking speed:
- Slower (0.75x) -- for the youngest learners or non-native speakers
- Normal (1.0x) -- default
- Slightly faster (1.15x) -- for kids who are already reading and find the voice slow

### 1.2 All Buttons Use Icons + Short Labels

No button relies on text alone. Every interactive element has:
- A **clear icon** (universally recognizable)
- A **short label** (1-2 words maximum)
- **Nuri reads the label** when the child hovers or first taps

| Button | Icon | Label |
|--------|------|-------|
| Home | House | Home |
| Start quiz | Play triangle | Play! |
| Next question | Right arrow | Next |
| Go back | Left arrow | Back |
| Microphone | Microphone | Talk |
| Settings | Gear | Settings |
| Profile | Owl face (Nuri) | Me |

### 1.3 Questions Presented as Voice + Visual

Every question is a multi-sensory experience:

1. **Nuri's voice** reads the question aloud
2. **Large, colorful illustration** accompanies the question (no text-only questions for this age group)
3. **Big text** displays simultaneously (for children who are learning to read -- the text reinforces reading skills even if they rely on voice)
4. **Text highlights word-by-word** as Nuri reads, linking spoken and written words (karaoke-style)

**Example -- Year 1 Maths question:**
- Screen shows: 3 red apples and 2 green apples, big and colorful
- Nuri says: "How many apples are there altogether?"
- Text on screen: "How many apples?" (simplified written version)
- Answer options: Large number buttons [4] [5] [6] with Nuri reading each number

### 1.4 Child Answers by Speaking

The microphone is always visible and prominent -- a large, friendly button at the bottom center of the screen. Children can answer by:

**Primary: Voice**
- Child taps the mic button (large, pulsing gently to invite interaction)
- Nuri says: "Tell me your answer!"
- Child speaks: "Five!"
- Nuri processes and confirms: "I heard five! Let me check..."
- Visual feedback: Nuri's ears perk up while listening, shows a thinking animation while processing

**Secondary: Tap**
- Large answer buttons (minimum 60px height, ideally 72px) with icons/images
- For number answers: oversized, colorful number pad
- For word answers: large picture-word buttons

**Tertiary: Keyboard (Year 2 only)**
- Available but not promoted for Year 1
- For Year 2, keyboard appears for simple word spelling exercises
- Large keys, simplified layout (letters only, no special characters)

**Voice recognition considerations:**
- Trained for children's voices (higher pitch, less enunciation)
- Accepts approximate pronunciation ("free" for "three" from a 5-year-old)
- If Nuri can't understand: "I didn't quite catch that. Can you say it again?" (never "Error: speech not recognized")
- Fallback: "You can also tap your answer!" (always offer the alternative)
- Works in both English and Arabic

### 1.5 Arabic Questions Always Include Diacritics

For Arabic content, **all text always includes full tashkeel (حركات)**. This is non-negotiable for early readers.

| Without diacritics | With diacritics | Why it matters |
|-------------------|-----------------|---------------|
| كتب | كَتَبَ | A 5-year-old cannot read unvoweled Arabic. "ktb" could be kataba, kutub, kutiba, etc. |
| علم | عِلْمٌ | Diacritics teach correct pronunciation from the start |
| بسم الله | بِسْمِ اللَّهِ | Religious phrases must be recited correctly |

**Implementation:**
- All Arabic text in the database for Years 1-2 must be stored with full tashkeel
- Nuri's Arabic voice reads with clear, slow pronunciation matching the diacritics
- As children progress to Year 3+, diacritics are gradually reduced (but available on-demand)

---

## 2. Simplified UI for Years 1-2

The interface for Years 1-2 is a distinct experience from Years 3-6. It is not the same UI with bigger fonts -- it is a fundamentally different, simpler design.

### 2.1 Tap Target Sizes

| Element | Minimum Size | Recommended Size |
|---------|-------------|-----------------|
| Answer buttons | 60px | 72px |
| Number pad keys | 56px | 64px |
| Navigation buttons | 48px | 56px |
| Mic button | 72px | 80px |
| Drag-and-drop items | 64px | 80px |

All tap targets have generous spacing (minimum 12px between interactive elements) to prevent accidental taps.

### 2.2 Multiple Choice: Maximum 3-4 Options

IXL often presents 5-6 options or complex input fields. For Years 1-2:

- **Year 1:** Maximum **3 answer options** per question
- **Year 2:** Maximum **4 answer options** per question
- Each option is a **large button with an image and/or big text**
- Options are laid out in a **single column** or **2x2 grid** (never a horizontal row of tiny buttons)
- Selected option has a clear, bold highlight (thick border + color change + Nuri repeats the selection)

### 2.3 Heavy Use of Images and Illustrations

| Question Type | Visual Treatment |
|--------------|-----------------|
| Counting | Illustrated objects (apples, stars, animals) -- not abstract numbers |
| Addition/subtraction | Two groups of objects with a visual operation (3 cats + 2 cats = ?) |
| Phonics | Large letter with an illustrated object (A = apple picture) |
| Science | Full-color photographs or illustrations (plants, animals, weather) |
| Arabic letters | Large letter in isolation + object illustration + diacritics |
| Religion | Warm, child-friendly story illustrations (Nuri narrates over them) |
| History | Side-by-side images for comparison ("old" vs "new") |

Every question must have an associated illustration. Text-only questions are **not permitted** for Years 1-2.

### 2.4 Reduced Text on Screen

The screen shows the minimum text necessary. Nuri's voice carries the information load.

**Year 1 screen text rules:**
- Question text: Maximum 8 words on screen (Nuri speaks the full version)
- Answer labels: Maximum 3 words per option
- No paragraph text -- ever
- No instructions in text form (Nuri speaks all instructions)

**Year 2 screen text rules:**
- Question text: Maximum 15 words on screen
- Answer labels: Maximum 5 words per option
- Short instructions may appear in text (but Nuri reads them aloud too)

### 2.5 Linear Flow -- No Complex Navigation

The child never needs to "navigate" in the traditional sense. The experience is strictly linear:

```
Home → Subject Selection → Question → Answer → Feedback → Next Question → ... → Session End Celebration
```

**What is removed for Years 1-2:**
- No breadcrumb navigation
- No sidebar menus
- No topic selection screens with dozens of options (Nuri picks the topic based on their progress)
- No settings accessible to the child (settings are parent-only, behind a parent gate)
- No back button during a quiz (prevents anxiety about changing answers)
- No progress bars that show "5/20 questions" (too much pressure -- Nuri just says "Let's do one more!")

**What stays:**
- Home button (house icon, always visible)
- Mic button (always visible)
- Nuri (always visible, always reacting)

### 2.6 Visual Design

**Color palette for Years 1-2:**
- Warm, saturated colors (no pastels that feel clinical, no dark themes)
- Background: soft cream or light sky blue (easy on young eyes, not stark white)
- Primary accent: warm orange (Nuri's color)
- Correct answer: bright green with golden sparkle
- "Try again" feedback: soft amber/warm yellow (NOT red -- red means danger to young children)
- Buttons: rounded corners (16px radius minimum), subtle shadow for depth

**Nuri always visible:**
- Nuri occupies 15-20% of the screen at all times
- Nuri is positioned consistently (bottom-left or top-right, never jumping around)
- Nuri reacts to everything in real time:
  - Idle: gentle bobbing, occasional blink
  - Question appears: leans forward, curious expression
  - Child answers correctly: jumps, stars burst, wings flap
  - Child answers incorrectly: gentle head tilt, soft smile, encouraging wing gesture
  - Child is idle for 10+ seconds: "Need some help? I can read the question again!"
  - Session ending: waves, blows confetti

### 2.7 Number Pad for Math Answers

For any question requiring a numerical answer, a custom number pad appears:

- **Large, colorful number buttons** (0-9) in a calculator layout but sized for small fingers
- Each number has a distinct color to aid recognition
- **Delete/backspace button** with a clear "X" icon
- **Submit/check button** with a big green checkmark
- Nuri reads each number as the child taps it: "Two... three... you typed twenty-three!"
- Number pad replaces the keyboard entirely for Year 1 (no keyboard shown)

### 2.8 Drag-and-Drop Activities

Used for sorting, ordering, and matching exercises:

- **Large draggable items** (minimum 64px, ideally 80px)
- **Clear drop zones** with dotted borders and visual cues (a subtle glow when an item is near)
- **Snap-to-target** behavior (item snaps into place when close enough -- high tolerance for imprecise dragging)
- **Nuri narrates the action:** "Great, you moved the cat to the 'animals' group!"
- **Undo:** If a child places something and changes their mind, they can drag it back or tap it to remove
- **Works for both left-handed and right-handed children** (drag targets accept from any direction)

**Used in:**
- Sorting (living vs non-living, big vs small)
- Ordering numbers (put 1, 2, 3 in the right order)
- Matching (match the letter to the picture)
- Sequencing (put the story in order)

---

## 3. Session Design for Short Attention Spans

Five-year-olds have an effective attention span of 10-15 minutes for focused academic work. IXL's model -- "keep going until you hit SmartScore 100" -- is completely wrong for this age group.

### 3.1 Default Session Length

| Year Group | Default Session | Maximum Before Break Prompt | Hard Limit (Parent-Settable) |
|-----------|----------------|---------------------------|------------------------------|
| Year 1 | 10 minutes | 15 minutes | 30 minutes |
| Year 2 | 15 minutes | 20 minutes | 45 minutes |

Sessions are measured in **time, not question count**. A session might be 5 questions or 12 questions depending on how long the child takes per question.

### 3.2 Break Prompts

When the default session time is reached, Nuri gently suggests a break:

**First prompt (at default session end):**
> Nuri: "Wow, you've been learning for [10/15] minutes! That's amazing! Want to keep going, or should we take a break?"
>
> Options: [Keep Going! (rocket icon)] [Take a Break (star icon)]

**Second prompt (at maximum before break prompt):**
> Nuri: "You've been working so hard! Even Nuri needs to rest his wings sometimes. Let's take a little break and come back later!"
>
> Options: [One More Question! (single star)] [OK, Bye Nuri! (waving hand)]

**"One More Question" option:** If the child selects this, Nuri asks exactly ONE more question, then ends the session with a celebration. This gives the child a sense of control and closure.

**Hard limit reached:**
> Nuri: "Time for a rest! You did SO well today. Nuri will be right here when you come back!"
>
> No option to continue. Session ends with full celebration animation.

### 3.3 Every Session Ends Positively

Regardless of performance, every session ends with:

1. **Celebration animation** -- confetti, stars, Nuri dancing (duration: 3-4 seconds)
2. **Nuri's closing statement** (randomized, always positive):
   - "You tried so hard today! Nuri is so proud of you!"
   - "Wow, look at everything you learned! You're getting so smart!"
   - "That was fun! Nuri can't wait to learn more with you tomorrow!"
   - "You're doing amazing! See you next time, superstar!"
   - Arabic variant: "!شاطر يا بطل! نوري فخور بيك" ("Clever one, champion! Nuri is proud of you!")
3. **"What you learned" summary** -- shows 2-3 positive achievements from the session:
   - "You counted all the way to 15!"
   - "You learned 3 new sight words!"
   - "You matched all the animals to their homes!"
   - This list NEVER mentions what they got wrong. It only highlights positives.
4. **Sticker/reward** -- a collectible sticker is awarded for completing the session (see Section 7)

### 3.4 "One More Question" at Natural Stopping Points

Instead of a progress bar showing "Question 8 of 15," Nuri periodically offers a natural exit:

After every 3-5 questions, when appropriate:
> Nuri: "Great job! Want to do one more, or is that enough for today?"
> Options: [One More!] [I'm Done!]

This gives the child agency without pressure. Both options are presented equally -- neither is "better."

### 3.5 Parent Session Time Controls

Parents can configure via the parent dashboard (behind parent gate):

- **Daily time limit:** Default 15 min/day for Year 1, 20 min/day for Year 2
- **Per-session limit:** Maximum continuous time before forced break
- **Cooldown period:** Minimum time between sessions (prevents binge-studying)
- **Schedule:** Days of the week the app is available (e.g., not on weekends)
- **Override for today:** "Let them do 10 more minutes today" one-tap option

---

## 4. Emotional Safety for Young Children

This is the most important section of this spec. A child's emotional relationship with learning is formed between ages 5-7. If Nuri makes a child feel stupid, anxious, or ashamed, we have failed -- even if they learn the material.

### 4.1 Wrong Answer Handling

Nuri NEVER says "wrong," "incorrect," "no," or any word that signals failure. The wrong-answer sound is NOT a buzzer, NOT a descending tone, NOT any sound associated with error or failure.

**Wrong answer experience:**

1. **Sound:** A soft, neutral "hmm" tone (warm, curious -- like "interesting, let's think about this")
2. **Nuri's expression:** Gentle head tilt, thinking face, encouraging smile. NOT a frown, NOT a sad face, NOT a shake of the head.
3. **Nuri's voice (randomized):**
   - "Hmm, not quite! Let me help you with this one..."
   - "Almost! Let's try it together..."
   - "Good try! Let me show you a little trick..."
   - "That's a tricky one! Here, let me give you a clue..."
   - "Ooh, so close! Let's look at it again..."
4. **Visual:** The selected answer gently fades back to its neutral state (no red X, no crossing-out animation). The correct answer glows softly with a green highlight.
5. **Teaching moment:** Nuri briefly explains the correct answer in simple terms:
   - "See? Three apples and two apples makes five apples altogether! 3... 4... 5!" (counting on fingers animation)
6. **Move on quickly:** Do not dwell. 3-4 seconds of explanation, then smoothly transition to the next question.

### 4.2 Correct Answer Celebrations

Celebration intensity scales with question difficulty:

**Easy question (at or below child's level):**
- Nuri: "Yes! Great job!" or "That's right!" or "You got it!"
- Animation: Small star burst around Nuri (1-2 seconds)
- Sound: Happy chime (short, bright)
- XP: Standard award

**Medium question (at child's level, topic they've struggled with):**
- Nuri: "Brilliant! You're really getting this!" or "Look at you go!"
- Animation: Multiple stars + Nuri does a small hop
- Sound: Happy melody (2 seconds)
- XP: Standard award + small bonus

**Hard question (above child's level, or previously missed):**
- Nuri: "WOW! That was a tough one and you NAILED it! Amazing!" or "Incredible! You're a superstar!"
- Animation: Full confetti explosion + Nuri dancing + screen sparkle (3 seconds)
- Sound: Full celebration fanfare
- XP: Standard award + big bonus
- If this was a previously-missed question: "Remember when this was tricky? Look how much you've learned!"

### 4.3 Consecutive Wrong Answers -- Frustration Prevention

If a child gets **3 or more questions wrong in a row**, the system intervenes:

**Step 1 -- Automatic difficulty reduction:**
The next question drops one difficulty tier. If they were getting Year 1 Term 2 questions, drop to Year 1 Term 1. This happens silently -- no announcement.

**Step 2 -- Verbal encouragement:**
> Nuri: "Let's try something a bit different! I have a fun one for you!"

The language signals a topic change or novelty, NOT a difficulty reduction. The child should never feel they are being given "baby questions."

**Step 3 -- Mini-activity pivot (if 5+ wrong in a row):**
If frustration continues, Nuri pivots to a non-academic mini-activity:
- "Let's take a quick brain break! Can you find all the hidden stars in this picture?" (find-the-object game)
- "Nuri wants to show you something cool! Watch this!" (short animation or fun fact)
- "Let's play a quick game! Tap the bubbles before they float away!" (simple motor skill game)

After the brain break (30-60 seconds), Nuri returns to academic content at a reduced difficulty level.

**Step 4 -- Session end suggestion (if struggle persists):**
> Nuri: "You've been working really hard! Nuri thinks we should take a break and try again later. You're doing great -- sometimes our brains just need a rest!"

This is a suggestion, not a forced end. But Nuri makes it very appealing to stop.

### 4.4 Emotional State Indicators (Internal)

The system tracks an internal "confidence score" for each session (never shown to the child):

| Metric | Effect |
|--------|--------|
| 3+ correct in a row | Confidence UP -- can try slightly harder questions |
| 3+ wrong in a row | Confidence DOWN -- reduce difficulty, increase encouragement |
| Fast correct answers | Child is comfortable -- can gradually increase difficulty |
| Long pauses before answering | Child may be unsure -- offer a hint proactively |
| Mic input with hesitant tone | If detectable, offer encouragement: "Take your time! There's no rush." |
| Child says "I don't know" | Never penalized. Nuri responds: "That's totally okay! Let me help you learn this one." |

---

## 5. Year 1 Specific Experience (Age 5-6)

Year 1 children are 5-6 years old. Many are just starting formal schooling. Reading ability ranges from non-existent to early decoding. The app must work for a child who cannot read a single word.

### 5.1 Maths -- Year 1

**Core approach:** Everything is visual and concrete. Numbers are always accompanied by countable objects.

**Topic: Counting (1-20, extending to 100)**
- **Question format:** Screen shows a group of illustrated objects (animals, fruits, toys). Nuri asks: "How many [objects] can you see? Count them!"
- **Interaction:** Child can tap each object to count (each tap highlights the object and Nuri counts along: "1... 2... 3... 4..."). Then child gives final answer via number pad or voice.
- **Visual aid:** Objects animate slightly when tapped (wiggle, bounce) to confirm the tap registered.
- **Scaffolding:** If child struggles, Nuri starts counting with them: "Let's count together! 1... your turn... 2!"

**Topic: Number Recognition**
- **Question format:** Nuri says a number, child taps the correct written numeral from 3 options.
- **Reverse:** Nuri shows a numeral, child says the number aloud.
- **Visual:** Numbers are large (80px+), each in a distinct color.

**Topic: Simple Addition with Pictures**
- **Question format:** Two groups of objects separated by a "+" symbol. Nuri says: "Three cats and two cats. How many cats altogether?"
- **Visual:** 3 cat illustrations | + | 2 cat illustrations | = | [?]
- **Interaction:** Number pad answer, or child counts all objects and speaks the total.
- **Scaffolding:** If wrong, Nuri animates the objects combining into one group and counts them one by one.

**Topic: Simple Subtraction with Pictures**
- **Question format:** A group of objects with some crossed out or "walking away." Nuri says: "There were five birds. Two flew away. How many are left?"
- **Visual:** 5 birds, 2 animated flying away, 3 remaining.
- **Interaction:** Count remaining objects, answer via voice or number pad.

**Topic: Shapes**
- **Question format:** "Which shape is a circle?" -- three large shapes displayed.
- **Visual:** Bright, bold shapes with thick outlines.
- **Interaction:** Tap the correct shape. Correct shape bounces and Nuri says the shape name.

**Topic: Comparing (Heavier/Lighter, Taller/Shorter)**
- **Question format:** Two illustrated objects on a visual scale or side-by-side. "Which is heavier, the elephant or the mouse?"
- **Visual:** Animated balance scale tipping to show the concept.

### 5.2 English -- Year 1

**Core approach:** Phonics-first. Every letter and word is paired with sound and image.

**Topic: Phonics (Letter Sounds)**
- **Question format:** Nuri says a sound: "/b/". Three large letters displayed. "Which letter makes the /b/ sound?"
- **Reverse:** Nuri shows a letter. "What sound does this letter make?" Child speaks the sound.
- **Visual:** Each letter is large (100px+), in a playful font, with an associated picture below (B = ball, bear, banana).
- **Game variant:** "Nuri's Sound Safari" -- Nuri makes animal sounds and child identifies the starting letter.

**Topic: Sight Words**
- **Question format:** Nuri says a word: "the." Three word cards displayed, each with an accompanying image. Child taps the correct word.
- **Visual:** Words displayed in large, clear font. High-frequency words (the, is, and, I, to, go, no) are introduced with picture mnemonics.
- **Repetition:** Sight words cycle back frequently using spaced repetition.

**Topic: Blending (CVC Words)**
- **Question format:** Three letter tiles shown: c-a-t. Nuri sounds each one: "/c/ /a/ /t/... what word does that make?"
- **Interaction:** Child speaks the blended word ("cat!") or taps a picture of a cat from 3 options.
- **Animation:** Letters physically slide together as the child blends them.

**Topic: Simple Sentence Reading (supported)**
- Nuri reads a short sentence aloud while highlighting each word.
- Comprehension question: "The cat sat on the mat. Where did the cat sit?" -- child taps the picture of a mat.

### 5.3 Science -- Year 1

**Core approach:** Picture-based exploration. Nuri describes, child observes and identifies.

**Topic: Living and Non-Living Things**
- **Question format:** Grid of 4-6 colorful pictures. "Tap all the living things!"
- **Visual:** Clear photographs or illustrations -- dog, tree, rock, car, flower, teddy bear.
- **Interaction:** Tap to select (multiple selection allowed). Selected items get a glowing border.
- **Nuri explains:** "A dog is alive -- it breathes and grows! A rock is NOT alive -- it doesn't grow or move on its own."

**Topic: Animals and Their Features**
- **Question format:** "Which animal has feathers?" -- show 3 animals (bird, fish, cat).
- **Drag variant:** Drag animals into two groups: "Lives in water" vs "Lives on land."

**Topic: Seasons and Weather**
- **Question format:** "Which picture shows winter?" -- 4 seasonal scenes displayed.
- **Nuri's story mode:** Nuri describes a scene: "It's cold outside, the trees have no leaves, and there's snow on the ground. What season is this?"

**Topic: Materials**
- **Question format:** "Which is made of wood?" -- show 3 objects.
- **Touch/feel description:** Nuri describes properties: "This is smooth and shiny -- it's made of glass!"

### 5.4 Arabic -- Year 1

**Core approach:** Letter recognition through sound, shape, and image. Full diacritics always.

**Topic: Letter Recognition**
- **Question format:** Nuri says a letter name and sound: "هذا حرف باء -- /ب/" ("This is the letter Ba"). Child sees 3-4 large Arabic letters and taps the correct one.
- **Visual:** Letters are displayed in large isolation form (100px+), with full diacritical marks.
- **Audio:** Clear, slow pronunciation with each letter's sound demonstrated.
- **Variant:** "Which word starts with ب?" -- show pictures (بيت/house, قطة/cat, شمس/sun). Child taps the picture that starts with the target letter.

**Topic: Letter Forms (Beginning, Middle, End)**
- **Question format:** Show the same letter in its different positional forms. Nuri explains: "The letter ب looks different depending on where it appears in a word!"
- **Visual:** Large, clear examples with the letter highlighted in color within a simple word.

**Topic: Simple Word Matching**
- **Question format:** A word with full diacritics (e.g., "بَيْتٌ") and 3 pictures. Nuri reads the word aloud. Child taps the matching picture.
- **Scaffolding:** Nuri sounds out the word slowly: "بَ... يْ... تٌ... بَيْتٌ -- house!"

**Topic: Listening Comprehension**
- **Question format:** Nuri says a simple sentence in Arabic. Child answers a question by tapping a picture.
- Example: "الولد يأكل تفاحة" (The boy is eating an apple). "What is the boy eating?" -- show apple, banana, bread.

### 5.5 Religion (Christian) -- Year 1

**Core approach:** Story-based. Nuri tells stories with warm illustrations. Comprehension through simple picture-based questions.

**Topic: Creation Story**
- **Format:** Nuri narrates the creation story with animated illustrations for each day.
- **Questions:** Picture-based: "What did God create on the first day?" -- show pictures of light, animals, water.
- **Interactive:** Child arranges creation days in order using drag-and-drop (with picture cards, not text).

**Topic: Stories of Jesus's Kindness**
- **Format:** Nuri tells a simplified story (1-2 minutes) with illustrations that transition like a picture book.
- **Questions:** "Who did Jesus help in this story?" -- show character pictures from the story.
- **Emotional:** Focus on how the story makes the child feel: "How do you think the little boy felt when Jesus helped him? Happy or sad?" -- child taps an emoji face.

**Topic: Prayers**
- **Format:** Nuri teaches simple prayers line by line. Nuri says a line, child repeats (voice).
- **Visual:** The prayer text scrolls slowly with each word highlighted as Nuri speaks.
- **Both languages:** Prayers taught in both Arabic and English.

**Topic: Good Behavior**
- **Format:** Scenario-based: "Your friend is sad. What should you do?" -- show pictures of responses (hug friend, walk away, share a toy).
- **No wrong answer shaming:** All options get feedback: "That's one thing you could do! But what would be the kindest thing?"

### 5.6 History -- Year 1

**Core approach:** Visual comparisons and picture-based timelines. History is about "then vs now."

**Topic: Old vs New**
- **Question format:** Two pictures side by side: an old telephone and a modern phone, an old car and a modern car. "Which one is from a long time ago?"
- **Sorting game:** Drag items into "A Long Time Ago" or "Today" buckets.

**Topic: Famous People**
- **Format:** Nuri tells a simplified story about a famous person (Florence Nightingale, Neil Armstrong).
- **Illustrations:** Warm, child-friendly portrait-style images (not photographs that might look "scary" or unfamiliar to a 5-year-old).
- **Questions:** "What did Florence Nightingale do?" -- picture options (helped sick people, built houses, flew airplanes).

**Topic: Events Beyond Living Memory**
- **Format:** Nuri tells simplified stories with visual timelines.
- **Great Fire of London:** Simple animated sequence showing key events. "What started the fire?" -- picture options.
- **First airplane flight:** Image of the Wright Brothers' plane. "Could people fly before this?" -- Yes/No buttons with picture cues.

---

## 6. Year 2 Specific Experience (Age 6-7)

Year 2 children are beginning to read independently. The experience starts transitioning from fully voice-first to voice-supported, but voice remains the primary channel.

### 6.1 Key Differences from Year 1

| Aspect | Year 1 | Year 2 |
|--------|--------|--------|
| Voice | Fully voice-first, Nuri reads everything | Voice-supported, Nuri still reads but child begins reading too |
| Answer options | Maximum 3 | Maximum 4 |
| Typed input | Not available | Available for simple words (2-4 letters) |
| Session length | 10-15 min default | 15-20 min default |
| Text on screen | Maximum 8 words | Maximum 15 words |
| Reading prompts | Nuri reads, child listens | Nuri reads, then asks "Can you read this one?" |
| Question complexity | Single-step | Begins introducing two-step questions |

### 6.2 Transition Strategy: Voice-First to Voice-Supported

Year 2 is the bridge year. The app gradually introduces more reading:

**Phase 1 (Year 2, Term 1): Still mostly voice-first**
- Nuri reads everything automatically
- Occasionally: "Want to try reading this one yourself?" (opt-in, no pressure)
- Text is slightly smaller than Year 1 but still large

**Phase 2 (Year 2, Term 2): Shared reading**
- Nuri reads the question but pauses at key words: "How many _____ are in the picture?"
- Child fills in the word by reading it or speaking it
- On-screen text is more prominent, word-by-word highlighting continues

**Phase 3 (Year 2, Term 3): Voice-supported**
- Short questions appear as text first, with a 3-second delay before Nuri reads aloud
- Child can read and answer before Nuri speaks
- A "Read it to me" button is always available (ear icon)
- Nuri praises reading attempts: "You read that all by yourself! Amazing!"

### 6.3 Maths -- Year 2

**Topic: Place Value (Tens and Ones)**
- **Visual:** Bundled sticks (ten-sticks and single sticks). "How many tens and how many ones in 34?"
- **Interactive:** Drag ten-bundles and ones into place value chart.
- **Number pad:** Child types the number. Nuri confirms: "Three tens and four ones makes... thirty-four!"

**Topic: Addition and Subtraction (2-Digit Numbers)**
- **Visual:** Number line that Nuri demonstrates jumping along.
- **Supported methods:** "Counting on" (animated jumps on number line), "Part-whole model" (visual splitting of numbers).
- **Voice:** Child can speak the answer or use the number pad.

**Topic: Multiplication (2, 5, 10 Times Tables)**
- **Visual:** Groups of objects. "Three groups of two bananas. How many bananas?"
- **Song integration:** Nuri sings times table songs (catchy, short -- 15-second clips).
- **Skip counting:** Interactive number line where child taps to skip count: 2, 4, 6, 8...

**Topic: Fractions (Halves and Quarters)**
- **Visual:** Pizza, cake, or chocolate bar split into parts. "Which shows one half?"
- **Interactive:** Child drags a line to split a shape in half.
- **Nuri explains:** "If we cut this cake into TWO equal pieces, each piece is one half!"

**Topic: Time**
- **Visual:** Large clock face with moveable hands.
- **Question format:** "What time does the clock show?" with a clear analog clock.
- **Interactive:** Drag clock hands to match a given time ("Show me half past three").

**Topic: Data and Charts**
- **Visual:** Colorful pictogram with large icons. "How many children chose pizza?"
- **Interactive:** Build a pictogram by dragging icons into columns.

### 6.4 English -- Year 2

**Topic: Reading Comprehension**
- **Format:** Short passage (3-5 sentences) displayed on screen. Nuri reads it aloud (word-by-word highlighting). Then asks a question.
- **Question types:** "What happened?" (literal), "Why do you think...?" (basic inference).
- **Voice answer option:** Child can speak their answer for open-ended questions. Nuri evaluates.

**Topic: Expanded Noun Phrases**
- **Format:** "Make this sentence more interesting! The butterfly → The ___ butterfly"
- **Options:** [blue] [big] [tiny] -- with illustrations showing each version.
- **Drag variant:** Drag adjective cards onto a sentence template.

**Topic: Past and Present Tense**
- **Format:** "Yesterday, the cat ___ on the mat." Options: [sits] [sat] [sit].
- **Nuri explains:** "If it happened YESTERDAY, we say 'sat.' If it's happening NOW, we say 'sits.'"

**Topic: Simple Spelling**
- **Format:** Nuri says a word. Child types it using a simplified keyboard (letters only, large keys).
- **Scaffolding:** If wrong, Nuri sounds out the word: "/c/ /a/ /t/ -- try again!"
- **Partial credit:** If child gets most letters right, Nuri acknowledges: "So close! You got the 'c' and the 'a' right!"

**Topic: Punctuation**
- **Format:** "Where does the full stop go?" -- child taps the position in a simple sentence.
- **Visual:** Sentence displayed with draggable punctuation marks (., ?, !).

### 6.5 Science -- Year 2

**Topic: Living Things and Habitats**
- **Sorting game:** Drag creatures into habitats -- ocean, forest, desert, garden.
- **Food chains:** Simple drag-and-drop: arrange 3 pictures in order (grass → rabbit → fox).
- **Visual:** Rich, colorful habitat illustrations.

**Topic: What Plants Need**
- **Interactive experiment:** "Let's do an experiment! What happens if a plant has no light?"
- **Visual:** Animated plant growth over time (fast-forwarded). Child predicts, then watches result.
- **Question:** "What do plants need to grow?" -- drag items to the plant (sunlight, water, soil -- yes; toys, music -- no).

**Topic: Healthy Living**
- **Sorting game:** Drag foods into "healthy" and "treat" categories.
- **Visual:** Colorful food illustrations. Nuri explains why each item is healthy or not.
- **Activity:** "Build a healthy plate!" -- drag food groups onto a plate diagram.

### 6.6 Arabic -- Year 2

- Full diacritics continue (still mandatory)
- Begin simple sentence reading with Nuri's support
- Word building: combine letters to form words (drag letter tiles)
- Short reading passages (2-3 sentences) with comprehension questions
- Introduction to simple handwriting exercises (trace letters on screen)
- Nuri's Arabic praise: "!ممتاز! أنت بطل" ("Excellent! You're a champion!")

### 6.7 Religion (Christian) -- Year 2

- Stories become slightly longer (2-3 minutes)
- Comprehension questions become two-part: "What happened? Why do you think God did that?"
- Introduction to key characters: Noah, Abraham, Moses, David
- Parables of Jesus with picture-based moral questions
- Simple memory verses with Nuri singing/reciting them
- Church calendar awareness: "What are we celebrating at Christmas?"

### 6.8 History -- Year 2

- Stories about significant people with more detail
- Comparison activities: "How is this different from today?"
- Simple timeline activities (drag events into chronological order -- max 3-4 events)
- Introduction to the concept of "evidence": "How do we know what happened a long time ago?" with pictures of artifacts

---

## 7. Gamification Adapted for Young Children

IXL's gamification (awards, certificates, SmartScore) is designed for older children who understand abstract achievement systems. For ages 5-7, gamification must be simpler, more visual, and more immediate.

### 7.1 Sticker Rewards (Instant Gratification)

**Frequency:** A sticker is awarded every **3 questions answered** (regardless of correctness -- effort, not perfection).

**Experience:**
1. After 3rd question: "You've earned a sticker! Let's see what you got!"
2. Sticker appears with a "peeling off" animation and a satisfying sound
3. Child taps to add it to their Sticker Book
4. Stickers are themed by subject:
   - Maths: Numbers, shapes, colorful equations
   - English: Letters, books, word bubbles
   - Science: Animals, plants, planets
   - Arabic: Arabic letters, cultural motifs
   - Religion: Doves, hearts, candles, stars
   - History: Castles, crowns, old ships

**Sticker Book:**
- A dedicated page where the child can view all their stickers
- Organized by subject (each subject has its own "page")
- Completionist goal: "Collect all 30 animal stickers!" (achievable, not overwhelming)
- Stickers are purely cosmetic but deeply satisfying for this age group

### 7.2 Nuri's Visual Evolution (Primary Motivator)

For ages 5-7, Nuri's visual changes are the **single most powerful motivator.** Children this age form genuine emotional attachments to characters.

**Evolution happens more frequently for young learners:**

| Milestone | Nuri Change | Age 5-7 Pacing |
|-----------|------------|-----------------|
| First session completed | Nuri gets a tiny backpack | Day 1 |
| 10 sessions completed | Nuri's backpack gets a badge | ~Week 1-2 |
| 25 sessions completed | Nuri gets a colorful scarf | ~Month 1 |
| 50 sessions completed | Stars orbit around Nuri | ~Month 2 |
| 100 sessions completed | Nuri gets sparkly glasses | ~Month 3-4 |
| Level 10 | Nuri gets a cape | Varies |
| Level 20 | Nuri gets golden wings | Varies |

**Key principle:** Changes must come FASTER for young learners than for older kids. A 5-year-old will not wait 6 months for a new accessory. Visible change should happen within the first week.

**Customization (earned):** After certain milestones, the child can CHOOSE Nuri's accessory color:
- "Nuri got a new scarf! What color should it be?" -- [Red] [Blue] [Purple] [Green]
- This increases ownership and attachment.

### 7.3 Simplified Badge System

Instead of dozens of small badges (overwhelming for a 5-year-old), Year 1-2 children have **12 mega-badges per year** -- one per subject per term, plus bonus badges.

| Badge | How to Earn | Visual |
|-------|-----------|--------|
| Maths Explorer | Complete 20 maths questions in a term | Large golden calculator icon |
| Word Wizard | Complete 20 English questions in a term | Large golden book icon |
| Science Star | Complete 20 science questions in a term | Large golden magnifying glass |
| Arabic Champion | Complete 20 Arabic questions in a term | Large golden Arabic letter |
| Story Seeker | Complete 20 religion questions in a term | Large golden dove icon |
| Time Traveler | Complete 20 history questions in a term | Large golden clock icon |
| Super Streak | 5-day streak | Large flame icon |
| Nuri's Best Friend | 30 total sessions | Nuri hugging the child's avatar |
| Try Hard Hero | Complete a session where they struggled | Heart with muscles |
| Voice Star | Answer 20 questions by speaking | Microphone with stars |
| Brave Explorer | Try a "Challenge Me" question | Shield icon |
| Perfect Week | Practice every day for a week | Golden crown |

Badges are displayed large (120px+), one at a time with a full celebration animation when earned. No badge gallery that makes the child feel they're "missing" badges.

### 7.4 No Leaderboards

Leaderboards are **completely absent** for Years 1-2. Social comparison at this age:
- Creates anxiety in children who are behind
- Shifts motivation from intrinsic ("I love learning") to extrinsic ("I need to beat others")
- Can damage the self-concept of early learners

**What replaces leaderboards:**
- "Nuri's Friendship Circle" -- the child sees their avatar and Nuri together, with accessories they've earned. No other children visible.
- If siblings use the app, they EACH see their own Nuri independently. No comparisons.

### 7.5 Celebration Animations

For Years 1-2, celebrations are MORE dramatic and MORE frequent than for older kids:

| Event | Celebration Level |
|-------|------------------|
| Correct answer (easy) | Small: 1-2 stars burst, happy chime |
| Correct answer (hard) | Big: Full confetti, Nuri dances, fanfare |
| Sticker earned | Medium: Sticker peels off with sparkle, satisfying sound |
| Badge earned | Large: Full-screen animation, Nuri jumps and cheers, gold particles |
| Session complete | Large: Confetti rain, Nuri waves, "You did it!" banner |
| Streak milestone | Large: Fireworks animation, Nuri wears a party hat |
| Nuri evolution | Extra Large: Screen darkens, spotlight on Nuri, dramatic reveal of new accessory, child cheers |

Animations are skippable (tap to skip) for children who want to move on, but they play fully by default.

---

## 8. Parent Controls for Young Learners

All parent controls are behind a **parent gate** (a simple math problem that a 5-7 year old cannot solve, e.g., "What is 42 + 37?"). This prevents children from accidentally changing settings.

### 8.1 Session Time Limit

- **Default:** 15 minutes per day (Year 1), 20 minutes per day (Year 2)
- **Adjustable range:** 5 minutes to 60 minutes
- **Per-session limit:** Can limit individual sessions (e.g., max 10 minutes per session, multiple sessions allowed per day)
- **Visual for child:** Nuri gently says "Time to rest!" when limit is reached. No visible countdown timer (that creates pressure).

### 8.2 Content Difficulty Override

- Parent can view the system's assessed level for each subject
- Parent can manually adjust up or down: "My child is ahead in maths" or "They need more support in Arabic"
- Override applies immediately to question selection
- System continues to adapt around the override (but won't drop below the parent's floor or above their ceiling)

### 8.3 Daily Usage Notifications

- **End of session summary** (push notification or email):
  - "Kareem practiced for 12 minutes today. He worked on counting and did great with numbers up to 10!"
  - Tone is always warm and encouraging, even in parent reports
- **Weekly summary:**
  - Total time spent per subject
  - Topics covered
  - Strengths highlighted
  - Areas where more practice would help (phrased constructively)
- **Achievement notifications:**
  - "Kareem earned the 'Word Wizard' badge today!"
  - "Kareem's Nuri got a new scarf! Ask him to show you!"

### 8.4 Bedtime Mode

- Parent sets a bedtime (e.g., 7:30 PM)
- 15 minutes before bedtime, Nuri gently winds down:
  > "It's almost bedtime! Let's finish up with one last question..."
- At bedtime, the app transitions to a locked state:
  > Nuri yawns and falls asleep on screen: "Nuri is sleeping now. See you tomorrow!"
  > App is non-interactive until the next morning (parent-set wake time)
- Override: Parent can unlock temporarily ("10 more minutes tonight")

### 8.5 Reading Level Setting

For on-screen text, parents can adjust the reading complexity:

| Setting | Effect |
|---------|--------|
| Minimal Text | Absolute minimum on screen. Nuri speaks everything. For non-readers. |
| Standard (default) | Age-appropriate text with voice support. |
| More Text | Slightly more text on screen for advanced readers. Voice still available on tap. |

This setting is independent of curriculum difficulty -- a child can be doing Year 2 maths but with Year 1 reading level for the interface text.

---

## 9. Accessibility

### 9.1 Color-Blind Friendly Design

- **Never rely on color alone** to convey information
- Correct/incorrect feedback uses **icons + color + sound + voice** (four channels)
- Answer options use **shape indicators** in addition to color (e.g., circle for A, square for B, triangle for C)
- Charts and data visualizations use **patterns** (stripes, dots, crosshatch) in addition to colors
- All color combinations pass WCAG 2.1 AA contrast ratios (minimum 4.5:1 for text, 3:1 for large text)

### 9.2 Screen Reader Compatibility

- All interactive elements have proper ARIA labels
- Images have descriptive alt text: not "image1.png" but "Three red apples on a table"
- Nuri's voice output complements (doesn't conflict with) screen reader output
- Focus management follows logical question flow
- Custom drag-and-drop has keyboard/switch alternatives (select, then tap destination)

### 9.3 Adjustable Voice Speed

- **Slower (0.75x):** For children who need more processing time, non-native speakers
- **Normal (1.0x):** Default
- **Slightly faster (1.15x):** For children who find the default pace slow
- Speed applies to all of Nuri's speech (questions, feedback, instructions)
- Parent-controlled (child cannot change this to prevent accidental adjustment)

### 9.4 High Contrast Mode

- Toggle in parent settings
- Increases border widths, darkens text, increases button contrast
- Background switches to white with black text
- Nuri remains in color (emotional attachment should not be compromised)
- All interactive elements get thicker borders (3px minimum)

### 9.5 Left-Handed Support

- Drag-and-drop targets accept interaction from any direction (no "drag left to right only" activities)
- Mic button can be repositioned (left or right side of screen)
- Number pad layout works equally well for left and right hands
- No UI element assumes right-hand dominance
- All swipe gestures work in both directions

### 9.6 Motor Skill Accommodations

- Extended tap/hold times (configurable: 200ms to 800ms to register a tap)
- Larger dead zones between interactive elements (prevents accidental taps)
- Drag-and-drop has generous snap-to-target radius (item snaps when within 40px of target, not just on-target)
- "Shake to undo" if child accidentally moves something
- All drag activities have a tap-to-select alternative ("Tap the item, then tap where it goes")

---

## 10. Head-to-Head: Nuri vs IXL for Ages 5-7

This is the competitive positioning matrix. Every row represents a dimension where IXL fails this age group and Nuri must win.

| Dimension | IXL (Ages 5-7) | Nuri (Ages 5-7) | Why Nuri Wins |
|-----------|----------------|-----------------|---------------|
| **Input method** | Text fields, typed answers, small buttons | Voice-first, large tap targets, visual number pad | A 5-year-old cannot type "seventeen." They can say it. |
| **Reading requirement** | All questions require reading ability | Nuri reads everything aloud automatically | Non-readers are completely excluded from IXL. Not from Nuri. |
| **Emotional feedback (wrong)** | Red X, score drops, anxiety-inducing | "Almost! Let's try together..." with gentle tone | IXL punishes. Nuri teaches. |
| **Emotional feedback (right)** | Green checkmark, score increments | Confetti, Nuri dances, proportional celebration | IXL is clinical. Nuri is joyful. |
| **Character/personality** | None. No mascot, no voice, no personality. | Nuri the owl -- beloved companion who reacts, speaks, evolves | Children form emotional bonds with Nuri. IXL is a worksheet. |
| **Session design** | Open-ended: drill until SmartScore 100 | 10-15 minute designed sessions with positive endings | IXL creates burnout. Nuri respects attention spans. |
| **Scoring pressure** | SmartScore visible, drops on wrong answers | No visible scoring. Internal tracking only. Pure encouragement. | SmartScore causes tears in 5-year-olds. Literally. |
| **Visual design** | Text-heavy, utilitarian, small fonts | Illustration-rich, large buttons, warm colors, Nuri always present | IXL looks like a tax form. Nuri looks like a game. |
| **Frustration handling** | No detection, no intervention | Auto-detects struggle, reduces difficulty, offers brain breaks | IXL keeps hammering. Nuri adapts. |
| **Arabic support** | No Arabic at all | Full Arabic with diacritics, voice, culturally appropriate content | IXL doesn't serve this market. Period. |
| **Religion/cultural** | No religion content | Christian religion curriculum with story-based delivery | Nuri serves the whole child, not just academic skills. |
| **Parental insight** | Detailed but clinical dashboards | Warm, encouraging parent reports with actionable suggestions | IXL reports feel like report cards. Nuri reports feel like a proud teacher. |
| **Voice interaction** | None | Full speech-to-text and text-to-speech in English and Arabic | In 2026, an ed-tech app with no voice is a relic. |
| **Gamification** | Awards/certificates (abstract, infrequent) | Stickers every 3 questions, Nuri evolves visually, dramatic celebrations | IXL's rewards are too infrequent and abstract for a 5-year-old. |

### The Bottom Line

IXL is a powerful drill-and-practice platform built for school-age children who can already read and handle abstract feedback systems. It was never designed for 5-year-olds, and it shows.

Nuri is designed from the ground up for this age group. Voice-first interaction, emotional safety, a beloved mascot companion, culturally relevant content in Arabic and English, and session design that respects tiny attention spans.

A parent choosing between IXL and Nuri for their 5-year-old should find the decision obvious within 30 seconds of their child using Nuri.

---

## Implementation Priority

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 (MVP) | Voice-first question delivery (Nuri reads everything) | Without this, the app doesn't work for 5-year-olds at all |
| P0 (MVP) | Large tap targets + simplified UI | Core usability requirement |
| P0 (MVP) | Emotional feedback system (no "wrong," proportional celebrations) | Core emotional safety |
| P0 (MVP) | Session time management (10-15 min sessions, positive endings) | Without this, parents won't trust the app |
| P0 (MVP) | Year 1 Maths and English content with illustrations | Minimum viable content |
| P1 (Fast Follow) | Voice input (child speaks answers) | High-impact but technically complex |
| P1 (Fast Follow) | Arabic with diacritics | Critical for target market but requires specialized content |
| P1 (Fast Follow) | Sticker rewards + Nuri evolution | Primary motivator for retention |
| P1 (Fast Follow) | Parent controls (time limits, bedtime mode) | Builds parent trust |
| P2 (v1.1) | Frustration detection + automatic difficulty adjustment | Important for engagement but requires data |
| P2 (v1.1) | Drag-and-drop activities | Enriches question types |
| P2 (v1.1) | Year 1 Science, Religion, History content | Expands subject coverage |
| P2 (v1.1) | Accessibility features (color-blind, screen reader, etc.) | Essential but can follow core launch |
| P3 (v1.2) | Year 2 full content + voice-to-text transition strategy | Builds on Year 1 foundation |
| P3 (v1.2) | Brain break mini-games | Nice-to-have for engagement |
| P3 (v1.2) | Badge system | Motivator but stickers + Nuri evolution come first |

---

*This spec should be read alongside studybuddy-spec.md (core product spec), studybuddy-features-part2.md (extended features), and studybuddy-features-part3.md (deep learning + emotional adaptation). The young learners experience is not a separate product -- it is a specialized mode within StudyBuddy that activates when a child's profile is set to Year 1 or Year 2.*
