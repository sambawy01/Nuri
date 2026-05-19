import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mic, Camera, GraduationCap, Shield, Check } from 'lucide-react';
import { usePresenceConfig } from '../context/PresenceContext';
import { isPresenceSupported } from '../lib/faceDetector';

const TIERS = [
  {
    key: 'off',
    label: 'Off',
    icon: EyeOff,
    blurb: 'Nuri only tracks taps and voice — no camera, no engagement check.',
    color: 'bg-gray-50 border-gray-200 text-gray-600',
  },
  {
    key: 't1',
    label: 'Liveness only',
    icon: Mic,
    blurb: 'No camera. Nuri marks a session as engaged only if your child spoke or tapped.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    key: 't2',
    label: 'Presence ping',
    icon: Camera,
    blurb: 'Camera checks once a minute for "is a face there?" — never recorded, never sent anywhere.',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    showsSchool: false,
  },
  {
    key: 't3',
    label: 'Classroom presence',
    icon: GraduationCap,
    blurb: 'School-only. More frequent presence pings so the teacher dashboard shows real engagement.',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    schoolsOnly: true,
  },
];

export default function PresenceSettings() {
  const { tier, updateTier } = usePresenceConfig();
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => stopPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startPreview() {
    setError(null);
    if (!isPresenceSupported()) {
      setError('This device does not support camera presence.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPreviewing(true);
    } catch {
      setError('Camera permission denied. You can still use Liveness mode.');
    }
  }

  function stopPreview() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPreviewing(false);
  }

  async function selectTier(key) {
    setSaving(true);
    try {
      await updateTier(key);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={18} className="text-purple-500" />
        <h3 className="font-extrabold text-gray-800">Presence & engagement</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">
        Help Nuri tell when your child has stepped away. Pick the level you&apos;re comfortable with. Frames are never stored or sent anywhere — Nuri only records whether a face was in front of the screen.
      </p>

      <div className="space-y-2 mb-4">
        {TIERS.map(({ key, label, icon: Icon, blurb, color, schoolsOnly }) => {
          const active = tier === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectTier(key)}
              disabled={saving}
              className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                active ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} border`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800">{label}</span>
                    {schoolsOnly && (
                      <span className="text-[10px] uppercase tracking-wide font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">
                        Schools
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug mt-0.5">{blurb}</p>
                </div>
                {active && <Check size={18} className="text-purple-500 shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live camera preview — shows the kid + parent exactly what's seen */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
            <Eye size={13} />
            What Nuri sees
          </span>
          {!previewing ? (
            <button
              type="button"
              onClick={startPreview}
              className="text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              Show preview
            </button>
          ) : (
            <button
              type="button"
              onClick={stopPreview}
              className="text-xs font-bold text-gray-500 hover:text-gray-700"
            >
              Stop
            </button>
          )}
        </div>

        <AnimatePresence>
          {previewing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-xl overflow-hidden bg-black"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-48 object-cover"
              />
              <p className="text-[11px] text-gray-300 bg-black/70 px-2 py-1">
                Stream stays on this device. Nuri checks once a minute and forgets the picture immediately.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
