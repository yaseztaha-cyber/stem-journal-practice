-- STEM Journal Academy — grade/semester architecture + EDP challenges
-- PostgreSQL 16 compatible. All statements are re-runnable (IF NOT EXISTS guards).

-- 1. Extend question_source with the spec source types (§10)



-- 2. Grade/semester scoping columns on questions (§4, §5, §10)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS grade SMALLINT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS semester SMALLINT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS school_year TEXT NOT NULL DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_number INT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_slot INT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS instructions TEXT NOT NULL DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rubric_version TEXT NOT NULL DEFAULT 'v1.0';

-- Backfill scope from official source labels like "Official Star Journal — S'24 G11 S1 J1"
UPDATE questions SET
  school_year = '20' || (regexp_match(source_label, E'S\'(\\d\\d)'))[1],
  grade = (regexp_match(source_label, E'G(\\d\\d?)\\s+S[12]'))[1]::smallint,
  semester = (regexp_match(source_label, E'G\\d\\d?\\s+S([12])'))[1]::smallint,
  question_number = (regexp_match(source_label, E'\\sJ(\\d+)'))[1]::int
WHERE source_label ~ E'S\'\\d\\d\\s+G\\d+\\s+S[12]'
  AND (grade IS NULL OR semester IS NULL);

-- question_type from category (§5, §6, §7)
UPDATE questions SET question_type = CASE category
  WHEN 'personal_reflection' THEN 'PERSONAL_REFLECTION'
  WHEN 'team_collaboration' THEN 'TEAM_COLLABORATION'
  WHEN 'engineering_design_process' THEN 'ENGINEERING_DESIGN_PROCESS'
  WHEN 'learning_transfer' THEN 'LEARNING_TRANSFER'
  ELSE ''
END WHERE question_type = '';

-- question_slot: Q1 = reflection-or-collaboration, Q2 = EDP, Q3/Q4 = transfer in journal order
UPDATE questions SET question_slot = 1
WHERE question_slot IS NULL AND category IN ('personal_reflection', 'team_collaboration');
UPDATE questions SET question_slot = 2
WHERE question_slot IS NULL AND category = 'engineering_design_process';
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY grade, semester, school_year, question_number ORDER BY created_at, id
  ) AS rn FROM questions WHERE category = 'learning_transfer' AND question_slot IS NULL
)
UPDATE questions q SET question_slot = 2 + o.rn FROM ordered o
WHERE q.id = o.id AND o.rn <= 2;

-- Rows transcribed from official journals become first-class official questions
UPDATE questions SET source = 'official'
WHERE source = 'official_example' AND source_label ILIKE '%official%';

CREATE INDEX IF NOT EXISTS idx_questions_grade_sem ON questions(grade, semester, active);
CREATE INDEX IF NOT EXISTS idx_questions_slot ON questions(grade, semester, question_slot, active);

-- 3. EDP challenges (§22–§30): one row per grade/semester, content never invented —
-- semesters without imported content simply have no row ("not yet imported").
CREATE TABLE IF NOT EXISTS edp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 10 AND 12),
  semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 2),
  school_year TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT '',
  grand_challenge_link TEXT NOT NULL DEFAULT '',
  big_idea TEXT NOT NULL DEFAULT '',
  essential_question TEXT NOT NULL DEFAULT '',
  design_challenge TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  evaluation_day TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grade, semester, school_year)
);

