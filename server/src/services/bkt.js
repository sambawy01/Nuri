/**
 * Bayesian Knowledge Tracing (BKT) — Mastery Modeling
 *
 * Replaces the simple star-counting heuristic in objective-mastery.js with
 * principled probabilistic skill mastery estimation.
 *
 * Based on OATutor's BKT implementation (MIT License).
 * Reference: Corbett & Anderson, 1995 — "Knowledge Tracing"
 *
 * Parameters:
 *   p_mastered (L0) — prior probability the skill is already mastered
 *   p_guess    (G)  — probability of correct answer when NOT mastered
 *   p_slip     (S)  — probability of wrong answer when mastered
 *   p_learn    (T)  — probability of transitioning to mastered after an attempt
 *
 * Invariant: P(L) is clamped to [0.01, 0.99] to prevent absorbing states.
 */
'use strict';

// ─── DEFAULT PARAMETERS ─────────────────────────────────────────────────────

const DEFAULTS = {
  p_mastered: 0.50,  // L0: 50% chance skill is already known
  p_guess: 0.25,     // G:  25% chance of lucky guess (4-option MCQ baseline)
  p_slip: 0.10,      // S:  10% chance of careless error
  p_learn: 0.30,     // T:  30% chance of learning per attempt
};

const CLAMP_MIN = 0.01;
const CLAMP_MAX = 0.99;

// Parameter boundaries for updateParams
const BOUNDS = {
  p_guess: { min: 0.05, max: 0.35 },
  p_slip:  { min: 0.01, max: 0.25 },
  p_learn: { min: 0.05, max: 0.60 },
};

// Damping factor for parameter updates (prevents oscillation)
const DAMPING = 0.5;

function clamp(v, lo = CLAMP_MIN, hi = CLAMP_MAX) {
  return Math.max(lo, Math.min(hi, v));
}

function clampBound(v, param) {
  const b = BOUNDS[param];
  if (!b) return clamp(v);
  return Math.max(b.min, Math.min(b.max, v));
}

// ─── CORE BKT MATH ──────────────────────────────────────────────────────────

/**
 * Update P(mastered) after observing a correct or wrong answer.
 *
 * Standard BKT (Corbett & Anderson 1995):
 *   1. P(L|obs) — Bayesian update given the observation
 *   2. P(L_{n+1}) = P(L|obs) + (1 - P(L|obs)) * P(T) — learning transition
 *
 * Step 2 applies after BOTH correct and wrong answers.
 */
function updateSkill(skill, correct) {
  const pL = typeof skill.p_mastered === 'number' ? skill.p_mastered : DEFAULTS.p_mastered;
  const pG = typeof skill.p_guess    === 'number' ? skill.p_guess    : DEFAULTS.p_guess;
  const pS = typeof skill.p_slip     === 'number' ? skill.p_slip     : DEFAULTS.p_slip;
  const pT = typeof skill.p_learn   === 'number' ? skill.p_learn    : DEFAULTS.p_learn;

  // Step 1: Bayesian update
  let pLGivenObs;
  if (correct) {
    // P(mastered | correct) = P(L) * (1 - P(S)) / [P(L)*(1-P(S)) + (1-P(L))*P(G)]
    const denom = pL * (1 - pS) + (1 - pL) * pG;
    if (denom <= 0) {
      pLGivenObs = pL; // degenerate case — no update
    } else {
      pLGivenObs = (pL * (1 - pS)) / denom;
    }
  } else {
    // P(mastered | wrong) = P(L) * P(S) / [P(L)*P(S) + (1-P(L))*(1-P(G))]
    const denom = pL * pS + (1 - pL) * (1 - pG);
    if (denom <= 0) {
      pLGivenObs = pL; // degenerate case
    } else {
      pLGivenObs = (pL * pS) / denom;
    }
  }

  // Step 2: Learning transition — applies after BOTH correct AND wrong answers
  // P(L_{n+1}) = P(L|obs) + (1 - P(L|obs)) * P(T)
  const pLNew = pLGivenObs + (1 - pLGivenObs) * pT;

  const nAttempts = (skill.n_attempts || 0) + 1;
  const nCorrect = (skill.n_correct || 0) + (correct ? 1 : 0);

  return {
    ...skill,
    p_mastered: clamp(pLNew),
    n_attempts: nAttempts,
    n_correct: nCorrect,
    last_seen: new Date().toISOString(),
  };
}

/**
 * Update BKT parameters based on observed accuracy trends.
 *
 * Uses exponential moving average (EMA) to smoothly track accuracy,
 * then adjusts parameters with damping to prevent oscillation.
 *
 * Now also updates p_learn — the learning rate adapts to how quickly
 * the student picks up the skill.
 */
