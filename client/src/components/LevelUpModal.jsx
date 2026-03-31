import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NuriOwl from './NuriOwl';

const CONFETTI_COLORS = ['#A855F7', '#F59E0B', '#14B8A6', '#F43F5E', '#3B82F6', '#10B981'];

function ConfettiPiece({ color, delay, x, y }) {
  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: 8 + Math.random() * 6,
        height: 8 + Math.random() * 6,
        backgroundColor: color,
        left: `${x}%`,
        top: `${y}%`,
      }}
      initial={{ opacity: 1, scale: 0, rotate: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1, 0.6],
        rotate: [0, (Math.random() - 0.5) * 720],
        y: [0, 200 + Math.random() * 200],
        x: [(Math.random() - 0.5) * 150],
      }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeOut' }}
    />
  );
}

function getLevelEvolution(level) {
  if (level >= 20) return 'Nuri gains golden wings!';
  if (level >= 15) return 'Nuri gets wise glasses!';
  if (level >= 10) return 'Stars orbit around Nuri!';
  if (level >= 5) return 'Nuri gets a colorful scarf!';
  return 'Nuri is growing stronger!';
}

export default function LevelUpModal({ level, visible, onClose }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (visible) {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        x: Math.random() * 100,
        y: Math.random() * 30,
      }));
      setConfetti(pieces);

      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((piece) => (
              <ConfettiPiece key={piece.id} {...piece} />
            ))}
          </div>

          {/* Modal card */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-8 mx-6 text-center max-w-sm w-full overflow-hidden"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,158,11,0.2))',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative z-10">
              {/* Title */}
              <motion.p
                className="text-lg font-bold text-gray-500 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Level Up!
              </motion.p>

              {/* Nuri */}
              <motion.div
                className="flex justify-center my-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3, damping: 10 }}
              >
                <NuriOwl state="celebrating" level={level} size="lg" />
              </motion.div>

              {/* Level number */}
              <motion.p
                className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.4, damping: 8 }}
              >
                Level {level}
              </motion.p>

              {/* Evolution description */}
              <motion.p
                className="text-sm font-semibold text-gray-500 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {getLevelEvolution(level)}
              </motion.p>

              {/* Tap to close hint */}
              <motion.p
                className="text-xs text-gray-400 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Tap anywhere to continue
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
