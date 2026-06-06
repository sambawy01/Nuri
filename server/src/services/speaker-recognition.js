'use strict';

/**
 * Speaker Recognition Service
 *
 * Manages voice enrollment and identification via a Python microservice
 * (SpeakerRecognitionGroupProject). Falls back gracefully when the
 * microservice is unavailable.
 *
 * Environment:
 *   SPEAKER_SERVICE_URL — base URL of the Python speaker service
 *                         (default: http://localhost:5001)
 */

const pool = require('../db/connection');

const SPEAKER_SERVICE_URL = process.env.SPEAKER_SERVICE_URL || 'http://localhost:5001';
const SPEAKER_TIMEOUT_MS = 5000;

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Call the Python speaker microservice.
 * Returns parsed JSON or null if the service is unreachable/times out.
 * @param {string} endpoint  e.g. '/enroll' or '/identify'
 * @param {object} body      JSON-serialisable request body
 * @returns {Promise<object|null>}
 */
async function callSpeakerService(endpoint, body) {
  const url = `${SPEAKER_SERVICE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SPEAKER_TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[SpeakerRecognition] ${endpoint} returned status ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[SpeakerRecognition] ${endpoint} timed out after ${SPEAKER_TIMEOUT_MS}ms`);
    } else {
      console.error(`[SpeakerRecognition] ${endpoint} call failed:`, err.message);
    }
    return null;
  }
}

// ─── Cosine similarity for FLOAT[] embeddings ─────────────────────────────────

/**
 * Compute cosine similarity between two FLOAT[] vectors.
 * Returns 0 if either vector is empty or magnitudes are zero.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  // Vectors must be same dimension — padding with zeros is incorrect for cosine
  const len = Math.max(a.length, b.length);
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < len; i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Enrol a voice profile for the given user.
 * Sends audio to the Python microservice, receives embedding, stores in DB.
 *
 * @param {number} profileId     The Nuri profile ID
 * @param {string} audioBase64   Base64-encoded audio data
 * @param {string} contentType   MIME type (default 'audio/webm')
 * @returns {Promise<{success: boolean, samplesCount?: number, error?: string}>}
 */
async function enrollVoice(profileId, audioBase64, contentType = 'audio/webm') {
  console.log(`[SpeakerRecognition] enrollVoice called for profile ${profileId}`);

  // 1. Create enrollment session
  let sessionId;
  try {
    const sessionRes = await pool.query(
      `INSERT INTO voice_enrollment_sessions (profile_id, status, content_type)
       VALUES ($1, 'processing', $2)
       RETURNING id`,
      [profileId, contentType]
    );
    sessionId = sessionRes.rows[0].id;
  } catch (err) {
    if (err.code === '42P01') {
      console.error('[SpeakerRecognition] voice_enrollment_sessions table missing — run v15 migration');
      return { success: false, error: 'Voice tables not available. Run migration v15.' };
    }
    throw err;
  }

  // 2. Call Python microservice
  const result = await callSpeakerService('/enroll', {
    profile_id: profileId,
    audio: audioBase64,
    content_type: contentType,
  });

  if (!result || !result.embedding) {
    // Mark session as failed
    await pool.query(
      `UPDATE voice_enrollment_sessions SET status = 'failed', error_message = $1, completed_at = NOW() WHERE id = $2`,
      ['No embedding returned from speaker service', sessionId]
    );
    console.error('[SpeakerRecognition] enrollVoice failed: no embedding returned');
    return { success: false, error: 'Speaker service unavailable or returned no embedding' };
  }

  // 3. Upsert voice_profiles
  const embedding = result.embedding;  // array of floats
  const samplesCount = result.samples_count || 1;

  try {
    const upsertRes = await pool.query(
      `INSERT INTO voice_profiles (profile_id, embedding, samples_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id)
       DO UPDATE SET embedding = $2, samples_count = voice_profiles.samples_count + 1, updated_at = NOW()
       RETURNING id, samples_count`,
      [profileId, JSON.stringify(embedding), samplesCount]
    );

    // Mark session as completed
    await pool.query(
      `UPDATE voice_enrollment_sessions SET status = 'completed', samples_collected = $1, completed_at = NOW() WHERE id = $2`,
      [upsertRes.rows[0].samples_count, sessionId]
    );

    console.log(`[SpeakerRecognition] enrollVoice succeeded for profile ${profileId}, samples: ${upsertRes.rows[0].samples_count}`);
    return { success: true, samplesCount: upsertRes.rows[0].samples_count };
  } catch (err) {
    if (err.code === '42P01') {
      console.error('[SpeakerRecognition] voice_profiles table missing — run v15 migration');
      return { success: false, error: 'Voice tables not available. Run migration v15.' };
    }
    throw err;
  }
}

