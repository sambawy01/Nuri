// client/src/pages/HomeworkPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Keyboard, Send, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import NuriOwl from '../components/NuriOwl';
import MicButton from '../components/MicButton';
import HomeworkCamera from '../components/HomeworkCamera';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { currentProfile, updateXP } = useProfile();

  // Phase: input | analyzing | questions | chat | verify | summary
  const [phase, setPhase] = useState('input');
  const [inputTab, setInputTab] = useState('upload'); // camera | upload | type
  const [typedText, setTypedText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionComplete, setQuestionComplete] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentProfile) navigate('/');
  }, [currentProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Input handlers ──

  async function handleImageCapture(base64, mediaType) {
    await analyzeInput(base64, mediaType, 'camera');
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const mediaType = file.type || 'image/jpeg';
      const sourceType = file.type === 'application/pdf' ? 'upload_pdf' : 'upload_image';
      await analyzeInput(base64, mediaType, sourceType);
    };
    reader.readAsDataURL(file);
  }

  async function handleTypedSubmit() {
    if (!typedText.trim()) return;
    setPhase('analyzing');
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/analyze', {
        method: 'POST',
        body: { profileId: pid, text: typedText.trim(), sourceType: 'typed' },
      });
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setSubject(data.subject);
      setPhase('questions');
    } catch {
      setPhase('input');
    }
  }

  async function analyzeInput(base64, mediaType, sourceType) {
    setPhase('analyzing');
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/analyze', {
        method: 'POST',
        body: { profileId: pid, image: base64, mediaType, sourceType },
      });
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setSubject(data.subject);
      setPhase('questions');
    } catch {
      setPhase('input');
    }
  }

  // ── Chat handlers ──

  function startQuestion(idx) {
    setCurrentQ(idx);
    setMessages([{
      text: `Let's work on question ${idx + 1}: "${questions[idx].text}"\n\nWhat do you think the first step is?`,
      isNuri: true,
    }]);
    setQuestionComplete(false);
    setCorrectAnswer(null);
    setVerifyResult(null);
    setPhase('chat');
  }

  async function sendChat(text) {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { text: text.trim(), isNuri: false }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/chat', {
        method: 'POST',
        body: { profileId: pid, sessionId, questionIndex: questions[currentQ].number, message: text.trim() },
      });
      setMessages(prev => [...prev, { text: data.reply, isNuri: true }]);
      if (data.questionComplete) {
        setQuestionComplete(true);
        setCorrectAnswer(data.correctAnswer);
      }
    } catch {
      setMessages(prev => [...prev, { text: "Oops, let me think again... Try rephrasing?", isNuri: true }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── Verify handlers ──

  async function handleVerifyCapture(base64, mediaType) {
    setIsLoading(true);
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/verify', {
        method: 'POST',
        body: { profileId: pid, sessionId, questionIndex: questions[currentQ].number, image: base64, mediaType },
      });
      setVerifyResult(data);
      if (data.xpEarned) updateXP(data.xpEarned);
      // Mark question as done in local state
      setQuestions(prev => prev.map((q, i) =>
        i === currentQ ? { ...q, done: true, correct: data.match } : q
      ));
    } catch {
      setVerifyResult({ match: false, feedback: "Couldn't read your answer. Try again?" });
    } finally {
      setIsLoading(false);
    }
  }

  function nextQuestion() {
    const nextIdx = questions.findIndex((q, i) => i > currentQ && !q.done);
    if (nextIdx >= 0) {
      startQuestion(nextIdx);
    } else {
      completeSession();
    }
  }

  async function completeSession() {
    try {
      const pid = currentProfile._id || currentProfile.id;
      const data = await api('/homework/complete', {
        method: 'POST',
        body: { profileId: pid, sessionId },
      });
      setSummaryData(data.summary);
      setPhase('summary');
    } catch {
      setPhase('questions');
    }
  }

  if (!currentProfile) return null;

  const pid = currentProfile._id || currentProfile.id;

  // ── RENDER ──
  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <motion.div
        className="px-4 py-3 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => phase === 'input' ? navigate('/home') : setPhase('input')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <NuriOwl size="sm" state={isLoading ? 'thinking' : 'idle'} level={currentProfile?.level || 1} />
        <div>
          <p className="font-bold text-gray-800 text-sm">Homework Helper</p>
          <p className="text-xs text-gray-500 font-semibold">Nuri helps you solve it</p>
        </div>
      </motion.div>

      {/* ── INPUT PHASE ── */}
      {phase === 'input' && (
        <div className="flex-1 p-4">
          <div className="flex gap-2 mb-6">
            {[
              { key: 'camera', icon: Camera, label: 'Camera' },
              { key: 'upload', icon: Upload, label: 'Upload' },
              { key: 'type', icon: Keyboard, label: 'Type' },
            ].map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setInputTab(key)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  inputTab === key ? 'gradient-bg text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={16} /> {label}
              </motion.button>
            ))}
          </div>

          {inputTab === 'camera' && (
            <HomeworkCamera onCapture={handleImageCapture} onClose={() => setInputTab('upload')} />
          )}

          {inputTab === 'upload' && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Upload size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-bold text-gray-700 mb-1">Upload homework photo or PDF</p>
              <p className="text-sm text-gray-400 mb-4">From your gallery, email, or files</p>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="gradient-bg text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                whileTap={{ scale: 0.97 }}
              >
                Choose File
              </motion.button>
            </motion.div>
          )}

          {inputTab === 'type' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type or paste your homework question here..."
                className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-sm font-semibold h-40 resize-none focus:outline-none focus:border-purple-400"
              />
              <motion.button
                onClick={handleTypedSubmit}
                disabled={!typedText.trim()}
                className="w-full mt-3 gradient-bg text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50"
                whileTap={{ scale: 0.97 }}
              >
                Analyze Question
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {/* ── ANALYZING PHASE ── */}
      {phase === 'analyzing' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <NuriOwl size="lg" state="thinking" level={currentProfile?.level || 1} />
            <p className="text-lg font-extrabold text-gray-800 mt-4">Nuri is reading your homework...</p>
            <Loader2 size={24} className="mx-auto mt-3 text-purple-500 animate-spin" />
          </motion.div>
        </div>
      )}

      {/* ── QUESTIONS LIST PHASE ── */}
      {phase === 'questions' && (
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-4">
            <NuriOwl size="sm" state="excited" level={currentProfile?.level || 1} />
            <div>
              <p className="font-bold text-gray-800">I found {questions.length} question{questions.length !== 1 ? 's' : ''}!</p>
              <p className="text-xs text-gray-500 font-semibold capitalize">{subject}</p>
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((q, i) => (
              <motion.button
                key={i}
                onClick={() => !q.done && startQuestion(i)}
                className={`w-full bg-white rounded-xl p-4 shadow text-left flex items-start gap-3 ${q.done ? 'opacity-60' : 'hover:shadow-md'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={!q.done ? { scale: 0.98 } : {}}
              >
                {q.done ? (
                  <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${q.correct ? 'text-green-500' : 'text-orange-400'}`} />
                ) : (
                  <Circle size={20} className="shrink-0 mt-0.5 text-gray-300" />
                )}
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">Question {q.number}</p>
                  <p className="text-sm font-semibold text-gray-700">{q.text}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {questions.every(q => q.done) && (
            <motion.button
              onClick={completeSession}
              className="w-full mt-4 gradient-bg text-white font-bold py-4 rounded-xl shadow-lg text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
            >
              Finish Homework
            </motion.button>
          )}
        </div>
      )}

      {/* ── CHAT PHASE ── */}
      {phase === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg.text} isNuri={msg.isNuri} subjectColor="#A855F7" />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {questionComplete && !verifyResult && (
            <div className="px-4 pb-2">
              <motion.div
                className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-bold text-green-800 mb-2">Now write your answer on paper and show me!</p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setPhase('verify')}
                    className="flex-1 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Camera size={16} /> Show My Work
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      // Skip verification, mark as done
                      setQuestions(prev => prev.map((q, i) => i === currentQ ? { ...q, done: true, correct: true } : q));
                      nextQuestion();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white border-2 border-gray-200 font-bold text-sm text-gray-500"
                    whileTap={{ scale: 0.97 }}
                  >
                    Skip
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {verifyResult && (
            <div className="px-4 pb-2">
              <motion.div
                className={`rounded-2xl p-4 text-center ${verifyResult.match ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className={`font-bold ${verifyResult.match ? 'text-green-800' : 'text-orange-800'}`}>
                  {verifyResult.feedback}
                </p>
                <p className="text-sm text-gray-500 mt-1">+{verifyResult.xpEarned || 0} XP</p>
                <motion.button
                  onClick={nextQuestion}
                  className="mt-3 gradient-bg text-white font-bold py-2.5 px-6 rounded-xl shadow-md"
                  whileTap={{ scale: 0.97 }}
                >
                  {questions.filter(q => !q.done).length > 1 ? 'Next Question' : 'Finish'}
                </motion.button>
              </motion.div>
            </div>
          )}

          {!questionComplete && (
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="flex gap-2 items-center">
                <MicButton onResult={(text) => sendChat(text)} lang="en-US" disabled={isLoading} size={44} />
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat(chatInput)}
                  placeholder="Type your answer..."
                  className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-400"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={() => sendChat(chatInput)}
                  disabled={!chatInput.trim() || isLoading}
                  className="w-12 h-12 rounded-2xl gradient-bg text-white flex items-center justify-center disabled:opacity-50 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── VERIFY PHASE (camera) ── */}
      {phase === 'verify' && (
        <div className="flex-1 p-4">
          <p className="font-bold text-gray-800 mb-4 text-center">Take a photo of your written answer</p>
          <HomeworkCamera
            onCapture={handleVerifyCapture}
            onClose={() => setPhase('chat')}
          />
          {isLoading && (
            <div className="text-center mt-4">
              <Loader2 size={24} className="mx-auto text-purple-500 animate-spin" />
              <p className="text-sm text-gray-500 font-semibold mt-2">Checking your work...</p>
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY PHASE ── */}
      {phase === 'summary' && summaryData && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div className="w-full text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <NuriOwl size="lg" state="celebrating" level={currentProfile?.level || 1} />
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">Homework Done!</h2>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-gray-800">{summaryData.total}</p>
                <p className="text-xs text-gray-500 font-semibold">Questions</p>
              </div>
              <div className="bg-green-50 rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-green-600">{summaryData.correct}</p>
                <p className="text-xs text-gray-500 font-semibold">Correct</p>
              </div>
              <div className="bg-purple-50 rounded-xl shadow-md p-3">
                <p className="text-2xl font-extrabold text-purple-600">+{summaryData.xp || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">XP</p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/home')}
              className="mt-6 gradient-bg text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-lg"
              whileTap={{ scale: 0.98 }}
            >
              Back Home
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
