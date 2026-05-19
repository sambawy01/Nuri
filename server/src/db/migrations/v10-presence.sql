-- v10: AI Presence Layer
--
-- Privacy posture:
--   - No frames are ever stored. Only derived booleans + timestamps.
--   - presence_tier values:
--       'off'      — feature disabled (default)
--       't1'       — touch/voice liveness only, NO camera
--       't2'       — periodic face-present pings (~60s) on lesson pages
--       't3'       — continuous low-FPS face-present (schools only)
--   - presence_samples stores aggregate counts only. No moment-level "absent" timestamps.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS presence_tier VARCHAR(10) NOT NULL DEFAULT 'off'
    CHECK (presence_tier IN ('off', 't1', 't2', 't3')),
  ADD COLUMN IF NOT EXISTS presence_consent_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS presence_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  context VARCHAR(30) NOT NULL,            -- 'quiz', 'learn', 'homework', 'duel'
  context_ref VARCHAR(100),                -- subject / topic / session_id
  tier VARCHAR(10) NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INT,
  -- Aggregates (zero frames stored)
  samples_total INT DEFAULT 0,
  samples_present INT DEFAULT 0,
  presence_score NUMERIC(4,3),             -- samples_present / samples_total
  liveness_events INT DEFAULT 0,           -- touch/voice signals received
  paused_count INT DEFAULT 0,              -- "I'll wait for you" triggers
  auto_ended BOOLEAN DEFAULT FALSE,        -- TRUE if killed for 4+ misses
  -- Streak integrity outcome
  counted_toward_streak BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_presence_sessions_profile
  ON presence_sessions(profile_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_presence_sessions_context
  ON presence_sessions(profile_id, context);
