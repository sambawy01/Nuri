import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function XPPopup({ amount, trigger }) {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    if (trigger && amount) {
      const id = Date.now() + Math.random();
      setPopups((prev) => [...prev, { id, amount }]);

      const timer = setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, amount]);

  return (
    <div className="fixed top-16 right-0 left-0 pointer-events-none z-50 flex justify-center">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            className="absolute"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-extrabold text-xl px-5 py-2 rounded-full shadow-lg">
              +{popup.amount} XP {'\u26A1'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
