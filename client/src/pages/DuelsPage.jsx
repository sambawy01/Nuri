import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Copy, CheckCheck, Clock, Trophy, Hash } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { api } from '../lib/api';
import { subjects, subjectKeys } from '../lib/subjects';
import LoadingSpinner from '../components/LoadingSpinner';
import NuriOwl from '../components/NuriOwl';

const TABS = ['Create', 'Join', 'History'];

export default function DuelsPage() {
  const navigate = useNavigate();
  const { currentProfile } = useProfile();
  const [tab, setTab] = useState('Create');

  // Create tab state
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdDuel, setCreatedDuel] = useState(null);
  const [copied, setCopied] = useState(false);

  // Join tab state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // History tab state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
    }
  }, [currentProfile, navigate]);

  useEffect(() => {
    if (tab === 'History' && currentProfile) {
      fetchHistory();
    }
  }, [tab, currentProfile]);

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const data = await api(`/duels/history/${currentProfile._id || currentProfile.id}`);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleCreate() {
    if (!selectedSubject) return;
    setCreating(true);
    setCreatedDuel(null);
    try {
      const data = await api('/duels/create', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject: selectedSubject,
        },
      });
      setCreatedDuel(data);
    } catch (err) {
      alert(err.message || 'Failed to create duel');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setJoinError('Please enter a 6-character code');
      return;
    }
    setJoining(true);
    setJoinError('');
    try {
      const data = await api(`/duels/join/${code}?profileId=${currentProfile._id || currentProfile.id}`);
      navigate(`/duel/${data.id}`);
    } catch (err) {
      setJoinError(err.message || 'Could not join duel');
    } finally {
      setJoining(false);
    }
  }

  function handleCopyCode() {
    if (!createdDuel?.code) return;
    navigator.clipboard.writeText(createdDuel.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function getResultForProfile(duel) {
    const pid = String(currentProfile._id || currentProfile.id);
    const isCreator = String(duel.creator_profile_id) === pid;
    const myScore = isCreator ? duel.creator_score : duel.opponent_score;
    const theirScore = isCreator ? duel.opponent_score : duel.creator_score;
    const theirName = isCreator ? duel.opponent_name : duel.creator_name;

    if (duel.status !== 'complete') return { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (!duel.winner_profile_id) return { label: 'Tie!', color: 'text-gray-600', bg: 'bg-gray-50', score: `${myScore} - ${theirScore}` };
    if (String(duel.winner_profile_id) === pid) return { label: 'You Won!', color: 'text-green-600', bg: 'bg-green-50', score: `${myScore} - ${theirScore}` };
    return { label: 'You Lost', color: 'text-red-500', bg: 'bg-red-50', score: `${myScore} - ${theirScore}`, opponent: theirName };
  }

  if (!currentProfile) return null;

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
        <div className="flex items-center gap-2">
          <Swords size={24} className="text-orange-500" />
          <h1 className="text-2xl font-extrabold text-gray-800">Study Duels</h1>
        </div>
        <div className="ml-auto">
          <NuriOwl size="sm" state="excited" level={currentProfile.level || 1} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === t ? 'bg-white shadow text-orange-500' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* CREATE TAB */}
        {tab === 'Create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {!createdDuel ? (
              <>
                <p className="text-gray-600 font-semibold mb-4 text-center">
                  Pick a subject and challenge a friend!
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {subjectKeys.map((key) => {
                    const sub = subjects[key];
                    const isSelected = selectedSubject === key;
                    return (
                      <motion.button
                        key={key}
                        onClick={() => setSelectedSubject(key)}
                        className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 border-2 transition-all ${
                          isSelected
                            ? 'border-orange-400 shadow-lg scale-105'
                            : 'border-gray-200 bg-white'
                        }`}
                        style={isSelected ? { borderColor: sub.color, backgroundColor: sub.color + '15' } : {}}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="text-2xl">{sub.emoji}</span>
                        <span
                          className="text-sm font-extrabold"
                          style={isSelected ? { color: sub.color } : { color: '#374151' }}
                        >
                          {sub.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  onClick={handleCreate}
                  disabled={!selectedSubject || creating}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: selectedSubject ? 1.02 : 1 }}
                  whileTap={{ scale: selectedSubject ? 0.98 : 1 }}
                >
                  {creating ? (
                    <><span className="animate-spin mr-2">⏳</span> Generating questions...</>
                  ) : (
                    <><Swords size={20} /> Create Duel</>
                  )}
                </motion.button>
              </>
            ) : (
              <motion.div
                className="bg-white rounded-3xl shadow-xl p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-5xl mb-3">⚔️</div>
                <h2 className="text-xl font-extrabold text-gray-800 mb-1">Duel Ready!</h2>
                <p className="text-gray-500 font-semibold text-sm mb-6">
                  Share this code with your friend
                </p>

                <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-orange-200 rounded-2xl p-6 mb-4">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Duel Code</p>
                  <p className="text-5xl font-extrabold tracking-widest text-orange-500">
                    {createdDuel.code}
                  </p>
                </div>

                <motion.button
                  onClick={handleCopyCode}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 mb-3"
                  whileTap={{ scale: 0.97 }}
                >
                  {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </motion.button>

                <motion.button
                  onClick={() => navigate(`/duel/${createdDuel.id}`)}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-extrabold py-3 rounded-2xl shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Playing Now!
                </motion.button>

                <button
                  onClick={() => { setCreatedDuel(null); setSelectedSubject(null); }}
                  className="mt-3 text-sm text-gray-400 font-semibold hover:text-gray-600"
                >
                  Create another duel
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* JOIN TAB */}
        {tab === 'Join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🔑</div>
                <h2 className="text-xl font-extrabold text-gray-800">Join a Duel</h2>
                <p className="text-gray-500 font-semibold text-sm mt-1">
                  Enter the 6-character code from your friend
                </p>
              </div>

              <div className="relative mb-4">
                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="ABCDE1"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setJoinError('');
                  }}
                  className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl font-extrabold text-xl text-center tracking-widest focus:outline-none focus:border-orange-400 uppercase"
                />
              </div>

              {joinError && (
                <p className="text-red-500 font-semibold text-sm text-center mb-3">{joinError}</p>
              )}

              <motion.button
                onClick={handleJoin}
                disabled={joinCode.length !== 6 || joining}
                className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-extrabold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: joinCode.length === 6 ? 1.02 : 1 }}
                whileTap={{ scale: joinCode.length === 6 ? 0.98 : 1 }}
              >
                {joining ? (
                  <span className="animate-pulse">Joining...</span>
                ) : (
                  <><Swords size={20} /> Join Duel!</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {tab === 'History' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loadingHistory ? (
              <LoadingSpinner text="Loading history..." />
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🏆</div>
                <p className="text-gray-500 font-semibold">No duels yet!</p>
                <p className="text-gray-400 text-sm mt-1">Create or join a duel to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((duel) => {
                  const result = getResultForProfile(duel);
                  const sub = subjects[duel.subject];
                  return (
                    <motion.button
                      key={duel.id}
                      onClick={() => navigate(`/duel/${duel.id}/results`)}
                      className={`w-full ${result.bg} rounded-2xl p-4 text-left flex items-center gap-4 border border-gray-100`}
                      whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: (sub?.color || '#999') + '20' }}
                      >
                        {sub?.emoji || '⚔️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-gray-800 capitalize">{duel.subject}</p>
                        <p className="text-xs text-gray-500 font-semibold">
                          vs {String(duel.creator_profile_id) === String(currentProfile._id || currentProfile.id)
                            ? (duel.opponent_name || 'Waiting for opponent')
                            : (duel.creator_name || 'Unknown')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-extrabold text-sm ${result.color}`}>{result.label}</p>
                        {result.score && (
                          <p className="text-xs text-gray-500 font-bold">{result.score}</p>
                        )}
                        {duel.status === 'complete' ? (
                          <Trophy size={14} className="ml-auto text-gray-400 mt-1" />
                        ) : (
                          <Clock size={14} className="ml-auto text-blue-400 mt-1" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
