import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle, Star } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StoryMapPage() {
  const navigate = useNavigate();
  const { currentProfile } = useProfile();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    fetchProgress();
  }, [currentProfile]);

  async function fetchProgress() {
    try {
      const data = await api(`/story/progress/${currentProfile._id || currentProfile.id}`);
      setChapters(data.chapters);
    } catch {
      // If server not available, show all chapters with no progress
      setChapters(getDefaultChapters());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultChapters() {
    return [
      { id: 1, title: 'The Book of Numbers', subject: 'maths', icon: '🔢', description: 'Hidden deep inside an ancient pyramid...', color: '#3B82F6', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 2, title: 'The Book of Nature', subject: 'science', icon: '🌿', description: 'Lost in a magical jungle...', color: '#10B981', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 3, title: 'The Book of Words', subject: 'english', icon: '📖', description: 'Trapped in a magical library...', color: '#8B5CF6', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 4, title: 'The Book of Time', subject: 'history', icon: '⏳', description: 'Stuck in the past...', color: '#F59E0B', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 5, title: 'The Book of Letters', subject: 'arabic', icon: '✍️', description: 'Guarded by a sphinx...', color: '#14B8A6', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 6, title: 'The Book of Light', subject: 'religion', icon: '✝️', description: 'In an ancient monastery...', color: '#F43F5E', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
      { id: 7, title: 'The Book of People', subject: 'socialstudies', icon: '🌍', description: 'In a bustling city...', color: '#6366F1', stagesComplete: 0, totalStages: 5, chapterComplete: false, completedStages: [] },
    ];
  }

  // Chapter 1 is always unlocked; each subsequent chapter unlocks when the previous is complete
  function isUnlocked(index) {
    if (index === 0) return true;
    return chapters[index - 1]?.chapterComplete === true;
  }

  // Find the next incomplete stage for a chapter
  function nextStageFor(ch) {
    for (let s = 1; s <= ch.totalStages; s++) {
      if (!ch.completedStages.includes(s)) return s;
    }
    return 1; // all done — replay from start
  }

  if (loading) return <LoadingSpinner text="Loading your adventure..." />;

  return (
    <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate('/home')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Story Adventure</h1>
          <p className="text-gray-500 font-semibold text-sm">The 7 Lost Books of Knowledge</p>
        </div>
      </motion.div>

      {/* Intro banner */}
      <motion.div
        className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-4 mb-8 text-white shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-lg font-extrabold mb-1">Ancient books of knowledge have been lost!</p>
        <p className="text-sm font-semibold opacity-90">
          Help Nuri find all 7 books hidden across the world. Answer questions, solve puzzles, and become a legend!
        </p>
      </motion.div>

      {/* Chapter list with connectors */}
      <div className="relative">
        {chapters.map((ch, index) => {
          const unlocked = isUnlocked(index);
          const nextStage = nextStageFor(ch);
          const progressPct = ch.totalStages > 0 ? (ch.stagesComplete / ch.totalStages) * 100 : 0;

          return (
            <div key={ch.id} className="relative">
              {/* Connector line between chapters */}
              {index < chapters.length - 1 && (
                <div
                  className="absolute left-8 w-0.5 bg-gray-200"
                  style={{ top: '100%', height: '24px', zIndex: 0 }}
                />
              )}

              <motion.div
                className={`relative z-10 mb-6 rounded-2xl shadow-md border-2 overflow-hidden ${
                  unlocked
                    ? 'bg-white cursor-pointer'
                    : 'bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                style={{ borderColor: unlocked ? ch.color : '#E5E7EB' }}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.07 }}
                whileHover={unlocked ? { y: -3, boxShadow: '0 16px 32px rgba(0,0,0,0.12)' } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() => unlocked && navigate(`/story/${ch.id}/${nextStage}`)}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow"
                    style={{ backgroundColor: unlocked ? ch.color : '#9CA3AF' }}
                  >
                    {unlocked ? ch.icon : <Lock size={20} className="text-white" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-extrabold text-gray-800 truncate">{ch.title}</p>
                      {ch.chapterComplete && (
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mb-2 truncate">{ch.description}</p>

                    {/* Stage dots */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: ch.totalStages }).map((_, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: ch.completedStages.includes(i + 1)
                              ? ch.color
                              : '#E5E7EB',
                          }}
                        >
                          {ch.completedStages.includes(i + 1) && (
                            <Star size={10} className="text-white" />
                          )}
                        </div>
                      ))}
                      <span className="text-xs text-gray-400 font-semibold ml-1">
                        {ch.stagesComplete}/{ch.totalStages} stages
                      </span>
                    </div>
                  </div>

                  {/* Arrow or lock */}
                  <div className="shrink-0">
                    {unlocked ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: ch.color }}
                      >
                        →
                      </div>
                    ) : (
                      <Lock size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {unlocked && ch.stagesComplete > 0 && (
                  <div className="h-1.5 bg-gray-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: ch.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ delay: 0.3 + index * 0.07, duration: 0.6 }}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Completion message if all 7 books found */}
      {chapters.length > 0 && chapters.every(c => c.chapterComplete) && (
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-xl font-extrabold mb-1">All 7 Books Found!</p>
          <p className="text-sm font-semibold opacity-90">
            You are a true Scholar of Knowledge! Nuri is so proud of you!
          </p>
        </motion.div>
      )}
    </div>
  );
}
