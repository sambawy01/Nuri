import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Lightbulb, Puzzle, Volume2, VolumeX } from 'lucide-react';
import { api } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { subjects } from '../lib/subjects';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import NuriOwl from '../components/NuriOwl';
import { useVoice } from '../hooks/useVoice';
import MicButton from '../components/MicButton';
import SpeakerButton from '../components/SpeakerButton';
import PresenceIndicator from '../components/PresenceIndicator';
import PresencePausedModal from '../components/PresencePausedModal';
import { usePresence } from '../hooks/usePresence';
import { usePresenceConfig } from '../context/PresenceContext';

export default function LearnPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProfile } = useProfile();
  const meta = subjects[subject];
  const selectedTopic = location.state?.topic;

  // Restore learn session if navigated back — only if same topic
  const topicKey = selectedTopic ? selectedTopic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) : 'auto';
  const learnSessionKey = `nuri_learn_${subject}_${topicKey}`;
  const savedLearn = useRef(null);
  if (!savedLearn.current) {
    try {
      const raw = sessionStorage.getItem(learnSessionKey);
      if (raw) savedLearn.current = JSON.parse(raw);
    } catch { savedLearn.current = null; }
    // Clear any other learn sessions for this subject (old topic sessions)
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(`nuri_learn_${subject}_`) && key !== learnSessionKey) {
        sessionStorage.removeItem(key);
      }
    }
  }
  const restoredLearn = savedLearn.current;

  const [messages, setMessages] = useState(restoredLearn?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [owlState, setOwlState] = useState('idle');
  const [audioMuted, setAudioMuted] = useState(() => {
    return localStorage.getItem('nuri_audio_muted') === 'true';
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(restoredLearn?.sessionId || null);
  const autoSpokeRef = useRef(!!restoredLearn);
  const lastExplainTypeRef = useRef(null);

  const { tier: presenceTier, updateTier: updatePresenceTier } = usePresenceConfig();
  const profileId = currentProfile?._id || currentProfile?.id;
  const presence = usePresence({
    enabled: !!profileId && presenceTier && presenceTier !== 'off',
    tier: presenceTier,
    profileId,
    context: 'learn',
    contextRef: subject,
  });

  const EXPLAIN_TYPE_MAP = {
    'Explain Simpler ✨': 'visual',
    'Give Example 💡': 'example_first',
    'Quiz Me 🧪': 'try_first',
  };
  const { speak } = useVoice();

  function toggleAudio() {
    setAudioMuted(prev => {
      const newVal = !prev;
      localStorage.setItem('nuri_audio_muted', String(newVal));
      if (newVal) {
        window.speechSynthesis?.cancel();
      }
      return newVal;
    });
  }

  // Persist learn session for back-button recovery
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(learnSessionKey, JSON.stringify({
        messages, sessionId: sessionIdRef.current,
      }));
    }
  }, [messages, learnSessionKey]);

  useEffect(() => {
    if (!currentProfile) {
      navigate('/');
      return;
    }
    // Skip greeting if restoring a session
    if (!restoredLearn) {
      sendInitialGreeting();
    }
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
        // Speak the full response
        if (text && !audioMuted) speak(text, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US' });
        return;
      }

      // SSE streaming
      setIsLoading(false); // hide typing indicator, show live text

      if (isInitial) {
        setMessages([{ text: '', isNuri: true }]);
      } else {
        setMessages(prev => [...prev, { text: '', isNuri: true }]);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let spokenUpTo = 0;

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
              fullText += event.content;
              setMessages(prev => {
                const updated = [...prev];
                const lastNuri = updated.length - 1;
                updated[lastNuri] = { ...updated[lastNuri], text: fullText };
                return updated;
              });

              // Speak complete sentences as they stream in
              const unspoken = fullText.substring(spokenUpTo);
              const match = unspoken.match(/^(.*?[.!?،؟])\s/);
              if (match) {
                const sentence = match[1].trim();
                if (sentence.length > 2 && !audioMuted) {
                  speak(sentence, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
                }
                spokenUpTo += match[0].length;
              }
            }
          } catch {}
        }
      }

      // Speak any remaining text after stream ends
      const remaining = fullText.substring(spokenUpTo).trim();
      if (remaining.length > 2 && !audioMuted) {
        speak(remaining, { lang: subject === 'arabic' ? 'ar-SA' : 'en-US', interrupt: false });
      }
      return;
    } catch (err) {
      throw err;
    }
  }

  async function sendInitialGreeting() {
    setIsLoading(true);
    setOwlState('talking');
    try {
      let topic = selectedTopic;
      let objectiveHint = '';

      // Fetch curriculum topics with mastery data to find what to teach next
      const pid = currentProfile._id || currentProfile.id;
      try {
        const topics = await api(`/curriculum/${subject}/${currentProfile.year_group}?profileId=${pid}`);
        if (topics && topics.length > 0) {
          if (!topic) {
            // Find the first topic that isn't fully mastered (stars < 5)
            const nextTopic = topics.find(t => t.stars < 5) || topics[0];
            topic = nextTopic.name;
          }

          // Find the current topic's objectives to guide what to teach
          const currentTopic = topics.find(t => t.name === topic);
          if (currentTopic?.objectives?.length > 0) {
            objectiveHint = `\n\nThis topic has these objectives: ${currentTopic.objectives.join('; ')}. Teach the NEXT one the child hasn't mastered yet — don't restart from the beginning.`;
          }
        }
      } catch {}

      const message = topic
        ? `Teach me about "${topic}" in ${meta?.name || subject}. Start teaching right away with a fun hook question — do NOT ask me what I want to learn.${objectiveHint}`
        : `Start teaching me ${meta?.name || subject}. Pick a topic I haven't mastered yet and begin teaching right away with a fun hook question — do NOT ask me what I want to learn.`;

      await streamChat(message, true);
    } catch (err) {
      const fallback = `Hi ${currentProfile.name}! I'm Nuri, your study buddy! Let's learn ${meta?.name || subject} together! What topic would you like to start with?`;
      setMessages([{ text: fallback, isNuri: true }]);
    } finally {
      setIsLoading(false);
      setOwlState('idle');
    }
  }

  // For non-streaming responses (fallback), speak when message appears
  const lastSpokenNonStream = useRef(-1);
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    // Only speak non-streaming responses (streaming is handled inline in streamChat)
    if (lastMsg.isNuri && lastMsg.text && lastIdx > lastSpokenNonStream.current && !isLoading) {
      lastSpokenNonStream.current = lastIdx;
    }
  }, [messages, isLoading]);

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    presence.signalLiveness();
    setMessages(prev => [...prev, { text: text.trim(), isNuri: false }]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setOwlState('talking');

    try {
      await streamChat(text.trim());
      setOwlState('idle');
      if (lastExplainTypeRef.current) {
        api('/learning-style/track', {
          method: 'POST',
          body: {
            profileId: currentProfile._id || currentProfile.id,
            explanationType: lastExplainTypeRef.current,
            wasCorrect: true,
          },
        }).catch(() => {});
        lastExplainTypeRef.current = null;
      }
    } catch (err) {
      setError('Oops! Nuri got a bit confused. Try again?');
      setOwlState('idle');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleQuickButton(text) {
    if (text === 'I Can Teach This! 🎓') {
      const topic = selectedTopic || meta?.name;
      navigate(`/explain/${subject}`, { state: { topic } });
      return;
    }
    lastExplainTypeRef.current = EXPLAIN_TYPE_MAP[text] || null;
    sendMessage(text);
  }

  if (!meta) {
    navigate('/home');
    return null;
  }

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto">
      <PresenceIndicator
        status={presence.status}
        tier={presence.tier}
        onTurnOff={() => updatePresenceTier('off')}
      />
      <PresencePausedModal
        open={presence.status === 'paused'}
        onResume={presence.resume}
        onExit={() => navigate(`/subject/${subject}`)}
      />
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
        <button
          onClick={toggleAudio}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={audioMuted ? 'Turn audio on' : 'Turn audio off'}
        >
          {audioMuted ? (
            <VolumeX size={20} className="text-gray-500" />
          ) : (
            <Volume2 size={20} className="text-gray-500" />
          )}
        </button>
        <NuriOwl size="sm" state={owlState} level={currentProfile?.level || 1} />
        <div>
          <p className={`font-bold text-gray-800 text-sm ${subject === 'arabic' ? 'font-arabic' : ''}`}>
            Learn {meta.name}
          </p>
          <p className="text-xs text-gray-500 font-semibold">with Nuri</p>
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
            owlState={msg.isNuri ? owlState : undefined}
            owlLevel={currentProfile?.level || 1}
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
          { label: 'Explain Simpler ✨' },
          { label: 'Give Example 💡' },
          { label: 'Quiz Me 🧪' },
          { label: 'I Can Teach This! 🎓' },
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
