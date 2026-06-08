import { useState, useCallback, useRef, useEffect } from 'react';

function isArabicText(text) {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return arabicChars > latinChars;
}

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const abortRef = useRef(null);          // AbortController for in-flight fetch
  const genRef = useRef(0);               // Generation counter to kill stale calls

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const queueRef = useRef([]);            // Audio queue for interrupt: false

  // ── Cleanup helpers ─────────────────────────────────────────────
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load(); // force browser to drop buffer
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const cleanupSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (utteranceRef.current) utteranceRef.current = null;
  }, []);

  // ── Web Speech (fallback) ───────────────────────────────────────
  const speakNative = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return;
    cleanupAudio();

    if (options.interrupt !== false) {
      window.speechSynthesis.cancel();
    }

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isArabic = options.lang === 'ar-SA' || isArabicText(cleanText);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = options.rate || (isArabic ? 0.75 : 0.82);
    utterance.pitch = options.pitch || 1.15;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = isArabic ? 'ar' : 'en';
    const preferredVoice = voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ||
      voices.find(v => v.lang.startsWith(langPrefix));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      options.onEnd?.();
    };
    utterance.onerror = (e) => {
      console.warn('Speech error:', e.error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, [cleanupAudio]);

  // ── Shared text cleaner for TTS ─────────────────────────────────
  function cleanTextForSpeech(text) {
    return text
      .replace(/[#*_~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/\[IMG:\w+\]/gi, '')
      .replace(/_{2,}/g, ' blank ')
      .replace(/\.{3,}/g, ' blank ')
      .replace(/—/g, ', ')
      .replace(/\b([A-Z]{2,4})\b/g, (match) => {
        const keepUppercase = new Set(['USA', 'UK', 'BBC', 'DNA', 'NASA', 'STEM', 'MCQ', 'PDF']);
        return keepUppercase.has(match) ? match : match.toLowerCase();
      })
      .replace(/\s+/g, ' ')
      .substring(0, 1000);
  }

  // ── Audio queue for sequential playback (interrupt: false) ──────
  function playNextInQueue() {
    if (queueRef.current.length === 0) return;
    const next = queueRef.current.shift();
    // If a newer generation has started, skip queue items
    if (genRef.current !== next.gen) return;

    audioRef.current = next.audio;
    audioUrlRef.current = next.url;

    next.audio.onplay = () => {
      if (genRef.current === next.gen) setIsSpeaking(true);
    };
    next.audio.onended = () => {
      if (genRef.current === next.gen) {
        setIsSpeaking(false);
        next.options?.onEnd?.();
        playNextInQueue();
      }
    };
    next.audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      if (genRef.current === next.gen) {
        setIsSpeaking(false);
        speakNative(next.text, next.options);
      }
    };

    next.audio.play().catch(() => {
      // Autoplay blocked or other error — skip and move to next
      playNextInQueue();
    });
  }

  // ── ElevenLabs via backend proxy ────────────────────────────────
  const speak = useCallback(async (text, options = {}) => {
    // Force native Web Speech when explicitly requested
    if (options.forceNative) {
      speakNative(text, options);
      return;
    }

    const myGen = ++genRef.current;          // Claim this generation

    // ── Interrupt mode (default) ────────────────────────────────────
    if (options.interrupt !== false) {
      abortRef.current?.abort();
      cleanupAudio();
      cleanupSpeech();
      queueRef.current = []; // clear any queued items
    }

    // ── If already playing and not interrupting, queue this text ────
    if (options.interrupt === false && (isSpeaking || audioRef.current || queueRef.current.length > 0)) {
      // We need to fetch the audio but not play it yet — store in queue
    }

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const cleanText = cleanTextForSpeech(text);
      if (!cleanText.trim()) return;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceId: options.voiceId,
          model: options.model,
        }),
        signal: controller.signal,
      });

      // If a newer speak() has started, die silently
      if (genRef.current !== myGen) return;

      if (!res.ok) {
        console.warn('TTS proxy failed:', res.status, 'falling back to Web Speech');
        if (options.interrupt !== false) {
          speakNative(text, options);
        } else {
          // Fallback to native but queue it
          // We can't queue native speech easily, so just play it native
          speakNative(text, options);
        }
        return;
      }

      const blob = await res.blob();

      // Generation check again after async gap
      if (genRef.current !== myGen) return;

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      if (options.interrupt !== false) {
        // Immediate playback (overwrite previous)
        audioRef.current = audio;
        audioUrlRef.current = url;

        audio.onplay = () => {
          if (genRef.current === myGen) setIsSpeaking(true);
        };
        audio.onended = () => {
          if (genRef.current === myGen) {
            setIsSpeaking(false);
            options.onEnd?.();
          }
        };
        audio.onerror = (e) => {
          console.warn('Audio playback error:', e);
          if (genRef.current === myGen) {
            setIsSpeaking(false);
            speakNative(text, options);
          }
        };

        await audio.play();
      } else {
        // Queue for sequential playback
        queueRef.current.push({ audio, url, text, options, gen: myGen });
        // If nothing currently playing, start the queue
        if (!isSpeaking && !audioRef.current) {
          playNextInQueue();
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Silently drop cancelled
      console.warn('TTS fetch error:', err.message);
      if (genRef.current === myGen) speakNative(text, options);
    }
  }, [cleanupAudio, cleanupSpeech, speakNative, isSpeaking]);

  const stopSpeaking = useCallback(() => {
    abortRef.current?.abort();
    cleanupAudio();
    cleanupSpeech();
    queueRef.current = [];      // clear queued audio
    ++genRef.current;           // Kill any queued generation
    setIsSpeaking(false);
  }, [cleanupAudio, cleanupSpeech]);

  // ── Speech Recognition ──────────────────────────────────────────
  const startListening = useCallback((options = {}) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      options.onResult?.(text);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      options.onError?.(event.error);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cleanupAudio();
      cleanupSpeech();
      recognitionRef.current?.stop();
    };
  }, [cleanupAudio, cleanupSpeech]);

  return {
    speak,
    speakNative,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    isSupported,
  };
}
