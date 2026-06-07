import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, RotateCcw, Check, BookOpen } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { subjects, subjectKeys } from '../lib/subjects';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MistakesPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const profileId = currentProfile?._id || currentProfile?.id;

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (profileId) {
      fetchMistakes();
    }
  }, [profileId, profileLoading]);

  async function fetchMistakes() {
    try {
      const data = await api(`/mistakes/${profileId}`);
      setMistakes(data);
    } catch {
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = useCallback(async (id) => {
    setResolvingId(id);
    try {
      await api(`/mistakes/${id}/resolve`, { method: 'POST' });
      setMistakes((prev) =>
        prev.map((m) => (m._id === id || m.id === id ? { ...m, resolved: true } : m))
      );
    } catch {
      // silently fail
    } finally {
      setResolvingId(null);
    }
  }, []);

  if (profileLoading || loading) return <LoadingSpinner text="Loading mistakes..." />;
  if (!currentProfile) return null;

  const filters = ['all', ...subjectKeys];
  const filtered = activeFilter === 'all'
    ? mistakes
    : mistakes.filter((m) => m.subject === activeFilter);

  const total = mistakes.length;
  const resolved = mistakes.filter((m) => m.resolved).length;
  const unresolved = total - resolved;

  return (
    <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            Mistake Journal {'\u{1F4D3}'}
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            Mistakes help us learn!
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <p className="text-xl font-extrabold text-gray-800">{total}</p>
          <p className="text-xs text-gray-500 font-semibold">Total</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <p className="text-xl font-extrabold text-green-600">{resolved}</p>
          <p className="text-xs text-gray-500 font-semibold">Resolved</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-3 text-center">
          <p className="text-xl font-extrabold text-amber-500">{unresolved}</p>
          <p className="text-xs text-gray-500 font-semibold">Unresolved</p>
        </div>
      </motion.div>

      {/* Subject Filter Tabs */}
      <motion.div
        className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {filters.map((key) => {
          const isActive = activeFilter === key;
          const meta = key === 'all' ? null : subjects[key];
          return (
            <motion.button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm'
              }`}
              style={isActive ? { backgroundColor: meta?.color || '#A855F7' } : {}}
              whileTap={{ scale: 0.95 }}
            >
              {key === 'all' ? 'All' : meta?.name || key}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Mistake Cards */}
      {filtered.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">{'\u{1F989}'}</div>
          <p className="text-xl font-extrabold text-gray-700 mb-2">
            No mistakes yet! Keep going! {'\u{1F31F}'}
          </p>
          <p className="text-sm text-gray-500 font-semibold">
            Nuri is proud of you!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((mistake, i) => {
              const id = mistake._id || mistake.id;
              const meta = subjects[mistake.subject] || {};
              const isExpanded = expandedId === id;
              const isResolved = mistake.resolved;

              return (
                <motion.div
                  key={id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden border-l-4 ${
                    isResolved ? 'opacity-60' : ''
                  }`}
                  style={{ borderLeftColor: meta.color || '#9CA3AF' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="p-4">
                    {/* Subject badge + resolved check */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: meta.color || '#9CA3AF' }}
                      >
                        {meta.emoji} {meta.name || mistake.subject}
                      </span>
                      {isResolved && (
                        <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                          <Check size={16} /> Resolved
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <p className="font-bold text-gray-800 mb-2">{mistake.question}</p>

                    {/* Answers */}
                    <div className="space-y-1 mb-2">
                      <p className="text-sm font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
                        You answered: {mistake.wrongAnswer}
                      </p>
                      <p className="text-sm font-semibold text-green-600 bg-green-50 rounded-lg px-3 py-1.5">
                        Correct answer: {mistake.correctAnswer}
                      </p>
                    </div>

                    {/* Explanation toggle */}
                    {mistake.explanation && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : id)}
                        className="flex items-center gap-1 text-sm font-semibold text-purple-600 mb-2"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Hide explanation' : 'Show explanation'}
                      </button>
                    )}

                    <AnimatePresence>
                      {isExpanded && mistake.explanation && (
                        <motion.div
                          className="bg-purple-50 rounded-lg p-3 mb-2 text-sm text-purple-800 font-medium"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {mistake.explanation}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    {!isResolved && (
                      <div className="flex gap-2 mt-2">
                        <motion.button
                          onClick={() => navigate(`/quiz/${mistake.subject}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: meta.color || '#A855F7' }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <RotateCcw size={14} /> Practice Again
                        </motion.button>
                        <motion.button
                          onClick={() => handleResolve(id)}
                          disabled={resolvingId === id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-green-700 bg-green-100"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Check size={14} /> Got it!
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
