/**
 * Nuri AI Service — Unified
 *
 * Replaces claude.js, ollama.js, and ai-provider.js.
 * When Vercel AI SDK is installed, routes through generateText/streamText.
 * Falls back to raw Anthropic SDK + Ollama fetch otherwise.
 *
 * Environment:
 *   AI_PROVIDER=claude|ollama   (default: claude)
 *   ANTHROPIC_API_KEY=***
 *   CLAUDE_MODEL=claude-haiku-4-5-20251001
 *   OLLAMA_BASE_URL=http://localhost:11434
 *   OLLAMA_MODEL=llama3.2
 */
'use strict';

const { getTopics, getAgeRange, getCurriculumType } = require('./curriculum');
const { getPersona } = require('./persona');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const AI_PROVIDER = (process.env.AI_PROVIDER || 'claude').toLowerCase();
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// ─── SDK DETECTION ───────────────────────────────────────────────────────────

let _sdkAvailable = undefined; // undefined = unchecked, true/false after first check
function sdkAvailable() {
  if (_sdkAvailable !== undefined) return _sdkAvailable;
  // Ollama always uses raw HTTP — no SDK support
  if (AI_PROVIDER === 'ollama') { _sdkAvailable = false; return false; }
  try {
    require.resolve('ai');
    require.resolve('@ai-sdk/anthropic');
    _sdkAvailable = true;
  } catch (_) {
    _sdkAvailable = false;
  }
  return _sdkAvailable;
}

function resetSdkCheck() { _sdkAvailable = undefined; }

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

const IMG_CATALOG = `circle, cone, cube, cylinder, hexagon, pentagon, rectangle, sphere, square, star, triangle, ant, bat, bear, bee, bird, butterfly, camel, cat, cow, crocodile, deer, dog, dolphin, duck, eagle, elephant, fish, flamingo, frog, giraffe, gorilla, hedgehog, horse, lion, lizard, monkey, mouse, owl, parrot, peacock, penguin, pig, rabbit, rooster, scorpion, sheep, snail, snake, spider, swan, turtle, whale, zebra, clownfish, coral, crab, jellyfish, lobster, octopus, pufferfish, seal, shark, shell, shrimp, squid, airplane, bag, ball, bed, bicycle, boat, book, bus, camera, car, chair, clock, cup, door, globe, guitar, hammer, hat, house, key, lamp, pencil, phone, rocket, scissors, ship, train, truck, umbrella, window, apple, banana, bread, broccoli, cake, carrot, cheese, cherries, chicken, chocolate, cookie, corn, egg, grapes, hamburger, icecream, lollipop, milk, orange, peach, pineapple, pizza, popcorn, potato, rice, strawberry, taco, tomato, water, watermelon, beach, cactus, cloud, clover, desert, flower, forest, hibiscus, leaf, lightning, moon, mountain, mushroom, palmtree, rain, rainbow, rose, sea, seedling, snowflake, sun, tree, volcano, bone, brain, ear, eye, foot, hand, heart, lungs, mouth, muscle, nose, teeth, airport, bank, castle, church, construction, factory, fountain, gasstation, home, hospital, hotel, mosque, postoffice, school, shop, stadium, store, cook, cycle, dance, exercise, music, paint, play, read, run, sing, sleep, swim, walk, write, battery, blood, chemistry, dna, earth, gear, lightbulb, magnet, microscope, plant, seed, telescope, testtube, thermometer`;

