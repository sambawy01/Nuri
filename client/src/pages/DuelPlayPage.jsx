import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Swords, CheckCircle2, XCircle } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';
import NuriOwl from '../components/NuriOwl';
import CelebrationEffect from '../components/CelebrationEffect';
import LoadingSpinner from '../components/LoadingSpinner';

const QUESTION_TIME_LIMIT = 30; // seconds per question

export default function DuelPlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProfile } = useProfile();

  const [duel, setDuel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [celebrate, setCelebrate] = useState(0);

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const [myAnswers, setMyAnswers] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    fetchDuel();
  }, []);

  async function fetchDuel() {
    try {
      const data = await api(`/duels/${id}`);
      setDuel(data);
      const qs = typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions;
      setQuestions(qs);
    } catch (err) {
      setError(err.message || 'Failed to load duel');
    } finally {
      setLoading(false);
    }
  }

  // Timer for each question
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setTimeExpired(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!loading && !answered && questions.length > 0) {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [currentIndex, loading, startTimer]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeExpired && !answered) {
      handleAnswer(null, true);
    }
  }, [timeExpired]);

  async function handleAnswer(optionIndex, timedOut = false) {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);

    const timeMs = startTimeRef.current ? Date.now() - startTimeRef.current : null;
    const answerLetter = timedOut ? null : String.fromCharCode(65 + optionIndex);
    const profileId = currentProfile._id || currentProfile.id;

    // Optimistic UI: show correct/wrong immediately
    if (!timedOut) {
      setSelectedAnswer(optionIndex);
    }

    let isCorrect = false;
    let correctLetter = null;
    let expl = '';

    try {
      const result = await api('/duels/answer', {
        method: 'POST',
        body: {
          duelId: id,
          profileId,
          questionIndex: currentIndex,
          answer: answerLetter || 'X',
          timeMs,
        },
      });
      isCorrect = result.isCorrect;
      correctLetter = result.correctAnswer;
      expl = result.explanation || '';
    } catch {
      // Non-critical — just show the question's answer locally
      const q = questions[currentIndex];
      correctLetter = q.correctAnswer;
      isCorrect = answerLetter === correctLetter;
    }

    const correctIndex = correctLetter ? correctLetter.charCodeAt(0) - 65 : null;
    setCorrectAnswer(correctIndex);
    setExplanation(expl);

    if (isCorrect) setCelebrate((c) => c + 1);

    setMyAnswers((prev) => [
      ...prev,
      { questionIndex: currentIndex, answer: answerLetter, isCorrect, timeMs },
    ]);
  }

  async function handleNext() {
    if (currentIndex >= questions.length - 1) {
      // All questions answered — complete the duel
      setAllDone(true);
      setWaitingForOpponent(true);
      try {
        await api('/duels/complete', {
          method: 'POST',
          body: {
            duelId: id,
            profileId: currentProfile._id || currentProfile.id,
          },
        });
      } catch {
        // Non-critical
      }
      // Poll for opponent completion
      startPolling();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setExplanation('');
  }

  function startPolling() {
    pollRef.current = setInterval(async () => {
      try {
        const data = await api(`/duels/${id}`);
        if (data.status === 'complete') {
          clearInterval(pollRef.current);
          navigate(`/duel/${id}/results`);
        }
      } catch {
        // Ignore
      }
    }, 2000);
  }

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  if (loading) return <LoadingSpinner text="Loading duel..." />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={() => navigate('/duels')} className="mt-4 text-orange-500 font-bold">
            Back to Duels
          </button>
        </div>
      </div>
    );
  }

  const sub = subjects[duel?.subject] || {};
  const question = questions[currentIndex];

  // Waiting for opponent screen
  if (waitingForOpponent) {
    const myScore = myAnswers.filter((a) => a.isCorrect).length;
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NuriOwl size="lg" state="thinking" level={currentProfile.level || 1} />
          <h2 className="text-2xl font-extrabold text-gray-800 mt-4 mb-2">
            You finished!
          </h2>
          <p className="text-gray-500 font-semibold mb-4">
            You got <span className="text-orange-500 font-extrabold">{myScore}/{questions.length}</span> correct.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-center gap-2 text-blue-500 mb-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="font-bold text-sm">Waiting for opponent...</span>
            </div>
            <p className="text-gray-400 text-xs">We'll take you to results automatically.</p>
          </div>
          <motion.button
            onClick={() => navigate(`/duel/${id}/results`)}
            className="text-sm text-gray-400 font-semibold hover:text-orange-500 underline"
          >
            See results now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const timerPercent = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const timerColor = timeLeft > 10 ? sub.color || '#F97316' : '#EF4444';

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <CelebrationEffect trigger={celebrate} />

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate('/duels')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-orange-500" />
          <span className="font-extrabold text-gray-700 capitalize">{duel?.subject} Duel</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-gray-700 text-sm">
          <span className="text-orange-500">{currentIndex + 1}</span>
          <span className="text-gray-400">/</span>
          <span>{questions.length}</span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: sub.color || '#F97316' }}
          animate={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 mb-5">
        <Timer size={16} style={{ color: timerColor }} />
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>
        <span
          className="text-sm font-extrabold min-w-[28px] text-right"
          style={{ color: timerColor }}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Nuri owl */}
      <div className="flex justify-center mb-4">
        <NuriOwl
          size="sm"
          state={answered ? (myAnswers[myAnswers.length - 1]?.isCorrect ? 'celebrating' : 'encouraging') : 'excited'}
          level={currentProfile.level || 1}
        />
      </div>

      {/* Question card */}
      {question && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">
              <p className="text-gray-800 font-bold text-base leading-relaxed">
                {question.question}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {(question.options || []).map((opt, i) => {
                let bg = 'bg-white border-2 border-gray-200 text-gray-800';
                if (answered) {
                  if (i === correctAnswer) bg = 'bg-green-50 border-2 border-green-400 text-green-800';
                  else if (i === selectedAnswer && i !== correctAnswer) bg = 'bg-red-50 border-2 border-red-400 text-red-800';
                  else bg = 'bg-gray-50 border-2 border-gray-200 text-gray-400';
                }
                return (
                  <motion.button
                    key={i}
                    onClick={() => !answered && handleAnswer(i)}
                    disabled={answered}
                    className={`w-full p-4 rounded-2xl font-semibold text-left flex items-center gap-3 transition-all ${bg}`}
                    whileHover={!answered ? { scale: 1.01, y: -1 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 text-white"
                      style={{ backgroundColor: answered && i === correctAnswer ? '#22c55e' : answered && i === selectedAnswer ? '#ef4444' : sub.color || '#F97316' }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm leading-snug">{opt}</span>
                    {answered && i === correctAnswer && <CheckCircle2 size={18} className="ml-auto text-green-500 shrink-0" />}
                    {answered && i === selectedAnswer && i !== correctAnswer && <XCircle size={18} className="ml-auto text-red-400 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && explanation && (
                <motion.div
                  className="bg-blue-50 rounded-2xl p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-blue-800 font-semibold text-sm">{explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timed out message */}
            {answered && timeExpired && selectedAnswer === null && (
              <div className="bg-amber-50 rounded-2xl p-4 mb-4 text-center">
                <p className="text-amber-700 font-bold text-sm">Time's up! Moving on...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Next button */}
      {answered && (
        <motion.button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-extrabold py-4 rounded-2xl shadow-lg text-lg flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentIndex >= questions.length - 1 ? (
            <><Trophy size={20} /> See Results!</>
          ) : (
            <>Next Question →</>
          )}
        </motion.button>
      )}
    </div>
  );
}
