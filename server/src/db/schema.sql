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

CREATE TABLE IF NOT EXISTS review_items (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  memory_score INT DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  times_reviewed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_items_profile ON review_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_review_items_due ON review_items(profile_id, next_review_date) WHERE memory_score < 5;

CREATE TABLE IF NOT EXISTS confidence_responses (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_history_id INT REFERENCES quiz_history(id) ON DELETE CASCADE,
  confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('guessed', 'unsure', 'pretty_sure', 'knew_it')),
  was_correct BOOLEAN NOT NULL,
  subject VARCHAR(50),
  topic VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confidence_profile ON confidence_responses(profile_id);
CREATE INDEX IF NOT EXISTS idx_confidence_blindspots ON confidence_responses(profile_id, confidence_level, was_correct);

CREATE TABLE IF NOT EXISTS learning_style_profiles (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  visual FLOAT DEFAULT 0,
  analogy FLOAT DEFAULT 0,
  example_first FLOAT DEFAULT 0,
  auditory FLOAT DEFAULT 0,
  try_first FLOAT DEFAULT 0,
  total_interactions INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_style_profile ON learning_style_profiles(profile_id);

CREATE TABLE IF NOT EXISTS explain_back_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  messages JSONB DEFAULT '[]',
  understanding_score INT CHECK (understanding_score BETWEEN 1 AND 5),
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_explain_back_profile ON explain_back_sessions(profile_id);

CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(30) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  condition_type VARCHAR(50) NOT NULL,
  condition_value INT NOT NULL DEFAULT 1,
  condition_extra VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS earned_badges (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_earned_badges_profile ON earned_badges(profile_id);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id SERIAL PRIMARY KEY,
  challenge_date DATE UNIQUE NOT NULL,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  question_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_challenge_attempts (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  answer TEXT,
  was_correct BOOLEAN,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(profile_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_attempts_profile ON daily_challenge_attempts(profile_id);

CREATE TABLE IF NOT EXISTS question_bank (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  year_group INT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  explanation TEXT,
  times_served INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qbank_lookup ON question_bank(subject, topic, year_group, difficulty);
CREATE INDEX IF NOT EXISTS idx_qbank_served ON question_bank(subject, topic, year_group, difficulty, times_served);

CREATE TABLE IF NOT EXISTS homework_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50),
  topic VARCHAR(100),
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('camera', 'upload_image', 'upload_pdf', 'typed')),
  questions_detected INT DEFAULT 0,
  questions_completed INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  total_xp_earned INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_homework_sessions_profile ON homework_sessions(profile_id);

CREATE TABLE IF NOT EXISTS homework_questions (
  id SERIAL PRIMARY KEY,
  session_id INT REFERENCES homework_sessions(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT,
  child_answer TEXT,
  verification_result VARCHAR(20) CHECK (verification_result IN ('correct', 'incorrect', 'partial', 'skipped')),
  error_type VARCHAR(30),
  messages JSONB DEFAULT '[]',
  time_spent_seconds INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_homework_questions_session ON homework_questions(session_id);

CREATE TABLE IF NOT EXISTS homework_topics_tracker (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  homework_date DATE NOT NULL,
  question_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_homework_tracker_profile ON homework_topics_tracker(profile_id, subject);
CREATE INDEX IF NOT EXISTS idx_homework_tracker_recent ON homework_topics_tracker(profile_id, homework_date);

CREATE TABLE IF NOT EXISTS session_reports (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('learn', 'quiz', 'homework', 'explain', 'review')),
  session_id INT,
  subject VARCHAR(50),
  topic VARCHAR(100),
  duration_seconds INT,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  strengths TEXT,
  struggles TEXT,
  recommendations TEXT,
  error_patterns JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_reports_profile ON session_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_session_reports_recent ON session_reports(profile_id, created_at DESC);

-- v10: AI Presence Layer (also in migrations/v10-presence.sql)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS presence_tier VARCHAR(10) NOT NULL DEFAULT 'off'
    CHECK (presence_tier IN ('off', 't1', 't2', 't3')),
  ADD COLUMN IF NOT EXISTS presence_consent_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS presence_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  context VARCHAR(30) NOT NULL,
  context_ref VARCHAR(100),
  tier VARCHAR(10) NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INT,
  samples_total INT DEFAULT 0,
  samples_present INT DEFAULT 0,
  presence_score NUMERIC(4,3),
  liveness_events INT DEFAULT 0,
  paused_count INT DEFAULT 0,
  auto_ended BOOLEAN DEFAULT FALSE,
  counted_toward_streak BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_profile ON presence_sessions(profile_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_presence_sessions_context ON presence_sessions(profile_id, context);
