import { motion } from 'framer-motion';

export default function XPBar({ currentXP = 0, nextLevelXP = 100, level = 1 }) {
  const progress = Math.min((currentXP % 100) / (nextLevelXP || 100), 1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-purple-600">Level {level}</span>
        <span className="text-xs text-gray-500 font-semibold">
          {currentXP % 100} / {nextLevelXP} XP
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full gradient-bg"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
