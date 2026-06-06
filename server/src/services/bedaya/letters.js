/**
 * Arabic letter inventory + ordering for Bedaya.
 *
 * Three orders are supported:
 *   - 'antura'              — pedagogical order inspired by CHI 2023 Antura
 *                             research on Arabic literacy for children. Groups
 *                             visually-similar letters for discrimination
 *                             practice, front-loads disconnected letters, and
 *                             delays emphatics. Best for younger learners.
 *   - 'frequency' (default) — high-utility letters first so learners can
 *                             read meaningful words within a few sessions.
 *   - 'moe'                 — the traditional alphabetic order required for
 *                             MOE-branded deployments.
 *
 * Each entry carries enough metadata for the lesson engine: the glyph itself,
 * its name in Arabic, the romanised name (for non-Arabic-speaking devs / logs),
 * the consonant/vowel sound, and a handful of safe example words.
 *
 * SECURITY-OF-MEANING: example words and any future content are STRICTLY
 * SECULAR per the Bedaya brief. No religious words, no religious figures.
 */

const LETTERS = [
  { glyph: 'ا', name: 'ألف',  romanised: 'alif',  sound: 'aa', examples: ['أم', 'باب', 'ماء'] },
  { glyph: 'ب', name: 'باء',  romanised: 'baa',   sound: 'b',  examples: ['باب', 'بنت', 'بيت'] },
  { glyph: 'ت', name: 'تاء',  romanised: 'taa',   sound: 't',  examples: ['تين', 'بيت', 'توت'] },
  { glyph: 'ث', name: 'ثاء',  romanised: 'thaa',  sound: 'th', examples: ['ثوب', 'ثلج'] },
  { glyph: 'ج', name: 'جيم',  romanised: 'jiim',  sound: 'j',  examples: ['جمل', 'جسر'] },
  { glyph: 'ح', name: 'حاء',  romanised: 'haa',   sound: 'H',  examples: ['حقل', 'حليب'] },
  { glyph: 'خ', name: 'خاء',  romanised: 'khaa',  sound: 'kh', examples: ['خبز', 'خيمة'] },
  { glyph: 'د', name: 'دال',  romanised: 'daal',  sound: 'd',  examples: ['دار', 'يد'] },
  { glyph: 'ذ', name: 'ذال',  romanised: 'dhaal', sound: 'dh', examples: ['ذرة', 'ذيل'] },
  { glyph: 'ر', name: 'راء',  romanised: 'raa',   sound: 'r',  examples: ['رجل', 'مطر'] },
  { glyph: 'ز', name: 'زاي',  romanised: 'zaay',  sound: 'z',  examples: ['زيت', 'زهرة'] },
  { glyph: 'س', name: 'سين',  romanised: 'siin',  sound: 's',  examples: ['سوق', 'سمك'] },
  { glyph: 'ش', name: 'شين',  romanised: 'shiin', sound: 'sh', examples: ['شمس', 'شاي'] },
  { glyph: 'ص', name: 'صاد',  romanised: 'Saad',  sound: 'S',  examples: ['صباح', 'صورة'] },
  { glyph: 'ض', name: 'ضاد',  romanised: 'Daad',  sound: 'D',  examples: ['ضوء', 'ضيف'] },
  { glyph: 'ط', name: 'طاء',  romanised: 'Taa',   sound: 'T',  examples: ['طريق', 'طبيب'] },
  { glyph: 'ظ', name: 'ظاء',  romanised: 'Zaa',   sound: 'Z',  examples: ['ظل', 'ظهر'] },
  { glyph: 'ع', name: 'عين',  romanised: 'ayn',   sound: '3',  examples: ['عمل', 'عين'] },
  { glyph: 'غ', name: 'غين',  romanised: 'ghayn', sound: 'gh', examples: ['غيم', 'غداء'] },
  { glyph: 'ف', name: 'فاء',  romanised: 'faa',   sound: 'f',  examples: ['فول', 'فيل'] },
  { glyph: 'ق', name: 'قاف',  romanised: 'qaaf',  sound: 'q',  examples: ['قلم', 'قمر'] },
  { glyph: 'ك', name: 'كاف',  romanised: 'kaaf',  sound: 'k',  examples: ['كتاب', 'كرسي'] },
  { glyph: 'ل', name: 'لام',  romanised: 'laam',  sound: 'l',  examples: ['ليل', 'ليمون'] },
  { glyph: 'م', name: 'ميم',  romanised: 'miim',  sound: 'm',  examples: ['ماء', 'مدرسة'] },
  { glyph: 'ن', name: 'نون',  romanised: 'nuun',  sound: 'n',  examples: ['نهر', 'نخلة'] },
  { glyph: 'ه', name: 'هاء',  romanised: 'haah',  sound: 'h',  examples: ['هواء', 'نهر'] },
  { glyph: 'و', name: 'واو',  romanised: 'waaw',  sound: 'w',  examples: ['ورد', 'دواء'] },
  { glyph: 'ي', name: 'ياء',  romanised: 'yaa',   sound: 'y',  examples: ['يد', 'يوم'] },
];

