# Regent International School Feedback — Action Plan

## Source
- **Reviewer:** Claire Rowland, Regional Academic Director
- **Institution:** Regent International School, West New Mansoura
- **Affiliations:** Cambridge Assessment, British Council, Oxford, Pearson
- **Date:** April 2026

## Positive Feedback
- Parent dashboard is a good feature for monitoring and individual needs
- From a parent perspective: explains topics simply, parents don't need curriculum knowledge
- Homework helper uses Socratic method well in maths

---

## Issue #1: Too Text-Heavy, No Visuals (CRITICAL)

**Feedback:** "You are relying on 2 main learning styles: reading or listening. If a student likes images, diagrams, visuals the site offers limited engagement."

**Root cause:** Nuri is a chat interface — all content is text + voice. No inline images, diagrams, or interactive visual elements.

**Fixes:**
- Add inline images to learn mode — shapes shown as shapes, plants shown as plant diagrams, scales shown as actual scales
- Quiz questions should use images as options where appropriate (e.g., "Put these pictures in order" for plant growth)
- AI image generation or curated image library for curriculum-relevant visuals
- For maths: show actual number lines, scales, geometric shapes — not describe them in text
- For science: show diagrams of life cycles, food chains, body parts — not just text descriptions
- Claire's specific example: "interpret scales" should show a visual scale with an arrow, asking "what number is here?" — not a text description of a scale

**Scope:** Significant UI work. Need an image/visual component system embedded in the chat interface. Consider: SVG generation for simple diagrams (shapes, number lines, scales), curated image library for curriculum topics, and AI-generated images for contextual illustrations.

---

## Issue #2: Year 1 Counting — Dots Too Small, Too Much Talk (CRITICAL)

**Feedback:** "The dots are small, close together, this age students would touch them. More time on explanations than it takes to count 9 dots. Year 1 students would lose interest quickly."

**Root cause:** One-size-fits-all interaction pattern. Year 1 needs doing, not explaining.

**Fixes:**
- Make counting objects large, colorful, spaced apart — full-width on mobile
- Kids tap each object as they count — tap highlights it + plays a sound + shows running number
- Reduce Nuri's talk for Year 1 math: current ~80% talk / 20% practice should flip to ~20% talk / 80% practice
- AI prompt adjustment: for Year 1-2, Nuri should use fewer words, shorter sentences, and more interactive doing
- Different interaction patterns per year group — younger = more manipulatives, less explanation

---

## Issue #3: Voice Quality and Audio Controls (CRITICAL)

**Feedback:** "The voice is very monotone... I found it very irritating and turned it off." Also: audio toggle resets between messages, reads "IT" as "I-T", uses child's name in every sentence.

**Fixes:**
- **Better TTS voice:** Evaluate ElevenLabs, Azure Neural TTS, Google Cloud TTS for more natural child-friendly voices with genuine intonation
- **Reduce name usage:** Modify AI prompt to use child's name every 3-4 exchanges, not every sentence
- **Audio toggle persistence:** Bug fix — toggle state must persist across the entire session until user changes it. Currently resets when a new message starts.
- **Quiz audio option:** Add a speaker icon on each quiz question — read aloud on demand, not auto-read. Let user choose.
- **Fix pronunciation:** "IT" read as "I-T" means TTS is spelling instead of reading. Pre-process text to handle common words that TTS misinterprets.
- **Strip markdown from TTS:** Voice should never read asterisks, hashes, or other formatting characters.

---

## Issue #4: No Engagement Hooks (HIGH)

**Feedback:** "After the first few uses student engagement would be low because there is nothing to keep them interested... needs avatars, animation, motivations e.g. coins."

**Fixes:**
- **Avatar system:** Kids create/customize their own character
- **Coin/reward economy:** Earn coins through learning, spend on hints, avatar customization, mini-games
- **Visual celebrations:** Correct answers trigger animations/confetti, not just text excitement
- **Progress map:** Visual adventure/journey map showing progress through topics (game world feel)
- **Daily streak visuals:** More compelling than current streak counter
- **Mini-games:** Quick, subject-related games between learning sessions that feel like play

