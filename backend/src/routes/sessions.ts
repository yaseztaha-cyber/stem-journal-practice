import { Router } from 'express';
import { query, PUBLIC_QUESTION_COLUMNS } from '../db';
import { requireAuth } from '../middleware/auth';
import { parseScope, parseLOs, scopeWhere } from '../lib/scope';
import { resolveStage } from '../lib/edpStages';

const router = Router();
router.use(requireAuth);

// Start mock journal: Q1 = personal reflection OR team collaboration (one slot),
// Q2 = EDP, Q3 + Q4 = two distinct learning-transfer questions — all scoped to
// the student's grade/semester plus the shared practice pool.
router.post('/start', async (req, res) => {
  const userId = (req as any).user.id;
  const body = { ...(req.query ?? {}), ...((req.body ?? {}) as any) };
  const { scope, error } = parseScope(body);
  if (error) return res.status(400).json({ error });
  // Optional LO restriction for Q3+Q4 (students pick LOs they have reached).
  const { los, error: loError } = parseLOs(body.los);
  if (loError) return res.status(400).json({ error: loError });
  const s = scopeWhere('q', scope, 1);

  // Optional EDP stage: makes Q1 a teamwork question about that stage.
  let stage: { stage_no: number; title: string } | null = null;
  if (body.edp_stage_no !== undefined && body.edp_stage_no !== null && body.edp_stage_no !== '') {
    const stageNo = Number(body.edp_stage_no);
    if (!Number.isInteger(stageNo)) return res.status(400).json({ error: 'EDP stage must be a stage number.' });
    const resolved = await resolveStage(scope?.grade ?? null, scope?.semester ?? null, stageNo);
    if (!resolved) return res.status(400).json({ error: 'That EDP stage does not exist for this semester.' });
    stage = { stage_no: resolved.stage_no, title: resolved.title };
  }

  async function pick(sql: string, params: any[]) {
    const r = await query(sql, params);
    return r.rows[0] ?? null;
  }
  const base = `SELECT ${PUBLIC_QUESTION_COLUMNS} FROM questions q WHERE q.active=TRUE${s.clause}`;
  const sp: any[] = scope ? [scope.grade, scope.semester] : [];
  const loClause = los ? ` AND q.learning_objectives && $${sp.length + 1}::text[]` : '';
  const lop: any[] = los ? [los] : [];

  // Q1: reflection-or-collaboration (single slot, random emphasis). When an EDP
  // stage is chosen the student wants the teamwork framing, so prefer it.
  const q1 = stage
    ? (await pick(`${base} AND q.question_slot=1 AND q.category='team_collaboration' ORDER BY RANDOM() LIMIT 1`, sp))
      ?? (await pick(`${base} AND q.question_slot=1 ORDER BY RANDOM() LIMIT 1`, sp))
    : await pick(`${base} AND q.question_slot=1 ORDER BY RANDOM() LIMIT 1`, sp);
  // Q2: EDP
  const q2 = await pick(`${base} AND q.question_slot=2 AND q.category='engineering_design_process' ORDER BY RANDOM() LIMIT 1`, sp);
  // Q3 + Q4: two distinct transfer questions, preferring one slot-3 and one slot-4
  const q3 = await pick(`${base} AND q.category='learning_transfer'${loClause} ORDER BY RANDOM() LIMIT 1`, [...sp, ...lop]);
  const preferSlot = q3?.question_slot === 4 ? 3 : 4;
  const q4 = q3
    ? await pick(
        `${base} AND q.category='learning_transfer'${loClause} AND q.id<>$${sp.length + lop.length + 1} ORDER BY CASE WHEN q.question_slot=$${sp.length + lop.length + 2} THEN 0 ELSE 1 END, RANDOM() LIMIT 1`,
        [...sp, ...lop, q3.id, preferSlot],
      )
    : null;

  const picked = [q1, q2, q3, q4].filter(Boolean);
  if (picked.length < 4) {
    return res.status(404).json({
      error: los
        ? 'Not enough transfer questions for the LOs you picked. Add more LOs you have reached, then try again.'
        : 'Not enough questions to build a mock journal for this semester yet. Practice questions are still available in Journal Practice.',
    });
  }
  const sess = await query(
    `INSERT INTO practice_sessions(user_id, mode, status, metadata, grade, semester) VALUES ($1,'mock','in_progress',$2,$3,$4) RETURNING *`,
    [
      userId,
      JSON.stringify({ question_ids: picked.map((p) => p.id), ...(stage ? { edp_stage_no: stage.stage_no, edp_stage_title: stage.title } : {}) }),
      scope?.grade ?? null,
      scope?.semester ?? null,
    ],
  );
  res.status(201).json({ session: sess.rows[0], questions: picked, ...(stage ? { edp_stage: stage } : {}) });
});

