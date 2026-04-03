import { useState, useCallback, useRef, useEffect } from 'react';

function isArabicText(text) {
  // Check if MAJORITY of the text is Arabic (not just a few Arabic words mixed in English)
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  // Only use Arabic voice if Arabic characters are the majority
  return arabicChars > latinChars;
}

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Ensure voices are loaded (Chrome loads them async)
  const voicesReady = useRef(false);
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => { voicesReady.current = window.speechSynthesis.getVoices().length > 0; };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return;

    // Only cancel if explicitly requested (not for queued sentences)
    if (options.interrupt !== false) {
      window.speechSynthesis.cancel();
    }

    // Clean text for natural speech
    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/_{2,}/g, ' blank ')           // Fill-in-the-blank gaps → "blank"
      .replace(/\.{3,}/g, ' blank ')           // ... gaps → "blank"
      .replace(/—/g, ', ')                     // Em dash → pause
      .replace(/\s+/g, ' ')                    // Collapse whitespace
      .substring(0, 1000);

    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isArabic = options.lang === 'ar-SA' || isArabicText(cleanText);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = options.rate || (isArabic ? 0.75 : 0.82);
    utterance.pitch = options.pitch || 1.15;

    // Try to pick a good voice
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

    // Chrome workaround: resume if paused
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    isSupported,
  };
}
