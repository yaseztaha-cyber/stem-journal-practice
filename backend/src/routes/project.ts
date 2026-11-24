import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import { projectSchema } from '../lib/validation';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { scope } = (await import('../lib/scope')).parseScope(req.query);
  const r = scope
    ? await query(`SELECT * FROM projects WHERE user_id=$1 AND is_active=TRUE AND grade=$2 AND semester=$3 ORDER BY updated_at DESC LIMIT 1`, [(req as any).user.id, scope.grade, scope.semester])
    : await query(`SELECT * FROM projects WHERE user_id=$1 AND is_active=TRUE ORDER BY updated_at DESC LIMIT 1`, [(req as any).user.id]);
  res.json({ project: r.rows[0] ?? null });
});

router.put('/', async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const userId = (req as any).user.id;
  const d = parsed.data;
  const existing = await query(`SELECT id FROM projects WHERE user_id=$1 AND is_active=TRUE ORDER BY updated_at DESC LIMIT 1`, [userId]);
  if (existing.rows.length === 0) {
    const r = await query(
      `INSERT INTO projects(user_id, name, problem, description, role, team_members, edp_steps, challenges, outcomes, grade, semester, school_year, challenge_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [userId, d.name ?? null, d.problem ?? null, d.description ?? null, d.role ?? null, d.team_members ?? [], d.edp_steps ?? [], d.challenges ?? null, d.outcomes ?? null,
       d.grade ?? null, d.semester ?? null, d.school_year ?? null, d.challenge_id ?? null],
    );
    return res.json({ project: r.rows[0] });
  }
  const id = existing.rows[0].id;
  const r = await query(
    `UPDATE projects SET name=$2, problem=$3, description=$4, role=$5, team_members=$6, edp_steps=$7, challenges=$8, outcomes=$9,
      grade=COALESCE($10, grade), semester=COALESCE($11, semester), school_year=COALESCE($12, school_year), challenge_id=COALESCE($13, challenge_id),
      updated_at=now() WHERE id=$1 RETURNING *`,
    [id, d.name ?? null, d.problem ?? null, d.description ?? null, d.role ?? null, d.team_members ?? [], d.edp_steps ?? [], d.challenges ?? null, d.outcomes ?? null,
     d.grade ?? null, d.semester ?? null, d.school_year ?? null, d.challenge_id ?? null],
  );
  res.json({ project: r.rows[0] });
});

export default router;
