import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, ShieldCheck } from 'lucide-react';

/**
 * ParentPinModal
 * Props:
 *   mode: 'set' | 'verify'
 *   onSuccess(pin): called with the entered PIN when complete
 *   onCancel(): called when user dismisses without completing
 */
export default function ParentPinModal({ mode = 'verify', onSuccess, onCancel }) {
  const [digits, setDigits] = useState([]);
  const [shake, setShake] = useState(false);
  const [confirmDigits, setConfirmDigits] = useState(null); // for 'set' mode second pass
  const [phase, setPhase] = useState('enter'); // 'enter' | 'confirm'

  const isSet = mode === 'set';

  function handleDigit(d) {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      setTimeout(() => handleComplete(next), 160);
    }
  }

  function handleDelete() {
    setDigits(prev => prev.slice(0, -1));
  }

  function handleComplete(pin) {
    if (isSet) {
      if (phase === 'enter') {
        // Store first entry and ask for confirmation
        setConfirmDigits(pin);
        setPhase('confirm');
        setDigits([]);
      } else {
        // Confirm phase — check they match
        if (pin.join('') === confirmDigits.join('')) {
          onSuccess(pin.join(''));
        } else {
          triggerShake();
          setPhase('enter');
          setConfirmDigits(null);
          setDigits([]);
        }
      }
    } else {
      onSuccess(pin.join(''));
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  const title = isSet
    ? phase === 'enter' ? 'Set a Parent PIN' : 'Confirm your PIN'
    : 'Parent Dashboard';
  const subtitle = isSet
    ? phase === 'enter'
      ? 'Choose a 4-digit PIN to protect the parent area'
      : 'Enter your PIN again to confirm'
    : 'Enter your 4-digit PIN to continue';

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
          {isSet ? <ShieldCheck size={32} className="text-white" /> : <Lock size={32} className="text-white" />}
        </div>

        <h2 className="text-xl font-extrabold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 font-medium mb-6">{subtitle}</p>

        {/* Dot indicators */}
        <motion.div
          className="flex justify-center gap-4 mb-8"
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
        >
          {[0,1,2,3].map(i => (
            <motion.div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                i < digits.length
                  ? 'bg-gradient-to-br from-orange-400 to-purple-500 border-transparent'
                  : 'bg-white border-gray-300'
              }`}
              animate={i < digits.length ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </motion.div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {keys.map((k, idx) => {
            if (k === '') return <div key={idx} />;
            if (k === 'del') {
              return (
                <motion.button
                  key="del"
                  onClick={handleDelete}
                  className="h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold active:bg-gray-200"
                  whileTap={{ scale: 0.92 }}
                >
                  <Delete size={20} />
                </motion.button>
              );
            }
            return (
              <motion.button
                key={k}
                onClick={() => handleDigit(k)}
                className="h-14 rounded-2xl bg-gray-100 text-gray-800 text-xl font-bold active:bg-orange-100 active:text-orange-600"
                whileTap={{ scale: 0.92 }}
              >
                {k}
              </motion.button>
            );
          })}
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-400 font-semibold hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </motion.div>
    </div>
  );
}
