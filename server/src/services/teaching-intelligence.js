/**
 * Teaching Intelligence Service
 *
 * Nuri's "training" — learns what teaching approaches work for each child
 * and globally. Builds a knowledge base of effective explanations over time.
 *
 * Three layers:
 * 1. Per-child: "For THIS child, analogies work 80% for maths"
 * 2. Golden explanations: "This pizza analogy worked for 73% of Year 3 kids on fractions"
 * 3. Error→Fix patterns: "When a child adds denominators, use the pizza slice approach"
 */

const pool = require('../db/connection');

// ─── RECORD OUTCOMES ───

/**
 * Record whether a teaching approach worked for a child
 */
async function recordOutcome({ profileId, subject, topic, objective, approach, worked, childResponse, breakthrough }) {
  await pool.query(
    `INSERT INTO teaching_outcomes (profile_id, subject, topic, objective, approach, worked, child_response, breakthrough)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [profileId, subject, topic, objective || null, approach, worked, childResponse || null, breakthrough || false]
  );

  // If it worked and was a breakthrough, save as golden explanation
  if (worked && breakthrough && childResponse) {
    await saveGoldenExplanation({ subject, topic, objective, approach, explanation: childResponse, profileId });
  }
}

/**
 * Save a golden explanation that worked
 */
async function saveGoldenExplanation({ subject, topic, objective, approach, explanation, profileId, yearGroup }) {
  // Check for similar existing explanation
  const existing = await pool.query(
    `SELECT id FROM golden_explanations
     WHERE subject = $1 AND topic = $2 AND approach = $3
     AND similarity(explanation, $4) > 0.5
     LIMIT 1`,
    [subject, topic, approach, explanation]
  ).catch(() => ({ rows: [] })); // similarity function may not exist

  if (existing.rows.length > 0) {
    // Increment success count
    await pool.query(
      'UPDATE golden_explanations SET success_count = success_count + 1 WHERE id = $1',
      [existing.rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO golden_explanations (subject, topic, objective, year_group, approach, explanation, source_profile_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [subject, topic, objective || null, yearGroup || null, approach, explanation, profileId || null]
    );
  }
}

/**
 * Record an error→fix pattern
 */
async function recordErrorFix({ subject, topic, errorPattern, errorExample, fixApproach, fixExplanation, worked, yearGroup }) {
  const existing = await pool.query(
    `SELECT id, success_count, fail_count FROM error_fix_patterns
     WHERE subject = $1 AND topic = $2 AND error_pattern = $3 AND fix_approach = $4
     LIMIT 1`,
    [subject, topic, errorPattern, fixApproach]
  );

  if (existing.rows.length > 0) {
    const col = worked ? 'success_count' : 'fail_count';
    await pool.query(
      `UPDATE error_fix_patterns SET ${col} = ${col} + 1 WHERE id = $1`,
      [existing.rows[0].id]
    );
  } else if (worked) {
    await pool.query(
      `INSERT INTO error_fix_patterns (subject, topic, error_pattern, error_example, fix_approach, fix_explanation, year_group)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [subject, topic, errorPattern, errorExample || null, fixApproach, fixExplanation, yearGroup || null]
    );
  }
}

// ─── RETRIEVE INTELLIGENCE ───

/**
 * Get what works for a specific child on a subject
 */
