const Anthropic = require('@anthropic-ai/sdk');
const { getTopics, getAgeRange, getCurriculumType } = require('./curriculum');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(profile, subject, mode, learningStyle) {
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

  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions and imagery', score: learningStyle.visual },
      { name: 'real-world analogies', score: learningStyle.analogy },
      { name: 'concrete examples before theory', score: learningStyle.example_first },
      { name: 'spoken/audio explanations', score: learningStyle.auditory },
      { name: 'attempting questions before being taught', score: learningStyle.try_first },
    ]
      .filter((s) => s.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (styles.length > 0) {
      prompt += `\n\nLEARNING STYLE: This child learns best with ${styles.map((s) => s.name).join(' and ')}. Prioritize these in your explanations.`;
    }
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
  // Year-shift for difficulty
  let effectiveYear = yearGroup;
  let difficultyNote = '';
  if (difficulty === 'easy') {
    effectiveYear = Math.max(1, yearGroup - 1);
    difficultyNote = 'Make this an easy, confidence-building question.';
  } else if (difficulty === 'hard') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Make this a challenging stretch question.';
  } else if (difficulty === 'challenge') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Make this the HARDEST possible question. Include multi-step reasoning. This is a Challenge Me question for ambitious students.';
  }

  const systemPrompt = `You are a quiz question generator for Year ${effectiveYear} students studying ${subject}.
Generate exactly ONE multiple-choice question about "${topic}".
Difficulty: ${difficulty}
${difficultyNote}

CRITICAL: Before finalizing, SOLVE the question yourself step-by-step to verify the correct answer. For maths questions, show your working mentally and double-check the arithmetic. The correctAnswer MUST actually be correct.

You MUST respond with ONLY valid JSON in this exact format:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "A", "explanation": "...", "verification": "brief step-by-step solution confirming the answer"}

The correctAnswer must be just the letter (A, B, C, or D).
Make the question age-appropriate for ${getAgeRange(effectiveYear)} year old students.`;

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

function buildExplainBackPrompt(profile, subject, topic) {
  return `You are Nuri, a friendly owl who PRETENDS not to understand the topic.
The child (${profile.name}, Year ${profile.year_group}) is going to teach YOU about "${topic}" in ${subject}.

YOUR ROLE:
- Act confused and curious — "Hmm, I don't quite get it... what do you mean by X?"
- Ask follow-up questions that probe their understanding
- If they explain something WRONG, don't correct them directly. Instead, ask a question that reveals the gap: "But wait, if that's true, then what happens when...?"
- If they explain something correctly, show genuine surprise and excitement
- After 4-6 exchanges, give them an understanding score (1-5) and summary

RESPOND IN JSON:
{"reply": "your message", "done": false}

When ready to score (after 4-6 exchanges):
{"reply": "your final encouraging message with score", "done": true, "score": 4, "summary": "one-line summary of what they understood well and what needs work"}

IMPORTANT: Be warm and fun. This is a GAME where they get to be the teacher. Make it feel playful.`;
}

module.exports = {
  buildSystemPrompt,
  chat,
  generateQuizQuestion,
  buildExplainBackPrompt,
};
