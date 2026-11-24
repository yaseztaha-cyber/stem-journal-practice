-- EDP learning track per challenge (§31) + research project semester binding (§44)

-- Learning lessons for approaching a challenge. Explicitly NOT official EDP
-- stages unless a row is marked official with a source note.
CREATE TABLE IF NOT EXISTS edp_track_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES edp_challenges(id) ON DELETE CASCADE,
  stage_no INT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  official BOOLEAN NOT NULL DEFAULT FALSE,
  official_note TEXT NOT NULL DEFAULT '',
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, stage_no)
);
CREATE INDEX IF NOT EXISTS idx_track_challenge ON edp_track_stages(challenge_id, sort);

-- Default 12-stage study guide for the G11 S1 challenge (platform guidance).
DO $$ DECLARE cid UUID; BEGIN
  SELECT id INTO cid FROM edp_challenges WHERE grade = 11 AND semester = 1 AND school_year = '2026–2027' LIMIT 1;
  IF cid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM edp_track_stages WHERE challenge_id = cid) THEN
    INSERT INTO edp_track_stages(challenge_id, stage_no, title, body, prompt, sort) VALUES
    (cid, 1, 'Understanding the Problem', 'Restate the challenge in your own words: preserve fresh food AND show its quality without opening the package. List what you know, what you assume, and what you must find out.', 'Write the challenge as two requirements in your own words.', 1),
    (cid, 2, 'Researching the Problem', 'Study deterioration mechanisms of your food and prior preservation solutions. Record sources; note what each source cannot tell you.', 'List three sources and one gap each leaves.', 2),
    (cid, 3, 'Identifying Requirements', 'Turn the brief into testable requirements: volume 1.0–3.0 L, natural materials, calibrated PVI, 0–120 h readings. Each requirement needs a pass/fail check.', 'Write five requirements each with a pass/fail check.', 3),
    (cid, 4, 'Generating Ideas', 'Brainstorm materials, geometries, closures, and pigments separately before combining. Quantity first, judgment later — no idea is rejected in this stage.', 'Sketch three different package concepts.', 4),
    (cid, 5, 'Selecting a Solution', 'Score concepts against requirements (preservation, feasibility, safety, cost). Pick the winner and record why the others lost.', 'Score your top three concepts and record the winner.', 5),
    (cid, 6, 'Planning the Prototype', 'Dimensions, mass budget, layer stack, PVI placement, reading schedule, and who builds what by when. A plan fits on one page.', 'Write the one-page build plan.', 6),
    (cid, 7, 'Building', 'Fabricate to the plan; log every deviation with its reason. Photograph stages for the video evidence.', 'Build prototype one and log deviations.', 7),
    (cid, 8, 'Testing', 'Run the control side by side, keep conditions identical, read at 0/24/…/120 h with calibrated instruments. Never taste test samples.', 'Run the first 48 h and compare with control.', 8),
    (cid, 9, 'Analyzing Results', 'Graph prototype vs control over time, quantify the benefit, and check whether the indicator tracks the measurements.', 'Plot both series and quantify the gap.', 9),
    (cid, 10, 'Iteration', 'Let the data order the redesign: biggest gap first. Change one thing at a time so the next test means something.', 'Name the one change iteration two will test.', 10),
    (cid, 11, 'Evaluation', 'Rehearse exhibition: sealed prototype, food sample, reference scale, three conditions, graphs, and the full video chain.', 'Run a timed exhibition rehearsal.', 11),
    (cid, 12, 'Reflection', 'What would you tell another team? Write the reusable rule, not just the story — this becomes journal evidence.', 'Write the reusable rule from your biggest failure.', 12);
  END IF;
END $$;

-- Research projects belong to a semester/challenge like everything else.
ALTER TABLE research_projects ADD COLUMN IF NOT EXISTS grade SMALLINT REFERENCES grades(grade) ON UPDATE CASCADE;
ALTER TABLE research_projects ADD COLUMN IF NOT EXISTS semester SMALLINT REFERENCES semesters(semester) ON UPDATE CASCADE;
ALTER TABLE research_projects ADD COLUMN IF NOT EXISTS school_year TEXT NOT NULL DEFAULT '';
ALTER TABLE research_projects ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES edp_challenges(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_research_scope ON research_projects(user_id, grade, semester);