// Session status + answers so far
router.get('/:id', async (req, res) => {
  const userId = (req as any).user.id;
  const s = await query(`SELECT * FROM practice_sessions WHERE id=$1 AND user_id=$2`, [req.params.id, userId]);
  if (s.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
  const session = s.rows[0];
  let qids: string[] = [];
  try {
    const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata;
    qids = meta?.question_ids ?? [];
  } catch { qids = []; }
  const questions = qids.length
    ? (await query(`SELECT ${PUBLIC_QUESTION_COLUMNS} FROM questions q WHERE q.id = ANY($1::uuid[])`, [qids])).rows.sort((a: any, b: any) => qids.indexOf(a.id) - qids.indexOf(b.id))
    : [];
  const attempts = (await query(`SELECT a.*, e.grade AS eval_grade FROM attempts a LEFT JOIN evaluations e ON e.attempt_id=a.id WHERE a.session_id=$1 ORDER BY a.submitted_at`, [session.id])).rows;
  let stage: { stage_no: number; title: string } | null = null;
  try {
    const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata;
    if (meta?.edp_stage_no) stage = { stage_no: meta.edp_stage_no, title: meta.edp_stage_title ?? '' };
  } catch { stage = null; }
  res.json({ session, questions, attempts, ...(stage ? { edp_stage: stage } : {}) });
});

// Complete mock session -> rubric profile
router.post('/:id/complete', async (req, res) => {
  const userId = (req as any).user.id;
  const s = await query(`SELECT * FROM practice_sessions WHERE id=$1 AND user_id=$2`, [req.params.id, userId]);
  if (s.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
  const session = s.rows[0];
  await query(`UPDATE practice_sessions SET status='completed', completed_at=now() WHERE id=$1`, [req.params.id]);
  // Every attempt in this session (a student may re-answer an earlier question).
  const r = await query(
    `SELECT q.category, q.question_slot, a.grade, a.question_id, a.submitted_at, a.edp_stage_no, a.edp_stage_title
     FROM attempts a JOIN questions q ON q.id=a.question_id
     WHERE a.session_id=$1 ORDER BY a.submitted_at`,
    [req.params.id],
  );
  let qids: string[] = [];
  try {
    const meta = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata;
    qids = Array.isArray(meta?.question_ids) ? meta.question_ids : [];
  } catch { qids = []; }
  // Latest attempt per question, then keyed Q1..Q4 in the SESSION's question
  // order (not submission order) so going back to revise Q1 cannot scramble
  // the profile.
  const latest = new Map<string, any>();
  for (const row of r.rows) latest.set(row.question_id, row);
  const ordered = qids.length ? qids.map((qid) => latest.get(qid)).filter(Boolean) : r.rows.slice(0, 4);
  const byCat: Record<string, any> = {};
  ordered.slice(0, 4).forEach((row: any, i: number) => {
    byCat[`Q${i + 1}`] = row;
  });
  const order = ['BLUE', 'GREEN', 'YELLOW', 'RED'];
  // strongest = highest rank, weakest = lowest rank
  const rank = (g: string) => order.indexOf(g);
  let strongest: string | null = null;
  let weakest: string | null = null;
  let strongestQ: string | null = null;
  let weakestQ: string | null = null;
  for (const c of Object.keys(byCat)) {
    if (!strongest || rank(byCat[c].grade) < rank(strongest)) { strongest = byCat[c].grade; strongestQ = c; }
    if (!weakest || rank(byCat[c].grade) > rank(weakest)) { weakest = byCat[c].grade; weakestQ = c; }
  }
  const weakCategory = weakestQ ? byCat[weakestQ].category : null;
  const plan = weakCategory
    ? `Focus next on ${weakCategory.replace(/_/g, ' ')}: retry one question in that category using the improvement actions from your last attempt.`
    : 'Answer all four questions to generate your profile.';
  res.json({
    session_id: req.params.id,
    profile: byCat,
    strongest_area: strongestQ ? byCat[strongestQ].category : null,
    strongest_question: strongestQ,
    needs_most_practice: weakCategory,
    needs_most_practice_question: weakestQ,
    recommended_plan: plan,
    answered: Object.keys(byCat).length,
  });
});

router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const r = await query(`SELECT * FROM practice_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`, [userId]);
  res.json({ sessions: r.rows });
});

export default router;
