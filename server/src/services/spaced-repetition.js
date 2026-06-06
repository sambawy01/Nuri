/**
 * Spaced Repetition Service — FSRS v6 Wrapper
 *
 * Uses ts-fsrs when installed, falls back to a simple SM-2 scheduler.
 * Run `npm install ts-fsrs` for production-grade memory decay curves.
 *
 * npm: ts-fsrs (MIT, 682 stars, 87 releases)
 */
'use strict';

// ─── TRY TO LOAD FSRS ────────────────────────────────────────────────────────

let fsrs = null, createEmptyCard = null, Rating = null, State = null;
let fsrsAvailable = false;
try {
  ({ fsrs, createEmptyCard, Rating, State } = require('ts-fsrs'));
  fsrsAvailable = true;
} catch (err) {
  // ts-fsrs not installed — use SM-2 fallback
  if (err.code !== 'MODULE_NOT_FOUND') {
    console.warn('[SR] ts-fsrs load failed:', err.message);
  }
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const RATING_VALUES = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

const RATING_NAMES = { 1: 'again', 2: 'hard', 3: 'good', 4: 'easy' };

// SM-2 fallback constants
const SM2_INTERVALS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
const SM2_NEW_INTERVAL = 1; // days before first review

// ─── FSRS SCHEDULER (when ts-fsrs installed) ─────────────────────────────────

function fsrsCreateCard({ profileId, subject, topic }) {
  const card = createEmptyCard();
  return {
    profileId, subject, topic,
    state: State.New,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.last_review ? card.last_review.toISOString() : null,
    due: card.due.toISOString(),
    firstLearnDate: new Date().toISOString(),
    lastScore: null,
  };
}

function fsrsSchedule(card, rawRating) {
  const ratingEnum = rawRating in Rating
    ? Rating[rawRating]
    : Object.values(Rating).find(r => r === rawRating) || Rating.Good;

  const now = new Date();
  const scheduler = fsrs();

  const fsrsCard = {
    state: card.state,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays || 0,
    scheduled_days: card.scheduledDays || 0,
    reps: card.reps || 0,
    lapses: card.lapses || 0,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
    due: card.due ? new Date(card.due) : now,
  };

  const preview = scheduler.repeat(fsrsCard, now);
  const result = preview[ratingEnum];
  const nextCard = result.card;

  return {
    ...card,
    state: nextCard.state,
    stability: nextCard.stability,
    difficulty: nextCard.difficulty,
    elapsedDays: nextCard.elapsed_days,
    scheduledDays: nextCard.scheduled_days,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    lastReview: now.toISOString(),
    due: nextCard.due.toISOString(),
    lastScore: RATING_NAMES[rawRating] || rawRating || 'good',
  };
}

function fsrsGetDueCards(cards, before) {
  const now = before || new Date();
  const due = cards.filter(c => new Date(c.due) <= now);
  due.sort((a, b) => {
    const ra = fsrsGetRetrievability(a);
    const rb = fsrsGetRetrievability(b);
    return ra - rb;
  });
  return due;
}

function fsrsGetRetrievability(card) {
  if (!card.due || !card.stability || card.stability <= 0) return 0;
  const now = new Date();
  const dueDate = new Date(card.due);
  const elapsedDays = (now - dueDate) / (1000 * 60 * 60 * 24);
  return Math.min(1, Math.pow(2, -elapsedDays / card.stability));
}

function fsrsGetReviewStats(cards) {
  const due = cards.filter(c => new Date(c.due) <= new Date());
  const young = cards.filter(c => c.state === State.New || c.state === State.Learning);
  const mature = cards.filter(c => c.reps >= 3 && (c.state === State.Review || c.state === State.Relearning));
  return {
    total: cards.length,
    due: due.length,
    young: young.length,
    mature: mature.length,
    averageStability: cards.length > 0
      ? cards.reduce((sum, c) => sum + (c.stability || 0), 0) / cards.length
      : 0,
    engine: 'fsrs-v6',
  };
}

// ─── SM-2 FALLBACK SCHEDULER ─────────────────────────────────────────────────
// Cards output FSRS-compatible shape so the same DB schema works.

function sm2CreateCard({ profileId, subject, topic }) {
  return {
    profileId, subject, topic,
    state: 0,            // New
    stability: 1,        // SM-2 initial interval
    difficulty: 2.5,     // SM-2 ease factor stored as difficulty
    elapsedDays: 0,
    scheduledDays: SM2_NEW_INTERVAL,
    reps: 0,
    lapses: 0,
    lastReview: null,
    due: new Date(Date.now() + SM2_NEW_INTERVAL * 24 * 3600 * 1000).toISOString(),
    firstLearnDate: new Date().toISOString(),
    lastScore: null,
  };
}

function sm2Schedule(card, rawRating) {
  const rating = RATING_VALUES[rawRating] || 3;
  const now = new Date();
  let interval = card.stability || card.scheduledDays || 0;
  let easeFactor = card.difficulty || 2.5;  // SM-2 EF stored in difficulty slot
  let reps = card.reps || 0;
  let lapses = card.lapses || 0;

  if (rating < 3) {
    // Forgot — reset
    lapses += 1;
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
      interval = Math.max(interval, SM2_INTERVALS[Math.min(reps - 1, SM2_INTERVALS.length - 1)]);
    }
  }

  // Update ease factor (SM-2 formula)
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02)));

  const dueDate = new Date(now.getTime() + interval * 24 * 3600 * 1000);

  return {
    ...card,
    state: rating < 3 ? 0 : (reps >= 3 ? 2 : 1),  // 0=New, 1=Learning, 2=Review
    stability: interval,
    difficulty: easeFactor,
    elapsedDays: 0,
    scheduledDays: interval,
    reps,
    lapses,
    lastReview: now.toISOString(),
    due: dueDate.toISOString(),
    lastScore: RATING_NAMES[rating] || rawRating || 'good',
  };
}

