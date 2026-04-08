/**
 * Nuri Curriculum Data — Aggregator
 *
 * Sources:
 * - Maths: Cambridge Primary Mathematics Framework 0845
 * - Science: Cambridge Primary Science Framework 0846/0097
 * - English: Cambridge Primary English Framework 0844/0058
 * - History: English National Curriculum — History Programmes of Study (KS1/KS2)
 * - Arabic: Egyptian Ministry of Education — Arabic Language Curriculum 2025-2026
 * - Religion: Egyptian Ministry of Education — Christian Religious Education (Coptic Orthodox)
 * - Religion (Islamic): Egyptian Ministry of Education — Islamic Religious Education
 *
 * See /research/cambridge-primary-curriculum.md and /research/egyptian-national-curriculum.md
 */

const maths = require('./curriculum-maths');
const science = require('./curriculum-science');
const english = require('./curriculum-english');
const history = require('./curriculum-history');
const arabic = require('./curriculum-arabic');
const religion = require('./curriculum-religion');
const religionIslamic = require('./curriculum-religion-islamic');
const socialstudies = require('./curriculum-socialstudies');

const curriculum = { maths, science, english, history, arabic, religion, socialstudies };

/**
 * Get all topic objects for a subject and year group.
 * Pass religionType = 'islamic' to route to the Islamic curriculum;
 * omit or pass anything else to default to the Christian curriculum.
 */
function getTopics(subject, yearGroup, religionType) {
  const lower = subject.toLowerCase();

  if (lower === 'religion' && religionType === 'islamic') {
    const topics = religionIslamic[yearGroup] || null;
    if (!topics) return null;
    return topics.map(t => (typeof t === 'string' ? { id: `religion-${yearGroup}-${t}`, name: t, strand: '', codes: [], objectives: [] } : t));
  }

  const subjectData = curriculum[lower];
  if (!subjectData) return null;
  const topics = subjectData[yearGroup];
  if (!topics) return null;

  // Ensure backward compatibility — if topics are strings (legacy), wrap them
  return topics.map(t => (typeof t === 'string' ? { id: `${subject}-${yearGroup}-${t}`, name: t, strand: '', codes: [], objectives: [] } : t));
}

/**
 * Get just topic name strings (backward compatible)
 */
function getTopicNames(subject, yearGroup, religionType) {
  const topics = getTopics(subject, yearGroup, religionType);
  if (!topics) return null;
  return topics.map(t => t.name);
}

/**
 * Get age range string for a year group
 */
function getAgeRange(yearGroup) {
  const ranges = { 1: '5-6', 2: '6-7', 3: '7-8', 4: '8-9', 5: '9-10', 6: '10-11' };
  return ranges[yearGroup] || null;
}

/**
 * Get curriculum type label for a subject.
 * Pass religionType = 'islamic' to get the Islamic label; defaults to Christian.
 */
function getCurriculumType(subject, religionType) {
  const lower = subject.toLowerCase();
  if (lower === 'maths') return 'Cambridge Primary Mathematics Framework 0845';
  if (lower === 'science') return 'Cambridge Primary Science Framework 0846/0097';
  if (lower === 'english') return 'Cambridge Primary English Framework 0844/0058';
  if (lower === 'history') return 'English National Curriculum — Humanities (History & Geography)';
  if (lower === 'arabic') return 'Egyptian National Curriculum — Arabic Language';
  if (lower === 'religion') return religionType === 'islamic'
    ? 'Egyptian National Curriculum — Islamic Religious Education'
    : 'Egyptian National Curriculum — Christian Religious Education (Coptic Orthodox)';
  if (lower === 'socialstudies') return 'Egyptian National Curriculum — Social Studies';
  return 'General Curriculum';
}

/**
 * Convenience helper — get topics for a specific religion without specifying the subject key.
 * religionType: 'islamic' | 'christian' (default)
 */
function getReligionTopics(yearGroup, religionType) {
  return getTopics('religion', yearGroup, religionType);
}

/**
 * Get objectives for a specific topic by ID
 */
function getObjectives(subject, yearGroup, topicId, religionType) {
  const topics = getTopics(subject, yearGroup, religionType);
  if (!topics) return null;
  const topic = topics.find(t => t.id === topicId);
  return topic ? topic.objectives : null;
}

/**
 * Get unique strands for a subject/year
 */
function getStrands(subject, yearGroup) {
  const topics = getTopics(subject, yearGroup);
  if (!topics) return null;
  return [...new Set(topics.map(t => t.strand).filter(Boolean))];
}

module.exports = {
  curriculum,
  getTopics,
  getTopicNames,
  getAgeRange,
  getCurriculumType,
  getObjectives,
  getStrands,
};
