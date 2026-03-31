import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Target, Award, BookOpen, RotateCcw } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { subjectKeys } from '../lib/subjects';
import { api } from '../lib/api';
import SubjectCard from '../components/SubjectCard';
import XPBar from '../components/XPBar';
import StreakBadge from '../components/StreakBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import NuriOwl from '../components/NuriOwl';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (currentProfile) {
      fetchStats();
      fetchToolCounts();
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

  async function fetchToolCounts() {
    const pid = currentProfile._id || currentProfile.id;
    try {
      const mStats = await api(`/mistakes/${pid}/stats`);
      setMistakeCount(mStats.unresolved ?? 0);
    } catch {
      setMistakeCount(0);
    }
    try {
      const rStats = await api(`/review/${pid}/stats`);
      setReviewCount(rStats.due ?? 0);
    } catch {
      setReviewCount(0);
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
        <div className="flex items-center gap-3">
          <NuriOwl size="sm" state="idle" level={level} />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              Hello, {currentProfile.name}!
            </h1>
            <p className="text-gray-500 font-semibold text-sm">
              Ready to learn something awesome?
            </p>
          </div>
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
        className="grid grid-cols-4 gap-3 mt-6"
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
        <motion.div
          className="bg-purple-50 rounded-2xl shadow-md p-3 text-center cursor-pointer border-2 border-purple-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/badges')}
        >
          <Award size={20} className="mx-auto text-purple-500 mb-1" />
          <p className="text-xl font-extrabold text-purple-600">
            <Trophy size={16} className="inline" />
          </p>
          <p className="text-xs text-purple-500 font-semibold">Badges</p>
        </motion.div>
      </motion.div>

      {/* Tools Section */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-lg font-extrabold text-gray-800 mb-3">
          Tools
        </h2>
        <div className="space-y-3">
          <motion.button
            onClick={() => navigate('/mistakes')}
            className="w-full bg-white rounded-2xl p-4 shadow-lg border-l-4 text-left flex items-center gap-4 cursor-pointer"
            style={{ borderLeftColor: '#F59E0B' }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0 bg-amber-500">
              <BookOpen size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">Mistake Journal {'\u{1F4D3}'}</p>
              <p className="text-sm text-gray-500 font-semibold">Learn from your mistakes</p>
            </div>
            {mistakeCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {mistakeCount}
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={() => navigate('/review')}
            className="w-full bg-white rounded-2xl p-4 shadow-lg border-l-4 text-left flex items-center gap-4 cursor-pointer"
            style={{ borderLeftColor: '#8B5CF6' }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0 bg-purple-500">
              <RotateCcw size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">Daily Review {'\u{1F504}'}</p>
              <p className="text-sm text-gray-500 font-semibold">Practice spaced repetition</p>
            </div>
            {reviewCount > 0 && (
              <span className="bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {reviewCount}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Nuri */}
      <motion.div
        className="fixed bottom-6 right-6 cursor-pointer z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/profile')}
      >
        <NuriOwl size="sm" state="idle" level={level} />
      </motion.div>
    </div>
  );
}
