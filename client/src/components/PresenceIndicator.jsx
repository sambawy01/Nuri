import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Circle } from 'lucide-react';

/**
 * Always-visible chip when presence is active. Two purposes:
 *   1. Tells the kid Nuri is "looking" (transparency, not surveillance)
 *   2. Provides a one-tap turn-off via the X button (passed in as onTurnOff)
 *
 * status: 'starting' | 'active' | 'paused' | 'denied' | 'ended'
 */
export default function PresenceIndicator({ status, tier, onTurnOff }) {
  if (status === 'idle' || status === 'ended' || tier === 'off') return null;

  const isCamera = tier === 't2' || tier === 't3';

  const label = (() => {
    if (status === 'starting') return 'Saying hi…';
    if (status === 'denied') return 'Listening';
    if (status === 'paused') return 'Waiting for you';
    return isCamera ? 'Nuri can see you' : 'Nuri is listening';
  })();

  const dotColor =
    status === 'paused' ? 'bg-amber-400' :
    status === 'denied' ? 'bg-blue-400' :
    'bg-green-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-40
                   flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-white/95 backdrop-blur shadow-md border border-gray-100"
      >
        <motion.span
          className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
          animate={{ scale: status === 'active' ? [1, 1.4, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        {isCamera ? <Eye size={13} className="text-gray-500" /> : <Circle size={13} className="text-gray-500" />}
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        {onTurnOff && (
          <button
            onClick={onTurnOff}
            className="ml-1 text-[10px] font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wide"
            aria-label="Turn off presence"
          >
            off
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
