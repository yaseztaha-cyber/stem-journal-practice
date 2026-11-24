-- Backfill scope for legacy label variants. NULL grade/semester = cross-semester
-- pool (practice/admin-created or grade-wide official sets), always labeled by `source`.

-- S'xx G12 Jn (no semester split in the source material): grade-wide official
UPDATE questions SET
  school_year = '20' || (regexp_match(source_label, E'S\'(\\d\\d)'))[1],
  grade = 12,
  question_number = (regexp_match(source_label, E'\\sJ(\\d+)'))[1]::int
WHERE source_label ~ E'S\'\\d\\d\\s+G12\\s+J\\d+' AND grade IS NULL;

-- Official Past Paper — G12 YYYY Jn
UPDATE questions SET
  school_year = (regexp_match(source_label, E'G12\\s+(\\d{4})'))[1],
  grade = 12,
  question_number = (regexp_match(source_label, E'\\sJ(\\d+)'))[1]::int
WHERE source_label ~ E'Past Paper — G12 \\d{4} J\\d+' AND grade IS NULL;

-- Official G10 Sample — Jn
UPDATE questions SET
  school_year = 'sample', grade = 10,
  question_number = (regexp_match(source_label, E'\\sJ(\\d+)'))[1]::int
WHERE source_label ILIKE 'Official G10 Sample%' AND grade IS NULL;

-- "Official G2 S2" typo label: treat as G12 S2
UPDATE questions SET
  grade = 12, semester = 2,
  question_number = (regexp_match(source_label, E'\\sJ(\\d+)'))[1]::int
WHERE source_label ILIKE 'Official G2 S2%' AND grade IS NULL;

-- Water-theme items are practice material, not official journals: label honestly
UPDATE questions SET source = 'practice'
WHERE source_label ILIKE 'Official Water Theme%' AND source = 'official';

-- Leftover transfer questions beyond 2 per journal set become Q3/Q4 alternates
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY grade, semester, school_year, COALESCE(question_number, 0) ORDER BY created_at, id
  ) AS rn FROM questions WHERE category = 'learning_transfer' AND question_slot IS NULL
)
UPDATE questions q SET question_slot = CASE WHEN o.rn % 2 = 1 THEN 3 ELSE 4 END
FROM ordered o WHERE q.id = o.id;
