import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, GraduationCap, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import NuriOwl from '../components/NuriOwl';
import MicButton from '../components/MicButton';

export default function ExplainBackPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile, updateXP } = useProfile();
  const meta = subjects[subject];
  const topic = location.state?.topic;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentProfile || !topic) {
      navigate(`/subject/${subject}`);
      return;
    }
    setMessages([{
      text: `Okay ${currentProfile.name}, I heard you know about "${topic}"... but I don't really get it. Can you teach me? Start from the beginning! 🤔`,
      isNuri: true,
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    if (!text.trim() || isLoading || result) return;
    setMessages((prev) => [...prev, { text: text.trim(), isNuri: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await api('/explain/message', {
        method: 'POST',
        body: {
          profileId: currentProfile._id || currentProfile.id,
          subject,
          topic,
          message: text.trim(),
          ...(sessionId && { sessionId }),
        },
      });

      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { text: data.reply, isNuri: true }]);

      if (data.done) {
        setResult({ score: data.score, summary: data.summary });
        if (data.xp) updateXP(data.xp.xpAwarded || 20);
      }
    } catch {
      setMessages((prev) => [...prev, {
        text: "Oops, I got confused! Try explaining again?",
        isNuri: true,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  if (!meta) {
    navigate('/home');
    return null;
  }

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        className="px-4 py-3 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate(`/subject/${subject}`)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={22} />
        </button>
        <NuriOwl size="sm" state={isLoading ? 'thinking' : 'excited'} level={currentProfile?.level || 1} />
        <div>
          <p className="font-bold text-gray-800 text-sm">Teach Nuri: {topic}</p>
          <p className="text-xs text-gray-500 font-semibold">You're the teacher!</p>
        </div>
        <GraduationCap size={20} className="ml-auto text-purple-500" />
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={msg.text}
            isNuri={msg.isNuri}
            subjectColor={meta.color}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Result */}
      {result && (
        <motion.div
          className="mx-4 mb-2 bg-green-50 border border-green-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-green-800">Understanding Score:</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={s <= result.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>
          </div>
          {result.summary && <p className="text-sm text-green-700">{result.summary}</p>}
          <motion.button
            onClick={() => navigate(`/subject/${subject}`)}
            className="mt-3 w-full gradient-bg text-white font-bold py-3 rounded-xl"
            whileTap={{ scale: 0.98 }}
          >
            Back to {meta.name}
          </motion.button>
        </motion.div>
      )}

      {/* Input */}
      {!result && (
        <div className="px-4 pb-4 pt-2 shrink-0">
          <div className="flex gap-2 items-center">
            <MicButton
              onResult={(text) => sendMessage(text)}
              lang={subject === 'arabic' ? 'ar-SA' : 'en-US'}
              disabled={isLoading}
              size={44}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Teach Nuri..."
              className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-purple-400 transition-colors"
              disabled={isLoading}
            />
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl gradient-bg text-white flex items-center justify-center disabled:opacity-50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
