import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Zap, Map, CheckCircle } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';
import NuriOwl from '../components/NuriOwl';
import QuestionCard from '../components/QuestionCard';
import CelebrationEffect from '../components/CelebrationEffect';
import LoadingSpinner from '../components/LoadingSpinner';

// Stage type badges
const STAGE_TYPE_LABELS = {
  story: { label: 'Story', bg: 'bg-blue-100', text: 'text-blue-700' },
  learn: { label: 'Learn', bg: 'bg-green-100', text: 'text-green-700' },
  challenge: { label: 'Challenge', bg: 'bg-orange-100', text: 'text-orange-700' },
  boss: { label: 'Boss', bg: 'bg-red-100', text: 'text-red-700' },
  reward: { label: 'Reward', bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const CHALLENGE_QUESTION_COUNT = 3;

export default function StoryChapterPage() {
  const { chapter, stage } = useParams();
  const chapterId = parseInt(chapter, 10);
  const stageNum = parseInt(stage, 10);
  const navigate = useNavigate();
  const { currentProfile, updateXP } = useProfile();

  const [chapterData, setChapterData] = useState(null);
  const [stageData, setStageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Challenge / boss state
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  // Reward state
  const [xpEarned, setXpEarned] = useState(0);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [celebrate, setCelebrate] = useState(0);

  const profileId = currentProfile?._id || currentProfile?.id;

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    loadChapter();
  }, [chapterId, stageNum, currentProfile]);

  async function loadChapter() {
    setLoading(true);
    setStageCompleted(false);
    setChallengeComplete(false);
    setQuestions([]);
    setCurrentQIndex(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    setQuestionAnswered(false);
    setSelectedAnswer(null);
    setCorrectAnswer(null);

    try {
      const data = await api(`/story/chapter/${chapterId}`);
      setChapterData(data);
      const s = data.stages.find(st => st.stage === stageNum);
      setStageData(s || null);

      // Pre-load questions for challenge/boss stages
      if (s && (s.type === 'challenge' || s.type === 'boss')) {
        await loadQuestions(data.subject, s.type);
      }
    } catch {
      // Fallback: build from static data embedded in StoryMapPage defaults
      setChapterData(null);
      setStageData(null);
    } finally {
      setLoading(false);
    }
  }

  const loadQuestions = useCallback(async (subject, type) => {
    setQuestionsLoading(true);
    const count = type === 'boss' ? 1 : CHALLENGE_QUESTION_COUNT;
    const difficulty = type === 'boss' ? 'hard' : 'medium';
    const pid = currentProfile?._id || currentProfile?.id;

    try {
      // Fetch a topic for this subject
      const topics = await api(`/curriculum/${subject}/${currentProfile?.year_group || 3}`);
      const topic = topics?.[Math.floor(Math.random() * (topics?.length || 1))]?.name || subject;

      const qs = [];
      for (let i = 0; i < count; i++) {
        try {
          const q = await api('/quiz/question', {
            method: 'POST',
            body: { profileId: pid, subject, topic, difficulty },
          });
          qs.push({ ...q, topic });
        } catch {
          // Use a fallback question
          qs.push({
            questionId: `fallback-${i}`,
            question: `Tell me something you know about ${subject}!`,
            options: ['A) I know lots!', 'B) A little bit', 'C) I am learning', 'D) I need more practice'],
            correctAnswer: 'A',
            explanation: 'Every answer shows you are trying — that is what counts!',
            topic,
          });
        }
      }
      setQuestions(qs);
    } catch {
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }, [currentProfile]);

  async function handleAnswer(index) {
    if (questionAnswered) return;
    setQuestionAnswered(true);
    setSelectedAnswer(index);

    const q = questions[currentQIndex];
    const correctLetter = q?.correctAnswer || 'A';
    const correct = correctLetter.charCodeAt(0) - 65;
    setCorrectAnswer(correct);
    setExplanation(q?.explanation || '');

    const isCorrect = index === correct;
    if (isCorrect) setCorrectCount(c => c + 1);
    setAnsweredCount(a => a + 1);

    // Submit to quiz answer endpoint (non-blocking)
    if (q?.questionId && !q.questionId.startsWith('fallback')) {
      api('/quiz/answer', {
        method: 'POST',
        body: {
          profileId,
          subject: chapterData?.subject,
          questionId: q.questionId,
          answer: String.fromCharCode(65 + index),
        },
      }).catch(() => {});
    }
  }

  function nextQuestion() {
    const totalQ = questions.length;
    if (currentQIndex + 1 >= totalQ) {
      setChallengeComplete(true);
    } else {
      setCurrentQIndex(i => i + 1);
      setQuestionAnswered(false);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setExplanation('');
    }
  }

  async function completeStage(score = 0) {
    if (stageCompleted) return;
    setStageCompleted(true);

    try {
      const result = await api('/story/complete-stage', {
        method: 'POST',
        body: { profileId, chapter: chapterId, stage: stageNum, score },
      });
      setXpEarned(result.xpEarned || 0);
      updateXP && updateXP(result.xpEarned || 0);
    } catch {
      setXpEarned(stageData?.type === 'reward' ? 50 : 20);
    }
    setCelebrate(c => c + 1);
  }

  function goNextStage() {
    if (stageNum < 5) {
      navigate(`/story/${chapterId}/${stageNum + 1}`);
    } else {
      // Chapter complete — go back to map
      navigate('/story');
    }
  }

  if (loading) return <LoadingSpinner text="Entering the story..." />;

  if (!stageData || !chapterData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 font-semibold mb-4">Chapter not found</p>
          <button onClick={() => navigate('/story')} className="text-purple-600 font-bold underline">
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  const typeBadge = STAGE_TYPE_LABELS[stageData.type] || STAGE_TYPE_LABELS.story;
  const subjectMeta = subjects[chapterData.subject] || {};
  const owlState = challengeComplete || stageData.type === 'reward' ? 'celebrating' : stageData.type === 'boss' ? 'excited' : 'idle';

  return (
    <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      <CelebrationEffect trigger={celebrate} />

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate('/story')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <p className="font-extrabold text-gray-800 text-sm">{chapterData.title}</p>
          <p className="text-xs text-gray-400 font-semibold">Stage {stageNum} of 5</p>
        </div>
        {/* Stage dots */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  s < stageNum
                    ? chapterData.color
                    : s === stageNum
                    ? chapterData.color
                    : '#E5E7EB',
                opacity: s === stageNum ? 1 : s < stageNum ? 0.7 : 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Chapter color banner */}
      <motion.div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={{ backgroundColor: chapterData.color + '18', border: `2px solid ${chapterData.color}30` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-3xl">{chapterData.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-gray-800">{stageData.title}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
              {typeBadge.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ---- STORY stage ---- */}
      {stageData.type === 'story' && (
        <StoryStage
          stageData={stageData}
          chapterData={chapterData}
          owlState="idle"
          profile={currentProfile}
          onContinue={() => completeStage(0).then(goNextStage)}
          stageCompleted={stageCompleted}
        />
      )}

      {/* ---- LEARN stage ---- */}
      {stageData.type === 'learn' && (
        <LearnStage
          stageData={stageData}
          chapterData={chapterData}
          profile={currentProfile}
          navigate={navigate}
          onDone={() => completeStage(0).then(goNextStage)}
          stageCompleted={stageCompleted}
        />
      )}

      {/* ---- CHALLENGE / BOSS stage ---- */}
      {(stageData.type === 'challenge' || stageData.type === 'boss') && (
        <ChallengeStage
          stageData={stageData}
          chapterData={chapterData}
          profile={currentProfile}
          questions={questions}
          questionsLoading={questionsLoading}
          currentQIndex={currentQIndex}
          questionAnswered={questionAnswered}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          explanation={explanation}
          challengeComplete={challengeComplete}
          correctCount={correctCount}
          answeredCount={answeredCount}
          onAnswer={handleAnswer}
          onNext={nextQuestion}
          onFinish={() => completeStage(correctCount).then(goNextStage)}
          stageCompleted={stageCompleted}
        />
      )}

      {/* ---- REWARD stage ---- */}
      {stageData.type === 'reward' && (
        <RewardStage
          stageData={stageData}
          chapterData={chapterData}
          profile={currentProfile}
          xpEarned={xpEarned}
          onComplete={() => completeStage(5)}
          onBackToMap={() => navigate('/story')}
          stageCompleted={stageCompleted}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StoryStage({ stageData, chapterData, profile, onContinue, stageCompleted }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-center mb-4">
        <NuriOwl size="md" state="idle" level={profile?.level || 1} />
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow-lg p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 font-semibold text-base leading-relaxed">{stageData.text}</p>
      </motion.div>

      <motion.button
        className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
        style={{ background: `linear-gradient(135deg, ${chapterData.color}, ${chapterData.color}aa)` }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={stageCompleted}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Continue the Adventure
        <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}

function LearnStage({ stageData, chapterData, profile, navigate, onDone, stageCompleted }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-center mb-4">
        <NuriOwl size="md" state="excited" level={profile?.level || 1} />
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow-lg p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-700 font-semibold text-base leading-relaxed mb-4">{stageData.text}</p>
        <div
          className="rounded-xl p-3 text-sm font-semibold"
          style={{ backgroundColor: chapterData.color + '18', color: chapterData.color }}
        >
          Nuri will teach you about <strong>{chapterData.title.replace('The Book of ', '')}</strong> right now!
        </div>
      </motion.div>

      <div className="space-y-3">
        <motion.button
          className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-base"
          style={{ backgroundColor: chapterData.color }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            navigate(`/learn/${chapterData.subject}`, {
              state: { storyReturn: `/story/${chapterData.id}/3` },
            })
          }
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <BookOpen size={20} />
          Start Learning with Nuri
        </motion.button>

        <motion.button
          className="w-full bg-white border-2 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-gray-700"
          style={{ borderColor: chapterData.color + '60' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDone}
          disabled={stageCompleted}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          I already know this — skip ahead
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ChallengeStage({
  stageData, chapterData, profile,
  questions, questionsLoading,
  currentQIndex, questionAnswered,
  selectedAnswer, correctAnswer, explanation,
  challengeComplete, correctCount, answeredCount,
  onAnswer, onNext, onFinish, stageCompleted,
}) {
  const isBoss = stageData.type === 'boss';
  const total = questions.length;
  const q = questions[currentQIndex];

  if (questionsLoading) {
    return <LoadingSpinner text={isBoss ? 'The boss prepares their question...' : 'Loading challenges...'} />;
  }

  if (challengeComplete) {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = pct >= 50;
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex justify-center mb-4">
          <NuriOwl size="md" state={passed ? 'celebrating' : 'encouraging'} level={profile?.level || 1} />
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <p className="text-3xl mb-3">{passed ? '🎉' : '💪'}</p>
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">
            {passed ? 'Challenge Complete!' : 'Great Effort!'}
          </h2>
          <p className="text-gray-500 font-semibold mb-4">
            {correctCount}/{total} correct
          </p>
          <p className="text-sm font-semibold" style={{ color: chapterData.color }}>
            {passed
              ? "You proved yourself! The adventure continues..."
              : "Every attempt makes you stronger. Let's keep going!"}
          </p>
        </div>
        <motion.button
          className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
          style={{ backgroundColor: chapterData.color }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFinish}
          disabled={stageCompleted}
        >
          Continue
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    );
  }

  if (!q) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 font-semibold">No questions available right now.</p>
        <button onClick={onFinish} className="mt-4 text-purple-600 font-bold underline">
          Continue anyway
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Narrative */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <p className="text-gray-600 font-semibold text-sm">{stageData.text}</p>
      </div>

      {/* Progress */}
      {!isBoss && (
        <div className="flex gap-2 mb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{
                backgroundColor:
                  i < currentQIndex
                    ? chapterData.color
                    : i === currentQIndex
                    ? chapterData.color + '80'
                    : '#E5E7EB',
              }}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center mb-4">
        <NuriOwl
          size="sm"
          state={questionAnswered ? (selectedAnswer === correctAnswer ? 'celebrating' : 'encouraging') : (isBoss ? 'excited' : 'idle')}
          level={profile?.level || 1}
        />
      </div>

      <QuestionCard
        question={q.question}
        options={q.options}
        onAnswer={onAnswer}
        answered={questionAnswered}
        selectedAnswer={selectedAnswer}
        correctAnswer={correctAnswer}
        explanation={explanation}
        subjectColor={chapterData.color}
      />

      {questionAnswered && (
        <motion.button
          className="w-full mt-4 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-lg"
          style={{ backgroundColor: chapterData.color }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentQIndex + 1 >= questions.length ? 'See Result' : 'Next Question'}
          <ArrowRight size={20} />
        </motion.button>
      )}
    </motion.div>
  );
}

function RewardStage({ stageData, chapterData, profile, xpEarned, onComplete, onBackToMap, stageCompleted }) {
  const [done, setDone] = useState(false);

  async function handleCollect() {
    if (done) return;
    setDone(true);
    await onComplete();
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-center mb-4">
        <NuriOwl size="lg" state="celebrating" level={profile?.level || 1} />
      </div>

      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6 mb-6 overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Glow behind icon */}
        <div
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{ background: `radial-gradient(circle at center, ${chapterData.color}, transparent 70%)` }}
        />
        <div className="text-6xl mb-3 relative z-10">{chapterData.icon}</div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2 relative z-10">{stageData.title}</h2>
        <p className="text-gray-600 font-semibold text-sm leading-relaxed mb-4 relative z-10">{stageData.text}</p>

        {/* XP earned */}
        {(xpEarned > 0 || done) && (
          <motion.div
            className="rounded-2xl p-3 mb-4 relative z-10"
            style={{ backgroundColor: chapterData.color + '18' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-2xl font-extrabold" style={{ color: chapterData.color }}>
              +{xpEarned || 50} XP
            </p>
            <p className="text-xs font-semibold text-gray-500">Chapter Complete Bonus!</p>
          </motion.div>
        )}

        {/* Sticker unlock hint */}
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 relative z-10">
          <CheckCircle size={16} className="text-green-500" />
          <span>Chapter {chapterData.id} unlocked in your Sticker Book!</span>
        </div>
      </motion.div>

      {!done ? (
        <motion.button
          className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl text-lg"
          style={{ background: `linear-gradient(135deg, ${chapterData.color}, #A855F7)` }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCollect}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Zap size={20} />
          Collect Your Reward!
        </motion.button>
      ) : (
        <motion.button
          className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl text-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBackToMap}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Map size={20} />
          Back to Adventure Map
        </motion.button>
      )}
    </motion.div>
  );
}
