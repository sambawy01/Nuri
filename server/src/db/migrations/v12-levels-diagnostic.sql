-- v12: Per-subject working levels + adaptive diagnostic placement
--
-- Edge educational group ask: decouple curriculum progression from school year.
-- A student is enrolled in a year_group (drives age-appropriate tone), but works
-- through each subject at its own level (drives which curriculum content they get).
--
-- Backward compatible: if a profile has no subject_levels row for a subject,
-- all code falls back to profiles.year_group — existing behaviour is unchanged.

CREATE TABLE IF NOT EXISTS subject_levels (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 6),
  placed_via VARCHAR(20) NOT NULL DEFAULT 'default'
    CHECK (placed_via IN ('default', 'diagnostic', 'manual', 'advanced')),
  placed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, subject)
);
CREATE INDEX IF NOT EXISTS idx_subject_levels_profile ON subject_levels(profile_id);

-- Adaptive diagnostic runs are stateful across requests (one question at a time),
-- so we persist the staircase state here between /start and each /answer.
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'complete', 'abandoned')),
  current_level INT NOT NULL,           -- level of the question currently posed
  current_question JSONB,               -- the posed question incl. correct answer (server-only)
  questions_asked INT DEFAULT 0,
  highest_passed INT,                   -- highest level answered correctly so far
  lowest_failed INT,                    -- lowest level answered wrong so far
  history JSONB DEFAULT '[]',           -- [{ level, correct }]
  final_level INT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_profile
  ON diagnostic_sessions(profile_id, subject, started_at DESC);
