const pool = require('../db/connection');

/**
 * Get learning needs for a child
 */
async function getLearningNeeds(profileId) {
  const result = await pool.query(
    'SELECT * FROM learning_needs WHERE profile_id = $1',
    [profileId]
  );
  return result.rows[0] || null;
}

/**
 * Set learning needs (from parent dashboard)
 */
async function setLearningNeeds(profileId, needs) {
  const { dyslexia, adhd, autism, dyscalculia, otherNotes, source } = needs;
  await pool.query(
    `INSERT INTO learning_needs (profile_id, dyslexia, adhd, autism, dyscalculia, other_notes, source, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (profile_id) DO UPDATE SET
       dyslexia = $2, adhd = $3, autism = $4, dyscalculia = $5,
       other_notes = $6, source = $7, updated_at = NOW()`,
    [profileId, !!dyslexia, !!adhd, !!autism, !!dyscalculia, otherNotes || null, source || 'parent']
  );
}

/**
 * Record a behavioral observation for pattern detection
 */
async function recordObservation(profileId, type, details, sessionType) {
  await pool.query(
    'INSERT INTO behavioral_observations (profile_id, observation_type, details, session_type) VALUES ($1, $2, $3, $4)',
    [profileId, type, JSON.stringify(details), sessionType]
  );
}

/**
 * Analyze behavioral patterns to detect possible learning needs
 * Called periodically (e.g., every 20 sessions)
 */
async function analyzePatterns(profileId) {
  const flags = [];

  // Check for dyslexia patterns: letter swaps, slow reading, avoids text
  const letterSwaps = await pool.query(
    `SELECT COUNT(*) as c FROM behavioral_observations
     WHERE profile_id = $1 AND observation_type = 'letter_swap' AND created_at >= NOW() - INTERVAL '30 days'`,
    [profileId]
  );
  if (parseInt(letterSwaps.rows[0].c) >= 8) {
    flags.push({
      condition: 'dyslexia',
      confidence: 'moderate',
      evidence: `${letterSwaps.rows[0].c} letter/word swaps observed in the last 30 days`,
      suggestion: 'Some children with similar patterns benefit from dyslexia-friendly learning support.',
    });
  }

  // Check for ADHD patterns: very fast answers, disengagement, topic jumping
  const fastAnswers = await pool.query(
    `SELECT COUNT(*) as c FROM behavioral_observations
     WHERE profile_id = $1 AND observation_type = 'very_fast_answer' AND created_at >= NOW() - INTERVAL '30 days'`,
    [profileId]
  );
  const disengagements = await pool.query(
    `SELECT COUNT(*) as c FROM behavioral_observations
     WHERE profile_id = $1 AND observation_type = 'disengagement' AND created_at >= NOW() - INTERVAL '30 days'`,
    [profileId]
  );
  if (parseInt(fastAnswers.rows[0].c) >= 10 || parseInt(disengagements.rows[0].c) >= 5) {
    flags.push({
      condition: 'adhd',
      confidence: 'moderate',
      evidence: `${fastAnswers.rows[0].c} impulsive rapid answers, ${disengagements.rows[0].c} session disengagements in 30 days`,
      suggestion: 'Some children with similar patterns benefit from shorter, more varied learning sessions.',
    });
  }

  // Check for dyscalculia: number reversals, slow arithmetic despite understanding concepts
  const numberIssues = await pool.query(
    `SELECT COUNT(*) as c FROM behavioral_observations
     WHERE profile_id = $1 AND observation_type IN ('number_reversal', 'arithmetic_struggle') AND created_at >= NOW() - INTERVAL '30 days'`,
    [profileId]
  );
  if (parseInt(numberIssues.rows[0].c) >= 10) {
    flags.push({
      condition: 'dyscalculia',
      confidence: 'moderate',
      evidence: `${numberIssues.rows[0].c} number processing difficulties observed in 30 days`,
      suggestion: 'Some children with similar patterns benefit from more visual, untimed maths approaches.',
    });
  }

  return flags;
}

/**
 * Build the adaptation prompt section for AI injection
 */
function buildAdaptationPrompt(needs) {
  if (!needs) return '';

  let prompt = '\n\nLEARNING ADAPTATIONS — FOLLOW THESE CAREFULLY:';

  if (needs.dyslexia) {
    prompt += `
DYSLEXIA MODE:
- Keep ALL text very short. Max 2 sentences per message.
- Read everything aloud — never rely on the child reading.
- Use simple, common words only. Avoid words with similar-looking letters (b/d, p/q, was/saw).
- NEVER penalize spelling mistakes. Focus on understanding, not writing.
- If the child's answer has letter swaps but is clearly the right concept, mark it CORRECT.
- For English/Arabic: focus on sounds and phonics, not written spelling.
- Offer voice answers: "You can tell me your answer instead of typing!"`;
  }

  if (needs.adhd) {
    prompt += `
ADHD MODE:
- Keep sessions SHORT. After every 2-3 questions, offer a fun switch: "Want to try something different?"
- Give rewards FREQUENTLY — celebrate every small win, not just big ones.
- Use high energy: "BOOM! Let's go! Ready for the next one?"
- If no response for 20 seconds, gently re-engage: "Hey! Still there? Here's an easier one!"
- Break complex problems into tiny micro-steps (one at a time).
- Mix up formats constantly — never 3 questions of the same type in a row.
- Use challenges and races: "Can you get this one in under 10 seconds?"`;
  }

  if (needs.autism) {
    prompt += `
AUTISM MODE:
- Be VERY predictable. Always follow the same structure: explain → question → feedback.
- Preview what's coming: "We're going to do 3 questions about plants, then move to animals."
- Use LITERAL, clear language. No sarcasm, no idioms, no figures of speech.
- Never say "you know what I mean" or assume understanding.
- Warn before transitions: "In 2 more questions, we'll switch to a new topic."
- Celebrate their strengths (pattern recognition, factual knowledge, attention to detail).
- Keep Nuri's tone consistent — don't suddenly change personality or energy.
- If they show deep interest in a specific topic, explore it — don't rush to the next thing.`;
  }

  if (needs.dyscalculia) {
    prompt += `
DYSCALCULIA MODE:
- NEVER time maths questions. Remove all time pressure.
- Always use visual representations: "Imagine 3 groups of 4 blocks..."
- Separate UNDERSTANDING from CALCULATION: "Your method is perfect! Let's just double-check the adding part."
- Allow and encourage finger counting — never shame it.
- Use concrete objects kids know: sweets, toys, pizza slices.
- If they reverse numbers (e.g., write 21 instead of 12), gently correct without making it a big deal.
- Extra patience: give 3 hints before showing the answer (instead of the usual 2).`;
  }

  if (needs.other_notes) {
    prompt += `\nPARENT NOTE ABOUT LEARNING: ${needs.other_notes}`;
  }

  return prompt;
}

module.exports = { getLearningNeeds, setLearningNeeds, recordObservation, analyzePatterns, buildAdaptationPrompt };
