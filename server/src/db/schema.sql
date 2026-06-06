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

-- v11: Bedaya (adult literacy) — see migrations/v11-bedaya.sql
CREATE TABLE IF NOT EXISTS bedaya_learners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  voice_guide VARCHAR(20) NOT NULL DEFAULT 'umm_yasmin'
    CHECK (voice_guide IN ('umm_yasmin', 'amm_hassan')),
  letter_order VARCHAR(20) NOT NULL DEFAULT 'frequency'
    CHECK (letter_order IN ('frequency', 'moe')),
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  letters_known INT DEFAULT 0,
  sessions_completed INT DEFAULT 0,
  total_minutes INT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bedaya_learners_device ON bedaya_learners(device_id);

CREATE TABLE IF NOT EXISTS bedaya_letter_progress (
  id SERIAL PRIMARY KEY,
  learner_id INT REFERENCES bedaya_learners(id) ON DELETE CASCADE,
  letter VARCHAR(4) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'introduced'
    CHECK (status IN ('introduced', 'practising', 'mastered')),
  introduced_at TIMESTAMP DEFAULT NOW(),
  mastered_at TIMESTAMP,
  trace_count INT DEFAULT 0,
  story_count INT DEFAULT 0,
  UNIQUE(learner_id, letter)
);
CREATE INDEX IF NOT EXISTS idx_bedaya_progress_learner ON bedaya_letter_progress(learner_id);

CREATE TABLE IF NOT EXISTS bedaya_sessions (
  id SERIAL PRIMARY KEY,
  learner_id INT REFERENCES bedaya_learners(id) ON DELETE CASCADE,
  letter VARCHAR(4) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INT,
  warmup_done BOOLEAN DEFAULT FALSE,
  phonics_done BOOLEAN DEFAULT FALSE,
  story_done BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_bedaya_sessions_learner ON bedaya_sessions(learner_id, started_at DESC);

CREATE TABLE IF NOT EXISTS bedaya_story_history (
  id SERIAL PRIMARY KEY,
  learner_id INT REFERENCES bedaya_learners(id) ON DELETE CASCADE,
  letters_used TEXT NOT NULL,
  story TEXT NOT NULL,
  topic VARCHAR(60),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bedaya_story_learner ON bedaya_story_history(learner_id, created_at DESC);

-- v12: Per-subject working levels + adaptive diagnostic (see migrations/v12-levels-diagnostic.sql)
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

CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'complete', 'abandoned')),
  current_level INT NOT NULL,
  current_question JSONB,
  questions_asked INT DEFAULT 0,
  highest_passed INT,
  lowest_failed INT,
  history JSONB DEFAULT '[]',
  final_level INT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_profile ON diagnostic_sessions(profile_id, subject, started_at DESC);

-- v14: DeepTutor memory layers + persona cache (see migrations/v14-memory-personas.sql)

-- L2: Curated facts per child per subject
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_working_memory_unique
  ON working_memory (profile_id, subject, fact_type, md5(fact_text));

-- L3: Cross-subject synthesis insights
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_insights_unique
  ON cross_subject_insights (profile_id, insight_type, md5(description));

-- Persona cache: compiled persona prompts per subject/year
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

-- v15: Voice biometrics for speaker recognition login (see migrations/v15-voice-biometrics.sql)
CREATE TABLE IF NOT EXISTS voice_profiles (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- v6: Pre-Test Predictor (see migrations/v6 in migrate-v6.js)
CREATE TABLE IF NOT EXISTS test_plans (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]',
  test_date DATE NOT NULL,
  total_days INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_test_plans_profile ON test_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_test_plans_date ON test_plans(profile_id, test_date);

CREATE TABLE IF NOT EXISTS test_plan_days (
  id SERIAL PRIMARY KEY,
  plan_id INT REFERENCES test_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('review', 'practice', 'mock_test', 'confidence')),
  topic VARCHAR(200),
  label TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_test_plan_days_plan ON test_plan_days(plan_id);

-- v7: Study Duels (see migrate-v7.js)
CREATE TABLE IF NOT EXISTS duels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  subject VARCHAR(50) NOT NULL,
  creator_profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  opponent_profile_id INT REFERENCES profiles(id) ON DELETE SET NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'complete')),
  winner_profile_id INT REFERENCES profiles(id) ON DELETE SET NULL,
  creator_score INT DEFAULT 0,
  opponent_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_duels_code ON duels(code);
