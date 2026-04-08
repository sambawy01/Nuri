import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  emoji: ['\u2B50', '\uD83C\uDF89', '\u2728', '\uD83D\uDCAB', '\uD83C\uDF1F', '\uD83D\uDD25', '\uD83D\uDCAA'][i % 7],
  x: (Math.random() - 0.5) * 300,
  y: -(Math.random() * 200 + 100),
  rotate: Math.random() * 360,
  delay: Math.random() * 0.3,
}));

export default function CelebrationBurst({ show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {PARTICLES.map(p => (
            <motion.div
              key={p.id}
              className="absolute text-2xl"
              initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x,
                y: p.y,
                scale: [0, 1.5, 0.5],
                rotate: p.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-6xl"
          >
            {'\uD83C\uDFAF'}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
