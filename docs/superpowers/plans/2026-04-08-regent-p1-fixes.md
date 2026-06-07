# Regent Feedback P1 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 P1 issues from Regent International School's review — ESL language simplification for young learners, Year 1 counting UX improvements, and TTS pronunciation fixes.

**Architecture:** Three independent fixes: (1) server-side prompt engineering to add year-group-specific language rules, (2) server-side prompt + frontend CSS for Year 1 counting visuals, (3) frontend text preprocessing in the TTS pipeline. No shared dependencies.

**Tech Stack:** React 18, Web Speech API, Anthropic Claude API (server-side prompts), Tailwind CSS

---

### Task 1: ESL Language Simplification for Young Learners

**Problem:** Nuri uses language like "I'm genuinely curious what you think" which is inaccessible to a 5-year-old ESL learner. The prompt has one generic syllable rule but no year-group-specific language enforcement.

**Claire Rowland's suggestion:** Lead with rich English for exposure, end with a clear explicit question: "I'm genuinely curious what you think, is sh 1 sound or 2?"

**Files:**
- Modify: `server/src/services/claude.js` (buildSystemPrompt, lines 48-53 and generateQuizQuestion, lines 310-313)

- [ ] **Step 1: Add year-group-specific language rules to buildSystemPrompt**

In `server/src/services/claude.js`, find these lines (around lines 48-53):

```javascript
RULES:
- ONLY teach objectives listed above — nothing from other years
- If asked beyond their year: "Ooh, big brain question! You'll unlock that in Year [X]. For now..."
- Age-appropriate language for ${ageRange} year olds — if a word has more than 3 syllables, find a simpler one
- Max 3-4 short sentences per response
- Real-world examples kids actually care about (games, animals, food, sports, cartoons)
```

Replace with:

```javascript
RULES:
- ONLY teach objectives listed above — nothing from other years
- If asked beyond their year: "Ooh, big brain question! You'll unlock that in Year [X]. For now..."
- Max 3-4 short sentences per response
- Real-world examples kids actually care about (games, animals, food, sports, cartoons)
${yearGroup <= 2 ? `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}) — CRITICAL:
- This child may be learning English as a second language. Use the SIMPLEST words possible.
- Maximum 1-2 syllable words. No exceptions. "Big" not "enormous". "Show" not "demonstrate".
- Maximum 6-8 words per sentence. Short. Clear. Direct.
- ALWAYS end with an explicit, simple question: "Is it 5 or 6?" not "What do you think?"
- You may use ONE richer English phrase for exposure, but ALWAYS follow it with the simple version: "I'm genuinely curious — is sh ONE sound or TWO sounds?"
- Never use: "genuinely", "curious", "perhaps", "actually", "absolutely", "fascinating", "definitely"
- Never use idioms, sarcasm, or figurative language (no "you're on fire" — they'll think of actual fire)
- For counting/maths: use FEWER words. "Count the dots. How many?" is better than a paragraph of encouragement before the question.
- Praise should be simple: "Yes!", "Great job!", "You got it!" — not long excited sentences.
` : yearGroup <= 4 ? `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}):
- Many students are learning English as a second language.
- Use simple, clear language. If a word has more than 3 syllables, find a simpler one.
- Always end questions with a clear, specific prompt. Not "What do you think?" but "Is the answer 12 or 15?"
- You can use richer vocabulary for exposure, but always follow with a simpler restatement if the concept is complex.
- Avoid idioms and figurative language unless you explain them: "'You're on fire' means you're doing really well!"
` : `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}):
- Age-appropriate language for ${ageRange} year olds — if a word has more than 3 syllables, find a simpler one.
- Students may be ESL learners. Avoid unnecessary jargon. Be clear and direct.
`}
```

- [ ] **Step 2: Add year-group-specific language rules to quiz generation**

In `server/src/services/claude.js`, find these lines (around lines 310-313):

```javascript
LANGUAGE FOR AGE ${ageRange}:
- Use words a ${ageRange} year old uses daily
- No jargon, no technical terms, no Latin/Greek roots
- If you wouldn't hear it on a children's TV show, don't use it
```

Replace with:

```javascript
LANGUAGE FOR AGE ${ageRange}:
- Use words a ${ageRange} year old uses daily
- No jargon, no technical terms, no Latin/Greek roots
- If you wouldn't hear it on a children's TV show, don't use it
${effectiveYear <= 2 ? `- YEAR 1-2 SPECIFIC: Maximum 1-2 syllable words in the question AND options. Maximum 8 words per option. The question should be ONE simple sentence. No complex phrasing.
- Questions must be answerable by a child who is LEARNING English, not fluent in it.` : ''}
```

Note: the quiz function uses `effectiveYear` (not `yearGroup`) which is already defined earlier in the function.

- [ ] **Step 3: Verify**

