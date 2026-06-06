import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const STATES = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  RESULT: 'result',
  ERROR: 'error',
};

function VoiceLoginButton({ onIdentified, onFallback, disabled = false }) {
  const [state, setState] = useState(STATES.IDLE);
  const [micDenied, setMicDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // already stopped
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleRecord = useCallback(async () => {
    if (disabled) return;
    setMicDenied(false);
    setErrorMsg('');
    setState(STATES.REQUESTING);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      setMicDenied(true);
      setState(STATES.ERROR);
      return;
    }

    // Determine supported mime type
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

    try {
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach((t) => t.stop());

        if (chunksRef.current.length === 0) {
          setState(STATES.IDLE);
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });

        setState(STATES.PROCESSING);

        try {
          const audioBase64 = await blobToBase64(blob);
          const result = await api('/voice/identify', {
            method: 'POST',
            body: {
              audio: audioBase64,
              contentType: blob.type,
            },
          });

          if (result && result.confidence >= 0.7 && result.profile) {
            setState(STATES.RESULT);
            onIdentified?.(result.profile);
            // Reset after brief success display
            timerRef.current = setTimeout(() => setState(STATES.IDLE), 1500);
          } else {
            setState(STATES.IDLE);
            onFallback?.();
          }
        } catch (err) {
          console.warn('Voice identification failed:', err);
          // Service unavailable or identification failed → fallback gracefully
          setState(STATES.IDLE);
          onFallback?.();
        }
      };

      recorder.start();
      setState(STATES.LISTENING);

      // Auto-stop after 3 seconds
      timerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3000);
    } catch (err) {
      console.warn('MediaRecorder setup failed:', err);
      stream.getTracks().forEach((t) => t.stop());
      setState(STATES.IDLE);
      onFallback?.();
    }
  }, [disabled, onIdentified, onFallback]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleRecord();
      }
    },
    [handleRecord]
  );

  const isListening = state === STATES.LISTENING;
  const isProcessing = state === STATES.PROCESSING;
  const isSuccess = state === STATES.RESULT;
  const isDisabled = disabled || state === STATES.REQUESTING;

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      {/* Pulsing rings when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-orange-400"
              style={{ width: 72, height: 72 }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-purple-400"
              style={{ width: 84, height: 84 }}
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.5, 1] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        type="button"
        onClick={handleRecord}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        whileTap={!isDisabled ? { scale: 0.92 } : undefined}
        whileHover={!isDisabled ? { scale: 1.08 } : undefined}
        className="relative z-10 flex items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed"
        style={{
          width: 64,
          height: 64,
          background: isSuccess
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : isListening
              ? 'linear-gradient(135deg, #F97316, #A855F7)'
              : 'linear-gradient(135deg, #F97316, #A855F7)',
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={
          micDenied
            ? 'Microphone access needed for voice login'
            : isListening
              ? 'Listening for your voice'
              : isProcessing
                ? 'Processing your voice'
                : 'Log in with your voice'
        }
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={28} className="animate-spin text-white" />
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-2xl"
            >
              ✅
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Mic size={28} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {isListening && (
          <motion.p
            key="listening"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent"
          >
            Listening...
          </motion.p>
        )}
        {isProcessing && (
          <motion.p
            key="processing"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-semibold text-gray-500"
          >
            Checking...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mic denied tooltip */}
      <AnimatePresence>
        {micDenied && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white shadow-lg"
          >
            Microphone access needed for voice login
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceLoginButton;