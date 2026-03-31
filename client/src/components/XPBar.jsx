import { motion } from 'framer-motion';

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 800 },
  { level: 6, xp: 1200 },
  { level: 7, xp: 1700 },
  { level: 8, xp: 2300 },
  { level: 9, xp: 3000 },
  { level: 10, xp: 4000 },
  { level: 15, xp: 8000 },
  { level: 20, xp: 15000 },
  { level: 25, xp: 25000 },
  { level: 30, xp: 40000 },
];

function getLevelInfo(totalXP) {
  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1] || { level: 99, xp: 999999 };

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xp) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || { level: currentThreshold.level + 1, xp: currentThreshold.xp + 10000 };
    } else {
      break;
    }
  }

  const xpInLevel = totalXP - currentThreshold.xp;
  const xpNeeded = nextThreshold.xp - currentThreshold.xp;
  const progress = Math.min(xpInLevel / xpNeeded, 1);

  return { level: currentThreshold.level, xpInLevel, xpNeeded, progress };
}

export default function XPBar({ currentXP = 0, level }) {
  const info = getLevelInfo(currentXP);
  const displayLevel = level || info.level;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-purple-600">Level {displayLevel}</span>
        <span className="text-xs text-gray-500 font-semibold">
          {info.xpInLevel} / {info.xpNeeded} XP
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full gradient-bg"
          initial={{ width: 0 }}
          animate={{ width: `${info.progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
