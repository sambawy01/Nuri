/**
 * Skill Memory Logger — DeepTutor L1 Trace
 *
 * Writes learning events to the skill_memory table.
 * Surfaces (learn, quiz, explain, homework) and events:
 *   question_asked, answer_given, hint_shown, breakthrough, struggle
 *
 * Phase 2 will add L2 (working memory) and L3 (long-term knowledge).
 */
'use strict';

const pool = require('../db/connection');

const VALID_SURFACES = new Set(['learn', 'quiz', 'explain', 'homework']);
const VALID_EVENTS = new Set([
  'question_asked', 'answer_given', 'hint_shown',
  'breakthrough', 'struggle',
]);

/**
 * Log a learning event to skill_memory.
 *
 * @param {Object} opts
 * @param {number} opts.profileId
 * @param {string} opts.surface — 'learn'|'quiz'|'explain'|'homework'
 * @param {string} opts.eventType — 'question_asked'|'answer_given'|'hint_shown'|'breakthrough'|'struggle'
 * @param {string} [opts.subject]
 * @param {string} [opts.topic]
 * @param {Object} [opts.details] — arbitrary JSONB payload
 * @returns {boolean} true if logged, false if table not available
 */
async function logEvent({ profileId, surface, eventType, subject, topic, details }) {
  if (!VALID_SURFACES.has(surface)) {
    console.warn('[Memory] Invalid surface:', surface);
    return false;
  }
  if (!VALID_EVENTS.has(eventType)) {
    console.warn('[Memory] Invalid event type:', eventType);
    return false;
  }

  try {
    await pool.query(
      `INSERT INTO skill_memory (profile_id, surface, subject, topic, event_type, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [profileId, surface, subject || null, topic || null, eventType, details ? JSON.stringify(details) : null]
    );
    return true;
  } catch (err) {
    if (err.code === '42P01') {
      // Table not migrated yet — silent
      return false;
    }
    console.warn('[Memory] Log failed:', err.message);
    return false;
  }
}

/**
 * Get recent events for a profile (optionally filtered by surface/subject).
 */
async function getRecentEvents(profileId, { surface, subject, limit = 50 } = {}) {
  limit = Math.min(Math.max(1, limit || 50), 500);
  try {
    const conditions = ['profile_id = $1'];
    const params = [profileId];
    let idx = 2;

    if (surface) { conditions.push(`surface = $${idx++}`); params.push(surface); }
    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }
    params.push(limit);

    const result = await pool.query(
      `SELECT * FROM skill_memory WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC LIMIT $${idx}`,
      params
    );
    return result.rows;
  } catch (err) {
    if (err.code === '42P01') return [];
    console.warn('[Memory] Query failed:', err.message);
    return [];
  }
}

module.exports = { logEvent, getRecentEvents, VALID_SURFACES, VALID_EVENTS };