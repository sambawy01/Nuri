import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import NuriOwl from '../components/NuriOwl';
import LoadingSpinner from '../components/LoadingSpinner';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6'];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { login, currentProfile } = useProfile();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      navigate('/home');
      return;
    }
    fetchProfiles();
  }, [currentProfile, navigate]);

  async function fetchProfiles() {
    try {
      const data = await api('/profiles');
      setProfiles(data || []);
    } catch (err) {
      setError('Could not load profiles. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    setLoggingIn(true);
    setPinError('');
    try {
      const profile = await api('/profiles/login', {
        method: 'POST',
        body: { profileId: selectedProfile._id || selectedProfile.id, pin },
      });
      login(profile);
      navigate('/home');
    } catch (err) {
      setPinError(err.message || 'Wrong PIN, try again!');
    } finally {
      setLoggingIn(false);
    }
  }

  function handlePinInput(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setPinError('');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center">
          <NuriOwl size="lg" state="idle" />
        </div>

        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-center mt-6 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Nuri!
        </motion.h1>

        <motion.p
          className="text-center text-gray-500 font-semibold mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Powered by Nuri 🦉
        </motion.p>

        <div className="mt-8">
          {loading ? (
            <LoadingSpinner text="Finding profiles..." />
          ) : error ? (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-600 font-semibold text-sm">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); fetchProfiles(); }}
                className="mt-2 text-sm text-red-500 underline font-semibold"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <>
              {profiles.length > 0 && (
                <motion.p
                  className="text-center text-gray-600 font-bold mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Who's learning today?
                </motion.p>
              )}

              <div className="space-y-3">
                {profiles.map((profile, index) => (
                  <motion.button
                    key={profile._id || profile.id}
                    onClick={() => { setSelectedProfile(profile); setPin(''); setPinError(''); }}
                    className="w-full bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 text-left hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: profile.avatarColor || AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                    >
                      {(profile.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{profile.name}</p>
                      <p className="text-sm text-gray-500">Year {profile.yearGroup || '?'}</p>
                    </div>
                    <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                      Lvl {profile.level || 1}
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          <motion.button
            onClick={() => navigate('/create-profile')}
            className="w-full mt-4 gradient-bg text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(249,115,22,0.3)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Plus size={22} />
            Create New Profile
          </motion.button>
        </div>
      </motion.div>

      {/* PIN Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl mb-3"
                  style={{ backgroundColor: selectedProfile.avatarColor || '#A855F7' }}
                >
                  {(selectedProfile.name || '?')[0].toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Hi, {selectedProfile.name}!
                </h2>
                <p className="text-gray-500 text-sm mt-1">Enter your secret PIN</p>
              </div>

              <div className="relative mb-4">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={handlePinInput}
                  placeholder="****"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-purple-400 transition-colors"
                  maxLength={4}
                  inputMode="numeric"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {pinError && (
                <motion.p
                  className="text-red-500 text-sm text-center font-semibold mb-3"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {pinError}
                </motion.p>
              )}

              <motion.button
                onClick={handleLogin}
                disabled={pin.length !== 4 || loggingIn}
                className="w-full gradient-bg text-white font-bold py-3 rounded-2xl disabled:opacity-50 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loggingIn ? 'Checking...' : "Let's Go! 🚀"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
