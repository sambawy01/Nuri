import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🎉', '⭐', '🌟', '✨', '💫', '🎊', '🏆', '💪'];

function Particle({ emoji, x, y, delay }) {
  return (
    <motion.div
      className="fixed text-2xl pointer-events-none z-50"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 1, scale: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.8],
        y: [0, -80, -120],
        x: [0, (Math.random() - 0.5) * 100],
        rotate: [0, (Math.random() - 0.5) * 360],
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}

export default function CelebrationEffect({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </AnimatePresence>
  );
}
