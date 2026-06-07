// client/src/components/HomeworkCamera.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

export default function HomeworkCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError('Camera access denied. Please allow camera access.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
  }

  function confirm() {
    if (preview) {
      // Extract base64 data without the data URL prefix
      const base64 = preview.split(',')[1];
      onCapture(base64, 'image/jpeg');
    }
  }

  function retake() {
    setPreview(null);
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Camera size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-red-500 font-semibold text-sm mb-4">{error}</p>
        <button onClick={onClose} className="text-purple-600 font-bold text-sm underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="hidden" />

      {preview ? (
        <div>
          <img src={preview} alt="Captured homework" className="w-full rounded-2xl" />
          <div className="flex gap-3 mt-4">
            <motion.button
              onClick={retake}
              className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 font-bold text-gray-700 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw size={18} /> Retake
            </motion.button>
            <motion.button
              onClick={confirm}
              className="flex-1 py-3 rounded-xl gradient-bg text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              whileTap={{ scale: 0.97 }}
            >
              <Check size={18} /> Use Photo
            </motion.button>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <motion.button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500"
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
            <motion.button
              onClick={capture}
              className="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-purple-500 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera size={28} className="text-purple-600" />
            </motion.button>
            <motion.button
              onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500"
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
