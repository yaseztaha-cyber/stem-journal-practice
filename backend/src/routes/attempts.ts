import { Router } from 'express';
import { query, wordCount } from '../db';
import { requireAuth } from '../middleware/auth';
import { attemptSchema } from '../lib/validation';
import { sanitizeAnswer } from '../lib/sanitize';
import { evaluateAnswer, ProjectContext } from '../lib/evaluator';
import { resolveStage } from '../lib/edpStages';
import { RUBRIC_VERSION, gradeRank } from '../lib/rubric';

const router = Router();
router.use(requireAuth);

async function getProjectContext(userId: string): Promise<ProjectContext | undefined> {
  const r = await query(`SELECT name, problem, description, role, team_members, edp_steps, challenges, outcomes FROM projects WHERE user_id=$1 AND is_active=TRUE ORDER BY updated_at DESC LIMIT 1`, [userId]);
  if (r.rows.length === 0) return undefined;
  return r.rows[0];
}

function improvementOf(prev: string | null, curr: string): 'first' | 'improved' | 'same' | 'declined' {
  if (!prev) return 'first';
  const d = gradeRank(curr as any) - gradeRank(prev as any);
  if (d > 0) return 'improved';
  if (d < 0) return 'declined';
  return 'same';
}

// Submit answer -> create attempt + evaluation (core training loop)
router.post('/', async (req, res) => {
  const parsed = attemptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const userId = (req as any).user.id;
  const clean = sanitizeAnswer(parsed.data.answer_text);
  if (!clean || clean.trim().length === 0) return res.status(400).json({ error: 'Answer cannot be empty' });
  const wc = wordCount(clean);

  const q = await query(`SELECT * FROM questions WHERE id=$1 AND active=TRUE`, [parsed.data.question_id]);
  if (q.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
  const question = q.rows[0];
  // normalize required_components (JSONB may come back as object already)
  let comps = question.required_components;
  if (typeof comps === 'string') {
    try { comps = JSON.parse(comps); } catch { comps = []; }
  }

  // session handling
  let sessionId: string | null = parsed.data.session_id ?? null;
  let sessionScope: { grade: number | null; semester: number | null } = { grade: question.grade ?? null, semester: question.semester ?? null };
  if (sessionId) {
    const s = await query(`SELECT id, mode, metadata, grade, semester FROM practice_sessions WHERE id=$1 AND user_id=$2`, [sessionId, userId]);
    if (s.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
    const sess = s.rows[0];
    if (sess.grade != null) sessionScope = { grade: sess.grade, semester: sess.semester ?? null };
    // Mock journal: questions are answered in order. You cannot skip ahead:
    // every earlier question in the session must already have an answer.
    // Going back to an answered question is allowed (it records a new attempt).
    if (sess.mode === 'mock') {
      let qids: string[] = [];
      try {
        const meta = typeof sess.metadata === 'string' ? JSON.parse(sess.metadata) : sess.metadata;
        qids = Array.isArray(meta?.question_ids) ? meta.question_ids : [];
      } catch { qids = []; }
      if (qids.length > 0) {
        const pos = qids.indexOf(question.id);
        if (pos === -1) return res.status(409).json({ error: 'This question is not part of your mock journal.' });
        if (pos > 0) {
          const earlier = qids.slice(0, pos);
          const done = await query(`SELECT DISTINCT question_id FROM attempts WHERE session_id=$1 AND question_id = ANY($2::uuid[])`, [sessionId, earlier]);
          const missing = earlier.filter((qid: string) => !done.rows.some((r: any) => r.question_id === qid));
          if (missing.length > 0) {
            const firstMissing = missing[0];
            const n = qids.indexOf(firstMissing) + 1;
            return res.status(409).json({ error: `Answer question ${n} before continuing — the mock journal is answered in order.` });
          }
        }
      }
    }
  } else {
    const s = await query(`INSERT INTO practice_sessions(user_id, mode, status) VALUES ($1,'practice','in_progress') RETURNING id`, [userId]);
    sessionId = s.rows[0].id;
  }

  // EDP stage the student says this teamwork answer is about (optional).
  let stage: { stage_no: number; title: string; body: string; prompt: string } | null = null;
  if (parsed.data.edp_stage_no != null) {
    const resolved = await resolveStage(sessionScope.grade, sessionScope.semester, parsed.data.edp_stage_no);
    if (!resolved) return res.status(400).json({ error: 'That EDP stage does not exist for this semester.' });
    stage = { stage_no: resolved.stage_no, title: resolved.title, body: resolved.body, prompt: resolved.prompt };
  }

  // attempt number = count+1 for this student+question
  const cnt = await query(`SELECT COUNT(*)::int AS c, MAX(grade)::text AS last_grade FROM attempts WHERE student_id=$1 AND question_id=$2`, [userId, question.id]);
  const attemptNumber = (cnt.rows[0].c ?? 0) + 1;
  const prevGrade: string | null = cnt.rows[0].last_grade ?? null;

  const project = await getProjectContext(userId);

  let evaluation;
  try {
    evaluation = await evaluateAnswer(
      {
        id: question.id,
        category: question.category,
        question_text: question.question_text,
        what_testing: question.what_testing,
        required_components: comps,
        updated_at: question.updated_at,
        grade: question.grade,
        semester: question.semester,
        school_year: question.school_year,
        question_number: question.question_number,
        question_slot: question.question_slot,
        question_type: question.question_type,
        rubric_version: question.rubric_version,
        reference_answer: question.reference_answer,
      },
      clean,
      project,
      { stage: stage ?? undefined },
    );
  } catch (e) {
    console.error('evaluation failed', e);
    return res.status(503).json({ error: "We couldn't evaluate this answer right now. Your draft is safely saved. Please try again." });
  }

  const improvement = improvementOf(prevGrade, evaluation.grade);

  const att = await query(
    `INSERT INTO attempts(student_id, question_id, session_id, answer_text, word_count, char_count, attempt_number, grade, improvement_from_previous, edp_stage_no, edp_stage_title)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [userId, question.id, sessionId, clean, wc, clean.length, attemptNumber, evaluation.grade, improvement, stage?.stage_no ?? null, stage?.title ?? ''],
  );
  const attempt = att.rows[0];

  const ev = await query(
    `INSERT INTO evaluations(attempt_id, grade, confidence, question_coverage, strengths, missing_elements, weaknesses, weakness_codes, improvement_actions, next_level, next_level_requirements, summary, why_level, recommended_practice, model_name, rubric_version, question_version, evaluation_time_ms, raw_provider)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
    [
      attempt.id, evaluation.grade, evaluation.confidence, JSON.stringify(evaluation.question_coverage),
      evaluation.strengths, evaluation.missing_elements, evaluation.weaknesses, evaluation.weakness_codes,
      evaluation.improvement_actions, evaluation.next_level, evaluation.next_level_requirements,
      evaluation.summary, evaluation.why_level, evaluation.recommended_practice,
      evaluation.model_name, evaluation.rubric_version, question.updated_at, evaluation.evaluation_time_ms, evaluation.raw_provider,
    ],
  );
  const evaluationRow = ev.rows[0];

  // feedback_items (normalized)
  const items: { kind: string; text: string }[] = [
    ...evaluation.strengths.map((t) => ({ kind: 'strength', text: t })),
    ...evaluation.missing_elements.map((t) => ({ kind: 'missing', text: t })),
    ...evaluation.weaknesses.map((t) => ({ kind: 'weakness', text: t })),
    ...evaluation.improvement_actions.map((t) => ({ kind: 'action', text: t })),
    ...evaluation.next_level_requirements.map((t) => ({ kind: 'next_requirement', text: t })),
  ];
  for (const it of items) {
    await query(`INSERT INTO feedback_items(evaluation_id, kind, text) VALUES ($1,$2,$3)`, [evaluationRow.id, it.kind, it.text]);
  }

  // progress + weakness patterns
  await query(
    `INSERT INTO student_progress(user_id, category, blue_count, green_count, yellow_count, red_count, total_attempts, last_grade, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,1,$7,now())
     ON CONFLICT (user_id, category) DO UPDATE SET
       blue_count = student_progress.blue_count + EXCLUDED.blue_count,
       green_count = student_progress.green_count + EXCLUDED.green_count,
       yellow_count = student_progress.yellow_count + EXCLUDED.yellow_count,
       red_count = student_progress.red_count + EXCLUDED.red_count,
       total_attempts = student_progress.total_attempts + 1,
       last_grade = EXCLUDED.last_grade, updated_at=now()`,
    [userId, question.category, evaluation.grade === 'BLUE' ? 1 : 0, evaluation.grade === 'GREEN' ? 1 : 0, evaluation.grade === 'YELLOW' ? 1 : 0, evaluation.grade === 'RED' ? 1 : 0, evaluation.grade],
  );
  const { WEAKNESS_LABELS } = await import('../lib/evaluator');
  for (const code of evaluation.weakness_codes) {
    const labelText = (WEAKNESS_LABELS as any)[code] ?? code;
    await query(
      `INSERT INTO weakness_patterns(user_id, code, label, occurrences, last_seen) VALUES ($1,$2,$3,1,now())
       ON CONFLICT (user_id, code) DO UPDATE SET occurrences = weakness_patterns.occurrences + 1, last_seen=now()`,
      [userId, code, labelText],
    );
  }

  // clear draft for this question (submission succeeded)
  await query(`DELETE FROM drafts WHERE user_id=$1 AND question_id=$2`, [userId, question.id]);

  res.status(201).json({ attempt, evaluation: evaluationRow, injection_detected: evaluation.injection_detected });
});

// List my attempts (recent)
router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const limit = Math.min(50, parseInt((req.query.limit as string) ?? '20', 10) || 20);
  const r = await query(
    `SELECT a.*, q.category, LEFT(q.question_text, 140) AS question_preview, e.summary
     FROM attempts a JOIN questions q ON q.id=a.question_id LEFT JOIN evaluations e ON e.attempt_id=a.id
     WHERE a.student_id=$1 ORDER BY a.submitted_at DESC LIMIT $2`,
    [userId, limit],
  );
  res.json({ attempts: r.rows });
});

// Attempt detail (owner only) with evaluation
router.get('/:id', async (req, res) => {
  const userId = (req as any).user.id;
  const r = await query(
    `SELECT a.*, q.category, q.question_text, q.what_testing, q.required_components, q.source_label, q.reference_answer
     FROM attempts a JOIN questions q ON q.id=a.question_id WHERE a.id=$1 AND a.student_id=$2`,
    [req.params.id, userId],
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'Attempt not found' });
  const e = await query(`SELECT * FROM evaluations WHERE attempt_id=$1`, [req.params.id]);
  const items = e.rows.length ? (await query(`SELECT kind, text FROM feedback_items WHERE evaluation_id=$1 ORDER BY created_at`, [e.rows[0].id])).rows : [];
  // sibling attempts for retry timeline (with answer text for revision compare)
  const sib = await query(`SELECT id, attempt_number, grade, submitted_at, improvement_from_previous, answer_text FROM attempts WHERE student_id=$1 AND question_id=$2 ORDER BY attempt_number`, [userId, r.rows[0].question_id]);
  res.json({ attempt: r.rows[0], evaluation: e.rows[0] ?? null, feedback_items: items, timeline: sib.rows });
});

export default router;
