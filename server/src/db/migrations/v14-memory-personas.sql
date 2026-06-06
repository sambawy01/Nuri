-- v14: DeepTutor memory layers + persona caching
-- Adds working_memory (L2), cross_subject_insights (L3), and persona_cache tables.

-- ============================================================
-- L2: Curated facts per child per subject
-- ============================================================
CREATE TABLE IF NOT EXISTS working_memory (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  fact_type TEXT NOT NULL CHECK (fact_type IN ('struggle', 'strength', 'misconception', 'preference', 'milestone')),
  fact_text TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,
  source TEXT CHECK (source IN ('quiz', 'learn', 'homework', 'explain', 'review', 'synthesis')),
  n_observations INTEGER DEFAULT 1,
  last_observed TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_working_memory_profile
  ON working_memory (profile_id);
CREATE INDEX IF NOT EXISTS idx_working_memory_subject
  ON working_memory (profile_id, subject);
CREATE INDEX IF NOT EXISTS idx_working_memory_type
  ON working_memory (profile_id, subject, fact_type);

-- Unique on (profile_id, subject, fact_type, fact_text) — use md5 hash for long text
CREATE UNIQUE INDEX IF NOT EXISTS idx_working_memory_unique
  ON working_memory (profile_id, subject, fact_type, md5(fact_text));

-- ============================================================
-- L3: Cross-subject synthesis insights
-- ============================================================
CREATE TABLE IF NOT EXISTS cross_subject_insights (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('struggle_pattern', 'strength_transfer', 'learning_style', 'attention_pattern')),
  subjects TEXT[] NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  confidence REAL DEFAULT 0.5,
  n_supporting INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cross_insights_profile
  ON cross_subject_insights (profile_id);
CREATE INDEX IF NOT EXISTS idx_cross_insights_type
  ON cross_subject_insights (profile_id, insight_type);

-- Unique on (profile_id, insight_type, description) — use md5 hash for long descriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_insights_unique
  ON cross_subject_insights (profile_id, insight_type, md5(description));

-- ============================================================
-- Persona cache: compiled persona prompts per subject/year
-- ============================================================
CREATE TABLE IF NOT EXISTS persona_cache (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  year_group INTEGER,
  persona_text TEXT NOT NULL,
  persona_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_cache_unique
  ON persona_cache (subject, year_group, persona_version);