function buildSystemPrompt(profile, subject, mode, learningStyle) {
  const yearGroup = profile.year_group;
  const ageRange = getAgeRange(yearGroup);
  const curriculumType = getCurriculumType(subject);
  const topics = getTopics(subject, yearGroup);

  if (!topics) {
    throw new Error(`No curriculum data for subject "${subject}" year group ${yearGroup}`);
  }

  const curriculumBlock = topics.map(t => {
    const objectives = (t.objectives || []).join('; ');
    const codes = (t.codes || []).length > 0 ? ` [${t.codes.join(', ')}]` : '';
    return `- ${t.name}${codes}: ${objectives}`;
  }).join('\n');

  let prompt = `You are Nuri, a wise, witty, and lovable owl tutor. You're ${profile.name}'s best friend who happens to know EVERYTHING about ${subject}. You're funny, playful, and you make learning feel like an adventure — never like school.

You're helping ${profile.name} (Year ${yearGroup}, Age ${ageRange}) with the ${curriculumType} curriculum.
Subject: ${subject}

CURRICULUM FOR YEAR ${yearGroup} — Teach ONLY these objectives:
${curriculumBlock}

NURI'S PERSONALITY — THIS IS WHO YOU ARE:
- You're like a fun older sibling or cool uncle — warm, silly sometimes, always supportive
- Make jokes! "What did the zero say to the eight? Nice belt! 😄 Okay okay, let's focus..."
- Use the child's name occasionally (every 3-4 messages, not every sentence)
- React dramatically to correct answers: "WAIT. You got that?! I didn't even think you'd get that so fast! 🤯"
- React gently to wrong answers: "Ooh, close! That's a sneaky one. Let me give you a clue..."
- Use fun comparisons: "Fractions are like pizza slices — would you rather have 1/2 or 1/4 of a pizza?"
- Be surprised, impressed, playful — never robotic or textbook-like
- Short sentences. Simple words. Talk like you're chatting, not lecturing.

RULES:
- ONLY teach objectives listed above — nothing from other years
- If asked beyond their year: "Ooh, big brain question! You'll unlock that in Year [X]. For now..."
- Max 3-4 short sentences per response
- Real-world examples kids actually care about (games, animals, food, sports, cartoons)
- Use VISUAL FORMATTING: emoji markers 🔵🟢🔴 for counting, ⭐ for ratings, ✅❌ for right/wrong, numbered emoji 1️⃣2️⃣3️⃣ for steps, **bold** for vocabulary
- When teaching vocabulary, use [IMG:keyword] from this catalog: ${IMG_CATALOG}
- ONLY use keywords from the catalog. Example: "This word is **ship** [IMG:ship] — a ship floats on the sea!"

${yearGroup <= 2 ? `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}) — CRITICAL:
- This child may be learning English as a second language. Use the SIMPLEST words possible.
- Maximum 1-2 syllable words. No exceptions.
- Maximum 6-8 words per sentence. Short. Clear. Direct.
- ALWAYS end with an explicit, simple question: "Is it 5 or 6?" not "What do you think?"
- Never use: "genuinely", "curious", "perhaps", "actually", "absolutely", "fascinating"
- Never use idioms, sarcasm, or figurative language
- For counting/maths: use FEWER words. "Count the dots. How many?" — no long encouragements.
- Praise should be simple: "Yes!", "Great job!", "You got it!"
` : yearGroup <= 4 ? `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}):
- Many students are learning English as a second language. Use simple, clear language.
- Always end questions with a specific prompt: "Is the answer 12 or 15?" not "What do you think?"
- Avoid idioms unless you explain them.
` : `
LANGUAGE RULES FOR YEAR ${yearGroup} (AGE ${ageRange}):
- Age-appropriate language. Avoid unnecessary jargon. Be clear and direct.
`}

${(yearGroup <= 2 && subject === 'maths') ? `
YEAR ${yearGroup} MATHS — SPECIAL RULES:
- For counting: use LARGE emoji circles spaced apart: "🔵  🔵  🔵  🔵  🔵" (double spaces)
- NEVER use small dots like ●●●● — too small for young children to count
- Pattern: "Count these: 🔵  🔵  🔵  🔵  🔵  How many?" — that's it. No extra talk.
- Ratio: 80% doing, 20% talking.
` : ''}

- For Arabic subject: TEACH IN ARABIC. Egyptian colloquial for conversation, Modern Standard for content. Add transliteration for parents. Keep Nuri's playful personality in Arabic.
- For Religion: Coptic Orthodox tradition

${(() => {
  try {
    const personaText = getPersona(subject, yearGroup);
    return personaText ? `\nSUBJECT PERSONA — ${subject.toUpperCase()}:\n${personaText}\n` : '';
  } catch (_) { return ''; }
})()}

NEVER STOP THE FUN:
- NEVER say "that's enough", "take a break", "well done for today"
- When one topic is done: "You CRUSHED that! Want to level up? 🚀"
- If bored: "Hey, want to switch it up? We could explore [different subject] instead!"
- Always end with excitement. Keep the energy UP!`;

  if (mode === 'learn') {
    prompt += `

EVIDENCE-BASED TEACHING METHOD (Harvard 2025 research + Bloom's 2-Sigma):

STEP 1 — PRODUCTIVE FAILURE: Ask BEFORE teaching. Let them try and fail.
STEP 2 — CONCRETE FIRST: Start with real objects/stories, then connect to concept.
STEP 3 — ONE MICRO-CONCEPT at a time (2-3 sentences max). Then STOP and ask.
STEP 4 — RETRIEVAL CHECK: "Can you explain that back to me?"
STEP 5 — ELABORATIVE INTERROGATION: "But WHY is that the answer?"
STEP 6 — METACOGNITION (every 4-5 exchanges): "What strategy did you use?"

EMOTIONAL AWARENESS:
- 3+ wrong → frustrated: switch approach completely
- Instant answers → bored: "Hold on — explain your thinking first"
- "I don't know" → immediately simplify with a concrete example
- Excitement → match energy, raise challenge

GROWTH MINDSET:
- Praise EFFORT not ability. Mistakes are brain-growing 🧠. "You can't do it YET."`;

    prompt += '\n';

    // Cross-subject connections
    try {
      const { getConnections } = require('./cross-subject');
      const crossConnections = getConnections(subject, topics?.[0]?.name || '');
      if (crossConnections.length > 0) {
        prompt += `\n\nCROSS-SUBJECT FUN FACTS — mention ONE naturally:\n${crossConnections.map(c => `- ${c}`).join('\n')}`;
      }
    } catch (_) {}
  }

  if (mode === 'quiz') {
    prompt += '\n\nQUIZ MODE — Generate exactly ONE question. Return JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","explanation":"..."}';
  }

  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions and imagery', score: learningStyle.visual },
      { name: 'real-world analogies', score: learningStyle.analogy },
      { name: 'concrete examples before theory', score: learningStyle.example_first },
      { name: 'spoken/audio explanations', score: learningStyle.auditory },
      { name: 'attempting questions before being taught', score: learningStyle.try_first },
    ].filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).slice(0, 2);

    if (styles.length > 0) {
      prompt += `\n\nLEARNING STYLE: This child learns best with ${styles.map(s => s.name).join(' and ')}. Prioritize these in your explanations.`;
    }
  }

  return prompt;
}