**Note:** Nuri already has XP, levels, streaks, and badges. The issue is they're not visually compelling enough. The gamification engine exists — the visual reward layer needs upgrading.

---

## Issue #5: Teacher Dashboard Missing (HIGH)

**Feedback:** "You need a teacher dashboard where we could set tasks according to the objective being taught that week, see student engagement, scores and feedback, class analysis and suggested next steps."

**What to build:**
- **Weekly objective setting:** Teacher selects topics/objectives to focus on this week per class or per student
- **Student engagement view:** Time spent, sessions completed, streak data per student
- **Scores and accuracy:** Per student, per subject, per topic — drill-down capability
- **Class analysis:** Aggregate view — which topics the class struggles with vs. mastered
- **Suggested next steps:** AI-generated recommendations ("5 students struggled with fractions — revisit equivalent fractions")
- **Assignment setting:** Teacher assigns specific learn/quiz topics to students or whole class
- **Exportable reports:** For parent meetings and school reports

**Note:** This is different from the Parent Dashboard (which shows one child's progress). The Teacher Dashboard shows the whole class and enables the teacher to direct learning.

---

## Issue #6: Markdown Artifacts Showing (HIGH)

**Feedback:** "Why does the written have * throughout? This is not good writing examples for students."

**Root cause:** AI outputs markdown (`**bold**`, `*italic*`, `#heading`) but the frontend shows raw markdown instead of rendered formatting in some contexts.

**Fixes:**
- **Audit all message rendering paths** — ensure markdown is parsed and rendered as formatted text everywhere (bold appears bold, not `**bold**`)
- **Strip markdown from TTS input** — voice should never read formatting characters
- **Consider suppressing markdown in AI output** for younger year groups — Year 1-2 don't benefit from bold/italic emphasis in text

---

## Issue #7: Quiz Answer Accuracy (CRITICAL)

**Feedback:** Multiple specific examples of wrong answers:
- Recipe question: D marked correct but has redundant grammar ("mix" + "together"). C is the correct answer.
- Detective sentence: Both C and D are valid. Need multi-answer support or more specific questions.
- Science Y1: C is a valid partial answer (would get 1 point in real assessment) alongside D (2 points).
- Explanation text sometimes describes a different answer than the one marked correct.

**Fixes:**
- **Quiz validation system:** Before serving a question, validate that the marked answer is unambiguously correct
- **Support partial credit / multi-answer:** Some questions legitimately have multiple correct answers — allow selecting multiple and award partial credit
- **More specific question stems:** Instead of "What needs to be fixed?" use "Which word needs to change to an adverb?"
- **AI prompt improvement:** Add explicit instructions — "Ensure exactly ONE unambiguous correct answer. If multiple could be correct, rephrase to be more specific. Double-check that the explanation matches the marked answer letter."
- **Human review pipeline:** Build a question bank review system where curriculum-critical questions are reviewed by an educator before being served
- **Answer-explanation consistency check:** Automated check that the explanation text references the same answer letter that is marked correct

---

## Issue #8: Arabic/Religion/Social Studies in Wrong Language (CRITICAL)

**Feedback:** "Arabic, Religion and Social Studies delivered in English — doesn't address MOE requirements. Only Christian Religion — no Islam."

**Fixes:**
- **Arabic subject must be 100% in Arabic** — AI prompt for Arabic lessons outputs Arabic text with Arabic audio
- **Add Islamic Religion** — students select their religion during profile setup (Christian or Islamic). Both curricula available, or remove religion entirely.
- **Profile setting for Arabic level:** "Arabic as First Language (MOE)" or "Arabic as Second Language" — different curriculum, difficulty, and language of delivery
- **Social Studies:** If targeting Egyptian MOE schools, deliver in Arabic aligned to MOE. If targeting international schools, English is fine but label clearly.
- **Rename "History" to "Humanities"** — Cambridge combines History and Geography. Simple label change that shows curriculum awareness.
- **Arabic quiz improvements:** Answers must be in Arabic with full Arabic explanations for first-language Arabic learners

---

## Issue #9: Language Too Complex for Young ESL Learners (HIGH)

**Feedback:** "'I'm genuinely curious what you think' is ambiguous for a 5-year-old ESL learner."

**Claire's suggestion:** "I'm genuinely curious what you think, is sh 1 sound or 2?" — lead with rich English for exposure, end with clear explicit question for accessibility.

**Fixes:**
- **Age-adaptive language in AI prompts:** Enforce simpler, more explicit language for younger year groups
  - Year 1-2: Short sentences, simple words, always restate the question explicitly at the end
  - Year 3-4: Slightly more complex, still end with clear specific question
  - Year 5-6: Can use richer language
- **ESL awareness in system prompt:** "Many students are learning English as a second language. Always end with a clear, simple question. Never use idioms, slang, or ambiguous phrasing with Year 1-2 students."
- **Claire's pattern is excellent:** Rich English first (exposure) + explicit question at the end (accessibility). Encode this in the prompt.

---

## Issue #10: Homework Helper Gives Answers Too Quickly (MEDIUM)

**Feedback:** "It only took 2 entries before it gave me the answer. Is the purpose to give the answer or to help?"

**Fixes:**
- **Stricter Socratic guardrails:** Nuri should NEVER give the direct answer to the homework question
- **Worked example approach:** Explain the concept, give a DIFFERENT worked example, then ask the student to apply it to their own question
- **Minimum interaction threshold:** Require 3-4 exchanges of genuine student thinking before strong hints
- **Audit English homework helper:** Currently works well in maths (Socratic) but gives away answers in English. Align English prompt to match maths approach.
- **Explicit prompt instruction:** "Never solve the student's actual homework question. Give a parallel example that teaches the same skill, then let them apply it."

---

## Priority Order for Implementation

### P0 — Fix Immediately (Quick Wins That Fix Broken Things)
1. **Markdown rendering** — parse and render properly, strip from TTS (#6)
2. **Audio toggle persistence** — bug fix, toggle state persists across session (#3)
3. **Quiz answer validation** — audit existing questions, fix wrong answers (#7)
4. **Homework helper guardrails** — tighten Socratic prompt for English (#10)

### P1 — Fix This Sprint (High Impact on Core Experience)
5. **Language complexity per year group** — rewrite AI prompts for Year 1-2 simplicity (#9)
6. **Voice quality + name frequency** — evaluate better TTS, reduce name usage (#3)
7. **Year 1 counting UX** — large touchable objects, less talk, more doing (#2)
8. **TTS pronunciation fixes** — "IT" as "I-T", markdown read aloud (#3)

### P2 — Build Next (Major Features)
9. **Visual/image system** — inline images, visual quizzes, diagrams (#1)
10. **Arabic/Religion delivered in Arabic** — bilingual AI output, Islam option (#8)
11. **Teacher dashboard** — weekly objectives, class analysis, assignments (#5)
12. **Engagement system upgrade** — avatars, coins, animations, progress map (#4)

---

## Response to Claire Rowland

Suggested response to send back to Regent:

> Dear Claire,
>
> Thank you for your thorough and constructive review of Nuri. Your feedback from both the parent and school perspectives is exactly what we needed to hear, and we're taking every point seriously.
>
> We've created a detailed action plan addressing all 10 issues you identified. The key changes we're prioritizing:
>
> 1. Adding visual learning support (images, diagrams, interactive elements)
> 2. Fixing the audio experience (better voice, persistent toggle, reduced name usage)
> 3. Improving quiz accuracy and supporting partial credit
> 4. Simplifying language for younger/ESL learners
> 5. Building a Teacher Dashboard for school adoption
> 6. Adding Islamic Religion and delivering Arabic subjects in Arabic
> 7. Strengthening homework helper guardrails
>
> We would welcome the opportunity to share an updated version with your team once these improvements are implemented. Your expertise in Cambridge curriculum delivery for the Egyptian market is invaluable to us.
>
> Would you be open to an ongoing advisory relationship as we develop Nuri further?
