import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

function getStreakTier(days) {
  if (days >= 100) return { color: 'bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500', text: 'text-white' };
  if (days >= 30) return { color: 'bg-yellow-400', text: 'text-yellow-900' };
  if (days >= 14) return { color: 'bg-gray-300', text: 'text-gray-700' };
  if (days >= 7) return { color: 'bg-orange-300', text: 'text-orange-800' };
  return { color: 'bg-gray-100', text: 'text-gray-500' };
}

export default function StreakBadge({ days = 0 }) {
  const tier = getStreakTier(days);

  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm ${tier.color} ${tier.text}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Flame size={16} className={days > 0 ? 'text-orange-500' : ''} />
      <span>{days}</span>
    </motion.div>
  );
}
