import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { createPresenceProbe, isPresenceSupported } from '../lib/faceDetector';

const SAMPLE_INTERVAL_MS = {
  t1: null,        // touch/voice only, no camera
  t2: 60_000,      // 60s
  t3: 15_000,      // 15s
};

const FLUSH_INTERVAL_MS = 30_000;
const MISS_PAUSE_THRESHOLD = 2;
const MISS_AUTO_END_THRESHOLD = 4;

/**
 * Drives a single presence session. Caller mounts this on lesson pages.
 *
 * Returns:
 *   status            'idle' | 'starting' | 'active' | 'paused' | 'ended' | 'denied' | 'unavailable'
 *   tier              the active tier
 *   sessionId
 *   signalLiveness    () => mark a touch/voice event (used in all tiers)
 *   resume            () => clear paused state, kid is back
 *   end               () => finalize session, returns presence score
 */
export function usePresence({ enabled, tier, profileId, context, contextRef }) {
  const [status, setStatus] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [missCount, setMissCount] = useState(0);

  // Aggregates that haven't been flushed to the server yet
  const pendingRef = useRef({
    samplesTotal: 0,
    samplesPresent: 0,
    livenessEvents: 0,
    pausedCount: 0,
  });

  const probeRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sampleTimerRef = useRef(null);
  const flushTimerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const statusRef = useRef('idle');

  const flush = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    const p = pendingRef.current;
    if (
      p.samplesTotal === 0 &&
      p.samplesPresent === 0 &&
      p.livenessEvents === 0 &&
      p.pausedCount === 0
    ) {
      return;
    }
    const payload = { ...p, sessionId: sid };
    pendingRef.current = { samplesTotal: 0, samplesPresent: 0, livenessEvents: 0, pausedCount: 0 };
    try {
      await api('/presence/sample', { method: 'POST', body: payload });
    } catch {
      // If flush fails, drop the batch — we don't queue retries (presence is best-effort
      // telemetry, not a billing event). Streak gate still applies on session end.
    }
  }, []);

  const signalLiveness = useCallback(() => {
    if (statusRef.current !== 'active' && statusRef.current !== 'paused') return;
    pendingRef.current.livenessEvents += 1;
    // A voice/touch event counts as presence too — gently undo a missed ping
    if (statusRef.current === 'paused') {
      setMissCount(0);
      setStatus('active');
      statusRef.current = 'active';
    }
  }, []);

  const tick = useCallback(() => {
    if (statusRef.current !== 'active' && statusRef.current !== 'paused') return;
    const probe = probeRef.current;
    const video = videoRef.current;
    if (!probe || !video) return;

    const result = probe.ping(video);
    pendingRef.current.samplesTotal += 1;
    if (result.present) {
      pendingRef.current.samplesPresent += 1;
      if (statusRef.current === 'paused') {
        setStatus('active');
        statusRef.current = 'active';
      }
      setMissCount(0);
    } else {
      setMissCount((m) => {
        const next = m + 1;
        if (next >= MISS_AUTO_END_THRESHOLD) {
          // caller decides what auto-ended means in UX
          end({ autoEnded: true });
        } else if (next >= MISS_PAUSE_THRESHOLD && statusRef.current === 'active') {
          pendingRef.current.pausedCount += 1;
          setStatus('paused');
          statusRef.current = 'paused';
        }
        return next;
      });
    }
  }, []);

  const startCamera = useCallback(async (interval) => {
    if (!isPresenceSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      videoRef.current = video;
      await video.play().catch(() => {});

      const probe = await createPresenceProbe();
      probeRef.current = probe;

      sampleTimerRef.current = setInterval(tick, interval);
      return true;
    } catch {
      return false;
    }
  }, [tick]);

  const stopCamera = useCallback(() => {
    if (sampleTimerRef.current) {
      clearInterval(sampleTimerRef.current);
      sampleTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (probeRef.current) {
      probeRef.current.close();
      probeRef.current = null;
    }
    videoRef.current = null;
  }, []);

  const end = useCallback(async ({ autoEnded } = {}) => {
    const sid = sessionIdRef.current;
    if (!sid) {
      stopCamera();
      setStatus('ended');
      statusRef.current = 'ended';
      return null;
    }
    sessionIdRef.current = null;
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    await flush();
    stopCamera();
    setStatus('ended');
    statusRef.current = 'ended';
    try {
      const summary = await api('/presence/end', {
        method: 'POST',
        body: { sessionId: sid, autoEnded: !!autoEnded },
      });
      return summary;
    } catch {
      return null;
    }
  }, [flush, stopCamera]);

  const resume = useCallback(() => {
    if (statusRef.current === 'paused') {
      setMissCount(0);
      setStatus('active');
      statusRef.current = 'active';
    }
  }, []);

  // Start session when enabled + tier resolved
  useEffect(() => {
    if (!enabled || !profileId || !tier || tier === 'off') return;
    let cancelled = false;

    (async () => {
      setStatus('starting');
      statusRef.current = 'starting';

      let started;
      try {
        started = await api('/presence/start', {
          method: 'POST',
          body: { profileId, context, contextRef, tier },
        });
      } catch {
        setStatus('unavailable');
        statusRef.current = 'unavailable';
        return;
      }
      if (cancelled) {
        // Effect was unmounted (e.g. Strict Mode double-fire) while /start was in flight.
        // Reap the orphan server-side so we don't leak open sessions.
        try {
          await api('/presence/end', {
            method: 'POST',
            body: { sessionId: started.sessionId, autoEnded: false },
          });
        } catch { /* best-effort */ }
        return;
      }

      sessionIdRef.current = started.sessionId;
      setSessionId(started.sessionId);

      flushTimerRef.current = setInterval(flush, FLUSH_INTERVAL_MS);

      const interval = SAMPLE_INTERVAL_MS[tier];
      if (interval) {
        const ok = await startCamera(interval);
        if (cancelled) return;
        if (!ok) {
          // Camera denied or unsupported — fall back silently to T1 behavior
          // (touch/voice liveness still gets recorded).
          setStatus('denied');
          statusRef.current = 'denied';
          // Stay in "denied" state but keep flushing liveness events
          statusRef.current = 'active';
          setStatus('active');
          return;
        }
      }
      setStatus('active');
      statusRef.current = 'active';
    })();

    return () => {
      cancelled = true;
      end({ autoEnded: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, profileId, tier, context, contextRef]);

  return {
    status,
    tier,
    sessionId,
    missCount,
    signalLiveness,
    resume,
    end,
  };
}
