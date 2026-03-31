import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'learning', label: 'Learning' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'fun', label: 'Fun' },
  { key: 'challenge', label: 'Daily' },
];

const rarityColors = {
  common: 'border-gray-200',
  uncommon: 'border-green-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

export default function BadgesPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (currentProfile) {
      fetchBadges();
    }
  }, [currentProfile, profileLoading, navigate]);

  async function fetchBadges() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const [all, earned] = await Promise.all([
        api('/badges/all'),
        api(`/badges/${pid}`),
      ]);
      setAllBadges(all);
      setEarnedBadges(earned.map(b => ({ id: b.id, earnedAt: b.earned_at })));
    } catch {
      setAllBadges([]);
      setEarnedBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  }

  if (profileLoading) return <LoadingSpinner text="Loading badges..." />;
  if (!currentProfile) return null;

  const earnedIds = new Set(earnedBadges.map((b) => b.id));
  const earnedCount = earnedIds.size;

  const filteredBadges =
    activeCategory === 'all'
      ? allBadges
      : allBadges.filter((b) => b.category === activeCategory);

  function getEarnedDate(badgeId) {
    const earned = earnedBadges.find((b) => b.id === badgeId);
    if (!earned) return null;
    return new Date(earned.earnedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <motion.button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-2xl font-extrabold text-gray-800">Badges</h1>
      </motion.div>

      {/* Progress count */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-4 mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-3xl font-extrabold text-purple-600">
          {earnedCount}/{allBadges.length}
        </p>
        <p className="text-sm text-gray-500 font-semibold">badges earned</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <motion.div
            className="h-full rounded-full gradient-bg"
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / allBadges.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Category filter tabs */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {cat.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge) => {
            const isEarned = earnedIds.has(badge.id);
            const earnedDate = getEarnedDate(badge.id);

            return (
              <motion.div
                key={badge.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative rounded-2xl p-3 text-center transition-shadow ${
                  isEarned
                    ? `bg-white shadow-lg border-2 ${rarityColors[badge.rarity] || 'border-purple-100'}`
                    : 'bg-gray-50 shadow-sm border-2 border-gray-100'
                }`}
              >
                {/* Lock overlay for unearned */}
                {!isEarned && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-gray-300" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`text-3xl mb-1 ${
                    isEarned ? '' : 'grayscale opacity-40'
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Name */}
                <p
                  className={`text-xs font-bold leading-tight ${
                    isEarned ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {badge.name}
                </p>

                {/* Description */}
                <p
                  className={`text-[10px] mt-0.5 leading-tight ${
                    isEarned ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {badge.description}
                </p>

                {/* Earned date */}
                {isEarned && earnedDate && (
                  <p className="text-[9px] text-purple-500 font-semibold mt-1">
                    {earnedDate}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
