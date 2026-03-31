CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  year_group INT NOT NULL CHECK (year_group BETWEEN 1 AND 6),
  avatar_color VARCHAR(7) NOT NULL,
  pin VARCHAR(4),
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_active_date DATE,
  english_level INT,
  arabic_level INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xp_events (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  subject VARCHAR(50),
  topic VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_history (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  child_answer TEXT,
  was_correct BOOLEAN,
  xp_earned INT DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'medium',
  hint_level_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_mastery (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  stars INT DEFAULT 0 CHECK (stars BETWEEN 0 AND 5),
  attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  last_practiced TIMESTAMP,
  UNIQUE(profile_id, subject, topic)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streak_history (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  activity_type VARCHAR(50),
  UNIQUE(profile_id, streak_date)
);

CREATE TABLE IF NOT EXISTS mistakes (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100),
  question_text TEXT NOT NULL,
  child_answer TEXT,
  correct_answer TEXT NOT NULL,
  error_type VARCHAR(30),
  explanation TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_events_profile ON xp_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_profile ON quiz_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_subject ON quiz_history(profile_id, subject);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_profile ON topic_mastery(profile_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_lookup ON topic_mastery(profile_id, subject, topic);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_profile ON chat_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_profile ON streak_history(profile_id, streak_date);
CREATE INDEX IF NOT EXISTS idx_mistakes_profile ON mistakes(profile_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_unresolved ON mistakes(profile_id, resolved) WHERE resolved = FALSE;
