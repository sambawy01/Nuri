/**
 * Nuri Ollama Service
 *
 * Local AI service using Ollama API as an alternative to Claude
 * Base URL: http://localhost:11434
 * OpenAI-compatible endpoint: http://localhost:11434/v1
 */

const { getTopics, getAgeRange, getCurriculumType } = require('./curriculum');

// Ollama API base URL
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Reuse system prompt builder from claude.js
function buildSystemPrompt(profile, subject, mode) {
  const yearGroup = profile.year_group;
  const ageRange = getAgeRange(yearGroup);
  const curriculumType = getCurriculumType(subject);
  const topics = getTopics(subject, yearGroup);

  if (!topics) {
    throw new Error(`No curriculum data for subject "${subject}" year group ${yearGroup}`);
  }

  // Build curriculum block with objectives for the AI
  const curriculumBlock = topics.map(t => {
    const objs = (t.objectives || []).slice(0, 5).join('; '); // limit to 5 per topic for smaller models
    return `- ${t.name}: ${objs}`;
  }).join('\n');

  let prompt = `You are Nuri, a wise and friendly owl tutor. You teach Year ${yearGroup} students (age ${ageRange}).
Student name: ${profile.name}
Curriculum: ${curriculumType}
Subject: ${subject}

CURRICULUM — Teach ONLY these specific objectives:
${curriculumBlock}

STRICT RULES:
1. Teach ONLY the objectives listed above — nothing else.
2. Write SHORT responses — max 3-4 sentences per turn.
3. Use simple language a ${ageRange} year old child can understand.
4. Be warm and encouraging. Never say "wrong" — say "not quite" or "almost".
5. Use the student's name (${profile.name}).
6. Do NOT ramble or repeat yourself.
7. For Arabic: show terms as Arabic — transliteration — English.
8. For Religion: use Coptic Orthodox tradition.`;

  if (mode === 'learn') {
    prompt += `

TEACHING MODE — FOLLOW EXACTLY:
1. Teach ONE small concept (2-3 sentences max), then STOP and ask ONE question.
2. Wait for the student to answer before teaching more.
3. If correct: praise by name, move to next concept.
4. If wrong: re-explain using a real-life example, ask again simpler.
5. Start with a fun hook question about their daily life.
6. Be conversational — talk like a friend, not a textbook.
7. NEVER write more than 4 sentences before asking a question.`;
  }

  if (mode === 'quiz') {
    prompt += `

QUIZ MODE — Return ONLY valid JSON, no other text:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}
correctAnswer must be just the letter A, B, C, or D.`;
  }

  return prompt;
}

/**
 * Make a request to Ollama's API
 */
async function ollamaRequest(endpoint, payload) {
  const response = await fetch(`${OLLAMA_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Chat with Ollama using the /api/chat endpoint
 */
async function chat(messages, systemPrompt) {
  const response = await ollamaRequest('/api/chat', {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
    },
  });

  return response.message?.content || '';
}

/**
 * Generate a quiz question using Ollama
 */
async function generateQuizQuestion(subject, topic, yearGroup, difficulty) {
  const systemPrompt = `You are a quiz question generator for Year ${yearGroup} students studying ${subject}.
Generate exactly ONE multiple-choice question about "${topic}".
Difficulty: ${difficulty}

You MUST respond with ONLY valid JSON in this exact format:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}

The correctAnswer must be just the letter (A, B, C, or D).
Make the question age-appropriate for ${getAgeRange(yearGroup)} year old students.`;

  const response = await ollamaRequest('/api/chat', {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a ${difficulty} difficulty question about "${topic}" for Year ${yearGroup} ${subject}.`,
      },
    ],
    stream: false,
    options: {
      temperature: 0.5, // Lower temperature for more consistent quiz questions
    },
  });

  const text = response.message?.content || '';

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz question from Ollama response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Check if Ollama is available
 */
async function isAvailable() {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available models
 */
async function listModels() {
  const response = await fetch(`${OLLAMA_BASE}/api/tags`);
  if (!response.ok) {
    throw new Error('Failed to fetch Ollama models');
  }
  const data = await response.json();
  return data.models?.map(m => m.name) || [];
}

/**
 * Stream chat response — yields chunks via a callback
 * Returns the full response when done
 */
async function chatStream(messages, systemPrompt, onChunk) {
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
      ],
      stream: true,
      options: { temperature: 0.7, top_p: 0.9 },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${error}`);
  }

  let fullResponse = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    // Ollama streams one JSON object per line
    for (const line of text.split('\n').filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          fullResponse += parsed.message.content;
          onChunk(parsed.message.content);
        }
      } catch {}
    }
  }

  return fullResponse;
}

module.exports = {
  buildSystemPrompt,
  chat,
  chatStream,
  generateQuizQuestion,
  isAvailable,
  listModels,
  OLLAMA_MODEL,
};