function sm2GetDueCards(cards, before) {
  const now = before || new Date();
  const due = cards.filter(c => new Date(c.due) <= now);
  // Sort by lowest score (hardest cards first)
  due.sort((a, b) => {
    const sa = typeof a.lastScore === 'string' ? (RATING_VALUES[a.lastScore] || 3) : (a.lastScore || 3);
    const sb = typeof b.lastScore === 'string' ? (RATING_VALUES[b.lastScore] || 3) : (b.lastScore || 3);
    return sa - sb;
  });
  return due;
}

function sm2GetRetrievability(card) {
  const interval = card.stability || card.scheduledDays || 0;
  if (interval <= 0) return 0;
  if (!card.due) return 0;
  const now = new Date();
  const dueDate = new Date(card.due);
  const elapsed = (now - dueDate) / (1000 * 60 * 60 * 24);
  return Math.min(1, Math.max(0, 1 - elapsed / interval));
}

function sm2GetReviewStats(cards) {
  const due = cards.filter(c => new Date(c.due) <= new Date());
  return {
    total: cards.length,
    due: due.length,
    mature: cards.filter(c => c.reps >= 3).length,
    averageStability: cards.length > 0
      ? cards.reduce((sum, c) => sum + ((c.stability || c.scheduledDays || 0)), 0) / cards.length
      : 0,
    engine: 'sm2-fallback',
  };
}

// ─── UNIFIED API ─────────────────────────────────────────────────────────────

const createCard = fsrsAvailable ? fsrsCreateCard : sm2CreateCard;
const scheduleReview = fsrsAvailable ? fsrsSchedule : sm2Schedule;
const getDueCards = fsrsAvailable ? fsrsGetDueCards : sm2GetDueCards;
const getRetrievability = fsrsAvailable ? fsrsGetRetrievability : sm2GetRetrievability;
const getReviewStats = fsrsAvailable ? fsrsGetReviewStats : sm2GetReviewStats;

function answerToRating(correct, confidence) {
  if (!correct) return 'again';
  if (confidence === 'low') return 'hard';
  if (confidence === 'high') return 'easy';
  return 'good';
}

// ─── DB MAPPER (camelCase JS ↔ snake_case SQL) ─────────────────────────────

/**
 * Map a JS card object (camelCase) to DB row shape (snake_case).
 * Use when writing to review_cards table.
 */
function cardToRow(card) {
  return {
    profile_id: card.profileId,
    subject: card.subject,
    topic: card.topic,
    state: card.state,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays || 0,
    scheduled_days: card.scheduledDays || 0,
    reps: card.reps,
    lapses: card.lapses,
    last_review: card.lastReview || null,
    due: card.due,
    last_score: card.lastScore || null,
    first_learn_date: card.firstLearnDate || new Date().toISOString(),
  };
}

/**
 * Map a DB row (snake_case) to a JS card object (camelCase).
 * Use when reading from review_cards table.
 */
function rowToCard(row) {
  return {
    profileId: row.profile_id,
    subject: row.subject,
    topic: row.topic,
    state: row.state,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsedDays: row.elapsed_days || 0,
    scheduledDays: row.scheduled_days || 0,
    reps: row.reps,
    lapses: row.lapses,
    lastReview: row.last_review || null,
    due: row.due,
    lastScore: row.last_score || null,
    firstLearnDate: row.first_learn_date || row.firstLearnDate || null,
  };
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

module.exports = {
  RATING_VALUES,
  createCard,
  answerToRating,
  scheduleReview,
  getDueCards,
  getRetrievability,
  getReviewStats,
  cardToRow,
  rowToCard,
};