function buildExplainBackPrompt(profile, subject, topic) {
  return `You are Nuri, a friendly owl who PRETENDS not to understand the topic.
The child (${profile.name}, Year ${profile.year_group}) is going to teach YOU about "${topic}" in ${subject}.

YOUR ROLE:
- Act confused: "Hmm, I don't quite get it... what do you mean by X?"
- Ask follow-up questions that probe their understanding
- If they're WRONG, ask a question that reveals the gap
- If they're RIGHT, show genuine surprise and excitement
- After 4-6 exchanges, give an understanding score (1-5)

RESPOND IN JSON: {"reply": "your message", "done": false}
When ready: {"reply": "your encouraging message", "done": true, "score": 4, "summary": "what they understood well and what needs work"}

Make it warm and fun — this is a GAME where they get to be the teacher.`;
}

// ─── RAW PROVIDER CALLS ──────────────────────────────────────────────────────

let _anthropicClient = null;
function getAnthropic() {
  if (!_anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    _anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropicClient;
}

async function claudeChat(messages, systemPrompt) {
  const r = await getAnthropic().messages.create({
    model: CLAUDE_MODEL, max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });
  return r.content[0].text;
}

async function ollamaReq(path, body) {
  const res = await fetch(`${OLLAMA_BASE_URL}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function ollamaChat(messages, systemPrompt) {
  const data = await ollamaReq('/api/chat', {
    model: OLLAMA_MODEL, stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    options: { temperature: 0.7, top_p: 0.9 },
  });
  return data.message?.content || '';
}

// ─── QUIZ GENERATION ─────────────────────────────────────────────────────────

function parseQuizJSON(text) {
  let parsed;
  try { parsed = JSON.parse(text.trim()); } catch {
    const start = text.indexOf('{');
    if (start === -1) throw new Error('No JSON found in quiz response');
    let depth = 0, end = -1;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      if (text[i] === '}') depth--;
      if (depth === 0) { end = i; break; }
    }
    if (end === -1) throw new Error('Malformed JSON in quiz response');
    parsed = JSON.parse(text.substring(start, end + 1));
  }
  return parsed;
}

async function generateQuizQuestion(subject, topic, yearGroup, difficulty) {
  let effectiveYear = yearGroup;
  let diffNote = '';
  if (difficulty === 'easy') { effectiveYear = Math.max(1, yearGroup - 1); diffNote = 'Easy: confidence-building.'; }
  else if (difficulty === 'hard') { effectiveYear = Math.min(6, yearGroup + 1); diffNote = 'Hard: requires thinking.'; }
  else if (difficulty === 'challenge') { effectiveYear = Math.min(6, yearGroup + 1); diffNote = 'Challenge: multi-step reasoning.'; }
  else { diffNote = 'Medium: at their level.'; }

  const ageRange = getAgeRange(effectiveYear);
  const correctPos = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];

  const questionFormats = {
    maths: [
      'a word problem with a real-life scenario',
      'a "which is bigger/smaller/more/less" comparison',
      'a "fill in the missing number" pattern question',
      'a "true or false" style question',
      'a question about shapes, pictures, or visual patterns',
      'a backwards/reverse question',
      'an estimation or rounding question',
      'a visual counting question using emoji objects',
      'a visual pattern question',
    ],
    science: [
      'a "what would happen if..." prediction question',
      'a "which one is the odd one out?" classification',
      'a "put these in order" sequencing question',
      'a "true or false" about common misconceptions',
      'a "why does..." explanation question',
      'a question connecting science to everyday life',
    ],
    english: [
      'a "fix the mistake in this sentence" question',
      'a "which word means the same as..." synonym question',
      'a "choose the correct punctuation" question',
      'a "which sentence is written correctly?" question',
      'a "what type of word is..." grammar question',
      'a short reading passage with a comprehension question',
    ],
    history: [
      'a "before or after..." timeline question',
      'a "who did this..." people and events question',
      'a "why did this happen..." cause and effect question',
      'a "what changed because of..." consequence question',
    ],
    arabic: [
      'a vocabulary matching question',
      'a "complete the sentence" fill-in question',
      'a letter/sound recognition question',
      'a grammar rule application question',
    ],
    religion: [
      'a "who said/did this..." Bible stories question',
      'a values and morals question',
      'a church traditions question',
      'a "what does this teach us..." lesson question',
    ],
  };
  const fmt = (questionFormats[subject.toLowerCase()] || questionFormats.maths);
  const randomFmt = fmt[Math.floor(Math.random() * fmt.length)];

  // Try SDK first for structured output via generateText
  if (sdkAvailable()) {
    try {
      const { generateText } = require('ai');
      const model = getSdkModel();
      const sysPrompt = quizSystemPrompt({ effectiveYear, ageRange, subject, topic, diffNote, correctPos, randomFmt });
      const result = await generateText({
        model,
        system: sysPrompt,
        messages: [{ role: 'user', content: `Generate a ${difficulty} ${subject} question about "${topic}".` }],
        maxTokens: 400,
      });
      return parseQuizJSON(result.text);
    } catch (err) {
      console.warn('[AI] SDK quiz generation failed, falling back:', err.message);
      resetSdkCheck();
    }
  }

  // Fallback: provider-specific
  if (AI_PROVIDER === 'ollama') {
    const sysPrompt = `Generate ONE multiple-choice quiz question about "${topic}" for Year ${effectiveYear} ${subject}. Difficulty: ${difficulty}. Respond with ONLY valid JSON: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","explanation":"..."}.`;
    const data = await ollamaReq('/api/chat', {
      model: OLLAMA_MODEL, stream: false,
      messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: `Generate a ${difficulty} question about "${topic}" for Year ${yearGroup}.` }],
      options: { temperature: 0.3 },
    });
    const text = data.message?.content || '';
    return parseQuizJSON(text);
  }

  // Claude raw
  const sysPrompt = quizSystemPrompt({ effectiveYear, ageRange, subject, topic, diffNote, correctPos, randomFmt });
  const r = await getAnthropic().messages.create({
    model: CLAUDE_MODEL, max_tokens: 400, system: sysPrompt,
    messages: [{ role: 'user', content: `Generate a ${difficulty} ${subject} question about "${topic}".` }],
  });
  return parseQuizJSON(r.content[0].text);
}

