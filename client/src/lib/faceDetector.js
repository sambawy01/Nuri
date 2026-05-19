// Lazy-loaded MediaPipe face detector wrapper.
//
// Privacy contract:
//   - Runs entirely in the browser. Never sends frames anywhere.
//   - Only exposes a boolean { present, confidence } per inference.
//   - Landmarks/identity intentionally NOT exposed to callers.
//
// Call detector.ping(videoElement) to get { present, confidence }.
// Caller is responsible for video capture lifecycle.

const MEDIAPIPE_VERSION = '0.10.21';
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const ESM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/+esm`;
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

let cachedDetector = null;
let loadingPromise = null;

async function loadDetector() {
  if (cachedDetector) return cachedDetector;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Loaded from CDN so the layer works without a local npm install.
    // The @vite-ignore comment prevents Vite from trying to pre-bundle the URL.
    const mp = await import(/* @vite-ignore */ ESM_URL);
    const FilesetResolver = mp.FilesetResolver;
    const FaceDetector = mp.FaceDetector;
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
    const detector = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.4,
    });
    cachedDetector = detector;
    return detector;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw err;
  }
}

export async function createPresenceProbe() {
  const detector = await loadDetector();

  return {
    /**
     * Run a single inference on a video element. Returns a derived boolean
     * + confidence — never landmarks, never identity.
     */
    ping(videoEl) {
      if (!videoEl || videoEl.readyState < 2) return { present: false, confidence: 0 };
      try {
        const result = detector.detect(videoEl);
        const detections = result?.detections ?? [];
        if (detections.length === 0) return { present: false, confidence: 0 };
        const top = detections.reduce(
          (best, d) =>
            (d.categories?.[0]?.score ?? 0) > best ? d.categories[0].score : best,
          0
        );
        return { present: top >= 0.4, confidence: top };
      } catch {
        return { present: false, confidence: 0 };
      }
    },

    close() {
      try { detector.close?.(); } catch { /* noop */ }
      cachedDetector = null;
      loadingPromise = null;
    },
  };
}

export function isPresenceSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}
