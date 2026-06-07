const CHAPTERS = [
  {
    id: 1,
    title: 'The Book of Numbers',
    subject: 'maths',
    icon: '🔢',
    description: 'Hidden deep inside an ancient pyramid...',
    color: '#3B82F6',
    stages: [
      { stage: 1, type: 'story', title: 'The Pyramid Door', text: 'Deep in the Egyptian desert, Nuri discovers an ancient pyramid. But the door is locked with a number puzzle! "I need someone clever to help me," Nuri whispers. "Will you help me crack the code?"' },
      { stage: 2, type: 'learn', title: 'Number Secrets', text: 'To open the door, we need to understand how numbers work. Let me teach you something cool about numbers...' },
      { stage: 3, type: 'challenge', title: 'The First Lock', text: 'The door has three locks. Solve these to open each one!' },
      { stage: 4, type: 'boss', title: 'The Final Lock', text: 'The last lock is the trickiest! The Pharaoh himself set this puzzle thousands of years ago...' },
      { stage: 5, type: 'reward', title: 'The Book of Numbers!', text: 'The door swings open! Inside, glowing on a golden pedestal, is the Book of Numbers! You did it! Nuri is jumping with joy!' },
    ],
  },
  {
    id: 2,
    title: 'The Book of Nature',
    subject: 'science',
    icon: '🌿',
    description: 'Lost in a magical jungle...',
    color: '#10B981',
    stages: [
      { stage: 1, type: 'story', title: 'The Enchanted Jungle', text: 'Nuri has found a map leading to a magical jungle where plants can talk and animals hold secrets. "The Book of Nature is hidden here somewhere," says Nuri. "But we need to understand nature to find it!"' },
      { stage: 2, type: 'learn', title: 'Jungle Secrets', text: 'The talking trees say they will show us the way — but first we need to prove we understand how nature works...' },
      { stage: 3, type: 'challenge', title: 'The Talking Trees', text: 'Each tree asks a science question. Answer correctly and they point the way!' },
      { stage: 4, type: 'boss', title: 'The Guardian Animal', text: 'A wise old elephant blocks the path. "Answer my riddle," it says, "and I will show you the book."' },
      { stage: 5, type: 'reward', title: 'The Book of Nature!', text: 'The elephant smiles and steps aside. There, wrapped in vines and glowing green, is the Book of Nature! The jungle celebrates!' },
    ],
  },
  {
    id: 3,
    title: 'The Book of Words',
    subject: 'english',
    icon: '📖',
    description: 'Trapped in a magical library...',
    color: '#8B5CF6',
    stages: [
      { stage: 1, type: 'story', title: 'The Infinite Library', text: 'Nuri flies into an enormous library that goes on forever. Books float in the air and sentences write themselves on the walls. "The Book of Words is here," Nuri says, "but the library has scrambled everything!"' },
      { stage: 2, type: 'learn', title: 'Word Magic', text: 'The floating books whisper grammar rules and vocabulary secrets. Let us learn their language...' },
      { stage: 3, type: 'challenge', title: 'Unscramble the Shelves', text: 'The bookshelves are in the wrong order! Fix the sentences to put them right.' },
      { stage: 4, type: 'boss', title: 'The Word Dragon', text: 'A dragon made entirely of letters guards the final room. "Defeat me with your words!" it roars.' },
      { stage: 5, type: 'reward', title: 'The Book of Words!', text: 'The dragon dissolves into a shower of letters and the Book of Words appears! Every word in the library sings with joy!' },
    ],
  },
  {
    id: 4,
    title: 'The Book of Time',
    subject: 'history',
    icon: '⏳',
    description: 'Stuck in the past...',
    color: '#F59E0B',
    stages: [
      { stage: 1, type: 'story', title: 'The Time Portal', text: 'A swirling portal appears in front of Nuri! "The Book of Time is stuck in the past," Nuri realizes. "We need to travel through history to find it. Hold on tight!"' },
      { stage: 2, type: 'learn', title: 'Echoes of the Past', text: 'We have landed in ancient times! To navigate through history, we need to understand what happened and when...' },
      { stage: 3, type: 'challenge', title: 'Timeline Puzzles', text: 'The time portal asks us to prove we understand history before letting us through!' },
      { stage: 4, type: 'boss', title: 'The Riddle of Ages', text: 'An ancient historian appears as a ghost. "Only those who truly understand the past may take the book," they say.' },
      { stage: 5, type: 'reward', title: 'The Book of Time!', text: 'The ghost nods and fades away, leaving behind the glowing Book of Time! History itself thanks you for remembering!' },
    ],
  },
  {
    id: 5,
    title: 'The Book of Letters',
    subject: 'arabic',
    icon: '✍️',
    description: 'Guarded by a sphinx...',
    color: '#14B8A6',
    stages: [
      { stage: 1, type: 'story', title: 'The Desert Sphinx', text: 'In the golden desert, a magnificent sphinx sits guarding a hidden cave. "أهلاً — Welcome," says the sphinx. "The Book of Letters is inside. But you must answer my Arabic riddles to pass!"' },
      { stage: 2, type: 'learn', title: 'The Beauty of Arabic', text: 'The sphinx teaches us the secrets of Arabic letters and words. Each letter is like a piece of art...' },
      { stage: 3, type: 'challenge', title: "The Sphinx's Questions", text: 'The sphinx asks three Arabic questions. Answer them and the cave opens!' },
      { stage: 4, type: 'boss', title: 'The Final Riddle', text: "The sphinx's eyes glow. \"One final riddle — the hardest one. Are you ready?\"" },
      { stage: 5, type: 'reward', title: 'The Book of Letters!', text: 'The cave opens with a golden light! Inside, written in beautiful calligraphy, is the Book of Letters! The sphinx bows to you!' },
    ],
  },
  {
    id: 6,
    title: 'The Book of Light',
    subject: 'religion',
    icon: '✝️',
    description: 'In an ancient monastery...',
    color: '#F43F5E',
    stages: [
      { stage: 1, type: 'story', title: 'The Hidden Monastery', text: 'High on a mountain, Nuri finds an ancient Coptic monastery. Monks have protected the Book of Light for centuries. "To receive the book," says the oldest monk, "you must show you understand its teachings."' },
      { stage: 2, type: 'learn', title: 'Lessons of Light', text: 'The monks share their wisdom. Stories of faith, love, and hope echo through the stone halls...' },
      { stage: 3, type: 'challenge', title: "The Monk's Test", text: 'The monks gently test your knowledge of faith and values.' },
      { stage: 4, type: 'boss', title: 'The Heart Question', text: 'The oldest monk looks into your eyes. "This last question comes from the heart, not from books," he says.' },
      { stage: 5, type: 'reward', title: 'The Book of Light!', text: 'The monk smiles and hands you the Book of Light. It glows warm in your hands. "Use this knowledge to spread light in the world," he says.' },
    ],
  },
  {
    id: 7,
    title: 'The Book of People',
    subject: 'socialstudies',
    icon: '🌍',
    description: 'In a bustling city...',
    color: '#6366F1',
    stages: [
      { stage: 1, type: 'story', title: 'The World City', text: 'Nuri arrives in an incredible city where people from every country live together. "The Book of People is here," Nuri says, "but it is divided into pieces, and each community holds one part!"' },
      { stage: 2, type: 'learn', title: 'Understanding People', text: 'To gather the pieces, we need to understand how people live together, share resources, and build communities...' },
      { stage: 3, type: 'challenge', title: 'Community Quest', text: 'Each community asks you a question about how people live and work together.' },
      { stage: 4, type: 'boss', title: 'The Council', text: 'The city council meets to ask the final question. "Show us you understand what makes a good community."' },
      { stage: 5, type: 'reward', title: 'The Book of People!', text: 'The pieces come together and the Book of People shines! The whole city celebrates and Nuri sheds a happy tear. All seven books are found!' },
    ],
  },
];

function getChapters() { return CHAPTERS; }
function getChapter(id) { return CHAPTERS.find(c => c.id === id); }
function getStage(chapterId, stageNum) {
  const ch = getChapter(chapterId);
  return ch?.stages.find(s => s.stage === stageNum);
}

module.exports = { CHAPTERS, getChapters, getChapter, getStage };
