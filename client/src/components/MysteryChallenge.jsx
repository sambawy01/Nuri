// client/src/components/MysteryChallenge.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MailOpen, Check, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import NuriOwl from './NuriOwl';
import QuestionCard from './QuestionCard';

export default function MysteryChallenge({ visible, onClose }) {
  const { currentProfile, updateXP } = useProfile();
  const [stage, setStage] = useState('envelope'); // envelope | opening | question | result
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (visible && currentProfile) {
      fetchChallenge();
    }
  }, [visible]);

  async function fetchChallenge() {
    setLoading(true);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api(`/challenge/today?profileId=${pid}`);
      setChallenge(data);
      if (data.attempted) {
        setStage('result');
        setResult({ correct: data.attempt.was_correct, xpEarned: data.attempt.xp_earned });
        setCorrectAnswer(data.question.correctAnswer);
      }
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEnvelope() {
    setStage('opening');
    setTimeout(() => setStage('question'), 800);
  }

  async function handleAnswer(index) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const options = challenge.question.options;
    const correctIdx = options.findIndex((_, i) =>
      String.fromCharCode(65 + i) === challenge.question.correctAnswer
    );
    setCorrectAnswer(correctIdx);

    const answer = String.fromCharCode(65 + index);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/challenge/answer', {
        method: 'POST',
        body: { profileId: pid, answer },
      });
      setResult({ correct: data.correct, xpEarned: data.xpEarned, newBadges: data.newBadges });
      updateXP(data.xpEarned);
    } catch {
      setResult({ correct: index === correctIdx, xpEarned: 0 });
    }

    setTimeout(() => setStage('result'), 1500);
  }

  function handleClose() {
    setStage('envelope');
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setResult(null);
    setChallenge(null);
    onClose();
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>

          {loading && (
            <div className="text-center py-12">
              <NuriOwl size="md" state="thinking" level={currentProfile?.level || 1} />
              <p className="text-gray-500 font-semibold mt-4">Preparing your mystery...</p>
            </div>
          )}

          {!loading && stage === 'envelope' && (
            <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg font-extrabold text-gray-800 mb-2">Daily Mystery Challenge</p>
              <p className="text-sm text-gray-500 font-semibold mb-6">Tap to open today's mystery question!</p>
              <motion.button
                onClick={handleOpenEnvelope}
                className="mx-auto"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-7xl">
                  <Mail size={80} className="text-purple-500 mx-auto" />
                </div>
              </motion.button>
              <p className="text-xs text-purple-400 font-semibold mt-4">+50 XP if correct!</p>
            </motion.div>
          )}

          {!loading && stage === 'opening' && (
            <motion.div className="text-center py-12"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 0.9, 1.1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8 }}
            >
              <MailOpen size={80} className="text-purple-500 mx-auto" />
            </motion.div>
          )}

          {!loading && stage === 'question' && challenge && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <NuriOwl size="sm" state="excited" level={currentProfile?.level || 1} />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Today's Mystery</p>
                  <p className="text-xs text-gray-500 font-semibold capitalize">{challenge.subject} - {challenge.topic}</p>
                </div>
              </div>
              <QuestionCard
                question={challenge.question.question}
                options={challenge.question.options}
                onAnswer={handleAnswer}
                answered={answered}
                selectedAnswer={selectedAnswer}
                correctAnswer={correctAnswer}
                explanation={answered ? challenge.question.explanation : ''}
                subjectColor="#A855F7"
              />
            </div>
          )}

          {!loading && stage === 'result' && result && (
            <motion.div className="text-center py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <NuriOwl size="md" state={result.correct ? 'celebrating' : 'encouraging'} level={currentProfile?.level || 1} />
              <div className={`mt-4 w-16 h-16 rounded-full mx-auto flex items-center justify-center ${result.correct ? 'bg-green-100' : 'bg-orange-100'}`}>
                {result.correct
                  ? <Check size={32} className="text-green-600" />
                  : <XCircle size={32} className="text-orange-500" />
                }
              </div>
              <p className="text-xl font-extrabold text-gray-800 mt-3">
                {result.correct ? 'Amazing!' : 'Nice try!'}
              </p>
              <p className="text-sm text-gray-500 font-semibold mt-1">
                {result.correct ? "You solved today's mystery!" : "You'll get it tomorrow!"}
              </p>
              <div className="bg-purple-50 rounded-xl px-4 py-2 inline-block mt-3">
                <p className="text-lg font-extrabold text-purple-600">+{result.xpEarned} XP</p>
              </div>
              {result.newBadges?.length > 0 && (
                <div className="mt-3 bg-yellow-50 rounded-xl px-4 py-2">
                  <p className="text-sm font-bold text-yellow-700">
                    New badge: {result.newBadges[0].name} {result.newBadges[0].icon}
                  </p>
                </div>
              )}
              <motion.button
                onClick={handleClose}
                className="mt-4 gradient-bg text-white font-bold py-3 px-8 rounded-2xl shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