Start the server and test:
```bash
cd /Users/bistrocloud/Documents/nuri/server && npm run dev
```

Test Year 1 English: Start a learn session for Year 1 English. Nuri's language should be noticeably simpler — short sentences, simple words, explicit questions.

Test Year 5 English: Start a learn session for Year 5 English. Nuri should still use rich, engaging language.

- [ ] **Step 4: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add server/src/services/claude.js
git commit -m "fix: age-adaptive language — simpler English for Year 1-2

Year 1-2: max 1-2 syllable words, 6-8 words per sentence, explicit
questions, no idioms or figurative language, minimal praise text.
Year 3-4: moderate simplification, clear questions, explain idioms.
Year 5-6: standard language with ESL awareness.

Applied to both learn mode (buildSystemPrompt) and quiz generation
(generateQuizQuestion). Implements Claire Rowland's suggestion:
rich English for exposure + explicit simple question at the end.

Fixes Regent feedback issue #9: language too complex for young ESL.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Year 1 Counting UX — Larger Dots, Less Talk

**Problem:** Year 1 maths counting exercises use tiny dots (●●●●●●●●●) that are small and close together. Too much Nuri talk between counting exercises. Claire Rowland: "There is more time spent on explanations between each practice count than it takes to count the 9 dots."

**Approach:** Two changes — (1) tell the AI to use fewer words and bigger visual markers for Year 1 maths, (2) add CSS to make dot/circle characters render larger in Nuri messages.

**Files:**
- Modify: `server/src/services/claude.js` (buildSystemPrompt, add Year 1 maths-specific instructions)
- Modify: `client/src/components/ChatBubble.jsx` (add CSS for large counting dots)

- [ ] **Step 1: Add Year 1 maths-specific prompt instructions**

In `server/src/services/claude.js`, inside the `buildSystemPrompt` function, find the learn mode section. After the existing year-group language rules we added in Task 1, add a maths-specific block. Find the line that starts the learn mode (`if (mode === 'learn')` or the section after the language rules). Add this BEFORE the closing of the prompt:

After the language rules section (the template literal block we added in Task 1), add:

```javascript
${(yearGroup <= 2 && subject === 'maths') ? `
YEAR ${yearGroup} MATHS — SPECIAL RULES:
- For counting exercises: use LARGE emoji circles spaced apart: "🔵  🔵  🔵  🔵  🔵" (with double spaces between)
- NEVER use small dots like ●●●● — they are too small for young children to count on a screen
- Keep your words to a MINIMUM between counting exercises. "Count these:" is enough. Do NOT write a paragraph of encouragement before each counting question.
- Pattern for counting: "Count these: 🔵  🔵  🔵  🔵  🔵  How many?" — that's it. No extra talk.
- After they answer correctly: "Yes! 5! 🎉" — then immediately give the next challenge. Don't over-explain.
- For number recognition: show the number BIG: "# 7" and ask "What number is this?"
- Ratio: 80% doing (counting, tapping, answering), 20% talking. NOT the other way around.
` : ''}
```

- [ ] **Step 2: Add CSS for larger counting emojis in ChatBubble**

In `client/src/components/ChatBubble.jsx`, the Nuri messages now render through ReactMarkdown with prose classes. Add a style rule to make emoji circles render larger. Find the `<div className="prose prose-sm...">` wrapper and add a CSS class:

Find:
```jsx
<div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 prose-headings:text-base">
```

Replace with:
```jsx
<div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 prose-headings:text-base [&_p]:has-emoji-large">
```

Actually, that won't work cleanly. Instead, add an inline style override. A simpler approach — add a global CSS rule. In `client/src/styles/index.css` (or wherever global styles live), add:

Find the global styles file. If it doesn't exist, check `client/src/index.css` or `client/src/App.css`. Add this CSS:

```css
/* Large counting emojis for Year 1-2 maths */
.prose p {
  font-size: inherit;
}
```

Actually, the simplest and most robust approach is to just handle this in the AI prompt (Step 1 already uses large emoji with spacing). The emoji 🔵 renders at text size naturally, which in the prose-sm context is adequate. The spacing (`🔵  🔵  🔵`) is what makes them countable. No CSS change needed — the prompt change in Step 1 handles it.

**Skip this step** — the prompt change in Step 1 is sufficient. The switch from `●` to `🔵` with double-spacing makes the dots large enough and spaced enough for finger counting.

- [ ] **Step 3: Verify**

```bash
cd /Users/bistrocloud/Documents/nuri/client && npm run build
```

Start the app. Test Year 1 Maths learn mode:
- Nuri should use 🔵 emoji with spaces between for counting, not small ● dots
- There should be minimal talk between counting exercises
- The pattern should be: "Count these: 🔵  🔵  🔵  How many?" → child answers → "Yes! 3! 🎉" → next question

