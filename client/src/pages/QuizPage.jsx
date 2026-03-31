import { useState, useEffect, useCallback, useRef } from 'react';
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
import DifficultySelector from '../components/DifficultySelector';
import ConfidenceMeter from '../components/ConfidenceMeter';
import LevelUpModal from '../components/LevelUpModal';

const TOTAL_QUESTIONS = 10;
const DIFFICULTY_XP = { easy: 5, medium: 10, hard: 15, challenge: 20 };

export default function QuizPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile, updateXP, levelUpData, clearLevelUp } = useProfile();
  const meta = subjects[subject];
  // Restore session from sessionStorage if navigated back
  const sessionKey = `nuri_quiz_${subject}`;
  const saved = useRef(null);
  if (!saved.current) {
    try {
      const raw = sessionStorage.getItem(sessionKey);
      if (raw) saved.current = JSON.parse(raw);
    } catch { saved.current = null; }
  }
  const restored = saved.current;

  const [activeTopic, setActiveTopic] = useState(location.state?.topic || restored?.topic || null);
  const [difficulty, setDifficulty] = useState(restored?.difficulty || 'medium');
  const [question, setQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(restored?.questionNum || 1);
  const [score, setScore] = useState(restored?.score || 0);
  const [sessionXP, setSessionXP] = useState(restored?.sessionXP || 0);
  const [quizStreak, setQuizStreak] = useState(restored?.quizStreak || 0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [xpFloat, setXpFloat] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [confidenceGiven, setConfidenceGiven] = useState(false);
  const pendingAnswerRef = useRef(null);

  // Persist quiz session progress
  useEffect(() => {
    if (showSummary) {
      sessionStorage.removeItem(sessionKey);
    } else if (questionNum > 0) {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        topic: activeTopic, difficulty, questionNum, score, sessionXP, quizStreak,
      }));
    }
  }, [questionNum, score, sessionXP, quizStreak, difficulty, activeTopic, showSummary, sessionKey]);

  // Track if initial load is done
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    if (!activeTopic) {
      // Fetch a topic first, then trigger question load via activeTopic change
      api(`/curriculum/${subject}/${currentProfile.year_group}`)
        .then(topics => {
          if (topics?.length > 0) {
            const randomTopic = topics[Math.floor(Math.random() * topics.length)].name;
            setActiveTopic(randomTopic);
          }
        })
        .catch(() => {});
    } else {
      fetchQuestion();
    }
  }, []);

  // Fetch question when activeTopic is set (handles the async topic fetch case)
  useEffect(() => {
    if (activeTopic && initialLoadDone.current) {
      fetchQuestion();
    }
  }, [activeTopic]);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setExplanation('');
    setError(null);
    setShowConfidence(false);
    setConfidenceGiven(false);

    try {
      const data = await api('/quiz/question', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject,
          difficulty,
          ...(activeTopic && { topic: activeTopic }),
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
  }, [currentProfile, subject, difficulty, meta, activeTopic]);

  async function handleAnswer(index) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);

    const correct = question.correctAnswer ?? 0;
    setCorrectAnswer(correct);
    setExplanation(question.explanation || '');

    const isCorrect = index === correct;
    const xpGain = DIFFICULTY_XP[difficulty] || 10;

    if (isCorrect) {
      setScore((s) => s + 1);
      setSessionXP((xp) => xp + xpGain);
      setQuizStreak((s) => s + 1);
      setCelebrate((c) => c + 1);
      setXpFloat(true);
      updateXP(xpGain);
      setTimeout(() => setXpFloat(false), 1500);
    } else {
      setQuizStreak(0);
    }

    setShowConfidence(true);

    // Store pending answer to submit with optional confidence
    pendingAnswerRef.current = {
      profileId: currentProfile._id || currentProfile.id,
      subject,
      questionId: question.questionId,
      answer: index,
      correct: isCorrect,
    };
  }

  async function submitAnswer(confidence) {
    if (!pendingAnswerRef.current) return;
    const body = { ...pendingAnswerRef.current };
    if (confidence) body.confidence = confidence;
    pendingAnswerRef.current = null;

    try {
      await api('/quiz/answer', {
        method: 'POST',
        body,
      });
    } catch {
      // Non-critical
    }
  }

  function handleConfidence(level) {
    setShowConfidence(false);
    setConfidenceGiven(true);
    setSessionXP((xp) => xp + 2);
    updateXP(2);
    submitAnswer(level);
  }

  function nextQuestion() {
    // Submit without confidence if not already submitted
    if (pendingAnswerRef.current) {
      submitAnswer(null);
    }
    if (questionNum >= TOTAL_QUESTIONS) {
      setShowSummary(true);
      return;
    }
    setQuestionNum((n) => n + 1);
    fetchQuestion();
  }

  function restartQuiz() {
    sessionStorage.removeItem(sessionKey);
    setShowSummary(false);
    setQuestionNum(1);
    setScore(0);
    setSessionXP(0);
    setQuizStreak(0);
    setShowConfidence(false);
    setConfidenceGiven(false);
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

    let suggestion = null;
    if (difficulty === 'easy' && percentage >= 90) {
      suggestion = "That was too easy for you! Want to try Medium? I think you're ready! 💪";
    } else if (difficulty === 'hard' && percentage < 40) {
      suggestion = "No shame! Let's go back to Medium and build up. You'll get there! 🌟";
    } else if (difficulty === 'medium' && percentage >= 90) {
      suggestion = "You're crushing it! Ready to try Hard mode? 🔥";
    }

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

            {suggestion && (
              <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-purple-800 font-semibold">{suggestion}</p>
              </div>
            )}

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
        <LevelUpModal level={levelUpData?.level} visible={!!levelUpData} onClose={clearLevelUp} />
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
            +{DIFFICULTY_XP[difficulty] || 10} XP
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
      <div className="mb-6">
        <DifficultySelector
          selected={difficulty}
          onSelect={setDifficulty}
          disabled={answered}
        />
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

      {/* Confidence Meter */}
      {answered && (
        <ConfidenceMeter
          visible={showConfidence && !confidenceGiven}
          onSelect={handleConfidence}
        />
      )}

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

      <LevelUpModal level={levelUpData?.level} visible={!!levelUpData} onClose={clearLevelUp} />
    </div>
  );
}
