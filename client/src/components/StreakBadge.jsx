import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const MILESTONES = [7, 14, 30, 100];

function getStreakTier(days) {
  if (days >= 100) return { color: 'bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500', text: 'text-white' };
  if (days >= 30) return { color: 'bg-yellow-400', text: 'text-yellow-900' };
  if (days >= 14) return { color: 'bg-gray-300', text: 'text-gray-700' };
  if (days >= 7) return { color: 'bg-orange-300', text: 'text-orange-800' };
  return { color: 'bg-gray-100', text: 'text-gray-500' };
}

function getNextMilestone(days) {
  for (const m of MILESTONES) {
    if (days < m) return m;
  }
  return null;
}

function isMilestone(days) {
  return MILESTONES.includes(days);
}

export default function StreakBadge({ days = 0 }) {
  const tier = getStreakTier(days);
  const [showTooltip, setShowTooltip] = useState(false);
  const hitMilestone = isMilestone(days);
  const nextMilestone = getNextMilestone(days);
  const daysUntilNext = nextMilestone ? nextMilestone - days : null;

  const tooltipText = useMemo(() => {
    if (daysUntilNext === null) return 'Maximum streak milestone reached!';
    if (daysUntilNext === 0) return 'Milestone reached!';
    return `${daysUntilNext} day${daysUntilNext === 1 ? '' : 's'} until ${nextMilestone}-day milestone`;
  }, [daysUntilNext, nextMilestone]);

  return (
    <div className="relative inline-block">
      <motion.div
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm ${tier.color} ${tier.text} cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        onTap={() => setShowTooltip((v) => !v)}
        animate={hitMilestone ? {
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        } : {}}
        transition={hitMilestone ? {
          duration: 0.6,
          repeat: 2,
          ease: 'easeInOut',
        } : {}}
      >
        <motion.div
          animate={hitMilestone ? {
            scale: [1, 1.4, 1],
            rotate: [0, 15, -15, 0],
          } : {}}
          transition={hitMilestone ? {
            duration: 0.5,
            repeat: 3,
            ease: 'easeInOut',
          } : {}}
        >
          <Flame size={16} className={days > 0 ? 'text-orange-500' : ''} />
        </motion.div>
        <span>{days}</span>
      </motion.div>

      {/* Milestone burst particles */}
      <AnimatePresence>
        {hitMilestone && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [1, 0],
                  scale: [0, 1.5],
                  x: Math.cos((i * Math.PI * 2) / 6) * 30,
                  y: Math.sin((i * Math.PI * 2) / 6) * 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap z-50 pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {tooltipText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