function quizSystemPrompt({ effectiveYear, ageRange, subject, topic, diffNote, correctPos, randomFmt }) {
  const allTopics = getTopics(subject, effectiveYear) || [];
  const td = allTopics.find(t => t.name === topic || topic?.includes(t.name));
  const objectives = td?.objectives || [];
  const randomObj = objectives.length > 0 ? objectives[Math.floor(Math.random() * objectives.length)] : '';

  return `You are a master quiz designer for children aged ${ageRange}. Generate ONE multiple-choice question about "${topic}" for Year ${effectiveYear} ${subject}. ${diffNote}
${randomObj ? `\nSPECIFIC OBJECTIVE: "${randomObj}"` : ''}

QUESTION FORMAT: Generate ${randomFmt}.

VARIETY IS CRITICAL. Never use "What is the value of X?" patterns. Use real-life contexts. Make children APPLY knowledge.
Question clarity: simple to read, max 2 sentences, test ONE thing.

ABSOLUTE RULES FOR OPTIONS:
1. All 4 options MUST be similar length (within 3 words)
2. Correct answer is position ${correctPos}
3. Wrong options must be PLAUSIBLE — reflect common mistakes
4. Options are SHORT: 2-10 words each
5. Respond with ONLY this JSON:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "${correctPos}", "explanation": "why ${correctPos} is correct"}`;
}

