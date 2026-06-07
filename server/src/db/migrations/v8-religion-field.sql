-- v8: Add religion field to profiles for curriculum routing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion VARCHAR(20) DEFAULT 'christian';