CREATE INDEX IF NOT EXISTS idx_duels_creator ON duels(creator_profile_id);
CREATE INDEX IF NOT EXISTS idx_duels_opponent ON duels(opponent_profile_id);

CREATE TABLE IF NOT EXISTS duel_answers (
  id SERIAL PRIMARY KEY,
  duel_id INT REFERENCES duels(id) ON DELETE CASCADE,
  profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  answer VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_ms INT,
  answered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (duel_id, profile_id, question_index)
);
CREATE INDEX IF NOT EXISTS idx_duel_answers_duel ON duel_answers(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_answers_profile ON duel_answers(profile_id);

-- v9: Teacher Dashboard (see migrations/v9-teacher-dashboard.sql)
CREATE TABLE IF NOT EXISTS teacher_classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'My Class',
  pin VARCHAR(4) NOT NULL,
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_roster (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES teacher_classes(id) ON DELETE CASCADE,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_class_roster_class ON class_roster(class_id);
CREATE INDEX IF NOT EXISTS idx_class_roster_profile ON class_roster(profile_id);

CREATE TABLE IF NOT EXISTS weekly_objectives (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES teacher_classes(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  objective TEXT NOT NULL,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_by JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weekly_objectives_class ON weekly_objectives(class_id, week_start);

-- v15: Phase 4-5 — Parent Dashboard, Story Mode, Learning Needs (see migrations/v15-phase4-parent-story.sql)
CREATE TABLE IF NOT EXISTS parent_pins (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pin_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_pins_profile ON parent_pins(profile_id);

CREATE TABLE IF NOT EXISTS parent_notes (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parent_notes_profile ON parent_notes(profile_id);

CREATE TABLE IF NOT EXISTS learning_needs (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dyslexia BOOLEAN NOT NULL DEFAULT FALSE,
  adhd BOOLEAN NOT NULL DEFAULT FALSE,
  autism BOOLEAN NOT NULL DEFAULT FALSE,
  dyscalculia BOOLEAN NOT NULL DEFAULT FALSE,
  other_notes TEXT,
  source VARCHAR(20) NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_needs_profile ON learning_needs(profile_id);

CREATE TABLE IF NOT EXISTS behavioral_observations (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  observation_type VARCHAR(50) NOT NULL,
  details JSONB,
  session_type VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_behavioral_obs_profile ON behavioral_observations(profile_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_obs_type ON behavioral_observations(profile_id, observation_type, created_at DESC);

CREATE TABLE IF NOT EXISTS specialist_reports (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_specialist_reports_profile ON specialist_reports(profile_id);

CREATE TABLE IF NOT EXISTS story_progress (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  stage INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, chapter, stage)
);
CREATE INDEX IF NOT EXISTS idx_story_progress_profile ON story_progress(profile_id);

-- Treehouse / owned items (auto-created by treehouse route)
CREATE TABLE IF NOT EXISTS treehouse_items (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  icon         TEXT NOT NULL,
  unlock_type  TEXT NOT NULL,
  unlock_value INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS owned_items (
  id          SERIAL PRIMARY KEY,
  profile_id  INT REFERENCES profiles(id) ON DELETE CASCADE,
  item_id     TEXT REFERENCES treehouse_items(id) ON DELETE CASCADE,
  equipped    BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_owned_items_profile ON owned_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_owned_items_item ON owned_items(item_id);
