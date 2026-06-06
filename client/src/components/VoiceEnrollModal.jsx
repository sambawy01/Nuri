import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';

const PROMPTS = [
  'Say your name! 🎤',
  'Great! One more time! 🌟',
  'Almost there! One last time! 🎉',
];

const STEPS = 3;

function VoiceEnrollModal({ profileId, profileName, onComplete, onSkip, open }) {
  const [step, setStep] = useState(0); // 0-indexed, 0–2
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [success, setSuccess] = useState(false);
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

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(0);
      setRecording(false);
      setProcessing(false);
      setError(null);
      setCompleted(false);
      setSuccess(false);
    }
    return () => cleanup();
  }, [open, cleanup]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onSkip?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onSkip]);

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

  const startRecording = useCallback(async () => {
    setError(null);
    setRecording(true);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      setError('Microphone access needed for voice enrollment.');
      setRecording(false);
      return;
    }

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
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);

        if (chunksRef.current.length === 0) {
          setError('No audio captured. Please try again.');
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setProcessing(true);

        try {
          const audioBase64 = await blobToBase64(blob);
          await api('/voice/enroll', {
            method: 'POST',
            body: {
              profileId,
              audio: audioBase64,
              contentType: blob.type,
              step: step + 1,
            },
          });

          setProcessing(false);

          if (step < STEPS - 1) {
            setStep((s) => s + 1);
          } else {
            // All 3 steps done
            setCompleted(true);
            setSuccess(true);
            setTimeout(() => {
              onComplete?.();
            }, 2000);
          }
        } catch (err) {
          console.warn('Voice enrollment step failed:', err);
          setProcessing(false);
          setError('Something went wrong. Tap retry to try again.');
        }
      };

      recorder.start();
      // Auto-stop after 3 seconds
      timerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3000);
    } catch (err) {
      console.warn('MediaRecorder setup failed:', err);
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setError('Could not start recording. Please try again.');
    }
  }, [step, profileId, onComplete]);

  const progressPercent = ((step + (completed ? 1 : 0)) / STEPS) * 100;

  // Confetti-like particles for success
  const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    emoji: ['⭐', '🎉', '✨', '💫', '🌟', '🎈'][i % 6],
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 180 + 80),
    rotate: Math.random() * 360,
    delay: Math.random() * 0.4,
  }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="enroll-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !recording && !processing) onSkip?.();
          }}
        >
          {/* Confetti on success */}
          {success && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              {CONFETTI.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute text-2xl"
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: p.x,
                    y: p.y,
                    scale: [0, 1.5, 0.5],
                    rotate: p.rotate,
                  }}
                  transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
                >
                  {p.emoji}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            key="enroll-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-50 mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            {/* Close button */}
            {!recording && !processing && (
              <button
                onClick={() => onSkip?.()}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Close enrollment"
              >
                <X size={20} />
              </button>
            )}

            {success ? (
              // Success state
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                  Voice Saved!
                </h2>
                <p className="text-gray-500 text-lg">
                  Next time you can log in just by speaking!
                </p>
              </div>
            ) : (
              // Recording flow
              <div className="flex flex-col items-center gap-6 text-center">
                {/* Title */}
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                    Voice Login Setup
                  </h2>
                  <p className="mt-1 text-gray-500">
                    Help {profileName || 'me'} recognize your voice!
                  </p>
                </div>

                {/* Step prompt */}
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xl font-bold tracking-tight"
                >
                  {PROMPTS[step]}
                </motion.div>

                {/* Progress bar */}
                <div className="w-full">
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                    <span>Step {step + 1} of {STEPS}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-purple-500"
                      initial={{ width: `${(step / STEPS) * 100}%` }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Mic button */}
                <div className="relative">
                  {/* Pulse rings when recording */}
                  <AnimatePresence>
                    {recording && (
                      <>
                        <motion.div
                          className="absolute inset-0 -m-2 rounded-full border-2 border-orange-400"
                          initial={{ opacity: 0.6, scale: 1 }}
                          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 -m-4 rounded-full border-2 border-purple-400"
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

                  <motion.button
                    type="button"
                    onClick={startRecording}
                    disabled={recording || processing}
                    whileTap={!recording && !processing ? { scale: 0.92 } : undefined}
                    whileHover={!recording && !processing ? { scale: 1.08 } : undefined}
                    className="relative z-10 flex items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400"
                    style={{
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #F97316, #A855F7)',
                      opacity: recording || processing ? 0.6 : 1,
                      cursor: recording || processing ? 'not-allowed' : 'pointer',
                    }}
                    aria-label={
                      recording
                        ? 'Recording your voice'
                        : processing
                          ? 'Processing audio'
                          : `Start recording step ${step + 1} of ${STEPS}`
                    }
                  >
                    <AnimatePresence mode="wait">
                      {processing ? (
                        <motion.div
                          key="spinner"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                        >
                          <Loader2 size={32} className="animate-spin text-white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="mic"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Mic size={32} className="text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                {/* Status text */}
                <AnimatePresence mode="wait">
                  {recording && (
                    <motion.p
                      key="recording"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent"
                    >
                      Listening for 3 seconds...
                    </motion.p>
                  )}
                  {processing && (
                    <motion.p
                      key="processing"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm font-semibold text-gray-500"
                    >
                      Saving your voice...
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Error message with retry */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <p className="text-sm text-red-500">{error}</p>
                      <button
                        onClick={startRecording}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        aria-label="Retry recording"
                      >
                        <RotateCcw size={14} />
                        Try again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip link */}
                {!recording && !processing && (
                  <button
                    onClick={() => onSkip?.()}
                    className="mt-2 text-sm text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:rounded"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VoiceEnrollModal;