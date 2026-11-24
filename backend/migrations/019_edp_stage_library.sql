-- Mock journal: EDP-stage-aware teamwork answers + per-attempt stage snapshot.
--
-- 1) A platform-wide EDP stage library so ANY semester can offer the stage
--    picker (the challenge track `edp_track_stages` is only seeded for the
--    G11 S1 2026-2027 challenge). These are platform study-guide stages, NOT
--    official EDP stages — same labeling rule as edp_track_stages.
-- 2) Attempts snapshot the stage the student chose, so a later answer can be
--    graded against the stage the teamwork question was actually about.

CREATE TABLE IF NOT EXISTS platform_edp_stages (
  stage_no INT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  sort INT NOT NULL DEFAULT 0
);

INSERT INTO platform_edp_stages(stage_no, title, body, prompt, sort) VALUES
  (1, 'Understanding the Problem', 'Restate the challenge in your own words: what must your solution achieve, and what must it not break.', 'Write the challenge as two requirements in your own words.', 1),
  (2, 'Researching the Problem', 'Study the science and prior solutions behind the problem. Record your sources and note what each one cannot tell you.', 'List three sources and one gap each leaves.', 2),
  (3, 'Identifying Requirements', 'Turn the brief into testable requirements. Every requirement needs a pass/fail check you can actually run.', 'Write five requirements each with a pass/fail check.', 3),
  (4, 'Generating Ideas', 'Brainstorm concepts separately before combining them: materials, shapes, methods, mechanisms. Quantity first, judgment later.', 'Sketch three different concepts.', 4),
  (5, 'Selecting a Solution', 'Score your candidates against the requirements, then pick the winner and record why the others lost.', 'Score your top three concepts and record the winner.', 5),
  (6, 'Planning the Prototype', 'Dimensions, materials, build order, measurements, and who builds what by when. A plan fits on one page.', 'Write the one-page build plan.', 6),
  (7, 'Building', 'Build to the plan and log every deviation with its reason. Photograph or record the build as evidence.', 'Build your prototype and log deviations.', 7),
  (8, 'Testing', 'Run the test with a control, keep conditions identical, use calibrated instruments, and never taste test samples.', 'Run your first test and compare with the control.', 8),
  (9, 'Analyzing Results', 'Plot the data, quantify the benefit, and check whether your indicator tracks the measurements honestly.', 'Plot both series and quantify the gap.', 9),
  (10, 'Iteration', 'Let the data order the redesign: biggest gap first. Change one thing at a time so the next test still means something.', 'Name the one change your next iteration will test.', 10),
  (11, 'Evaluation', 'Judge the solution against the requirements and the evidence, and rehearse how you will present it.', 'Run a timed exhibition rehearsal.', 11),
  (12, 'Reflection', 'Write the reusable rule, not just the story — what another team should copy from your work.', 'Write the reusable rule from your biggest failure.', 12)
ON CONFLICT (stage_no) DO NOTHING;

-- Snapshot of the stage an answer was written for (text copies survive edits
-- or deletion of the source row).
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS edp_stage_no INT;
ALTER TABLE attempts ADD COLUMN IF NOT EXISTS edp_stage_title TEXT NOT NULL DEFAULT '';

-- Index for "which stage did this student answer for" reporting.
CREATE INDEX IF NOT EXISTS idx_attempts_stage ON attempts(student_id, edp_stage_no);
