# Regent Feedback P0 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 4 highest-priority issues identified by Regent International School's review — markdown rendering, audio toggle persistence, quiz accuracy, and homework helper guardrails.

**Architecture:** Four independent fixes touching frontend rendering (ChatBubble), voice state management (LearnPage + useVoice), backend AI prompts (claude.js quiz generation), and backend AI prompts (homework.js Socratic guardrails). No shared dependencies — can be implemented in any order.

**Tech Stack:** React 18, Web Speech API, Anthropic Claude API (server-side prompts)

---

### Task 1: Fix Markdown Rendering in Chat Messages

**Files:**
- Modify: `client/src/components/ChatBubble.jsx`
- Modify: `client/package.json` (add dependency)

- [ ] **Step 1: Install react-markdown**

Run:
```bash
cd /Users/bistrocloud/Documents/nuri/client && npm install react-markdown
```

Expected: `react-markdown` added to `package.json` dependencies.

- [ ] **Step 2: Update ChatBubble to render markdown**

In `client/src/components/ChatBubble.jsx`, replace the entire file with:

```jsx
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import NuriOwl from './NuriOwl';
import SpeakerButton from './SpeakerButton';

export default function ChatBubble({ message, isNuri, subjectColor, owlState, owlLevel }) {
  return (
    <motion.div
      className={`flex ${isNuri ? 'justify-start' : 'justify-end'} mb-3`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isNuri && (
        <div className="shrink-0 mt-1 mr-2">
          <NuriOwl size="sm" state={owlState || 'idle'} level={owlLevel || 1} />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isNuri
              ? 'bg-white shadow-md text-gray-800 rounded-tl-sm'
              : 'text-white rounded-tr-sm'
          }`}
          style={!isNuri ? { backgroundColor: subjectColor || '#A855F7' } : undefined}
        >
          {isNuri ? (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 prose-headings:text-base">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
        {isNuri && message && (
          <div className="pl-1">
            <SpeakerButton text={message} size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

Key changes:
- Import `ReactMarkdown`
- Nuri messages render through `<ReactMarkdown>` with Tailwind `prose` classes
- User messages stay as plain `<p>` (users don't write markdown)
- `prose-sm` keeps text size consistent, `max-w-none` prevents width constraints

- [ ] **Step 3: Verify rendering**

Run:
```bash
cd /Users/bistrocloud/Documents/nuri/client && npm run dev
```

Test: Open the app, start a learn session. Nuri's messages should show **bold text** as bold, *italic* as italic, and bullet lists as actual lists. No raw `**` or `*` characters visible.

- [ ] **Step 4: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add client/src/components/ChatBubble.jsx client/package.json client/package-lock.json
git commit -m "fix: render markdown in Nuri chat messages

Nuri's AI responses contain markdown (bold, italic, lists, headings)
but were displayed as raw text with visible ** and * characters.
Now uses react-markdown with Tailwind prose classes for proper
rendering. User messages remain plain text.

Fixes Regent feedback issue #6: markdown artifacts showing."
```

---

### Task 2: Fix Audio Toggle Persistence + Reduce Name Overuse

**Files:**
- Modify: `client/src/pages/LearnPage.jsx`
- Modify: `server/src/services/claude.js:41`

- [ ] **Step 1: Add audio mute state to LearnPage**

In `client/src/pages/LearnPage.jsx`, find the state declarations near the top of the component (around line 15-20). Add after the existing state declarations:

```jsx
// Audio preference — persists across the session
const [audioMuted, setAudioMuted] = useState(() => {
  return localStorage.getItem('nuri_audio_muted') === 'true';
});
```

- [ ] **Step 2: Create toggle handler**

Add this function after the state declarations:

```jsx
function toggleAudio() {
  setAudioMuted(prev => {
    const newVal = !prev;
    localStorage.setItem('nuri_audio_muted', String(newVal));
    if (newVal) {
      window.speechSynthesis?.cancel();
    }
    return newVal;
  });
}
```

- [ ] **Step 3: Guard auto-speak with mute check**

In `client/src/pages/LearnPage.jsx`, find the streaming auto-speak block (around lines 156-182). Wrap both `speak()` calls with the mute check.

Replace line 162:
```jsx
                  speak(sentence, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
```
With:
```jsx
                  if (!audioMuted) speak(sentence, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
```

Replace line 178:
```jsx
            speak(remaining, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
```
With:
```jsx
            if (!audioMuted) speak(remaining, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
```

- [ ] **Step 4: Add mute toggle button to the UI**

In `client/src/pages/LearnPage.jsx`, find the header/toolbar area. Add a mute toggle button near the existing navigation. Look for the `ArrowLeft` back button in the JSX and add after it:

```jsx
<button
  onClick={toggleAudio}
  className="p-2 rounded-full hover:bg-white/20 transition-colors"
  title={audioMuted ? 'Turn audio on' : 'Turn audio off'}
>
  {audioMuted ? (
    <VolumeX size={20} className="text-white" />
  ) : (
    <Volume2 size={20} className="text-white" />
  )}
</button>
```

Add to the imports at the top of the file:
```jsx
import { ArrowLeft, Send, Sparkles, Lightbulb, Puzzle, Volume2, VolumeX } from 'lucide-react';
```

- [ ] **Step 5: Reduce name overuse in AI prompt**

In `server/src/services/claude.js`, line 41, change:

```javascript
- Use the child's name A LOT: "Wow ${profile.name}, you're on fire today!"
```

To:

```javascript
- Use the child's name occasionally (every 3-4 messages, not every sentence): "Wow ${profile.name}, you're on fire today!"
```

- [ ] **Step 6: Verify**

Run the app. Test:
1. Start a learn session — audio plays by default
2. Tap the mute button — audio stops immediately, icon changes to VolumeX
3. Send a new message — Nuri responds with text only, no voice
4. Navigate away and come back — mute state persists (stored in localStorage)
5. Tap unmute — audio resumes for next message
6. Nuri should use the child's name less frequently

- [ ] **Step 7: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add client/src/pages/LearnPage.jsx server/src/services/claude.js
git commit -m "fix: audio toggle persists across session + reduce name overuse

Audio mute state stored in localStorage, survives page navigation
and new messages. Mute button added to learn page header with
Volume2/VolumeX icons. Auto-speak respects mute state.

Also reduces child's name usage from 'A LOT' to 'every 3-4
messages' in the system prompt per Regent feedback.

Fixes Regent feedback issues #3 (audio toggle) and partial #3
(name frequency)."
```

---

### Task 3: Improve Quiz Answer Accuracy

**Files:**
- Modify: `server/src/services/claude.js` (lines 263-318, quiz system prompt)

- [ ] **Step 1: Strengthen the quiz generation prompt**

In `server/src/services/claude.js`, find the quiz system prompt (starts around line 263). Replace the `VERIFICATION` and `RESPOND` sections (lines 315-318) with an expanded version.

Find this text (around line 315):
```
VERIFICATION: For maths, solve it yourself. The answer MUST be correct.

RESPOND WITH ONLY THIS JSON:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "${correctPosition}", "explanation": "one simple sentence explaining why"}`;
```

Replace with:
```
VERIFICATION — DO THIS BEFORE RESPONDING:
1. For maths: solve the problem yourself step by step. The answer MUST be mathematically correct.
2. For English: check every option for grammatical correctness. If two options are both grammatically valid, rephrase the question to be more specific (e.g., "Which word is an adverb?" instead of "What needs to be fixed?").
3. For all subjects: read the question and ALL four options. Confirm that ONLY the correct answer is unambiguously right. If another option could also be considered correct, change that option or make the question more specific.
4. Check that no option contains redundant words (e.g., "mix together" — "mix" already means "combine together", so this is poor grammar).
5. Verify that the explanation describes WHY the correct answer (${correctPosition}) is right — not a different option.

CRITICAL: There must be exactly ONE correct answer. If you cannot make the question unambiguous with 4 options, simplify the question.

RESPOND WITH ONLY THIS JSON:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "${correctPosition}", "explanation": "one simple sentence explaining why ${correctPosition} is correct"}`;
```

- [ ] **Step 2: Verify the fix**

Run:
```bash
cd /Users/bistrocloud/Documents/nuri && node -e "
const { generateQuizQuestion } = require('./server/src/services/claude');
// This will fail if the module doesn't export — that's fine, we just check syntax
console.log('Module loads OK');
" 2>/dev/null || echo "Check module exports"
```

Start the server and test quiz generation:
```bash
cd /Users/bistrocloud/Documents/nuri/server && npm run dev
```

Test: Start a quiz in Year 6 English. Check that:
- The marked answer is unambiguously correct
- The explanation references the correct answer letter
- No options have redundant grammar

- [ ] **Step 3: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add server/src/services/claude.js
git commit -m "fix: strengthen quiz answer accuracy validation

Expanded verification steps in quiz generation prompt:
- Maths: solve step by step before answering
- English: check all options for grammatical validity
- All subjects: confirm only ONE unambiguous correct answer
- Check for redundant words in options
- Verify explanation matches the correct answer letter
- If ambiguous, simplify the question

Fixes Regent feedback issue #7: quiz answer accuracy."
```

---

### Task 4: Strengthen Homework Helper Socratic Guardrails

**Files:**
- Modify: `server/src/services/homework.js` (lines 212-220, golden rules)

- [ ] **Step 1: Tighten the golden rules**

In `server/src/services/homework.js`, find the `GOLDEN RULES` section (around line 212). Replace lines 212-220:

```javascript
GOLDEN RULES:
1. NEVER just say "What's the first step?" "What's the next step?" — that's boring and robotic
2. NEVER give the answer directly — but DO guide strongly. A stuck child needs help, not more questions.
3. Talk like a friend, not a teacher. Short sentences. Fun comparisons. Use ${profile.name}'s name.
4. If they're wrong: "Ooh interesting! But check this — if [their logic], then [contradiction]. See what I mean?"
5. If stuck after 2 tries: give a BIG hint or a worked example with different numbers, then ask them to try the original
6. Max 3-4 sentences per reply. Kids zone out with walls of text.
7. Use age-appropriate words ONLY. This child is ${age} years old.
8. Be playful! "I bet you can crack this one... 🤔" "BOOM you got it! 🎉"
```

With:

```javascript
GOLDEN RULES:
1. NEVER just say "What's the first step?" "What's the next step?" — that's boring and robotic
2. ABSOLUTELY NEVER give the actual answer to the homework question. Not after 1 try, not after 5 tries, not ever.
   - Instead: teach the CONCEPT using a DIFFERENT example, then let them apply it to their question.
   - Example: If the homework asks "What is 3 × 7?", do NOT say "21". Instead say "Let's figure out how multiplication works. If you have 2 groups of 5 marbles, that's 2 × 5 = 10 marbles. Now YOUR question has 3 groups of 7. Can you work it out?"
3. Talk like a friend, not a teacher. Short sentences. Fun comparisons. Use ${profile.name}'s name occasionally.
4. If they're wrong: "Ooh interesting! But check this — if [their logic], then [contradiction]. See what I mean?"
5. If stuck after 3 tries: give a BIG hint using a PARALLEL example with different values/words — NEVER the actual answer.
   - Maths: use different numbers. If homework is "3 × 7", show them "2 × 5 = 10" as a worked example.
   - English: use a different sentence. If homework asks about a subordinate clause in sentence A, show them how to find one in sentence B.
   - Science: give a similar scenario. If homework asks about plants, explain using a different organism first.
6. If stuck after 5 tries: walk them through the METHOD step by step using their actual question, but stop JUST BEFORE the final answer and ask them to complete it.
7. Max 3-4 sentences per reply. Kids zone out with walls of text.
8. Use age-appropriate words ONLY. This child is ${age} years old.
9. Be playful! "I bet you can crack this one... 🤔" "BOOM you got it! 🎉"
10. For English grammar questions: NEVER identify which specific words in the homework are the answer. Instead, teach the RULE and let them find it themselves. "Subordinate clauses often start with words like 'if', 'when', 'although' — can you spot one in your sentence?"
```

- [ ] **Step 2: Verify the fix**

Start the server and test homework helper:
1. Upload a homework photo or type a homework question
2. Say "I don't know" — Nuri should explain the concept with a different example, NOT give the answer
3. Say "I still don't know" — Nuri should give a bigger hint with a parallel example, NOT the answer
4. After 5 wrong attempts — Nuri should walk through the method but stop before the final answer
5. Nuri should NEVER reveal the actual answer until the child produces it

- [ ] **Step 3: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add server/src/services/homework.js
git commit -m "fix: homework helper never gives the answer directly

Strengthened Socratic guardrails:
- Absolute rule: never give the actual answer, use parallel examples
- After 3 tries: bigger hints with different values/words
- After 5 tries: walk through method but stop before final answer
- English grammar: teach the rule, don't identify specific words
- Consistent across all subjects (was inconsistent between maths
  and English per Regent feedback)

Fixes Regent feedback issue #10: homework helper gives answers
too quickly."
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run the full app**

```bash
cd /Users/bistrocloud/Documents/nuri
# Terminal 1: server
cd server && npm run dev
# Terminal 2: client
cd client && npm run dev
```

- [ ] **Step 2: Test all 4 fixes**

| Fix | Test | Expected |
|-----|------|----------|
| Markdown | Start learn session, check Nuri messages | Bold is bold, italic is italic, no raw `**` or `*` |
| Audio toggle | Tap mute button, send messages | Audio stops, state persists across navigation |
| Quiz accuracy | Take Year 6 English quiz | Answers are unambiguously correct, explanations match |
| Homework | Upload homework, say "I don't know" 3 times | Nuri guides with examples, never gives the answer |

- [ ] **Step 3: Final commit if any adjustments needed**

```bash
cd /Users/bistrocloud/Documents/nuri
git add -A
git commit -m "fix: final adjustments from Regent P0 testing"
```
