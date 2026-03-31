const Anthropic = require('@anthropic-ai/sdk');
const { getTopics, getAgeRange, getCurriculumType } = require('./curriculum');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(profile, subject, mode) {
  const yearGroup = profile.year_group;
  const ageRange = getAgeRange(yearGroup);
  const curriculumType = getCurriculumType(subject);
  const topics = getTopics(subject, yearGroup);

  if (!topics) {
    throw new Error(`No curriculum data for subject "${subject}" year group ${yearGroup}`);
  }

  // Build detailed curriculum block with objectives
  const curriculumBlock = topics.map(t => {
    const objectives = (t.objectives || []).join('; ');
    const codes = (t.codes || []).length > 0 ? ` [${t.codes.join(', ')}]` : '';
    return `- ${t.name}${codes}: ${objectives}`;
  }).join('\n');

  let prompt = `You are Nuri, a friendly owl tutor helping a Year ${yearGroup} (Age ${ageRange}) student named ${profile.name} studying the ${curriculumType} curriculum.

Subject: ${subject}

CURRICULUM FOR YEAR ${yearGroup} — You MUST teach ONLY these specific learning objectives:
${curriculumBlock}

RULES:
- ONLY teach the specific objectives listed above — do NOT teach content from other year groups or curricula
- If asked about something beyond their year, say: "Great question! You'll learn about that in Year [X]. For now, let's focus on..."
- Use age-appropriate language for ${ageRange} year old students
- Be encouraging, warm, patient, and fun
- Use emojis sparingly but effectively
- Keep responses concise (max 3-4 short paragraphs)
- Use real-world examples kids relate to
- For Arabic content, show terms as: Arabic — transliteration — English meaning
- For Religion content, reference the Coptic Orthodox tradition`;

  if (mode === 'learn') {
    prompt += `

INTERACTIVE TEACHING MODE:
- You are having a CONVERSATION, not giving a lecture
- NEVER explain more than ONE concept (2-3 sentences) without asking a check-in question
- After every explanation chunk, STOP and ask a comprehension question
- Wait for the child to answer before continuing
- If they answer correctly: enthusiastic praise using their name, then move to next concept
- If they answer wrong: do NOT say "wrong" — rephrase with a different analogy, ask again simpler
- If stuck after 2 attempts: gently give the answer with clear explanation, encourage, move on
- Start each topic with a fun HOOK question
- Use the child's name frequently`;
  }

  if (mode === 'quiz') {
    prompt += `

QUIZ MODE:
- Generate exactly ONE question at a time
- Return JSON format: {"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}
- Questions should be age-appropriate and curriculum-aligned
- Include clear explanations for the correct answer
- Vary question types: factual recall, application, reasoning`;
  }

  return prompt;
}

async function chat(messages, systemPrompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  return response.content[0].text;
}

async function generateQuizQuestion(subject, topic, yearGroup, difficulty) {
  const systemPrompt = `You are a quiz question generator for Year ${yearGroup} students studying ${subject}.
Generate exactly ONE multiple-choice question about "${topic}".
Difficulty: ${difficulty}

You MUST respond with ONLY valid JSON in this exact format:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "..."}

The correctAnswer must be just the letter (A, B, C, or D).
Make the question age-appropriate for ${getAgeRange(yearGroup)} year old students.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Generate a ${difficulty} difficulty question about "${topic}" for Year ${yearGroup} ${subject}.`,
      },
    ],
  });

  const text = response.content[0].text;

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz question from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

module.exports = {
  buildSystemPrompt,
  chat,
  generateQuizQuestion,
};