const BY_GLYPH = Object.fromEntries(LETTERS.map(l => [l.glyph, l]));

/**
 * MOE-traditional order: the alphabetic sequence as taught in Egyptian
 * schools. Useful for MOE-branded deployments and older learners who
 * already know the alphabet song.
 */
const MOE_ORDER = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];

/**
 * Frequency-weighted order: high-utility letters first so functional words
 * (أم، باب، يد، ماء، بيت، نهر…) are reachable within the first few sessions.
 * Derived from common Arabic letter frequencies in everyday/written text.
 * Good default for intermediate learners who can already recognise basic
 * letter shapes.
 */
const FREQUENCY_ORDER = ['ا','ل','م','ي','ن','و','ر','ت','ب','ه','ع','س','ف','ك','د','ق','ح','ج','ش','ز','خ','ص','ث','ط','ذ','ض','غ','ظ'];

/**
 * Antura-inspired pedagogical order (CHI 2023 research on Arabic literacy).
 *
 * Groups visually-similar letters together for discrimination practice,
 * front-loads disconnected letters (easier to recognise in isolation),
 * and delays emphatics to reduce early confusion.
 *
 * Groups:
 *   1. ا ب ت ث — Ba family: shared base shape, teach together for discrimination.
 *   2. ج ح خ   — Jim family: throat letters with similar visual form.
 *   3. د ذ ر ز و — Disconnected letters: easier to recognise, don't join left.
 *   4. س ش ص ض — S-themed: similar shapes, force discrimination.
 *   5. ط ظ ع غ — Complex emphatics + throat.
 *   6. ف ق ك ل م ن ه ي — Connected letters: word-building.
 */
const ANTURA_ORDER = [
  // Group 1 — Ba family
  'ا','ب','ت','ث',
  // Group 2 — Jim family
  'ج','ح','خ',
  // Group 3 — Disconnected letters
  'د','ذ','ر','ز','و',
  // Group 4 — S-themed discrimination
  'س','ش','ص','ض',
  // Group 5 — Complex emphatics + throat
  'ط','ظ','ع','غ',
  // Group 6 — Connected word-building letters
  'ف','ق','ك','ل','م','ن','ه','ي',
];

function orderFor(mode) {
  if (mode === 'antura') return ANTURA_ORDER;
  if (mode === 'moe') return MOE_ORDER;
  return FREQUENCY_ORDER;
}

function letterInfo(glyph) {
  return BY_GLYPH[glyph] || null;
}

/**
 * Recommended order mode for a given year group.
 *
 *   - Year 1-2 (ages 5-7):   'antura'   — visual discrimination first.
 *   - Year 3-4 (ages 7-9):   'frequency' — transition to high-utility.
 *   - Year 5-6 (ages 9-11):  'moe'      — align with school curriculum.
 *
 * Defaults to 'frequency' when no yearGroup is provided.
 */
function recommendedOrder(yearGroup) {
  if (yearGroup >= 1 && yearGroup <= 2) return 'antura';
  if (yearGroup >= 3 && yearGroup <= 4) return 'frequency';
  if (yearGroup >= 5 && yearGroup <= 6) return 'moe';
  return 'frequency';
}

/**
 * Next letter for a learner given their existing progress.
 * Returns null when every letter in the chosen order is mastered.
 */
function nextLetter(orderMode, knownGlyphs) {
  const order = orderFor(orderMode);
  for (const g of order) {
    if (!knownGlyphs.includes(g)) return letterInfo(g);
  }
  return null;
}

module.exports = {
  LETTERS,
  MOE_ORDER,
  FREQUENCY_ORDER,
  ANTURA_ORDER,
  orderFor,
  letterInfo,
  recommendedOrder,
  nextLetter,
};
