import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const SECTIONS = [
  'title',
  'research_question',
  'background',
  'hypothesis',
  'methods',
  'results',
  'discussion',
  'conclusion',
  'references_text',
] as const;

const projectSchema = z.object({
  title: z.string().max(300).optional(),
  research_question: z.string().max(2000).optional(),
  background: z.string().max(8000).optional(),
  hypothesis: z.string().max(2000).optional(),
  methods: z.string().max(8000).optional(),
  results: z.string().max(8000).optional(),
  discussion: z.string().max(8000).optional(),
  conclusion: z.string().max(4000).optional(),
  references_text: z.string().max(8000).optional(),
  sources: z.array(z.object({ title: z.string().max(300), note: z.string().max(1000).optional(), citation: z.string().max(1000).optional(), official: z.boolean().optional() })).max(50).optional(),
  notes: z.string().max(8000).optional(),
  status: z.enum(['draft', 'in_review', 'done']).optional(),
  grade: z.number().int().min(10).max(12).optional().nullable(),
  semester: z.number().int().min(1).max(2).optional().nullable(),
  school_year: z.string().max(20).optional().nullable(),
  challenge_id: z.string().uuid().optional().nullable(),
});

function clean<T extends Record<string, any>>(d: T): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of SECTIONS as readonly string[]) if (d[k] !== undefined) out[k] = d[k];
  if (d.sources !== undefined) out.sources = JSON.stringify(d.sources);
  if (d.notes !== undefined) out.notes = d.notes;
  if (d.status !== undefined) out.status = d.status;
  for (const k of ['grade', 'semester', 'school_year', 'challenge_id'] as const) {
    if ((d as any)[k] !== undefined) out[k] = (d as any)[k];
  }
  return out;
}

// GET /api/research — list my projects, optional ?grade=&semester=
router.get('/', async (req, res) => {
  const { parseScope } = await import('../lib/scope');
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  const r = scope
    ? await query(
        `SELECT id, title, research_question, status, grade, semester, challenge_id, created_at, updated_at FROM research_projects
         WHERE user_id=$1 AND grade=$2 AND semester=$3 ORDER BY updated_at DESC`,
        [(req as any).user.id, scope.grade, scope.semester],
      )
    : await query(
        `SELECT id, title, research_question, status, grade, semester, challenge_id, created_at, updated_at FROM research_projects
         WHERE user_id=$1 ORDER BY updated_at DESC`,
        [(req as any).user.id],
      );
  res.json({ projects: r.rows, sections: [...SECTIONS] });
});

// POST /api/research — create (grade/semester enforced together, like questions)
router.post('/', async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = clean(parsed.data) as any;
  if ((d.grade == null) !== (d.semester == null)) {
    return res.status(400).json({ error: 'Grade and semester must be set together, or both left empty.' });
  }
  const r = await query(
    `INSERT INTO research_projects(user_id, title, research_question, background, hypothesis, methods, results, discussion, conclusion, references_text, sources, notes, status, grade, semester, school_year, challenge_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'draft',$13,$14,$15,$16) RETURNING *`,
    [
      (req as any).user.id,
      d.title ?? 'Untitled research',
      d.research_question ?? '',
      d.background ?? '',
      d.hypothesis ?? '',
      d.methods ?? '',
      d.results ?? '',
      d.discussion ?? '',
      d.conclusion ?? '',
      d.references_text ?? '',
      d.sources ?? '[]',
      d.notes ?? '',
      d.grade ?? null,
      d.semester ?? null,
      d.school_year ?? '',
      d.challenge_id ?? null,
    ],
  );
  res.status(201).json({ project: r.rows[0] });
});

// GET /api/research/:id
router.get('/:id', async (req, res) => {
  const r = await query(`SELECT * FROM research_projects WHERE id=$1 AND user_id=$2`, [req.params.id, (req as any).user.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json({ project: r.rows[0], sections: [...SECTIONS] });
});

// PUT /api/research/:id — partial update
router.put('/:id', async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = clean(parsed.data);
  const sets: string[] = [];
  const vals: any[] = [(req as any).user.id, req.params.id];
  const push = (col: string, v: any) => {
    vals.push(v);
    sets.push(`${col}=$${vals.length}`);
  };
  if (d.title !== undefined) push('title', d.title);
  for (const s of SECTIONS as readonly string[]) {
    if (s !== 'title' && d[s] !== undefined) push(s, d[s]);
  }
  if (d.sources !== undefined) push('sources', d.sources);
  if (d.notes !== undefined) push('notes', d.notes);
  if (d.status !== undefined) push('status', d.status);
  for (const k of ['grade', 'semester', 'school_year', 'challenge_id'] as const) {
    if ((d as any)[k] !== undefined) push(k, (d as any)[k]);
  }
  if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(
    `UPDATE research_projects SET ${sets.join(', ')}, updated_at=now() WHERE user_id=$1 AND id=$2 RETURNING *`,
    vals,
  );
  if (!r.rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json({ project: r.rows[0] });
});

// DELETE /api/research/:id
router.delete('/:id', async (req, res) => {
  const r = await query(`DELETE FROM research_projects WHERE id=$1 AND user_id=$2 RETURNING id`, [
    req.params.id,
    (req as any).user.id,
  ]);
  if (!r.rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json({ ok: true });
});

export default router;
