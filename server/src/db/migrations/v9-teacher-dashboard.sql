-- v9: Teacher Dashboard tables

-- Teacher classes (a teacher manages a group of students)
CREATE TABLE IF NOT EXISTS teacher_classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'My Class',
  pin VARCHAR(4) NOT NULL,
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Class roster (which students belong to which class)
CREATE TABLE IF NOT EXISTS class_roster (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES teacher_classes(id) ON DELETE CASCADE,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, profile_id)
);

-- Weekly objectives set by teacher
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

CREATE INDEX IF NOT EXISTS idx_class_roster_class ON class_roster(class_id);
CREATE INDEX IF NOT EXISTS idx_class_roster_profile ON class_roster(profile_id);
CREATE INDEX IF NOT EXISTS idx_weekly_objectives_class ON weekly_objectives(class_id, week_start);
