import { Router } from 'express';
import { query, PUBLIC_QUESTION_COLUMNS } from '../db';
import { requireAuth } from '../middleware/auth';
import { parseScope, parseLOs, scopeWhere } from '../lib/scope';

const router = Router();
router.use(requireAuth);

// List active questions, optional ?category= ?grade= ?semester=
// Scoped queries return the semester's official questions plus the shared
// cross-semester practice pool (never another semester's official questions).
router.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const valid = ['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process'];
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  // LO filter (§transfer): only meaningful for Learning Transfer questions.
  const { los, error: loError } = parseLOs(req.query.los);
  if (loError) return res.status(400).json({ error: loError });
  if (los && category !== 'learning_transfer') {
    return res.status(400).json({ error: 'The LO filter applies to Learning Transfer questions only' });
  }
  let rows;
  if (category && valid.includes(category)) {
    const s = scopeWhere('q', scope, 3);
    const loClause = los ? ` AND q.learning_objectives && $${s.nextIdx}::text[]` : '';
    const params: any[] = scope ? [category, (req as any).user.id, scope.grade, scope.semester] : [category, (req as any).user.id];
    if (los) params.push(los);
    const r = await query(
      `SELECT ${PUBLIC_QUESTION_COLUMNS}, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags,
              (SELECT COUNT(*)::int FROM attempts a WHERE a.question_id=q.id AND a.student_id=$2) AS my_attempts
       FROM questions q WHERE q.active=TRUE AND q.category=$1${s.clause}${loClause} ORDER BY q.question_slot NULLS LAST, q.question_number NULLS LAST, q.created_at`,
      params,
    );
    rows = r.rows;
  } else {
    const s = scopeWhere('q', scope, 2);
    const r = await query(
      `SELECT ${PUBLIC_QUESTION_COLUMNS}, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags,
              (SELECT COUNT(*)::int FROM attempts a WHERE a.question_id=q.id AND a.student_id=$1) AS my_attempts
       FROM questions q WHERE q.active=TRUE${s.clause} ORDER BY q.category, q.question_slot NULLS LAST, q.question_number NULLS LAST, q.created_at`,
      scope ? [(req as any).user.id, scope.grade, scope.semester] : [(req as any).user.id],
    );
    rows = r.rows;
  }
  res.json({ questions: rows });
});

// Next question in a category (fewest attempts by this student).
// Optional ?min_difficulty=easy|medium|hard for progression ("give me harder").
const DIFF_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
router.get('/next', async (req, res) => {
  const category = req.query.category as string | undefined;
  const exclude = req.query.exclude as string | undefined;
  const valid = ['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process'];
  if (!category || !valid.includes(category)) return res.status(400).json({ error: 'Valid category required' });
  const minDiff = typeof req.query.min_difficulty === 'string' ? req.query.min_difficulty.toLowerCase() : null;
  if (minDiff && !(minDiff in DIFF_RANK)) return res.status(400).json({ error: 'min_difficulty must be easy, medium, or hard' });
  const diffClause = minDiff ? ` AND CASE q.difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END >= ${DIFF_RANK[minDiff]}` : '';
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  const { los, error: loError } = parseLOs(req.query.los);
  if (loError) return res.status(400).json({ error: loError });
  if (los && category !== 'learning_transfer') {
    return res.status(400).json({ error: 'The LO filter applies to Learning Transfer questions only' });
  }
  const s = scopeWhere('q', scope, 4);
  const loIdx = s.nextIdx;
  const loClause = los ? ` AND q.learning_objectives && $${loIdx}::text[]` : '';
  const params: any[] = scope ? [category, (req as any).user.id, exclude ?? null, scope.grade, scope.semester] : [category, (req as any).user.id, exclude ?? null];
  if (los) params.push(los);
  const r = await query(
    `SELECT ${PUBLIC_QUESTION_COLUMNS}, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags,
            (SELECT COUNT(*)::int FROM attempts a WHERE a.question_id=q.id AND a.student_id=$2) AS my_attempts
     FROM questions q WHERE q.active=TRUE AND q.category=$1 AND ($3::text IS NULL OR q.id::text <> $3)${s.clause}${loClause}${diffClause}
     ORDER BY my_attempts ASC, RANDOM() LIMIT 1`,
    params,
  );
  // Fallback without exclude
  if (r.rows.length === 0) {
    const s2 = scopeWhere('q', scope, 2);
    const loIdx2 = s2.nextIdx;
    const loClause2 = los ? ` AND q.learning_objectives && $${loIdx2}::text[]` : '';
    const params2: any[] = scope ? [category, scope.grade, scope.semester] : [category];
    if (los) params2.push(los);
    const r2 = await query(
      `SELECT ${PUBLIC_QUESTION_COLUMNS}, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags FROM questions q WHERE q.active=TRUE AND q.category=$1${s2.clause}${loClause2}${diffClause} ORDER BY RANDOM() LIMIT 1`,
      params2,
    );
    if (r2.rows.length === 0) return res.status(404).json({ error: 'No questions available' });
    return res.json({ question: r2.rows[0] });
  }
  res.json({ question: r.rows[0] });
});

// Single question (never expose inactive to students)
router.get('/:id', async (req, res) => {
  const r = await query(
    `SELECT ${PUBLIC_QUESTION_COLUMNS}, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags FROM questions q WHERE q.id=$1 AND q.active=TRUE`,
    [req.params.id],
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
  const q = r.rows[0];
  // attempts history for this student+question
  const att = await query(
    `SELECT a.id, a.attempt_number, a.grade, a.word_count, a.submitted_at, e.summary, e.next_level
     FROM attempts a LEFT JOIN evaluations e ON e.attempt_id=a.id
     WHERE a.student_id=$1 AND a.question_id=$2 ORDER BY a.attempt_number`,
    [(req as any).user.id, q.id],
  );
  res.json({ question: q, my_attempts: att.rows });
});

export default router;
