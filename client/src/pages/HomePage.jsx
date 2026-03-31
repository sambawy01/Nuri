import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Target } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { subjectKeys } from '../lib/subjects';
import { api } from '../lib/api';
import SubjectCard from '../components/SubjectCard';
import XPBar from '../components/XPBar';
import StreakBadge from '../components/StreakBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (currentProfile) {
      fetchStats();
    }
  }, [currentProfile, profileLoading, navigate]);

  async function fetchStats() {
    try {
      const data = await api(`/stats/${currentProfile._id || currentProfile.id}`);
      setStats(data);
    } catch {
      // Use profile defaults if stats endpoint unavailable
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }

  if (profileLoading) return <LoadingSpinner text="Loading your profile..." />;
  if (!currentProfile) return null;

  const xp = stats?.totalXP ?? currentProfile.xp ?? 0;
  const level = stats?.level ?? currentProfile.level ?? 1;
  const streak = stats?.streakDays ?? currentProfile.streak ?? 0;
  const masteries = stats?.subjectMastery || {};

  return (
    <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            Hello, {currentProfile.name}! 👋
          </h1>
          <p className="text-gray-500 font-semibold text-sm">
            Ready to learn something awesome?
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
          style={{ backgroundColor: currentProfile.avatarColor || '#A855F7' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {(currentProfile.name || '?')[0].toUpperCase()}
        </motion.button>
      </motion.div>

      {/* XP Bar and Streak */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <XPBar currentXP={xp} nextLevelXP={100} level={level} />
          <div className="ml-4">
            <StreakBadge days={streak} />
          </div>
        </div>
      </motion.div>

      {/* Subject Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-extrabold text-gray-800 mb-3">
          Choose a Subject
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjectKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <SubjectCard
                subject={key}
                mastery={masteries[key] || 0}
                onClick={() => navigate(`/subject/${key}`)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <Trophy size={20} className="mx-auto text-yellow-500 mb-1" />
          <p className="text-xl font-extrabold text-gray-800">{xp}</p>
          <p className="text-xs text-gray-500 font-semibold">Total XP</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <Zap size={20} className="mx-auto text-purple-500 mb-1" />
          <p className="text-xl font-extrabold text-gray-800">{level}</p>
          <p className="text-xs text-gray-500 font-semibold">Level</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <Target size={20} className="mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-extrabold text-gray-800">{streak}</p>
          <p className="text-xs text-gray-500 font-semibold">Day Streak</p>
        </div>
      </motion.div>

      {/* Floating Nuri */}
      <motion.div
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-bg shadow-xl flex items-center justify-center text-2xl cursor-pointer z-40"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/profile')}
      >
        🦉
      </motion.div>
    </div>
  );
}