-- Free-form requirement sections (requirements, constraints, measurements, …)
CREATE TABLE IF NOT EXISTS challenge_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES edp_challenges(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  heading TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_challenge_sections ON challenge_sections(challenge_id, sort);

-- Resources with official-vs-supplemental labeling (§32)
CREATE TABLE IF NOT EXISTS challenge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES edp_challenges(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'document' CHECK (kind IN ('document','video','link','template','data_sheet','guide','rubric')),
  title TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  official BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_challenge_resources ON challenge_resources(challenge_id);

-- 4. Scope sessions + projects to their semester (§35, §50)
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS grade SMALLINT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS semester SMALLINT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS school_year TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_sessions_user_scope ON practice_sessions(user_id, grade, semester);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS grade SMALLINT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS semester SMALLINT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS school_year TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES edp_challenges(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_user_scope ON projects(user_id, grade, semester);

-- 5. Per-semester progress (§35): scope the aggregate table if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') THEN
    ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS grade SMALLINT;
    ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS semester SMALLINT;
  END IF;
END $$;

-- 6. Seed: G11 S1 2026–2027 official challenge (§23–§29, from the supplied challenge doc)
DO $$ DECLARE cid UUID; BEGIN
  IF NOT EXISTS (SELECT 1 FROM edp_challenges WHERE grade = 11 AND semester = 1 AND school_year = '2026–2027') THEN
    INSERT INTO edp_challenges(grade, semester, school_year, title, subtitle, theme, big_idea, essential_question, design_challenge, timeline, evaluation_day)
    VALUES (
      11, 1, '2026–2027',
      'Smart Sustainable Food Packaging',
      'Integrating Passive Preservation with Natural Quality Indicators',
      'Change, Equilibrium, and Cycles',
      'Food packaging can slow physical, chemical, and biological deterioration — and it can also show, measurably, how fresh the food still is.',
      'How can a portable package built mostly from natural or repurposed materials both preserve fresh food and display its quality without opening the package?',
      'Design and fabricate one portable packaging prototype from primarily natural and/or repurposed materials that provides a preservation benefit and includes a calibrated natural-pigment Product Validation Indicator (PVI) linked to measured food-quality changes.',
      'Recommended test period is 5–7 days with readings at 0 h, 24 h, 48 h, 72 h, 96 h and 120 h, unless the predefined preservation endpoint is reached earlier and documented.',
      'Bring a sealed prototype with a representative approved food sample, a visible measurable indicator with its reference scale, at least three previously characterized conditions (fresh/acceptable, intermediate, deteriorated or simulated-deteriorated), time-dependent graphs (indicator response vs time or stimulus, prototype vs control/blank), and video evidence covering material selection, preparation, fabrication, PVI preparation, calibration, preservation testing, measurement, control comparison, analysis, and validation.'
    ) RETURNING id INTO cid;

    INSERT INTO challenge_sections(challenge_id, section, heading, body, sort) VALUES
    (cid, 'requirements', 'Team requirements', 'Select a fresh food product/category and identify its main deterioration mechanisms. Design and fabricate ONE portable packaging prototype using primarily natural and/or repurposed materials, with defined geometry, adequate structural integrity, and an appropriate closure/sealing mechanism. Justify the preservation function. Include a Product Validation Indicator (PVI) derived from a natural pigment that responds to a recognizable physical, chemical, and/or biological change tied to a measurable food/package-condition change. Calibrate the indicator, run a controlled preservation experiment comparing prototype vs control/blank, demonstrate a measurable preservation benefit, and show a scientifically justified relationship between indicator response and the selected food-quality measurements.', 1),
    (cid, 'materials', 'Material requirements', 'At least one major functional packaging component must come from natural and/or repurposed eco-friendly material. Document each material''s source, preparation, treatment/transformation, and reason for selection. The sensing indicator must use a natural/repurposed pigment, be observable without opening or damaging the package, have an established reference sensing scale, and show a reproducible response to controlled changes before preservation testing.', 2),
    (cid, 'packaging', 'Packaging requirements', 'The packaging must reduce at least one relevant deterioration driver (moisture exchange, oxygen exposure, light exposure, or another scientifically justified factor). Document material composition/source, external dimensions, internal dimensions, internal volume, wall/layer thickness, total mass, closure/sealing method, structural configuration, and number/type of layers — and explain how these characteristics support preservation.', 3),
    (cid, 'measurements', 'Measurement requirements', 'Internal volume must be between 1.0 L and 3.0 L, suited to and justified for the selected food. Define what counts as the end of acceptable preservation. Select at least two measurable, scientifically relevant, feasible preservation indicators; for each, collect at least six readings at 0 h, 24 h, 48 h, 72 h, 96 h and 120 h. The package must demonstrate a measurable delay in deterioration versus a control/blank.', 4),
    (cid, 'constraints', 'Safety and constraints', 'Work only in school-approved facilities with safe natural/repurposed-derived materials. No radioactive materials, no hazardous chemicals, no intentional culture/amplification of potentially pathogenic microorganisms. Tested food samples must not be consumed. Food-contact materials must be approved or separated by an approved barrier. The PVI must not contact food directly unless demonstrated safe and approved. Keep testing conditions consistent; use separate matched samples for destructive measurements. All exhibition components are the team''s responsibility. The indicator cannot independently certify food safety. Conclusions must stay limited to measured and validated variables, and data-collection devices must be calibrated.', 5),
    (cid, 'deliverables', 'Deliverables', 'Sealed prototype, representative approved food sample, measurable indicator with reference scale, three characterized conditions, time-dependent graphs (indicator response vs time/stimulus, prototype vs control), and full video evidence from material selection through validation.', 6);
  END IF;
END $$;
