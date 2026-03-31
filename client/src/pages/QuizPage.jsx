import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Flame, Trophy, RotateCcw, Home } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import QuestionCard from '../components/QuestionCard';
import CelebrationEffect from '../components/CelebrationEffect';
import LoadingSpinner from '../components/LoadingSpinner';
import NuriOwl from '../components/NuriOwl';

const TOTAL_QUESTIONS = 10;
const XP_PER_CORRECT = 15;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function QuizPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile, updateXP } = useProfile();
  const meta = subjects[subject];
  const topic = location.state?.topic;

  const [difficulty, setDifficulty] = useState('medium');
  const [question, setQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [score, setScore] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [xpFloat, setXpFloat] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    fetchQuestion();
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setExplanation('');
    setError(null);

    try {
      const data = await api('/quiz/question', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject,
          difficulty,
          ...(topic && { topic }),
        },
      });
      setQuestion(data);
    } catch (err) {
      // Fallback question if API is down
      setQuestion({
        question: `What is a key concept in ${meta?.name || subject}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is a sample question. Connect the server for real questions!',
      });
    } finally {
      setLoading(false);
    }
  }, [currentProfile, subject, difficulty, meta, topic]);

  async function handleAnswer(index) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const correct = question.correctAnswer ?? 0;
    setCorrectAnswer(correct);
    setExplanation(question.explanation || '');

    const isCorrect = index === correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      setSessionXP((xp) => xp + XP_PER_CORRECT);
      setQuizStreak((s) => s + 1);
      setCelebrate((c) => c + 1);
      setXpFloat(true);
      updateXP(XP_PER_CORRECT);
      setTimeout(() => setXpFloat(false), 1500);
    } else {
      setQuizStreak(0);
    }

    // Submit answer to API
    try {
      await api('/quiz/answer', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject,
          questionId: question._id || question.id,
          answer: index,
          correct: isCorrect,
        },
      });
    } catch {
      // Non-critical, continue quiz
    }
  }

  function nextQuestion() {
    if (questionNum >= TOTAL_QUESTIONS) {
      setShowSummary(true);
      return;
    }
    setQuestionNum((n) => n + 1);
    fetchQuestion();
  }

  function restartQuiz() {
    setShowSummary(false);
    setQuestionNum(1);
    setScore(0);
    setSessionXP(0);
    setQuizStreak(0);
    fetchQuestion();
  }

  if (!meta) {
    navigate('/home');
    return null;
  }

  const owlState = answered
    ? (selectedAnswer === correctAnswer ? 'celebrating' : 'encouraging')
    : 'excited';

  // Summary screen
  if (showSummary) {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    let nuriMessage = '';
    if (percentage >= 90) nuriMessage = "WOW! You're a superstar! 🌟 Amazing work!";
    else if (percentage >= 70) nuriMessage = "Great job! You're doing brilliantly! 💪";
    else if (percentage >= 50) nuriMessage = "Good effort! Keep practising and you'll be amazing! 🦉";
    else nuriMessage = "Don't worry! Every mistake helps you learn. Let's try again! 💕";

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex justify-center">
            <NuriOwl size="md" state={score >= 7 ? 'celebrating' : 'encouraging'} level={currentProfile.level || 1} />
          </div>

          <motion.div
            className="bg-white rounded-3xl shadow-xl p-6 mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Quiz Complete!</h2>
            <p className={`font-bold mb-4 ${subject === 'arabic' ? 'font-arabic' : ''}`} style={{ color: meta.color }}>
              {meta.name}
            </p>

            <div className="text-6xl font-extrabold gradient-text mb-2">
              {score}/{TOTAL_QUESTIONS}
            </div>
            <p className="text-gray-500 font-semibold text-sm mb-4">{percentage}% correct</p>

            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-purple-50 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-extrabold text-purple-600">+{sessionXP}</p>
                <p className="text-xs text-purple-400 font-semibold">XP Earned</p>
              </div>
              <div className="bg-orange-50 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-extrabold text-orange-600">{score}</p>
                <p className="text-xs text-orange-400 font-semibold">Correct</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-semibold">{nuriMessage}</p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={restartQuiz}
                className="flex-1 bg-white border-2 border-gray-200 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-gray-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={18} />
                Try Again
              </motion.button>
              <motion.button
                onClick={() => navigate('/home')}
                className="flex-1 gradient-bg text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home size={18} />
                Home
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        <CelebrationEffect trigger={score >= 7 ? 1 : 0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <CelebrationEffect trigger={celebrate} />

      {/* XP Float */}
      <AnimatePresence>
        {xpFloat && (
          <motion.div
            className="fixed top-20 right-8 text-xl font-extrabold text-green-500 z-50"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            +{XP_PER_CORRECT} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(`/subject/${subject}`)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">
            {questionNum}/{TOTAL_QUESTIONS}
          </span>
          <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
            +{sessionXP} XP
          </div>
          {quizStreak > 1 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
              <Flame size={12} />
              {quizStreak}
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          animate={{ width: `${(questionNum / TOTAL_QUESTIONS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Difficulty */}
      <div className="flex justify-center gap-2 mb-6">
        {DIFFICULTIES.map((d) => (
          <motion.button
            key={d}
            onClick={() => !answered && setDifficulty(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              difficulty === d
                ? 'text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
            style={difficulty === d ? { backgroundColor: meta.color } : undefined}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {d}
          </motion.button>
        ))}
      </div>

      {/* Nuri Owl */}
      <div className="flex justify-center mb-4">
        <NuriOwl size="md" state={loading ? 'thinking' : owlState} level={currentProfile.level || 1} />
      </div>

      {/* Question */}
      {loading ? (
        <LoadingSpinner text="Loading question..." />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-semibold text-sm">{error}</p>
          <button onClick={fetchQuestion} className="mt-2 text-sm text-red-500 underline font-semibold">
            Try Again
          </button>
        </div>
      ) : question ? (
        <QuestionCard
          question={question.question}
          options={question.options}
          onAnswer={handleAnswer}
          answered={answered}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          explanation={explanation}
          subjectColor={meta.color}
        />
      ) : null}

      {/* Next button */}
      {answered && (
        <motion.button
          onClick={nextQuestion}
          className="w-full mt-6 gradient-bg text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {questionNum >= TOTAL_QUESTIONS ? (
            <>
              See Results
              <Trophy size={20} />
            </>
          ) : (
            <>
              Next Question
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
