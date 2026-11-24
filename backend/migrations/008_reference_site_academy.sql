-- STEM Journal Academy — reference tables, site CMS, academy scoping (§12, §38, §48–§51)

-- 1. First-class grade/semester reference data (§51, §52)
CREATE TABLE IF NOT EXISTS grades (
  grade SMALLINT PRIMARY KEY CHECK (grade BETWEEN 10 AND 12),
  label TEXT NOT NULL
);
INSERT INTO grades(grade, label) VALUES (10, 'Grade 10'), (11, 'Grade 11'), (12, 'Grade 12')
ON CONFLICT (grade) DO NOTHING;

CREATE TABLE IF NOT EXISTS semesters (
  semester SMALLINT PRIMARY KEY CHECK (semester BETWEEN 1 AND 2),
  label TEXT NOT NULL
);
INSERT INTO semesters(semester, label) VALUES (1, 'Semester 1'), (2, 'Semester 2')
ON CONFLICT (semester) DO NOTHING;

CREATE TABLE IF NOT EXISTS academic_years (
  year TEXT PRIMARY KEY,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO academic_years(year)
SELECT DISTINCT school_year FROM questions WHERE school_year <> ''
ON CONFLICT (year) DO NOTHING;
INSERT INTO academic_years(year) VALUES ('2026–2027') ON CONFLICT (year) DO NOTHING;

CREATE TABLE IF NOT EXISTS grade_semester_contexts (
  grade SMALLINT NOT NULL REFERENCES grades(grade),
  semester SMALLINT NOT NULL REFERENCES semesters(semester),
  school_year TEXT NOT NULL DEFAULT '',
  focus TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (grade, semester, school_year)
);
INSERT INTO grade_semester_contexts(grade, semester, school_year, focus) VALUES
  (10, 1, '', 'Foundations: understanding journals, academic sentences, and the first EDP cycle.'),
  (10, 2, '', 'Building up: evidence, teamwork reflection, and deeper EDP iteration.'),
  (11, 1, '', 'Four-question journal: reflection/teamwork, EDP, and double learning transfer.'),
  (11, 2, '', 'Advanced EDP and transfer: connecting semester learning to Capstone decisions.'),
  (12, 1, '', 'Capstone mastery: BLUE-level synthesis across the whole project.'),
  (12, 2, '', 'Final journal readiness: insight, judgment, and research-grade writing.'),
  (11, 1, '2026–2027', 'Smart Sustainable Food Packaging — preservation plus a natural quality indicator.')
ON CONFLICT (grade, semester, school_year) DO UPDATE SET focus = EXCLUDED.focus;

-- Enforce scope integrity at the database level (never frontend-only)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_grade') THEN
    ALTER TABLE questions ADD CONSTRAINT fk_questions_grade FOREIGN KEY (grade) REFERENCES grades(grade) ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_semester') THEN
    ALTER TABLE questions ADD CONSTRAINT fk_questions_semester FOREIGN KEY (semester) REFERENCES semesters(semester) ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_grade') THEN
    ALTER TABLE practice_sessions ADD CONSTRAINT fk_sessions_grade FOREIGN KEY (grade) REFERENCES grades(grade) ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_semester') THEN
    ALTER TABLE practice_sessions ADD CONSTRAINT fk_sessions_semester FOREIGN KEY (semester) REFERENCES semesters(semester) ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_grade') THEN
    ALTER TABLE projects ADD CONSTRAINT fk_projects_grade FOREIGN KEY (grade) REFERENCES grades(grade) ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_projects_semester') THEN
    ALTER TABLE projects ADD CONSTRAINT fk_projects_semester FOREIGN KEY (semester) REFERENCES semesters(semester) ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. Site CMS: About / Privacy / Terms pages + creator settings (§38, §48–§50)
CREATE TABLE IF NOT EXISTS site_pages (
  slug TEXT PRIMARY KEY CHECK (slug IN ('about', 'privacy', 'terms')),
  title TEXT NOT NULL,
  body_md TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_pages(slug, title, body_md) VALUES
('about', 'About STEM Journal Academy',
'## About the Platform
STEM Journal Academy is a student-focused platform for practicing Capstone Journal responses, learning academic writing, understanding how BLUE-level responses are built, and connecting writing skills to the Engineering Design Process and semester Capstone challenges.

## Why STEM Journal Practice?
Capstone Journals reward specific thinking: concrete evidence, honest reflection, synthesis across subjects, and value judgments other teams can reuse. This platform trains exactly those skills with instant rubric feedback and structured retries.

## How It Works
Pick your grade and semester, answer real journal questions, receive a BLUE / GREEN / YELLOW / RED evaluation with reasons, study the recommended skill, and retry the same question stronger.

## Journal Simulator
Timed four-question mock journals (reflection-or-teamwork, EDP, double learning transfer) with a Q1–Q4 rubric profile, strongest area, weakest area, and a practice plan.

## Academic Writing Academy
A LEARN → WATCH → UNDERSTAND → PRACTICE → QUIZ → APPLY → JOURNAL sequence teaching thinking, evidence, reflection, synthesis, and research communication — not just grammar.

## EDP Challenge
Each semester''s Capstone challenge with requirements, measurements, constraints, deliverables, evaluation-day expectations, and labeled resources.

## BLUE / GREEN / YELLOW / RED
BLUE means insight another team could reuse. GREEN means solid and concrete. YELLOW means relevant but thin. RED means off-topic or generic. The coach always explains how to climb one level.

## Learning Through Revision
Every attempt keeps its history. The platform compares drafts, names the actual improvement, and points at the one skill that unlocks the next level.

## Creator
STEM Journal Academy is a student-built educational platform designed to help STEM students practice Capstone Journal writing, strengthen academic writing skills, and better understand their semester challenges.

Created by
Yassen Taha Hussainy Elnasher
S''28 STEM Gharbiya

## Disclaimer / Educational Use
A student practice environment, not an official grading authority. Practice questions labeled as practice are training material, never official STEM questions. Uploaded files are analyzed in memory and never stored.'
),
('privacy', 'Privacy',
'## What we store
Your account (email, display name), your answers and evaluations (so progress, retries, and weaknesses work), your drafts, academy progress, and project notes you choose to save.

## What we do not store
Uploaded PDF files are analyzed in memory and never saved. We do not sell data or show ads.

## Your control
Your work is visible only to your account (and platform admins for support). Signing out on a shared device ends your session.'
),
('terms', 'Terms of Use',
'## Purpose
STEM Journal Academy is a student practice environment for Capstone Journal training and academic writing.

## Fair use
Write your own answers. The platform coaches reasoning; it is not an answer generator and must not be used to submit work you did not write.

## No official standing
Rubric levels here are training feedback, not official grades, and nothing here implies Ministry approval, certification, or partnership.

## Content honesty
Official-labeled material comes from supplied sources. Practice material is clearly labeled and must never be presented as official.'
)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
INSERT INTO site_settings(key, value) VALUES
  ('platform_name', 'STEM Journal Academy'),
  ('platform_tagline', 'Academic Journal Practice & Writing Training'),
  ('creator_name', 'Yassen Taha Hussainy Elnasher'),
  ('creator_school', 'S''28 STEM Gharbiya')
ON CONFLICT (key) DO NOTHING;

-- 3. Academy unit scoping: CORE vs grade/semester/journal/research tracks (§12)
ALTER TABLE academy_units ADD COLUMN IF NOT EXISTS track_scope TEXT NOT NULL DEFAULT 'CORE'
  CHECK (track_scope IN ('CORE','G10','G11','G12','SEMESTER','JOURNAL','RESEARCH'));
ALTER TABLE academy_units ADD COLUMN IF NOT EXISTS grade SMALLINT REFERENCES grades(grade) ON UPDATE CASCADE;
ALTER TABLE academy_units ADD COLUMN IF NOT EXISTS semester SMALLINT REFERENCES semesters(semester) ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS idx_units_scope ON academy_units(track_scope, grade, semester, active);
