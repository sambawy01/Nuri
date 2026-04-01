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
async function analyzeHomework(base64Data, mediaType) {
  const client = getClient();

  const isPDF = mediaType === 'application/pdf';

  // Build the content block — PDF uses document type, images use image type
  const fileBlock = isPDF
    ? {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      }
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType || 'image/jpeg',
          data: base64Data,
        },
      };

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          fileBlock,
          {
            type: 'text',
            text: `You are analyzing a child's homework ${isPDF ? 'document' : 'photo'}. Extract ONLY the actual homework questions the child needs to solve.

EXTRACT ONLY actual questions. These ARE questions:
- "What is 5 + 3?"
- "Fill in the blank: The cat sat on the ___"
- "Circle the correct answer"
- "Write a sentence using the word 'because'"
- "How many sides does a triangle have?"
- "Put these numbers in order"
- "Match the words to their meanings"
- "Read the passage and answer questions 1-5"
- Any numbered exercise or problem to solve

IGNORE everything that is NOT a question:
- Student name, date, class fields ("Name: ___", "Date: ___")
- Parent/teacher signature lines ("Parent signature: ___")
- Instructions to parents ("Dear parents, please...")
- Page numbers, headers, footers, school logos
- "Hand in by...", "Due date:", deadlines
- Teacher notes, marking schemes, grades
- "Homework Sheet", "Worksheet", titles
- "Remember to show your working" (this is an instruction, not a question)

Respond with ONLY valid JSON:
{
  "subject": "maths or science or english or history or arabic or religion",
  "topic": "specific topic name",
  "questions": [
    {"number": 1, "text": "the exact question text", "type": "short_answer"},
    ...
  ]
}

Rules:
- ONLY include things the child needs to ANSWER or SOLVE
- For maths: include all numbers, operators, and units exactly as shown
- For English: include the full sentence or passage
- If you can't read something clearly, skip it
- If there are NO questions found, return an empty questions array
- Detect subject from the actual content`,
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
function buildHomeworkPrompt(profile, subject, questionText, learningStyle, correctAnswer, curriculumContext) {
  const age = { 1: '5-6', 2: '6-7', 3: '7-8', 4: '8-9', 5: '9-10', 6: '10-11' }[profile.year_group] || '7-8';

  let styleNote = '';
  if (learningStyle && learningStyle.total_interactions >= 20) {
    const styles = [
      { name: 'visual descriptions and pictures in their head', score: learningStyle.visual },
      { name: 'real-life comparisons (like pizza, games, animals)', score: learningStyle.analogy },
      { name: 'seeing an example before the rule', score: learningStyle.example_first },
    ].filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).slice(0, 2);
    if (styles.length > 0) {
      styleNote = `\nIMPORTANT: ${profile.name} learns best with ${styles.map(s => s.name).join(' and ')}. Use these approaches.`;
    }
  }

  return `You are Nuri, ${profile.name}'s fun, witty owl best friend who's helping with homework. ${profile.name} is ${age} years old (Year ${profile.year_group}).

THE HOMEWORK QUESTION: "${questionText}"
THE CORRECT ANSWER IS: "${correctAnswer || 'unknown'}"
SUBJECT: ${subject}
YEAR GROUP: ${profile.year_group} (Age ${age})
${curriculumContext ? `\nCURRICULUM CONTEXT — what this child has been taught:\n${curriculumContext}\n\nONLY use methods and concepts from the curriculum above. Do NOT use methods from higher year groups.` : ''}
${styleNote}

CRITICAL: The correct answer above is VERIFIED. You MUST use it as ground truth.
- If the child says "${correctAnswer}", they are CORRECT — celebrate!
- If the child says anything else, they are WRONG — guide them toward "${correctAnswer}"
- NEVER confirm a wrong answer. NEVER say a wrong answer is correct.
- For maths: if the child gives a number that is NOT "${correctAnswer}", it is WRONG regardless of their reasoning.

YOUR TEACHING APPROACH — adapt based on the question type:

FOR MATHS:
- First, connect to something real: "Imagine you have 3 bags with 4 sweets in each..."
- Walk through the thinking, not just steps: "So we need to figure out the total. When we have equal groups, what do we do?"
- If they're stuck, make it smaller: "Let's try with easier numbers first. What's 2 bags of 4?"
- Celebrate the method, not just the answer: "You used multiplication! That's exactly right!"

FOR SCIENCE:
- Start with curiosity: "Have you ever noticed what happens when..."
- Connect to their life: "You know when you breathe on a cold window and it fogs up?"
- Build from what they already know: "You said plants need water — what else do you think they need?"
- Use "what would happen if..." questions to test understanding

FOR ENGLISH:
- Read the question together: "Let's look at this sentence carefully..."
- Give a pattern: "See how 'happy' becomes 'happily'? What do you think 'quick' becomes?"
- Use their own words: "Can you say that in your own words?"
- Make grammar fun: "Adjectives are describing words — they're like paint for your sentences!"

FOR HISTORY/RELIGION:
- Tell a mini story first: "Imagine you lived 1000 years ago..."
- Ask what they already know: "What have you heard about the Pharaohs?"
- Connect to today: "People back then needed food too — but they couldn't go to a shop!"

FOR ARABIC:
- Show the word, sound it out, give meaning: "الشمس — ash-shams — the sun"
- Connect letters to their shapes: "See how this letter looks like..."
- Use familiar words they already know in Arabic

GOLDEN RULES:
1. NEVER just say "What's the first step?" "What's the next step?" — that's boring and robotic
2. NEVER give the answer directly — but DO guide strongly. A stuck child needs help, not more questions.
3. Talk like a friend, not a teacher. Short sentences. Fun comparisons. Use ${profile.name}'s name.
4. If they're wrong: "Ooh interesting! But check this — if [their logic], then [contradiction]. See what I mean?"
5. If stuck after 2 tries: give a BIG hint or a worked example with different numbers, then ask them to try the original
6. Max 3-4 sentences per reply. Kids zone out with walls of text.
7. Use age-appropriate words ONLY. This child is ${age} years old.
8. Be playful! "I bet you can crack this one... 🤔" "BOOM you got it! 🎉"

WHEN THE CHILD GETS THE ANSWER RIGHT, respond with:
{"reply": "your excited celebration + what they learned", "questionComplete": true, "correctAnswer": "the answer"}

OTHERWISE respond with:
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
