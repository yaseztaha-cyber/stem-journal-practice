-- Academy depth: lesson takeaways + student reflections
ALTER TABLE academy_lessons ADD COLUMN IF NOT EXISTS takeaway TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS academy_reflections (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
