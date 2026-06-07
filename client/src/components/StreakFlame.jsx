import { motion } from 'framer-motion';

export default function StreakFlame({ days }) {
  if (!days || days <= 0) return null;

  const intensity = Math.min(days / 10, 1);
  const flameSize = 20 + intensity * 20;

  return (
    <motion.div
      className="flex items-center gap-1"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <span style={{ fontSize: flameSize }} role="img" aria-label="streak">
        {'\uD83D\uDD25'}
      </span>
      <span className="font-bold text-orange-600 text-sm">{days} day streak</span>
    </motion.div>
  );
}
