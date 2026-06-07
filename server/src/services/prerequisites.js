/**
 * Prerequisite chains for key topics.
 * If a child struggles with a topic, check if they've mastered its prerequisites.
 */

const PREREQUISITE_CHAINS = {
  maths: {
    'Multiplication and Division': ['Addition and Subtraction', 'Counting and Place Value'],
    'Fractions': ['Multiplication and Division', 'Addition and Subtraction'],
    'Decimals': ['Fractions', 'Place Value'],
    'Ratio and Proportion': ['Fractions', 'Multiplication and Division'],
    'Algebra': ['Addition and Subtraction', 'Multiplication and Division', 'Fractions'],
    'Area and Perimeter': ['Multiplication and Division', 'Length, Mass and Capacity'],
    'Data Handling': ['Addition and Subtraction', 'Counting and Place Value'],
    'Time': ['Counting and Place Value', 'Addition and Subtraction'],
    'Money': ['Addition and Subtraction', 'Decimals'],
  },
  science: {
    'Food Chains': ['Animals', 'Living Things and Habitats'],
    'States of Matter': ['Everyday Materials', 'Uses of Everyday Materials'],
    'Electricity': ['Materials', 'Forces'],
    'Evolution': ['Living Things', 'Animals Including Humans'],
  },
  english: {
    'Complex Sentences': ['Simple Sentences', 'Conjunctions'],
    'Paragraphs': ['Sentences', 'Sequencing'],
    'Formal Writing': ['Paragraphs', 'Grammar'],
    'Comprehension Inference': ['Reading Comprehension', 'Vocabulary'],
  },
};

/**
 * Get prerequisites for a topic
 */
function getPrerequisites(subject, topic) {
  const subjectChains = PREREQUISITE_CHAINS[subject?.toLowerCase()] || {};
  // Check partial matches (topic names vary)
  for (const [key, prereqs] of Object.entries(subjectChains)) {
    if (topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())) {
      return prereqs;
    }
  }
  return [];
}

/**
 * Check if prerequisites are mastered
 */
async function checkPrerequisites(profileId, subject, topic, pool) {
  const prereqs = getPrerequisites(subject, topic);
  if (prereqs.length === 0) return { allMet: true, gaps: [] };

  const gaps = [];
  for (const prereq of prereqs) {
    const result = await pool.query(
      `SELECT AVG(CASE WHEN attempts > 0 THEN correct_count::float / attempts ELSE 0 END) as avg_accuracy
       FROM objective_mastery WHERE profile_id = $1 AND subject = $2 AND topic ILIKE $3`,
      [profileId, subject, `%${prereq}%`]
    );
    const accuracy = result.rows[0]?.avg_accuracy || 0;
    if (accuracy < 0.6) {
      gaps.push({ topic: prereq, accuracy: Math.round(accuracy * 100) });
    }
  }

  return { allMet: gaps.length === 0, gaps };
}

module.exports = { getPrerequisites, checkPrerequisites, PREREQUISITE_CHAINS };