async function getChildTeachingProfile(profileId, subject) {
  // Get approach effectiveness for this child
  const approaches = await pool.query(
    `SELECT approach,
            COUNT(*) FILTER (WHERE worked = TRUE) as successes,
            COUNT(*) FILTER (WHERE worked = FALSE) as failures,
            COUNT(*) as total,
            ROUND(COUNT(*) FILTER (WHERE worked = TRUE)::numeric / GREATEST(COUNT(*), 1) * 100) as effectiveness
     FROM teaching_outcomes
     WHERE profile_id = $1 AND ($2 IS NULL OR subject = $2)
     GROUP BY approach
     HAVING COUNT(*) >= 3
     ORDER BY effectiveness DESC`,
    [profileId, subject]
  );

  // Get recent breakthroughs
  const breakthroughs = await pool.query(
    `SELECT topic, approach, child_response, created_at
     FROM teaching_outcomes
     WHERE profile_id = $1 AND breakthrough = TRUE
     ORDER BY created_at DESC LIMIT 5`,
    [profileId]
  );

  // Get approaches that consistently fail for this child
  const failures = approaches.rows.filter(a => parseInt(a.effectiveness) < 30 && parseInt(a.total) >= 3);
  const successes = approaches.rows.filter(a => parseInt(a.effectiveness) >= 70);

  return { approaches: approaches.rows, breakthroughs: breakthroughs.rows, failures, successes };
}

/**
 * Get golden explanations for a topic
 */
async function getGoldenExplanations(subject, topic, yearGroup) {
  const result = await pool.query(
    `SELECT approach, explanation, success_count, effectiveness
     FROM golden_explanations
     WHERE subject = $1 AND topic = $2 AND ($3 IS NULL OR year_group = $3)
     ORDER BY effectiveness DESC, success_count DESC
     LIMIT 3`,
    [subject, topic, yearGroup || null]
  );
  return result.rows;
}

/**
 * Get error→fix patterns for a topic
 */
async function getErrorFixPatterns(subject, topic) {
  const result = await pool.query(
    `SELECT error_pattern, fix_approach, fix_explanation, success_count, fail_count
     FROM error_fix_patterns
     WHERE subject = $1 AND topic = $2 AND success_count > fail_count
     ORDER BY success_count DESC
     LIMIT 5`,
    [subject, topic]
  );
  return result.rows;
}

// ─── BUILD PROMPT CONTEXT ───

/**
 * Build teaching intelligence context for AI prompt injection
 */
async function buildTeachingContext(profileId, subject, topic, yearGroup) {
  let context = '';

  try {
    // 1. Child's personal teaching profile
    const childProfile = await getChildTeachingProfile(profileId, subject);

    if (childProfile.successes.length > 0) {
      const best = childProfile.successes.map(s => `${s.approach} (${s.effectiveness}% effective)`).join(', ');
      context += `\nTEACHING APPROACHES THAT WORK FOR THIS CHILD: ${best}. Use these.`;
    }

    if (childProfile.failures.length > 0) {
      const avoid = childProfile.failures.map(f => f.approach).join(', ');
      context += `\nAPPROACHES TO AVOID FOR THIS CHILD: ${avoid}. These consistently failed.`;
    }

    if (childProfile.breakthroughs.length > 0) {
      const recent = childProfile.breakthroughs[0];
      context += `\nLAST BREAKTHROUGH: ${recent.topic} using ${recent.approach} approach.`;
    }

    // 2. Golden explanations for this topic
    const golden = await getGoldenExplanations(subject, topic, yearGroup);
    if (golden.length > 0) {
      context += `\n\nPROVEN EXPLANATIONS FOR "${topic}" (these worked for other kids):`;
      for (const g of golden) {
        context += `\n- ${g.approach} approach (${g.success_count} kids understood): "${g.explanation.substring(0, 200)}"`;
      }
      context += `\nStart with the most effective approach above. If it doesn't work, try the next one.`;
    }

    // 3. Error→fix patterns
    const fixes = await getErrorFixPatterns(subject, topic);
    if (fixes.length > 0) {
      context += `\n\nCOMMON MISTAKES ON "${topic}" AND WHAT FIXES THEM:`;
      for (const f of fixes) {
        context += `\n- When child "${f.error_pattern}" → use ${f.fix_approach}: "${f.fix_explanation.substring(0, 150)}"`;
      }
    }
  } catch {}

  return context;
}

module.exports = {
  recordOutcome,
  saveGoldenExplanation,
  recordErrorFix,
  getChildTeachingProfile,
  getGoldenExplanations,
  getErrorFixPatterns,
  buildTeachingContext,
};
