import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

const STEPS = {
  INTRO: 'intro',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

function VoiceEnrollModal({ profileId, profileName, onComplete, onSkip, open }) {
  const [step, setStep] = useState(STEPS.INTRO);
  const [errorMsg, setErrorMsg] = useState('');
  const [samplesCollected, setSamplesCollected] = useState(0);
  const TOTAL_SAMPLES = 3;
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(STEPS.INTRO);
      setErrorMsg('');
      setSamplesCollected(0);
    }
  }, [open]);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
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
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleRecord = useCallback(async () => {
    setErrorMsg('');
    setStep(STEPS.RECORDING);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setErrorMsg('Microphone access is needed for voice enrollment.');
      setStep(STEPS.ERROR);
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

        if (chunksRef.current.length === 0) {
          setStep(STEPS.INTRO);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setStep(STEPS.PROCESSING);

        try {
          const audioBase64 = await blobToBase64(blob);
          const result = await api('/voice/enroll', {
            method: 'POST',
            body: { profileId, audio: audioBase64, contentType: blob.type },
          });

          if (result && result.success) {
            const newCount = (result.data?.samplesCount || samplesCollected + 1);
            setSamplesCollected(newCount);

            if (newCount >= TOTAL_SAMPLES) {
              setStep(STEPS.DONE);
            } else {
              setStep(STEPS.INTRO);
            }
          } else {
            setErrorMsg(result?.error || 'Voice enrollment failed. Try again.');
            setStep(STEPS.ERROR);
          }
        } catch (err) {
          setErrorMsg('Something went wrong. Please try again.');
          setStep(STEPS.ERROR);
        }
      };

      recorder.start();

      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3000);
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      setErrorMsg('Could not start recording. Please try again.');
      setStep(STEPS.ERROR);
    }
  }, [profileId, samplesCollected]);

  const handleRetry = useCallback(() => {
    setStep(STEPS.INTRO);
    setErrorMsg('');
  }, []);

  // Progress dots
  const progressDots = Array.from({ length: TOTAL_SAMPLES }, (_, i) => (
    <motion.div
      key={i}
      className="w-3 h-3 rounded-full"
      style={{
        backgroundColor: i < samplesCollected ? '#10B981' : '#E5E7EB',
      }}
      animate={i < samplesCollected ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
    />
  ));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Close / Skip button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip voice enrollment"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-extrabold gradient-text text-center">
              Voice Login Setup
            </h2>

            {/* Step: INTRO */}
            {step === STEPS.INTRO && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-gray-600 text-sm text-center">
                  {samplesCollected === 0
                    ? `${profileName}, let's teach Nuri to recognise your voice! Say your name when the mic turns on.`
                    : `Great job! ${TOTAL_SAMPLES - samplesCollected} more to go.`}
                </p>

                {/* Progress dots */}
                <div className="flex gap-2">{progressDots}</div>

                <motion.button
                  onClick={handleRecord}
                  className="gradient-bg text-white font-bold py-3 px-8 rounded-2xl shadow-lg flex items-center gap-2"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Mic size={20} />
                  {samplesCollected === 0 ? 'Start Recording' : 'Record Again'}
                </motion.button>

                {samplesCollected > 0 && (
                  <button
                    onClick={onComplete}
                    className="text-sm text-orange-500 font-semibold underline"
                  >
                    Skip remaining samples
                  </button>
                )}
              </motion.div>
            )}

            {/* Step: RECORDING */}
            {step === STEPS.RECORDING && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mic size={32} className="text-white" />
                </motion.div>
                <p className="text-gray-600 font-semibold text-center">
                  Say "<span className="text-orange-500">{profileName}</span>" clearly...
                </p>
                <div className="flex gap-2">{progressDots}</div>
              </motion.div>
            )}

            {/* Step: PROCESSING */}
            {step === STEPS.PROCESSING && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-semibold">Processing voice...</p>
              </motion.div>
            )}

            {/* Step: DONE */}
            {step === STEPS.DONE && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <CheckCircle size={36} className="text-green-500" />
                </motion.div>
                <p className="text-green-600 font-bold text-center">
                  Voice enrolled successfully!
                </p>
                <p className="text-gray-500 text-sm text-center">
                  Nuri will recognise {profileName}'s voice next time.
                </p>
                <motion.button
                  onClick={onComplete}
                  className="gradient-bg text-white font-bold py-3 px-8 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Let's Go!
                </motion.button>
              </motion.div>
            )}

            {/* Step: ERROR */}
            {step === STEPS.ERROR && (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-red-500 font-semibold text-center">{errorMsg}</p>
                <motion.button
                  onClick={handleRetry}
                  className="gradient-bg text-white font-bold py-2 px-6 rounded-xl"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Try Again
                </motion.button>
                <button
                  onClick={onSkip}
                  className="text-sm text-gray-400 font-semibold"
                >
                  Skip for now
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VoiceEnrollModal;