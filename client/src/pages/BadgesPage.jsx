import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

const allBadges = [
  { id: 'first-quiz', name: 'First Steps', description: 'Complete your first quiz', icon: '\u{1F31F}', category: 'milestones' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day streak', icon: '\u{1F525}', category: 'streaks' },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day streak', icon: '\u{1F48E}', category: 'streaks' },
  { id: 'perfect-quiz', name: 'Perfect Score', description: '10/10 on a quiz', icon: '\u{1F4AF}', category: 'quizzes' },
  { id: 'all-subjects', name: 'Explorer', description: 'Practiced all subjects', icon: '\u{1F5FA}\uFE0F', category: 'subjects' },
  { id: 'maths-star', name: 'Maths Star', description: '5 stars in any maths topic', icon: '\u{1F522}', category: 'mastery' },
  { id: 'science-star', name: 'Science Star', description: '5 stars in any science topic', icon: '\u{1F52C}', category: 'mastery' },
  { id: 'english-star', name: 'English Star', description: '5 stars in any English topic', icon: '\u{1F4D6}', category: 'mastery' },
  { id: 'arabic-star', name: 'Arabic Star', description: '5 stars in any Arabic topic', icon: '\u270D\uFE0F', category: 'mastery' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Answer 5 questions in under 30 seconds each', icon: '\u26A1', category: 'quizzes' },
  { id: 'curious-mind', name: 'Curious Mind', description: 'Use "Explain Simpler" or "Give Example" 10 times', icon: '\u{1F914}', category: 'learning' },
  { id: 'fearless', name: 'Fearless', description: 'Complete 10 quizzes on Hard difficulty', icon: '\u{1F981}', category: 'quizzes' },
  { id: 'comeback-kid', name: 'Comeback Kid', description: 'Resolve 10 mistakes from Mistake Journal', icon: '\u{1F4AA}', category: 'learning' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach Level 5', icon: '\u2B50', category: 'milestones' },
  { id: 'level-10', name: 'Superstar', description: 'Reach Level 10', icon: '\u{1F31F}', category: 'milestones' },
  { id: 'level-20', name: 'Legend', description: 'Reach Level 20', icon: '\u{1F451}', category: 'milestones' },
  { id: 'quiz-50', name: 'Quiz Champion', description: 'Complete 50 quizzes', icon: '\u{1F3C6}', category: 'milestones' },
  { id: 'learn-20', name: 'Knowledge Seeker', description: '20 Learn Mode sessions', icon: '\u{1F4DA}', category: 'learning' },
  { id: 'night-owl', name: 'Night Owl', description: 'Study after 8 PM', icon: '\u{1F319}', category: 'fun' },
  { id: 'early-bird', name: 'Early Bird', description: 'Study before 8 AM', icon: '\u{1F305}', category: 'fun' },
];

const categories = [
  { key: 'all', label: 'All' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'learning', label: 'Learning' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'fun', label: 'Fun' },
];

export default function BadgesPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
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
      const data = await api(`/stats/${currentProfile._id || currentProfile.id}`);
      setEarnedBadges(data.badges || []);
    } catch {
      // Mock some earned badges if endpoint unavailable
      setEarnedBadges([
        { id: 'first-quiz', earnedAt: '2026-03-15T10:00:00Z' },
        { id: 'streak-7', earnedAt: '2026-03-20T14:30:00Z' },
        { id: 'night-owl', earnedAt: '2026-03-22T21:00:00Z' },
        { id: 'level-5', earnedAt: '2026-03-25T09:15:00Z' },
        { id: 'maths-star', earnedAt: '2026-03-28T11:45:00Z' },
      ]);
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
                    ? 'bg-white shadow-lg border-2 border-purple-100'
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
