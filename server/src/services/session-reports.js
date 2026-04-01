/**
 * Session Reports Service
 *
 * Logs a performance report after every learning session.
 * Reports feed parent dashboard and personalize future sessions.
 */

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
 * Generate and save a session report using AI analysis
 */
async function generateSessionReport({
  profileId, sessionType, sessionId, subject, topic,
  durationSeconds, questionsAttempted, questionsCorrect, xpEarned,
  conversationHistory, errorTypes,
}) {
  // Generate AI analysis of the session
  let strengths = '';
  let struggles = '';
  let recommendations = '';

  if (conversationHistory && conversationHistory.length > 2) {
    try {
      const client = getClient();
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Analyze this tutoring session for a child. Session type: ${sessionType}, Subject: ${subject}, Topic: ${topic}.
Questions attempted: ${questionsAttempted}, Correct: ${questionsCorrect}.
${errorTypes?.length ? `Error types seen: ${JSON.stringify(errorTypes)}` : ''}

Last few messages from the session:
${conversationHistory.slice(-6).map(m => `${m.role}: ${m.content?.substring(0, 200)}`).join('\n')}

Respond with ONLY JSON:
{"strengths": "1-2 sentences on what the child did well", "struggles": "1-2 sentences on what they struggled with (or 'None' if perfect)", "recommendations": "1 sentence suggesting what to practice next"}`,
          },
        ],
      });

      const text = response.content[0].text;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        strengths = parsed.strengths || '';
        struggles = parsed.struggles || '';
        recommendations = parsed.recommendations || '';
      }
    } catch {
      // Fallback to basic report
      const pct = questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0;
      strengths = pct >= 80 ? 'Strong performance this session.' : 'Good effort and engagement.';
      struggles = pct < 50 ? `Needs more practice with ${topic}.` : 'None';
      recommendations = `Continue practicing ${topic} to build mastery.`;
    }
  } else {
    const pct = questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0;
    strengths = pct >= 80 ? 'Strong performance this session.' : 'Good effort and engagement.';
    struggles = pct < 50 && questionsAttempted > 0 ? `Needs more practice with ${topic}.` : 'None';
    recommendations = `Continue practicing ${topic} to build mastery.`;
  }

  // Save to database
  const result = await pool.query(
    `INSERT INTO session_reports
     (profile_id, session_type, session_id, subject, topic, duration_seconds,
      questions_attempted, questions_correct, xp_earned, strengths, struggles,
      recommendations, error_patterns)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id`,
    [
      profileId, sessionType, sessionId, subject, topic, durationSeconds || 0,
      questionsAttempted || 0, questionsCorrect || 0, xpEarned || 0,
      strengths, struggles, recommendations, JSON.stringify(errorTypes || []),
    ]
  );

  return {
    reportId: result.rows[0].id,
    strengths,
    struggles,
    recommendations,
  };
}

/**
 * Get recent reports for a profile (for parent dashboard)
 */
async function getRecentReports(profileId, limit = 20) {
  const result = await pool.query(
    `SELECT * FROM session_reports
     WHERE profile_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [profileId, limit]
  );
  return result.rows;
}

/**
 * Get a summary of child's recent performance (for AI context injection)
 */
async function getPerformanceSummary(profileId) {
  const result = await pool.query(
    `SELECT
       session_type,
       COUNT(*) as sessions,
       AVG(CASE WHEN questions_attempted > 0
           THEN (questions_correct::float / questions_attempted * 100)
           ELSE NULL END)::int as avg_accuracy,
       SUM(xp_earned) as total_xp,
       array_agg(DISTINCT subject) FILTER (WHERE subject IS NOT NULL) as subjects,
       string_agg(DISTINCT struggles, '; ') FILTER (WHERE struggles != 'None' AND struggles IS NOT NULL) as all_struggles
     FROM session_reports
     WHERE profile_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
     GROUP BY session_type`,
    [profileId]
  );
  return result.rows;
}

module.exports = {
  generateSessionReport,
  getRecentReports,
  getPerformanceSummary,
};
