-- v15: Voice biometrics for speaker recognition login
-- NOTE: Prefer VECTOR(512) type from pgvector extension for efficient similarity search.
-- If pgvector is not available, we fall back to FLOAT[] which stores the same data
-- but cannot use dedicated vector index operators.

-- Attempt to enable pgvector; if the extension is not installed this will fail,
-- and the FLOAT[] columns below will still work (just without vector index support).
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS voice_profiles (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Preferred: VECTOR(512) from pgvector. Falls back to FLOAT[] if pgvector unavailable.
  -- To migrate to VECTOR later: ALTER TABLE voice_profiles ALTER COLUMN embedding TYPE VECTOR(512) USING embedding::vector;
  embedding FLOAT[] DEFAULT '{}',
  samples_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_profile ON voice_profiles(profile_id);

CREATE TABLE IF NOT EXISTS voice_enrollment_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  audio_data BYTEA,
  content_type VARCHAR(50) DEFAULT 'audio/webm',
  samples_collected INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_voice_enrollment_profile ON voice_enrollment_sessions(profile_id, status);

CREATE TABLE IF NOT EXISTS voice_identification_logs (
  id SERIAL PRIMARY KEY,
  identified_profile_id INTEGER REFERENCES profiles(id) ON DELETE SET NULL,
  confidence REAL NOT NULL,
  was_correct BOOLEAN,
  audio_duration_seconds REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voice_id_logs_profile ON voice_identification_logs(identified_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_id_logs_time ON voice_identification_logs(created_at DESC);