- [ ] **Step 4: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add server/src/services/claude.js
git commit -m "fix: Year 1 maths — larger counting dots, less talk

Year 1-2 maths now uses large emoji circles (🔵) with spacing
instead of tiny dots (●●●). Prompt enforces 80% doing / 20%
talking ratio for counting exercises. Pattern: 'Count these:
🔵  🔵  🔵  How many?' — minimal words, maximum practice.

Fixes Regent feedback issue #2: dots too small, too much talk.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: TTS Pronunciation Fixes

**Problem:** The TTS reads "IT" as "I-T" (spelling instead of reading). Uppercase short words are interpreted as acronyms by the Web Speech API. Also, any remaining markdown formatting characters should be stripped.

**Files:**
- Modify: `client/src/hooks/useVoice.js` (text cleaning section, lines 40-49)

- [ ] **Step 1: Add pronunciation fixes to the text cleaning pipeline**

In `client/src/hooks/useVoice.js`, find the text cleaning section (lines 40-49):

```javascript
    // Clean text for natural speech
    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/_{2,}/g, ' blank ')           // Fill-in-the-blank gaps → "blank"
      .replace(/\.{3,}/g, ' blank ')           // ... gaps → "blank"
      .replace(/—/g, ', ')                     // Em dash → pause
      .replace(/\s+/g, ' ')                    // Collapse whitespace
      .substring(0, 1000);
```

Replace with:

```javascript
    // Clean text for natural speech
    const cleanText = text
      .replace(/[#*_~`]/g, '')                 // Strip markdown formatting
      .replace(/\[.*?\]\(.*?\)/g, '')          // Strip markdown links
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')  // Strip emojis
      .replace(/_{2,}/g, ' blank ')            // Fill-in-the-blank gaps → "blank"
      .replace(/\.{3,}/g, ' blank ')           // ... gaps → "blank"
      .replace(/—/g, ', ')                     // Em dash → pause
      // Fix TTS pronunciation: convert short ALL-CAPS words to lowercase
      // so TTS reads them as words, not spelled-out letters (IT→it, OK→ok)
      .replace(/\b([A-Z]{2,4})\b/g, (match) => {
        // Keep actual acronyms that should be spelled out
        const keepUppercase = new Set(['USA', 'UK', 'BBC', 'DNA', 'NASA', 'STEM', 'MCQ', 'PDF']);
        return keepUppercase.has(match) ? match : match.toLowerCase();
      })
      .replace(/\s+/g, ' ')                   // Collapse whitespace
      .substring(0, 1000);
```

Key change: The new regex `\b([A-Z]{2,4})\b` matches 2-4 letter all-caps words and lowercases them (IT→it, OK→ok, BOOM→boom, WAIT→wait, NINE→nine), EXCEPT for known acronyms that should be spelled out (USA, UK, BBC, DNA, etc.).

- [ ] **Step 2: Verify**

```bash
cd /Users/bistrocloud/Documents/nuri/client && npm run build
```

Start the app. Test: start a learn session, let Nuri speak. Words like "IT", "WAIT", "BOOM", "SEVEN" should be spoken as words, not spelled out letter by letter. "USA" and "DNA" should still be spelled out.

- [ ] **Step 3: Commit**

```bash
cd /Users/bistrocloud/Documents/nuri
git add client/src/hooks/useVoice.js
git commit -m "fix: TTS pronunciation — stop spelling short words

Short ALL-CAPS words (IT, OK, BOOM, WAIT) are now lowercased
before TTS so they're read as words, not spelled out letter by
letter. Known acronyms (USA, UK, BBC, DNA, NASA) are kept
uppercase so TTS spells them correctly.

Fixes Regent feedback issue #3: 'IT' read as 'I-T'.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Build and run**

```bash
cd /Users/bistrocloud/Documents/nuri/client && npm run build
cd /Users/bistrocloud/Documents/nuri/server && npm run dev
# In another terminal:
cd /Users/bistrocloud/Documents/nuri/client && npm run dev
```

- [ ] **Step 2: Test all 3 fixes**

| Fix | Test | Expected |
|-----|------|----------|
| ESL Language | Year 1 English learn session | Simple words, short sentences, explicit questions. No "genuinely curious" |
| ESL Language | Year 5 English learn session | Normal rich language, still age-appropriate |
| Year 1 Counting | Year 1 Maths learn session | Large 🔵 emoji with spaces, minimal talk between counts |
| TTS Pronunciation | Listen to Nuri speak "IT is a great word" | Says "it is a great word", not "I-T is a great word" |
| TTS Pronunciation | Listen to Nuri speak "The USA is big" | Says "the U-S-A is big" (spelled out correctly) |

- [ ] **Step 3: Commit if any adjustments needed**

```bash
cd /Users/bistrocloud/Documents/nuri
git add -A
git commit -m "fix: final adjustments from Regent P1 testing

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```
