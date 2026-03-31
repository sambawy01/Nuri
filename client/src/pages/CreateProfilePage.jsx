import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import NuriAvatar from '../components/NuriAvatar';

const YEARS = [1, 2, 3, 4, 5, 6];
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6'];

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

const STEP_TITLES = [
  "What's your name?",
  'What year are you in?',
  'Pick your favourite colour!',
  'Create a secret PIN!',
];

const NURI_MESSAGES = [
  "I'm Nuri! Let's get to know each other! 🦉",
  "Great name! Now tell me about your school year.",
  "Ooh, colours! Pick the one that makes you smile! 🎨",
  "Nearly done! This PIN keeps your profile safe. 🔒",
];

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { login } = useProfile();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [yearGroup, setYearGroup] = useState(null);
  const [avatarColor, setAvatarColor] = useState(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  function canProceed() {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return yearGroup !== null;
    if (step === 2) return avatarColor !== null;
    if (step === 3) return pin.length === 4;
    return false;
  }

  function nextStep() {
    if (!canProceed()) return;
    if (step < 3) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleCreate();
    }
  }

  function prevStep() {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    } else {
      navigate('/');
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError('');
    try {
      const profile = await api('/profiles', {
        method: 'POST',
        body: { name: name.trim(), yearGroup, avatarColor, pin },
      });
      login(profile);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
              <motion.div
                className="h-full gradient-bg"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <NuriAvatar size={100} />

        <motion.p
          key={`nuri-${step}`}
          className="text-center text-gray-600 font-semibold mt-4 mb-2 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {NURI_MESSAGES[step]}
        </motion.p>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
              {STEP_TITLES[step]}
            </h2>

            {step === 0 && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name..."
                className="w-full text-center text-2xl font-bold bg-white border-2 border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-400 transition-colors shadow-lg"
                autoFocus
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
              />
            )}

            {step === 1 && (
              <div className="grid grid-cols-3 gap-3">
                {YEARS.map((year) => (
                  <motion.button
                    key={year}
                    onClick={() => setYearGroup(year)}
                    className={`py-5 rounded-2xl text-xl font-extrabold transition-all shadow-lg ${
                      yearGroup === year
                        ? 'gradient-bg text-white scale-105'
                        : 'bg-white text-gray-700 hover:shadow-xl'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Year {year}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                {COLORS.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className="aspect-square rounded-full border-4 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: avatarColor === color ? '#1f2937' : 'transparent',
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {avatarColor === color && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center text-white"
                      >
                        <Check size={32} strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="relative max-w-xs mx-auto">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="****"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] bg-white border-2 border-gray-200 rounded-2xl py-5 focus:outline-none focus:border-purple-400 transition-colors shadow-lg"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.p
            className="text-red-500 text-sm text-center font-semibold mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <motion.button
            onClick={prevStep}
            className="flex-1 bg-white text-gray-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
          <motion.button
            onClick={nextStep}
            disabled={!canProceed() || creating}
            className="flex-[2] gradient-bg text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity shadow-lg"
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            {creating ? (
              'Creating...'
            ) : step === 3 ? (
              <>
                <Check size={18} />
                Create Profile!
              </>
            ) : (
              <>
                Next
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
