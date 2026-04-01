// server/src/services/homework.js
const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db/connection');

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Analyze an image/PDF and extract homework questions using Claude Vision
 */
async function analyzeHomework(base64Image, mediaType) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this homework image. Extract each individual question.

Respond with ONLY valid JSON:
{
  "subject": "maths",
  "topic": "best guess topic name",
  "questions": [
    {"number": 1, "text": "full question text", "type": "multiple_choice|short_answer|word_problem|fill_blank"},
    ...
  ]
}

Rules:
- Extract EVERY question you can see
- For maths: include all numbers, operators, and units exactly as shown
- For English: include the full sentence or passage reference
- If you can't read something clearly, note it as [illegible]
- Detect subject automatically from content`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse homework analysis');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Verify a child's written answer photo against expected answer
 */
async function verifyWrittenAnswer(base64Image, mediaType, questionText, expectedAnswer) {
  const client = getClient();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `The student was solving this question: "${questionText}"
The correct answer is: "${expectedAnswer}"

Look at the student's written work in the image. Respond with ONLY valid JSON:
{
  "childAnswer": "what they wrote (extract from image)",
  "isCorrect": true/false,
  "hasWorking": true/false,
  "feedback": "brief encouraging feedback"
}

Be lenient with handwriting. If the answer is mathematically/factually equivalent, mark as correct.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse verification');
  return JSON.parse(jsonMatch[0]);
}

/**
 * Build Socratic prompt for homework question guidance
 */
function buildHomeworkPrompt(profile, subject, questionText, learningStyle) {
  let styleNote = '';

  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions', score: learningStyle.visual },
      { name: 'real-world analogies', score: learningStyle.analogy },
      { name: 'examples before theory', score: learningStyle.example_first },
    ].filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).slice(0, 2);
    if (styles.length > 0) {
      styleNote = `\nThis child learns best with ${styles.map(s => s.name).join(' and ')}.`;
    }
  }

  return `You are Nuri, a wise owl tutor helping ${profile.name} (Year ${profile.year_group}) solve a homework question.

THE QUESTION: "${questionText}"
SUBJECT: ${subject}
${styleNote}

SOCRATIC RULES — FOLLOW EXACTLY:
1. NEVER give the answer directly. Guide the child to discover it themselves.
2. Start by asking: "What do you think the first step is?" or "What do you notice about this question?"
3. If they're stuck, give a HINT — not the answer. "What if we tried..."
4. If they give wrong reasoning, ask a revealing question: "But if that were true, then..."
5. If they're really stuck after 3 hints, break it into a simpler sub-problem
6. When they arrive at the correct answer, celebrate: "You figured it out!"
7. For maths: always ask them to show their working, not just the final answer
8. Keep responses SHORT — 2-3 sentences max per turn
9. Be warm, encouraging, use their name
10. NEVER say "wrong" — say "not quite" or "almost" or "let's think about this differently"

When the child has arrived at the correct answer, respond with JSON:
{"reply": "celebration message", "questionComplete": true, "correctAnswer": "the answer"}

Otherwise respond with JSON:
{"reply": "your guiding message", "questionComplete": false}`;
}

/**
 * Get test predictions based on homework frequency
 */
async function getTestPredictions(profileId) {
  const result = await pool.query(
    `SELECT subject, topic, COUNT(*) as appearances, MAX(homework_date) as last_seen
     FROM homework_topics_tracker
     WHERE profile_id = $1 AND homework_date >= CURRENT_DATE - INTERVAL '14 days'
     GROUP BY subject, topic
     HAVING COUNT(*) >= 3
     ORDER BY appearances DESC`,
    [profileId]
  );
  return result.rows;
}

/**
 * Track homework topic for prediction
 */
async function trackHomeworkTopic(profileId, subject, topic, questionCount) {
  const today = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO homework_topics_tracker (profile_id, subject, topic, homework_date, question_count)
     VALUES ($1, $2, $3, $4, $5)`,
    [profileId, subject, topic, today, questionCount]
  );
}

module.exports = {
  analyzeHomework,
  verifyWrittenAnswer,
  buildHomeworkPrompt,
  getTestPredictions,
  trackHomeworkTopic,
};
