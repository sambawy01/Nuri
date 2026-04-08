import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Users, Trophy, Zap, Flame, HelpCircle, Star, Award, ShieldCheck, GraduationCap } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { subjects, subjectKeys } from '../lib/subjects';
import { api } from '../lib/api';
import { getStageImage } from '../components/NuriOwl';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentProfile, logout, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [learningStyle, setLearningStyle] = useState(null);

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
      const pid = currentProfile._id || currentProfile.id;
      const [statsData, styleData] = await Promise.all([
        api(`/stats/${pid}`).catch(() => null),
        api(`/learning-style/${pid}`).catch(() => null),
      ]);
      setStats(statsData);
      if (styleData) setLearningStyle(styleData);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleSwitch() {
    logout();
    navigate('/');
  }

  if (profileLoading) return <LoadingSpinner />;
  if (!currentProfile) return null;

  const xp = stats?.totalXP ?? currentProfile.xp ?? 0;
  const level = stats?.level ?? currentProfile.level ?? 1;
  const streak = stats?.streakDays ?? currentProfile.streak ?? 0;
  const questionsAnswered = stats?.questionsAnswered ?? 0;
  const masteries = stats?.subjectMastery || {};

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Back */}
      <motion.button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-gray-700"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
      >
        <ArrowLeft size={20} />
        Back
      </motion.button>

      {/* Avatar and Name */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img
          src={getStageImage(level)}
          alt="Nuri Evolution"
          className="w-28 h-28 object-contain mx-auto"
          draggable={false}
        />
        <div
          className="w-20 h-20 rounded-full mx-auto -mt-4 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white relative z-10"
          style={{ backgroundColor: currentProfile.avatarColor || '#A855F7' }}
        >
          {(currentProfile.name || '?')[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mt-3">{currentProfile.name}</h1>
        <p className="text-gray-500 font-semibold">Year {currentProfile.yearGroup || '?'}</p>
        <div className="inline-flex items-center gap-1 mt-2 bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1 rounded-full">
          <Zap size={14} />
          Level {level}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { icon: Trophy, label: 'Total XP', value: xp, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { icon: Zap, label: 'Level', value: level, color: 'text-purple-500', bg: 'bg-purple-50' },
          { icon: Flame, label: 'Streak Days', value: streak, color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: HelpCircle, label: 'Questions', value: questionsAnswered, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            className={`${bg} rounded-2xl p-4 text-center`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Icon size={24} className={`mx-auto ${color} mb-2`} />
            <p className="text-2xl font-extrabold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Subject Mastery */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-extrabold text-gray-800 mb-4">Subject Mastery</h3>
        <div className="space-y-3">
          {subjectKeys.map((key) => {
            const meta = subjects[key];
            const mastery = masteries[key] || 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shrink-0"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.emoji}
                </div>
                <span className={`text-sm font-bold text-gray-700 flex-1 ${key === 'arabic' ? 'font-arabic' : ''}`}>
                  {meta.name}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Style */}
      {learningStyle && learningStyle.total_interactions >= 20 && (
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="font-extrabold text-gray-800 mb-4">How You Learn Best</h3>
          <p className="text-xs text-gray-500 font-semibold mb-3">Based on {learningStyle.total_interactions} interactions</p>
          <div className="space-y-3">
            {[
              { label: 'Visual', key: 'visual', emoji: '\ud83d\uddbc\ufe0f' },
              { label: 'Analogies', key: 'analogy', emoji: '\ud83d\udd17' },
              { label: 'Examples First', key: 'example_first', emoji: '\ud83d\udca1' },
              { label: 'Listening', key: 'auditory', emoji: '\ud83d\udd0a' },
              { label: 'Try First', key: 'try_first', emoji: '\ud83e\uddea' },
            ].map(({ label, key, emoji }) => {
              const score = Math.round((learningStyle[key] || 0) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{emoji} {label}</span>
                    <span className="font-bold text-purple-600">{score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate(`/parent/${currentProfile._id || currentProfile.id}`)}
          className="w-full bg-gradient-to-r from-orange-400 to-purple-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShieldCheck size={18} />
          Parent Dashboard
        </motion.button>
        <motion.button
          onClick={() => navigate('/teacher')}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <GraduationCap size={18} />
          Teacher Dashboard
        </motion.button>
        <motion.button
          onClick={() => navigate('/stickers')}
          className="w-full bg-yellow-50 border-2 border-yellow-200 text-yellow-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Star size={18} />
          Sticker Book
        </motion.button>
        <motion.button
          onClick={() => navigate('/badges')}
          className="w-full bg-purple-50 border-2 border-purple-200 text-purple-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Award size={18} />
          View Badges
        </motion.button>
        <motion.button
          onClick={handleSwitch}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users size={18} />
          Switch Profile
        </motion.button>
        <motion.button
          onClick={handleLogout}
          className="w-full bg-red-50 border-2 border-red-200 text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          Log Out
        </motion.button>
      </motion.div>
    </div>
  );
}
