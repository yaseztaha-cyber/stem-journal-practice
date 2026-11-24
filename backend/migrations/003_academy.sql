-- Academic Writing Academy + Research Paper Lab

CREATE TABLE IF NOT EXISTS academy_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  unit_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  est_minutes INT NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  duration_seconds INT NOT NULL DEFAULT 0,
  transcript TEXT NOT NULL DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  examples JSONB NOT NULL DEFAULT '[]',
  widget TEXT NOT NULL DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Interactive practice exercises AND quiz questions live here.
-- kind: single_choice | multi_select | true_false | order_steps | short_answer | compare_levels | decoder
-- payload: { options?, correct?, explanation, pairs?, steps?, levels?, keywords?, segments? ... }
-- quiz: TRUE means part of the unit quiz (needs points); FALSE means formative practice.
CREATE TABLE IF NOT EXISTS academy_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
  quiz BOOLEAN NOT NULL DEFAULT FALSE,
  kind TEXT NOT NULL DEFAULT 'single_choice',
  prompt TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  points INT NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academy_tricks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academy_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS academy_lesson_completions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS academy_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES academy_items(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  score INT NOT NULL DEFAULT 0,
  answer JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academy_unit_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_progress','completed')),
  quiz_attempts INT NOT NULL DEFAULT 0,
  quiz_best_pct INT NOT NULL DEFAULT 0,
  quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, unit_id)
);

CREATE TABLE IF NOT EXISTS academy_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  pct INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers JSONB NOT NULL DEFAULT '[]',
  missed_ids JSONB NOT NULL DEFAULT '[]',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Research Paper Lab workspace
CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled research',
  research_question TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  hypothesis TEXT NOT NULL DEFAULT '',
  methods TEXT NOT NULL DEFAULT '',
  results TEXT NOT NULL DEFAULT '',
  discussion TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  references_text TEXT NOT NULL DEFAULT '',
  sources JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_unit ON academy_lessons(unit_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_academy_videos_unit_order ON academy_videos(unit_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_academy_lessons_unit_order ON academy_lessons(unit_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_academy_items_unit_order ON academy_items(unit_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_academy_tricks_unit_order ON academy_tricks(unit_id, order_index);
CREATE UNIQUE INDEX IF NOT EXISTS uq_academy_mistakes_unit_order ON academy_mistakes(unit_id, order_index);
CREATE INDEX IF NOT EXISTS idx_academy_items_unit ON academy_items(unit_id, quiz, order_index);
CREATE INDEX IF NOT EXISTS idx_academy_items_lesson ON academy_items(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_academy_ex_attempts ON academy_exercise_attempts(user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_academy_quiz_attempts ON academy_quiz_attempts(user_id, unit_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_user ON research_projects(user_id, updated_at);
