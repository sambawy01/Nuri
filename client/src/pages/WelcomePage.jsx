import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import { getDeviceId } from '../lib/device';
import { useProfile } from '../context/ProfileContext';
import NuriOwl from '../components/NuriOwl';
import LoadingSpinner from '../components/LoadingSpinner';
import VoiceLoginButton from '../components/VoiceLoginButton';
import VoiceEnrollModal from '../components/VoiceEnrollModal';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6'];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { login, currentProfile } = useProfile();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFallbackMsg, setShowFallbackMsg] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollProfile, setEnrollProfile] = useState(null);
  const fallbackTimerRef = useRef(null);

  // Cleanup fallback timer on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentProfile) {
      navigate('/home');
      return;
    }
    fetchProfiles();
  }, [currentProfile, navigate]);

  async function fetchProfiles() {
    try {
      const deviceId = getDeviceId();
      const data = await api(`/profiles?deviceId=${deviceId}`);
      setProfiles(data || []);
    } catch (err) {
      setError('Could not load profiles. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProfile(profile) {
    login(profile);
    if (!profile.voiceEnrolled) {
      setEnrollProfile(profile);
      setShowEnrollModal(true);
    } else {
      navigate('/home');
    }
  }

  const handleVoiceIdentified = useCallback((profile) => {
    handleSelectProfile(profile);
  }, []);

  const handleVoiceFallback = useCallback(() => {
    setShowFallbackMsg(true);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => setShowFallbackMsg(false), 3000);
  }, []);

  function handleEnrollComplete() {
    if (enrollProfile) {
      login({ ...enrollProfile, voiceEnrolled: true });
    }
    setShowEnrollModal(false);
    setEnrollProfile(null);
    navigate('/home');
  }

  function handleEnrollSkip() {
    setShowEnrollModal(false);
    setEnrollProfile(null);
    navigate('/home');
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
          ) : profiles.length === 0 ? (
            <motion.p
              className="text-center text-gray-500 font-semibold text-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Hi there! Let's create your first profile.
            </motion.p>
          ) : (
            <>
              <motion.p
                className="text-center text-gray-600 font-bold mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Who's learning today?
              </motion.p>

              {/* Voice login button */}
              <motion.div
                className="flex justify-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <VoiceLoginButton
                  onIdentified={handleVoiceIdentified}
                  onFallback={handleVoiceFallback}
                  disabled={loading}
                />
              </motion.div>

              {/* Fallback message */}
              <AnimatePresence>
                {showFallbackMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-sm font-semibold text-orange-500 mb-4"
                  >
                    Voice not recognized, tap your profile below
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Profile cards grid */}
              <div className="flex flex-wrap justify-center gap-6">
                {profiles.map((profile, index) => {
                  const bgColor = profile.avatarColor || AVATAR_COLORS[index % AVATAR_COLORS.length];
                  const initial = (profile.name || '?')[0].toUpperCase();
                  return (
                    <motion.button
                      key={profile._id || profile.id}
                      onClick={() => handleSelectProfile(profile)}
                      className="flex flex-col items-center gap-2 focus:outline-none"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.08 }}
                      whileHover={{ scale: 1.08, y: -4 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-lg"
                        style={{ backgroundColor: bgColor }}
                      >
                        {initial}
                      </div>
                      <span className="text-gray-700 font-bold text-sm text-center max-w-[80px] truncate">
                        {profile.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          <motion.button
            onClick={() => navigate('/create-profile')}
            className="w-full mt-8 gradient-bg text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
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

      {/* Voice enrollment modal */}
      {enrollProfile && (
        <VoiceEnrollModal
          profileId={enrollProfile._id || enrollProfile.id}
          profileName={enrollProfile.name}
          onComplete={handleEnrollComplete}
          onSkip={handleEnrollSkip}
          open={showEnrollModal}
        />
      )}
    </div>
  );
}