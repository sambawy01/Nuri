import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Swords, Zap, CheckCircle2, XCircle, Clock, Home } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import { subjects } from '../lib/subjects';
import NuriOwl from '../components/NuriOwl';
import CelebrationEffect from '../components/CelebrationEffect';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DuelResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProfile } = useProfile();

  const [duel, setDuel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(0);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const data = await api(`/duels/${id}`);
      setDuel(data);
      const qs = typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions;
      setQuestions(qs);
      setAnswers(data.answers || []);

      // Trigger confetti if current user won
      const pid = String(currentProfile._id || currentProfile.id);
      if (data.winner_profile_id && String(data.winner_profile_id) === pid) {
        setTimeout(() => setCelebrate(1), 400);
        setTimeout(() => setCelebrate(2), 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading results..." />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-2">{error}</p>
          <button onClick={() => navigate('/duels')} className="text-orange-500 font-bold">
            Back to Duels
          </button>
        </div>
      </div>
    );
  }

  const sub = subjects[duel?.subject] || {};
  const pid = String(currentProfile._id || currentProfile.id);
  const isCreator = String(duel.creator_profile_id) === pid;

  const myName = currentProfile.name;
  const opponentName = isCreator ? (duel.opponent_name || 'Opponent') : (duel.creator_name || 'Opponent');
  const myProfileId = pid;
  const opponentProfileId = isCreator ? String(duel.opponent_profile_id) : String(duel.creator_profile_id);

  const myScore = isCreator ? (duel.creator_score ?? 0) : (duel.opponent_score ?? 0);
  const opponentScore = isCreator ? (duel.opponent_score ?? 0) : (duel.creator_score ?? 0);
  const winnerId = duel.winner_profile_id ? String(duel.winner_profile_id) : null;
  const iWon = winnerId === pid;
  const isTie = duel.status === 'complete' && !winnerId;

  // Build per-question comparison
  const questionComparison = questions.map((q, idx) => {
    const myAns = answers.find((a) => String(a.profile_id) === myProfileId && Number(a.question_index) === idx);
    const oppAns = answers.find((a) => String(a.profile_id) === opponentProfileId && Number(a.question_index) === idx);
    return {
      question: q.question,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
      myAnswer: myAns,
      oppAnswer: oppAns,
    };
  });

  const owlState = iWon ? 'celebrating' : isTie ? 'excited' : 'encouraging';
  let headline = '';
  let subline = '';
  if (duel.status !== 'complete') {
    headline = 'Duel in Progress';
    subline = 'Results will update when both players finish.';
  } else if (iWon) {
    headline = 'You Won! ';
    subline = `Amazing work, ${myName}! You crushed it!`;
  } else if (isTie) {
    headline = "It's a Tie!";
    subline = 'Great minds think alike!';
  } else {
    headline = 'Better luck next time!';
    subline = `${opponentName} won this round — you'll get them next time!`;
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      <CelebrationEffect trigger={celebrate} />

      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate('/duels')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Swords size={22} className="text-orange-500" />
          <h1 className="text-xl font-extrabold text-gray-800 capitalize">{duel.subject} Duel Results</h1>
        </div>
      </motion.div>

      {/* Winner Banner */}
      <motion.div
        className={`rounded-3xl p-6 mb-6 text-center ${
          iWon ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-xl' :
          isTie ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800' :
          'bg-white shadow-lg text-gray-800'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <NuriOwl size="md" state={owlState} level={currentProfile.level || 1} />
        <h2 className={`text-2xl font-extrabold mt-3 mb-1 ${iWon ? 'text-white' : 'text-gray-800'}`}>
          {headline}{iWon && <Trophy size={24} className="inline ml-1 text-yellow-300" />}
        </h2>
        <p className={`text-sm font-semibold ${iWon ? 'text-white/80' : 'text-gray-500'}`}>{subline}</p>

        {/* XP earned */}
        {duel.status === 'complete' && (
          <motion.div
            className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full font-extrabold text-sm ${
              iWon ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Zap size={16} />
            +{iWon ? 50 : 20} XP earned!
          </motion.div>
        )}
      </motion.div>

      {/* Scoreboard */}
      <motion.div
        className="bg-white rounded-3xl shadow-lg p-5 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-extrabold text-gray-800 mb-4 text-center">Scoreboard</h3>
        <div className="flex items-center gap-4">
          {/* My score */}
          <div className={`flex-1 text-center p-4 rounded-2xl ${iWon ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500 font-bold mb-1 truncate">{myName} (You)</p>
            <p className="text-4xl font-extrabold" style={{ color: iWon ? '#F97316' : '#6B7280' }}>
              {myScore}
            </p>
            <p className="text-xs text-gray-400 font-semibold">/{questions.length}</p>
            {iWon && <Trophy size={16} className="mx-auto text-orange-400 mt-1" />}
          </div>

          <div className="text-2xl font-extrabold text-gray-300">vs</div>

          {/* Opponent score */}
          <div className={`flex-1 text-center p-4 rounded-2xl ${!iWon && !isTie && winnerId ? 'bg-purple-50 ring-2 ring-purple-400' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500 font-bold mb-1 truncate">{opponentName}</p>
            <p className="text-4xl font-extrabold" style={{ color: !iWon && !isTie && winnerId ? '#A855F7' : '#6B7280' }}>
              {opponentScore}
            </p>
            <p className="text-xs text-gray-400 font-semibold">/{questions.length}</p>
            {!iWon && !isTie && winnerId && <Trophy size={16} className="mx-auto text-purple-400 mt-1" />}
          </div>
        </div>
      </motion.div>

      {/* Question-by-question breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-extrabold text-gray-800 mb-3">Question Breakdown</h3>
        <div className="space-y-3">
          {questionComparison.map((item, idx) => {
            const myCorrect = item.myAnswer?.is_correct;
            const oppCorrect = item.oppAnswer?.is_correct;

            return (
              <motion.div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.06 }}
              >
                <p className="text-xs text-gray-400 font-bold mb-1">Q{idx + 1} · {item.topic || duel.subject}</p>
                <p className="text-sm text-gray-700 font-semibold mb-3 leading-snug line-clamp-2">{item.question}</p>

                <div className="flex items-center gap-3">
                  {/* My answer */}
                  <div className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl ${
                    myCorrect ? 'bg-green-50' : myCorrect === false ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    {myCorrect === true ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    ) : myCorrect === false ? (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    ) : (
                      <Clock size={16} className="text-gray-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-bold truncate">{myName}</p>
                      {item.myAnswer && (
                        <p className="text-xs font-extrabold text-gray-700">
                          {item.myAnswer.answer || '?'}
                          {item.myAnswer.time_ms && (
                            <span className="text-gray-400 font-semibold ml-1">
                              · {(item.myAnswer.time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-gray-300 font-bold text-xs">vs</span>

                  {/* Opponent answer */}
                  <div className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl ${
                    oppCorrect ? 'bg-green-50' : oppCorrect === false ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    {oppCorrect === true ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    ) : oppCorrect === false ? (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    ) : (
                      <Clock size={16} className="text-gray-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-bold truncate">{opponentName}</p>
                      {item.oppAnswer && (
                        <p className="text-xs font-extrabold text-gray-700">
                          {item.oppAnswer.answer || '?'}
                          {item.oppAnswer.time_ms && (
                            <span className="text-gray-400 font-semibold ml-1">
                              · {(item.oppAnswer.time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-semibold mt-2">
                  Correct: <span className="font-extrabold text-green-600">{item.correctAnswer}</span>
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="mt-6 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate('/duels')}
          className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Swords size={20} /> New Duel!
        </motion.button>
        <motion.button
          onClick={() => navigate('/home')}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home size={18} /> Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
