import { motion, AnimatePresence } from 'framer-motion';

/**
 * Soft pause modal — appears when the kid has been absent for ~2 minutes.
 * No scolding. No XP language. Just "I'll wait."
 */
export default function PresencePausedModal({ open, onResume, onExit }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 6 }}
            className="bg-white rounded-3xl shadow-xl px-6 py-7 max-w-xs mx-4 text-center"
          >
            <div className="text-5xl mb-2">🌸</div>
            <div className="font-bold text-lg text-gray-800 mb-1">
              I&apos;ll wait for you
            </div>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Take your time. When you&apos;re back, tap to keep going.
            </p>
            <button
              onClick={onResume}
              className="w-full py-3 rounded-2xl gradient-bg text-white font-bold shadow-md"
            >
              I&apos;m back!
            </button>
            <button
              onClick={onExit}
              className="mt-2 w-full py-2 rounded-2xl text-gray-500 text-sm font-semibold"
            >
              Done for now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
