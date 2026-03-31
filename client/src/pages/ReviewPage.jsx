import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { currentProfile, loading: profileLoading } = useProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(0);

  const profileId = currentProfile?._id || currentProfile?.id;

  useEffect(() => {
    if (!profileLoading && !currentProfile) {
      navigate('/');
      return;
    }
    if (profileId) {
      fetchDueItems();
    }
  }, [profileId, profileLoading]);

  async function fetchDueItems() {
    try {
      const data = await api(`/review/${profileId}/due`);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleResult = useCallback(async (correct) => {
    if (submitting) return;
    const item = items[currentIndex];
    const id = item._id || item.id;
    setSubmitting(true);
    try {
      await api(`/review/${id}/result`, {
        method: 'POST',
        body: { correct },
      });
    } catch {
      // continue even if API fails
    }
    setCompleted((prev) => prev + 1);
    setFlipped(false);
    setSubmitting(false);

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Mark as fully done by going past the last index
      setCurrentIndex(items.length);
    }
  }, [submitting, items, currentIndex]);

  if (profileLoading || loading) return <LoadingSpinner text="Loading reviews..." />;
  if (!currentProfile) return null;

  const totalItems = items.length;
  const allDone = currentIndex >= totalItems;
  const currentItem = !allDone ? items[currentIndex] : null;
  const meta = currentItem ? (subjects[currentItem.subject] || {}) : {};
  const progressPercent = totalItems > 0 ? (completed / totalItems) * 100 : 0;

  // Empty state - nothing due today
  if (totalItems === 0) {
    return (
      <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-6"
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
          <h1 className="text-2xl font-extrabold text-gray-800">
            Daily Review {'\u{1F504}'}
          </h1>
        </motion.div>
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">{'\u{1F989}'}</div>
          <p className="text-xl font-extrabold text-gray-700 mb-2">
            Nothing to review today!
          </p>
          <p className="text-sm text-gray-500 font-semibold">
            You're all caught up! {'\u{1F31F}'}
          </p>
          <motion.button
            onClick={() => navigate('/home')}
            className="mt-6 px-6 py-3 rounded-xl gradient-bg text-white font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Celebration - all done
  if (allDone) {
    return (
      <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-6"
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
          <h1 className="text-2xl font-extrabold text-gray-800">
            Daily Review {'\u{1F504}'}
          </h1>
        </motion.div>

        {/* Full progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <motion.div
            className="h-3 rounded-full gradient-bg"
            initial={{ width: `${((totalItems - 1) / totalItems) * 100}%` }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500 font-semibold text-center mb-8">
          {totalItems} of {totalItems} reviewed
        </p>

        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {'\u{1F389}'}
          </motion.div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            All reviewed for today!
          </h2>
          <p className="text-gray-500 font-semibold mb-6">
            Come back tomorrow! {'\u{1F31F}'}
          </p>
          <motion.button
            onClick={() => navigate('/home')}
            className="px-6 py-3 rounded-xl gradient-bg text-white font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Active review card
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
            Daily Review {'\u{1F504}'}
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            {totalItems - completed} item{totalItems - completed !== 1 ? 's' : ''} due today
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <motion.div
          className="h-3 rounded-full gradient-bg"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-sm text-gray-500 font-semibold text-center mb-6">
        {completed} of {totalItems} reviewed
      </p>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="perspective-1000"
        >
          <motion.div
            className="relative cursor-pointer"
            onClick={() => !flipped && setFlipped(true)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Card */}
            <div
              className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-4 min-h-[320px] flex flex-col"
              style={{ borderTopColor: meta.color || '#A855F7' }}
            >
              {/* Subject badge */}
              <div className="px-5 pt-5 pb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: meta.color || '#A855F7' }}
                >
                  {meta.emoji} {meta.name || currentItem.subject}
                </span>
              </div>

              {/* Question side */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
                {!flipped ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-lg font-extrabold text-gray-800 mb-4">
                      {currentItem.question}
                    </p>
                    <p className="text-sm text-gray-400 font-semibold">
                      Tap to reveal answer
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-gray-400 font-semibold mb-2">
                      Answer
                    </p>
                    <p className="text-xl font-extrabold text-green-600 mb-2">
                      {currentItem.answer}
                    </p>
                    {currentItem.explanation && (
                      <p className="text-sm text-gray-500 font-medium mt-3 bg-gray-50 rounded-lg p-3">
                        {currentItem.explanation}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action buttons (shown after flip) */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                className="flex gap-3 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
              >
                <motion.button
                  onClick={() => handleResult(false)}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-100 text-red-700 font-bold text-sm shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <X size={18} /> Need more practice
                </motion.button>
                <motion.button
                  onClick={() => handleResult(true)}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-100 text-green-700 font-bold text-sm shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Check size={18} /> Got it!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
