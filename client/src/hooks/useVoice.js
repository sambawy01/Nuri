import { useState, useCallback, useRef, useEffect } from 'react';

function isArabicText(text) {
  return /[\u0600-\u06FF]/.test(text);
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

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const isArabic = options.lang === 'ar-SA' || isArabicText(text);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = options.rate || (isArabic ? 0.85 : 0.95);
    utterance.pitch = options.pitch || 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      options.onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
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
