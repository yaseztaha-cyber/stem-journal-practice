import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Public reads: footer, About, Privacy, Terms must work logged-out too.
router.get('/pages/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!['about', 'privacy', 'terms'].includes(slug)) return res.status(404).json({ error: 'Not found' });
  const r = await query(`SELECT slug, title, body_md, updated_at FROM site_pages WHERE slug=$1`, [slug]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ page: r.rows[0] });
});

router.get('/settings', async (_req, res) => {
  const r = await query(`SELECT key, value FROM site_settings`);
  res.json({ settings: Object.fromEntries(r.rows.map((x: any) => [x.key, x.value])) });
});

// Public honest platform stats for the landing hero (counts only, no content).
router.get('/stats', async (_req, res) => {
  const q = await query(`SELECT COUNT(*)::int AS questions FROM questions WHERE active=TRUE`);
  const u = await query(`SELECT COUNT(*)::int AS units FROM academy_units WHERE active=TRUE`);
  const c = await query(`SELECT COUNT(*)::int AS challenges FROM edp_challenges WHERE active=TRUE`);
  res.json({ questions: q.rows[0].questions, units: u.rows[0].units, challenges: c.rows[0].challenges, semesters: 6 });
});

export default router;
