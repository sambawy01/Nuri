// server/src/services/cross-subject.js
const connections = [
  { from: { subject: 'maths', keywords: ['fraction', 'fractions'] }, to: 'arabic', text: "In Arabic, the word for fraction is كسر (kasr)!" },
  { from: { subject: 'maths', keywords: ['fraction', 'fractions'] }, to: 'science', text: "In Science, you'll measure liquids in fractions of a litre!" },
  { from: { subject: 'maths', keywords: ['measuring', 'measurement', 'length', 'mass', 'capacity'] }, to: 'science', text: "In Science lab, you'll use these exact same units — ml, cm, g!" },
  { from: { subject: 'maths', keywords: ['roman numeral', 'roman numerals'] }, to: 'history', text: "The Romans used these for everything — you'll see them in History!" },
  { from: { subject: 'maths', keywords: ['symmetry', 'shape', 'shapes', 'geometry'] }, to: 'arabic', text: "Arabic art is full of geometric patterns and symmetry!" },
  { from: { subject: 'maths', keywords: ['time', 'clock', 'hours', 'minutes'] }, to: 'history', text: "Ancient Egyptians invented one of the first clocks — a sundial!" },
  { from: { subject: 'maths', keywords: ['data', 'chart', 'graph', 'pictogram'] }, to: 'science', text: "Scientists use these same charts to show their experiment results!" },
  { from: { subject: 'science', keywords: ['water cycle', 'evaporation', 'rain'] }, to: 'history', text: "The Nile floods because of the water cycle — that's how ancient Egypt farmed!" },
  { from: { subject: 'science', keywords: ['plant', 'plants', 'seed', 'grow'] }, to: 'history', text: "When humans first learned to grow plants, they stopped being nomads!" },
  { from: { subject: 'science', keywords: ['material', 'materials', 'metal', 'wood'] }, to: 'history', text: "The Stone Age, Bronze Age, Iron Age — all named after materials!" },
  { from: { subject: 'science', keywords: ['light', 'shadow', 'sun'] }, to: 'religion', text: "In many faiths, light is a symbol of goodness and truth!" },
  { from: { subject: 'science', keywords: ['force', 'push', 'pull', 'gravity'] }, to: 'maths', text: "You can use maths to calculate exactly how much force you need!" },
  { from: { subject: 'science', keywords: ['animal', 'animals', 'habitat'] }, to: 'arabic', text: "Many Arabic words describe animals — أسد (asad) means lion!" },
  { from: { subject: 'english', keywords: ['noun', 'nouns'] }, to: 'arabic', text: "In Arabic, nouns have gender — every word is either masculine or feminine!" },
  { from: { subject: 'english', keywords: ['adjective', 'adjectives'] }, to: 'arabic', text: "In Arabic, adjectives come AFTER the noun — the opposite of English!" },
  { from: { subject: 'english', keywords: ['verb', 'verbs', 'tense'] }, to: 'arabic', text: "Arabic verbs change based on who's doing the action, just like English!" },
  { from: { subject: 'english', keywords: ['story', 'stories', 'narrative'] }, to: 'history', text: "The best history is told as stories — just like English!" },
  { from: { subject: 'english', keywords: ['poetry', 'poem', 'rhyme'] }, to: 'arabic', text: "Arabic poetry is one of the oldest and most beautiful in the world!" },
  { from: { subject: 'history', keywords: ['egypt', 'pharaoh', 'pyramid', 'ancient'] }, to: 'science', text: "The Egyptians used early chemistry to mummify bodies — that's science!" },
  { from: { subject: 'history', keywords: ['egypt', 'pharaoh', 'nile'] }, to: 'arabic', text: "مصر (Misr) — that's Egypt in Arabic, one of the oldest words still used today!" },
  { from: { subject: 'history', keywords: ['roman', 'romans', 'rome'] }, to: 'maths', text: "Roman numerals like IV, IX, XII — you learn those in Maths!" },
  { from: { subject: 'history', keywords: ['war', 'battle', 'king', 'queen'] }, to: 'english', text: "Some of the best English literature tells stories about these events!" },
  { from: { subject: 'religion', keywords: ['creation', 'god', 'bible'] }, to: 'science', text: "Scientists study how the universe began too — in Science you'll learn about the Big Bang!" },
  { from: { subject: 'religion', keywords: ['church', 'monastery', 'coptic'] }, to: 'history', text: "The Coptic Church is one of the oldest in the world — over 1900 years!" },
  { from: { subject: 'religion', keywords: ['prayer', 'psalm'] }, to: 'arabic', text: "Many prayers use beautiful Arabic words and phrases!" },
  { from: { subject: 'arabic', keywords: ['letter', 'letters', 'alphabet'] }, to: 'english', text: "English has 26 letters, Arabic has 28 — but Arabic goes right to left!" },
  { from: { subject: 'arabic', keywords: ['number', 'numbers'] }, to: 'maths', text: "Did you know? The numbers we use (1, 2, 3) actually come from Arabic!" },
  { from: { subject: 'arabic', keywords: ['story', 'read', 'reading'] }, to: 'english', text: "Reading skills work the same way in any language — practice makes perfect!" },
];

function getConnections(subject, topic) {
  if (!subject || !topic) return [];
  const topicLower = topic.toLowerCase();
  return connections
    .filter(c => c.from.subject === subject.toLowerCase() && c.from.keywords.some(k => topicLower.includes(k)))
    .map(c => c.text);
}

module.exports = { getConnections, connections };