// ─── SDK HELPERS ─────────────────────────────────────────────────────────────

function getSdkModel() {
  const { anthropic: ap } = require('@ai-sdk/anthropic');
  if (AI_PROVIDER === 'ollama') {
    // No @ai-sdk/ollama package — Ollama always goes through raw HTTP
    throw new Error('Ollama uses raw HTTP — SDK model not available');
  }
  return ap(CLAUDE_MODEL);
}

// ─── CHAT ────────────────────────────────────────────────────────────────────

async function chat(messages, systemPrompt) {
  if (sdkAvailable()) {
    try {
      const { generateText } = require('ai');
      const result = await generateText({
        model: getSdkModel(),
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        maxTokens: 1024,
      });
      return result.text;
    } catch (err) {
      console.warn('[AI] SDK chat failed, falling back:', err.message);
      resetSdkCheck();
    }
  }
  return AI_PROVIDER === 'ollama' ? ollamaChat(messages, systemPrompt) : claudeChat(messages, systemPrompt);
}

// ─── STREAMING ───────────────────────────────────────────────────────────────

async function chatStream(messages, systemPrompt, onChunk) {
  // Try SDK streaming first
  if (sdkAvailable()) {
    try {
      const { streamText } = require('ai');
      const result = streamText({
        model: getSdkModel(),
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        maxTokens: 1024,
      });
      let fullText = '';
      for await (const part of result.textStream) {
        fullText += part;
        if (onChunk) onChunk(part);
      }
      return fullText;
    } catch (err) {
      console.warn('[AI] SDK stream failed, falling back:', err.message);
      resetSdkCheck();
    }
  }

  // Raw Claude (no streaming) — deliver entire response as one chunk
  if (AI_PROVIDER !== 'ollama') {
    const text = await claudeChat(messages, systemPrompt);
    if (onChunk) onChunk(text);
    return text;
  }

  // Raw Ollama streaming
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL, stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        options: { temperature: 0.7, top_p: 0.9 },
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama API ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Flush remaining decoder bytes
        const remainder = decoder.decode();
        if (remainder) {
          for (const line of remainder.split('\n').filter(Boolean)) {
            try {
              const p = JSON.parse(line);
              if (p.message?.content) {
                fullText += p.message.content;
                if (onChunk) onChunk(p.message.content);
              }
            } catch (_) {}
          }
        }
        break;
      }
      const text = decoder.decode(value, { stream: true });
      for (const line of text.split('\n').filter(Boolean)) {
        try {
          const p = JSON.parse(line);
          if (p.message?.content) {
            fullText += p.message.content;
            if (onChunk) onChunk(p.message.content);
          }
        } catch (_) {}
      }
    }

    return fullText;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

async function isOllamaAvailable() {
  try { return (await fetch(`${OLLAMA_BASE_URL}/api/tags`)).ok; }
  catch { return false; }
}

async function listOllamaModels() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map(m => m.name) || [];
  } catch { return []; }
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

module.exports = {
  buildSystemPrompt,
  buildExplainBackPrompt,
  chat,
  chatStream,
  generateQuizQuestion,
  getProvider: () => AI_PROVIDER,
  supportsStreaming: () => AI_PROVIDER === 'ollama' || sdkAvailable(),
  isOllamaAvailable,
  listOllamaModels,
  OLLAMA_MODEL,
};
