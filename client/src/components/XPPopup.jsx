import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function XPPopup({ amount, trigger }) {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    if (trigger && amount) {
      const id = Date.now() + Math.random();
      const offsetX = (Math.random() - 0.5) * 40;
      setPopups((prev) => [...prev, { id, amount, offsetX }]);

      const timer = setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [trigger, amount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            className="absolute font-extrabold text-2xl drop-shadow-lg"
            style={{
              color: '#F59E0B',
              textShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
            }}
            initial={{ opacity: 1, y: 0, x: popup.offsetX, scale: 0.5 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            +{popup.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
