-- v13: Spaced Repetition (FSRS) + Bayesian Knowledge Tracing (BKT)
-- Adds review_cards and bkt_skills tables.

-- Review cards store individual topic-review items with FSRS memory parameters.
CREATE TABLE IF NOT EXISTS review_cards (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  state INTEGER NOT NULL DEFAULT 0,  -- FSRS State: 0=New, 1=Learning, 2=Review, 3=Relearning
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days REAL NOT NULL DEFAULT 0,
  scheduled_days REAL NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_review TIMESTAMPTZ,
  due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_score TEXT,  -- 'again','hard','good','easy'
  first_learn_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_cards_profile_due
  ON review_cards (profile_id, due);

CREATE UNIQUE INDEX IF NOT EXISTS idx_review_cards_unique
  ON review_cards (profile_id, subject, topic);

-- BKT skills store per-topic mastery probabilities.
CREATE TABLE IF NOT EXISTS bkt_skills (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  p_mastered REAL NOT NULL DEFAULT 0.50,  -- P(mastered) — current estimate
  p_guess REAL NOT NULL DEFAULT 0.25,     -- P(correct | not mastered)
  p_slip REAL NOT NULL DEFAULT 0.10,      -- P(wrong | mastered)
  p_learn REAL NOT NULL DEFAULT 0.30,     -- P(learn | wrong attempt)
  n_attempts INTEGER NOT NULL DEFAULT 0,
  n_correct INTEGER NOT NULL DEFAULT 0,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bkt_skills_unique
  ON bkt_skills (profile_id, subject, topic);

-- Add skill_memory table (DeepTutor L1 traces)
CREATE TABLE IF NOT EXISTS skill_memory (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surface TEXT NOT NULL DEFAULT 'learn',  -- 'learn','quiz','explain','homework'
  subject TEXT,
  topic TEXT,
  event_type TEXT NOT NULL,  -- 'question_asked','answer_given','hint_shown','breakthrough','struggle'
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_memory_profile
  ON skill_memory (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_memory_surface
  ON skill_memory (profile_id, surface);
