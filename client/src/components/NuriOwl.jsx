import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sizes = { sm: 60, md: 120, lg: 200 };

/* ─── Expression images ─── */
const expressionMap = {
  idle: '/nuri/idle.png',
  talking: '/nuri/talking.png',
  celebrating: '/nuri/celebrating.png',
  thinking: '/nuri/thinking.png',
  encouraging: '/nuri/encouraging.png',
  excited: '/nuri/excited.png',
  sad: '/nuri/sad.png',
  sleeping: '/nuri/sleeping.png',
};

/* ─── Subject images ─── */
const subjectMap = {
  maths: '/nuri/subject-maths.png',
  science: '/nuri/subject-science.png',
  english: '/nuri/subject-english.png',
  history: '/nuri/subject-history.png',
  religion: '/nuri/subject-religion.png',
  arabic: '/nuri/subject-arabic.png',
  socialstudies: '/nuri/subject-socialstudies.png',
};

/* ─── Evolution stage images ─── */
function getStageImage(level) {
  if (level >= 25) return '/nuri/stage-6.png';
  if (level >= 20) return '/nuri/stage-5.png';
  if (level >= 15) return '/nuri/stage-4.png';
  if (level >= 10) return '/nuri/stage-3.png';
  if (level >= 5) return '/nuri/stage-2.png';
  return '/nuri/stage-1.png';
}

/* ─── Animation variants per state ─── */
const stateAnimations = {
  idle: {
    y: [0, -3, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  talking: {
    y: [0, -2, 0],
    transition: { duration: 0.5, repeat: Infinity },
  },
  celebrating: {
    y: [0, -15, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.6, repeat: 2 },
  },
  thinking: {
    rotate: [0, 5, 0],
    transition: { duration: 2, repeat: Infinity },
  },
  encouraging: {
    rotate: [0, 3, -3, 0],
    transition: { duration: 1.5, repeat: Infinity },
  },
  excited: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.4, repeat: Infinity },
  },
  sad: {
    y: [0, -1, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  sleeping: {
    rotate: [0, 2, -2, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

function NuriOwl({ state = 'idle', level = 1, size = 'md', subject = null }) {
  const px = sizes[size] || sizes.md;

  // Determine which image to show — subject variant takes priority if provided
  const imageSrc = useMemo(() => {
    if (subject && subjectMap[subject]) return subjectMap[subject];
    return expressionMap[state] || expressionMap.idle;
  }, [state, subject]);

  const animation = stateAnimations[state] || stateAnimations.idle;

  return (
    <motion.div
      style={{ width: px, height: px }}
      className="relative inline-flex items-center justify-center"
      animate={animation}
    >
      <img
        src={imageSrc}
        alt={`Nuri ${subject ? subject : state}`}
        width={px}
        height={px}
        className="object-contain"
        draggable={false}
      />
    </motion.div>
  );
}

export default memo(NuriOwl);
export { getStageImage, subjectMap, expressionMap };
