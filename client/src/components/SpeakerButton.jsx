import { memo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

function SpeakerButton({
  text = '',
  lang,
  autoPlay = false,
  size = 32,
  className = '',
}) {
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const handleClick = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (text) {
      speak(text, { lang });
    }
  }, [isSpeaking, lang, speak, stopSpeaking, text]);

  // Auto-play on mount when requested
  useEffect(() => {
    if (autoPlay && text) {
      speak(text, { lang });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconSize = Math.round(size * 0.5);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className={`inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: isSpeaking ? '#CCFBF1' : '#F3F4F6',
        cursor: text ? 'pointer' : 'not-allowed',
        opacity: text ? 1 : 0.4,
      }}
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      disabled={!text}
    >
      <motion.div
        animate={
          isSpeaking
            ? { scale: [1, 1.15, 1] }
            : { scale: 1 }
        }
        transition={
          isSpeaking
            ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        <Volume2
          size={iconSize}
          color={isSpeaking ? '#14B8A6' : '#6B7280'}
        />
      </motion.div>
    </motion.button>
  );
}

export default memo(SpeakerButton);