function updateParams(skill) {
  const nAttempts = skill.n_attempts || 0;
  if (nAttempts < 5) return skill; // Not enough data yet

  const accuracy = (skill.n_correct || 0) / nAttempts;
  const { p_guess, p_slip, p_learn } = skill;

  // EMA of accuracy for smoother parameter estimation
  // Weight recent observations more (alpha = 0.3)
  const alpha = 0.3;
  const prevAccuracy = skill._ema_accuracy || accuracy;
  const emaAccuracy = alpha * accuracy + (1 - alpha) * prevAccuracy;

  let newGuess = p_guess;
  let newSlip = p_slip;
  let newLearn = p_learn || DEFAULTS.p_learn;

  // p_guess: if accuracy is much higher than expected, lower p_guess
  // (student isn't just guessing). If accuracy is near chance, raise it.
  const expectedNoGuess = p_learn + (1 - p_learn) * (1 - p_slip);
  if (emaAccuracy > expectedNoGuess + 0.05) {
    newGuess = p_guess - (0.02 * DAMPING);
  } else if (emaAccuracy < DEFAULTS.p_guess + 0.05) {
    newGuess = p_guess + (0.02 * DAMPING);
  }

  // p_slip: if accuracy is lower than expected for a "mastered" student,
  // they might be slipping more. If accuracy is very high, lower slip.
  if (emaAccuracy < 1 - p_slip - 0.1) {
    newSlip = p_slip + (0.01 * DAMPING);
  } else if (emaAccuracy > 0.95) {
    newSlip = p_slip - (0.01 * DAMPING);
  }

  // p_learn: if mastery jumps quickly (high early accuracy), increase T.
  // If student struggles despite many attempts, decrease T.
  const earlyAccuracy = nAttempts > 10
    ? (skill.n_correct - Math.floor(nAttempts * 0.5)) / Math.ceil(nAttempts * 0.5)
    : accuracy;
  if (earlyAccuracy > 0.7 && p_learn < BOUNDS.p_learn.max) {
    newLearn = p_learn + (0.03 * DAMPING);
  } else if (earlyAccuracy < 0.4 && p_learn > BOUNDS.p_learn.min) {
    newLearn = p_learn - (0.03 * DAMPING);
  }

  return {
    ...skill,
    p_guess: clampBound(newGuess, 'p_guess'),
    p_slip:  clampBound(newSlip, 'p_slip'),
    p_learn: clampBound(newLearn, 'p_learn'),
    _ema_accuracy: emaAccuracy,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function createSkill(opts = {}) {
  return {
    p_mastered: opts.p_mastered ?? DEFAULTS.p_mastered,
    p_guess:    opts.p_guess    ?? DEFAULTS.p_guess,
    p_slip:     opts.p_slip     ?? DEFAULTS.p_slip,
    p_learn:    opts.p_learn    ?? DEFAULTS.p_learn,
    n_attempts: 0,
    n_correct:  0,
    last_seen:  new Date().toISOString(),
    createdAt:  new Date().toISOString(),
  };
}

/**
 * Mastery threshold: P(mastered) >= 0.85 means the skill is learned.
 */
function isMastered(skill) {
  return (skill.p_mastered || 0) >= 0.85;
}

/**
 * Map BKT probability to a 1-5 star display (for parent/kid UI).
 * Stars are one-way: they never decrease (growth-only policy).
 */
function masteryToStars(skill) {
  const p = skill.p_mastered || 0;
  if (p >= 0.95) return 5;
  if (p >= 0.85) return 4;
  if (p >= 0.70) return 3;
  if (p >= 0.50) return 2;
  return 1;
}

/**
 * Human-readable confidence label.
 */
function confidenceLabel(skill) {
  const p = skill.p_mastered || 0;
  if (p >= 0.95) return 'Mastered';
  if (p >= 0.85) return 'Confident';
  if (p >= 0.70) return 'Getting it';
  if (p >= 0.50) return 'Building';
  return 'Starting';
}

/**
 * Get a summary object for API responses.
 */
function getSummary(skill) {
  return {
    topic: skill.topic,
    subject: skill.subject,
    p_mastered: Math.round((skill.p_mastered || 0) * 100) / 100,
    stars: masteryToStars(skill),
    confidence: confidenceLabel(skill),
    n_attempts: skill.n_attempts || 0,
    n_correct: skill.n_correct || 0,
  };
}

module.exports = {
  DEFAULTS,
  BOUNDS,
  updateSkill,
  updateParams,
  createSkill,
  isMastered,
  masteryToStars,
  confidenceLabel,
  getSummary,
};