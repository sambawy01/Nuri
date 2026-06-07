import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

function MicButton({
  onResult,
  lang = 'en-US',
  disabled = false,
  size = 56,
  className = '',
}) {
  const { startListening, stopListening, isListening } = useVoice();

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang,
        onResult: (text) => onResult?.(text),
        onError: (err) => console.warn('Speech recognition error:', err),
      });
    }
  }, [disabled, isListening, lang, onResult, startListening, stopListening]);

  const iconSize = Math.round(size * 0.4);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulsing ring when listening */}
      {isListening && (
        <motion.div
          className="absolute rounded-full border-2 border-red-400"
          style={{ width: size + 12, height: size + 12 }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.35, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main button */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        className="relative z-10 flex items-center justify-center rounded-full shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
        style={{
          width: size,
          height: size,
          backgroundColor: isListening ? '#FEE2E2' : '#FFFFFF',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {disabled ? (
          <MicOff size={iconSize} color="#9CA3AF" />
        ) : (
          <Mic size={iconSize} color={isListening ? '#EF4444' : '#6B7280'} />
        )}
      </motion.button>

      {/* Audio waveform bars */}
      {isListening && (
        <div
          className="absolute flex items-end gap-0.5"
          style={{ bottom: -Math.round(size * 0.22) }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full bg-red-400"
              style={{ width: 3 }}
              initial={{ height: 4 }}
              animate={{ height: [4, 14, 4] }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(MicButton);
