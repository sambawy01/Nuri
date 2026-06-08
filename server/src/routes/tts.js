const express = require('express');
const https = require('https');
const router = express.Router();

/**
 * TTS Proxy — Backend-protected ElevenLabs streaming
 *
 * POST /api/tts
 * Body: { text: string, voiceId?: string, model?: string }
 * Response: audio/mpeg stream
 *
 * Falls back to 500 with JSON error if no key or upstream failure.
 */

router.post('/', async (req, res, next) => {
  try {
    const { text, voiceId, model } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'text required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, error: 'TTS not configured — add ELEVENLABS_API_KEY to env' });
    }

    const voice_id = voiceId || process.env.ELEVENLABS_VOICE_ID || 'l4Coq6695JDX9xtLqXDE';
    const model_id = model || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

    const payload = JSON.stringify({
      text,
      model_id,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${encodeURIComponent(voice_id)}/stream`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 15000,
    };

    const upstream = https.request(options, (tRes) => {
      const status = tRes.statusCode;
      if (status >= 200 && status < 300) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(status);
        tRes.pipe(res);
      } else {
        let body = '';
        tRes.on('data', (chunk) => { body += chunk; });
        tRes.on('end', () => {
          console.error('ElevenLabs error:', status, body);
          res.status(502).json({ success: false, error: 'TTS upstream error', upstreamStatus: status });
        });
      }
    });

    upstream.on('error', (err) => {
      console.error('ElevenLabs connection error:', err.message);
      res.status(502).json({ success: false, error: 'TTS upstream unreachable' });
    });

    upstream.on('timeout', () => {
      upstream.destroy();
      res.status(504).json({ success: false, error: 'TTS upstream timeout' });
    });

    upstream.write(payload);
    upstream.end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
