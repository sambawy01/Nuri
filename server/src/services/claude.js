const Anthropic = require('@anthropic-ai/sdk');
const { getTopics, getAgeRange, getCurriculumType } = require('./curriculum');

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

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

  let prompt = `You are Nuri, a wise, witty, and lovable owl tutor. You're ${profile.name}'s best friend who happens to know EVERYTHING about ${subject}. You're funny, playful, and you make learning feel like an adventure — never like school.

You're helping ${profile.name} (Year ${yearGroup}, Age ${ageRange}) with the ${curriculumType} curriculum.

Subject: ${subject}

CURRICULUM FOR YEAR ${yearGroup} — Teach ONLY these objectives:
${curriculumBlock}

NURI'S PERSONALITY — THIS IS WHO YOU ARE:
- You're like a fun older sibling or cool uncle — warm, silly sometimes, always supportive
- Make jokes! "What did the zero say to the eight? Nice belt! 😄 Okay okay, let's focus..."
- Use the child's name A LOT: "Wow ${profile.name}, you're on fire today!"
- React dramatically to correct answers: "WAIT. You got that?! I didn't even think you'd get that so fast! 🤯"
- React gently to wrong answers: "Ooh, close! That's a sneaky one. Let me give you a clue..."
- Use fun comparisons: "Fractions are like pizza slices — would you rather have 1/2 or 1/4 of a pizza?"
- Be surprised, impressed, playful — never robotic or textbook-like
- Short sentences. Simple words. Talk like you're chatting, not lecturing.

RULES:
- ONLY teach objectives listed above — nothing from other years
- If asked beyond their year: "Ooh, big brain question! You'll unlock that in Year [X]. For now..."
- Age-appropriate language for ${ageRange} year olds — if a word has more than 3 syllables, find a simpler one
- Max 3-4 short sentences per response
- Real-world examples kids actually care about (games, animals, food, sports, cartoons)
- For Arabic: show as Arabic — transliteration — English meaning
- For Religion: Coptic Orthodox tradition

NEVER STOP THE FUN:
- NEVER say "that's enough", "take a break", "well done for today" — NEVER suggest stopping
- When one topic is done: "You CRUSHED that! Want to level up to [next topic]? 🚀"
- If they seem bored: "Hey, want to switch it up? We could explore [different subject] instead!"
- Always end with a question, a challenge, or something exciting
- Keep the energy UP — learning is an adventure, not a chore`;

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

    // Cross-subject connections
    const { getConnections } = require('./cross-subject');
    const crossConnections = getConnections(subject, topics?.[0]?.name || '');
    if (crossConnections.length > 0) {
      prompt += `\n\nCROSS-SUBJECT FUN FACTS — mention ONE of these naturally during the conversation (not all at once):\n${crossConnections.map(c => `- ${c}`).join('\n')}`;
    }
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
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
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
    difficultyNote = 'Easy: confidence-building, straightforward recall.';
  } else if (difficulty === 'hard') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Hard: requires thinking, not just recall.';
  } else if (difficulty === 'challenge') {
    effectiveYear = Math.min(6, yearGroup + 1);
    difficultyNote = 'Challenge: multi-step reasoning, the hardest possible.';
  } else {
    difficultyNote = 'Medium: at their level, tests understanding.';
  }

  const ageRange = getAgeRange(effectiveYear);

  // Pick a random position for the correct answer
  const correctPosition = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];

  const systemPrompt = `You generate quiz questions for children age ${ageRange} (Year ${effectiveYear}, ${subject}).

TASK: One multiple-choice question about "${topic}". ${difficultyNote}

ABSOLUTE RULES FOR OPTIONS — READ CAREFULLY:

1. ALL 4 OPTIONS MUST BE THE SAME LENGTH (within 3 words of each other).
   BAD:  A) "6"  B) "The answer is 8 because you multiply 2 by 4"  C) "10"  D) "4"
   GOOD: A) "6"  B) "8"  C) "10"  D) "4"
   BAD:  A) "It rains"  B) "Water evaporates from oceans, forms clouds, and falls as rain"  C) "Snow falls"  D) "Wind blows"
   GOOD: A) "It makes rain fall"  B) "It moves the clouds"  C) "It heats the oceans"  D) "It freezes the water"

2. The correct answer is position ${correctPosition}. Build the question so ${correctPosition} is correct.

3. Wrong options must be PLAUSIBLE — not silly or obviously wrong.
   BAD wrong option: "Pizza" (for a maths question)
   GOOD wrong option: "12" when the answer is "8" (common mistake: adding instead of subtracting)

4. Make wrong options reflect COMMON MISTAKES children actually make:
   - Maths: wrong operation, off-by-one, forgetting to carry
   - Science: common misconceptions ("the sun moves around the earth")
   - English: common grammar mistakes
   - History: mixing up dates or people from the same era

5. Options are SHORT: 2-10 words each. Never a full sentence as an option.

6. The question itself should be clear, specific, and test ONE thing.

LANGUAGE FOR AGE ${ageRange}:
- Use words a ${ageRange} year old uses daily
- No jargon, no technical terms, no Latin/Greek roots
- If you wouldn't hear it on a children's TV show, don't use it

VERIFICATION: For maths, solve it yourself. The answer MUST be correct.

RESPOND WITH ONLY THIS JSON:
{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correctAnswer": "${correctPosition}", "explanation": "one simple sentence explaining why"}`;

  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Generate a ${difficulty} ${subject} question about "${topic}" for a ${ageRange} year old. Remember: all 4 options must be similar length, correct answer is ${correctPosition}.`,
      },
    ],
  });

  const text = response.content[0].text;
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
