import { motion, AnimatePresence } from 'framer-motion';

const OPTIONS = [
  { key: 'guessed', emoji: '😬', label: 'Guessed' },
  { key: 'unsure', emoji: '🤔', label: 'Unsure' },
  { key: 'pretty_sure', emoji: '😊', label: 'Pretty sure' },
  { key: 'knew_it', emoji: '💪', label: 'Knew it' },
];

export default function ConfidenceMeter({ visible, onSelect }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mt-4 bg-purple-50 rounded-2xl p-4"
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-bold text-purple-700 mb-3 text-center">
            How sure were you?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map((opt) => (
              <motion.button
                key={opt.key}
                onClick={() => onSelect(opt.key)}
                className="flex flex-col items-center gap-1 bg-white rounded-xl py-2 px-1 border-2 border-purple-100 hover:border-purple-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs font-semibold text-gray-600">{opt.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-purple-400 text-center mt-2 font-semibold">+2 XP for self-awareness</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
