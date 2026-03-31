import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Lightbulb, Puzzle } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';

export default function LearnPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile } = useProfile();
  const meta = subjects[subject];
  const selectedTopic = location.state?.topic;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    sendInitialGreeting();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function streamChat(userMessage, isInitial = false) {
    const body = {
      profileId: currentProfile._id || currentProfile.id,
      subject,
      mode: 'learn',
      message: userMessage,
      ...(sessionIdRef.current && { sessionId: sessionIdRef.current }),
    };

    try {
      const res = await fetch(`/api/chat?stream=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Check if server returned SSE stream or regular JSON
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        // Fallback to non-streaming
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        if (data.data.sessionId) sessionIdRef.current = data.data.sessionId;
        const text = data.data.response || data.data.reply || data.data.message;
        if (isInitial) {
          setMessages([{ text, isNuri: true }]);
        } else {
          setMessages(prev => [...prev, { text, isNuri: true }]);
        }
        return;
      }

      // SSE streaming
      setIsLoading(false); // hide typing indicator, show live text
      const nuriMsgIndex = isInitial ? 0 : -1; // track which message to update

      if (isInitial) {
        setMessages([{ text: '', isNuri: true }]);
      } else {
        setMessages(prev => [...prev, { text: '', isNuri: true }]);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'session') {
              sessionIdRef.current = event.sessionId;
            } else if (event.type === 'chunk') {
              setMessages(prev => {
                const updated = [...prev];
                const lastNuri = updated.length - 1;
                updated[lastNuri] = { ...updated[lastNuri], text: updated[lastNuri].text + event.content };
                return updated;
              });
            }
          } catch {}
        }
      }
      return;
    } catch (err) {
      throw err;
    }
  }

  async function sendInitialGreeting() {
    setIsLoading(true);
    try {
      let topic = selectedTopic;
      if (!topic) {
        try {
          const topics = await api(`/curriculum/${subject}/${currentProfile.year_group}`);
          if (topics && topics.length > 0) topic = topics[0].name;
        } catch {}
      }

      const message = topic
        ? `Teach me about "${topic}" in ${meta?.name || subject}. Start teaching right away with a fun hook question — do NOT ask me what I want to learn.`
        : `Start teaching me ${meta?.name || subject}. Pick the first topic and begin teaching right away with a fun hook question — do NOT ask me what I want to learn.`;

      await streamChat(message, true);
    } catch (err) {
      setMessages([{
        text: `Hi ${currentProfile.name}! I'm Nuri, your study buddy! 🦉 Let's learn ${meta?.name || subject} together! What topic would you like to start with?`,
        isNuri: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { text: text.trim(), isNuri: false }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      await streamChat(text.trim());
    } catch (err) {
      setError('Oops! Nuri got a bit confused. Try again?');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleQuickButton(text) {
    sendMessage(text);
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
        <button
          onClick={() => navigate(`/subject/${subject}`)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: meta.color }}
        >
          {meta.emoji}
        </div>
        <div>
          <p className={`font-bold text-gray-800 text-sm ${subject === 'arabic' ? 'font-arabic' : ''}`}>
            Learn {meta.name}
          </p>
          <p className="text-xs text-gray-500 font-semibold">with Nuri 🦉</p>
        </div>
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
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Buttons */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
        {[
          { label: 'Explain Simpler ✨', icon: Sparkles },
          { label: 'Give Example 💡', icon: Lightbulb },
          { label: 'Quiz Me 🧩', icon: Puzzle },
        ].map(({ label }) => (
          <motion.button
            key={label}
            onClick={() => handleQuickButton(label)}
            disabled={isLoading}
            className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask Nuri anything..."
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
    </div>
  );
}