/**
 * Identify a speaker from an audio sample.
 * Queries the Python microservice and compares stored embeddings.
 * Returns null if no confident match or service is unavailable.
 *
 * @param {string} audioBase64   Base64-encoded audio data
 * @param {string} contentType   MIME type (default 'audio/webm')
 * @returns {Promise<{profileId: number, confidence: number}|null>}
 */
async function identifySpeaker(audioBase64, contentType = 'audio/webm') {
  console.log('[SpeakerRecognition] identifySpeaker called');

  // 1. Ask Python service for embedding
  const result = await callSpeakerService('/identify', {
    audio: audioBase64,
    content_type: contentType,
  });

  // 2. If the Python service returns a direct match, use it
  if (result && result.profile_id != null && result.confidence != null) {
    const confidence = result.confidence;
    console.log(`[SpeakerRecognition] Python service identified profile ${result.profile_id} with confidence ${confidence}`);

    // Log the identification attempt
    try {
      await pool.query(
        `INSERT INTO voice_identification_logs (identified_profile_id, confidence)
         VALUES ($1, $2)`,
        [result.profile_id, confidence]
      );
    } catch (err) {
      if (err.code !== '42P01') throw err;
      console.error('[SpeakerRecognition] voice_identification_logs table missing — skipping log');
    }

    if (confidence >= 0.7) {
      return { profileId: result.profile_id, confidence };
    }
    return null;
  }

  // 3. Fallback: if Python returns an embedding, compare locally against DB
  if (result && result.embedding) {
    const inputEmbedding = result.embedding;

    let profiles;
    try {
      profiles = await pool.query(`SELECT profile_id, embedding, samples_count FROM voice_profiles`);
    } catch (err) {
      if (err.code === '42P01') {
        console.error('[SpeakerRecognition] voice_profiles table missing — run v15 migration');
        return null;
      }
      throw err;
    }

    let bestMatch = null;
    let bestScore = -1;

    for (const row of profiles.rows) {
      // Parse stored embedding — might be JSON string or already an array
      let storedEmbedding = row.embedding;
      if (typeof storedEmbedding === 'string') {
        try { storedEmbedding = JSON.parse(storedEmbedding); } catch (_) { continue; }
      }
      if (!Array.isArray(storedEmbedding) || storedEmbedding.length === 0) continue;

      const score = cosineSimilarity(inputEmbedding, storedEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = row.profile_id;
      }
    }

    console.log(`[SpeakerRecognition] Local comparison best score: ${bestScore} for profile ${bestMatch}`);

    // Log identification attempt (only if we had profiles to compare against)
    if (bestMatch !== null) {
      try {
        await pool.query(
          `INSERT INTO voice_identification_logs (identified_profile_id, confidence)
           VALUES ($1, $2)`,
          [bestMatch, bestScore]
        );
      } catch (err) {
        if (err.code !== '42P01') throw err;
        console.error('[SpeakerRecognition] voice_identification_logs table missing — skipping log');
      }
    }

    if (bestScore >= 0.7 && bestMatch !== null) {
      return { profileId: bestMatch, confidence: bestScore };
    }
    return null;
  }

  // 4. Service completely unavailable
  console.log('[SpeakerRecognition] No result from speaker service — returning null');
  return null;
}

/**
 * Get the voice profile status for a given Nuri profile.
 *
 * @param {number} profileId
 * @returns {Promise<{id: number, samplesCount: number, createdAt: string}|null>}
 */
async function getVoiceProfile(profileId) {
  try {
    const result = await pool.query(
      `SELECT id, samples_count, created_at FROM voice_profiles WHERE profile_id = $1`,
      [profileId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      samplesCount: row.samples_count,
      createdAt: row.created_at,
    };
  } catch (err) {
    if (err.code === '42P01') {
      console.error('[SpeakerRecognition] voice_profiles table missing — run v15 migration');
      return null;
    }
    throw err;
  }
}

/**
 * Delete a voice profile for the given Nuri profile.
 *
 * @param {number} profileId
 * @returns {Promise<{success: boolean}>}
 */
async function deleteVoiceProfile(profileId) {
  console.log(`[SpeakerRecognition] deleteVoiceProfile called for profile ${profileId}`);
  try {
    await pool.query(`DELETE FROM voice_profiles WHERE profile_id = $1`, [profileId]);
    return { success: true };
  } catch (err) {
    if (err.code === '42P01') {
      console.error('[SpeakerRecognition] voice_profiles table missing — run v15 migration');
      return { success: false, error: 'Voice tables not available. Run migration v15.' };
    }
    throw err;
  }
}

module.exports = {
  enrollVoice,
  identifySpeaker,
  getVoiceProfile,
  deleteVoiceProfile,
};