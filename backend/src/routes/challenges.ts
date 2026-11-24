import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import { parseScope } from '../lib/scope';

const router = Router();
router.use(requireAuth);

// List challenges, optional ?grade= ?semester= (both required together)
router.get('/', async (req, res) => {
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  const r = scope
    ? await query(`SELECT * FROM edp_challenges WHERE active=TRUE AND grade=$1 AND semester=$2 ORDER BY school_year DESC`, [scope.grade, scope.semester])
    : await query(`SELECT * FROM edp_challenges WHERE active=TRUE ORDER BY grade, semester, school_year DESC`);
  res.json({ challenges: r.rows });
});

// Full challenge detail: sections + resources (official vs supplemental labeled)
router.get('/:id', async (req, res) => {
  const c = await query(`SELECT * FROM edp_challenges WHERE id=$1 AND active=TRUE`, [req.params.id]);
  if (c.rows.length === 0) return res.status(404).json({ error: 'Challenge content not yet imported for this semester.' });
  const sections = await query(`SELECT section, heading, body, sort FROM challenge_sections WHERE challenge_id=$1 ORDER BY sort`, [req.params.id]);
  const resources = await query(`SELECT id, kind, title, url, official, notes FROM challenge_resources WHERE challenge_id=$1 ORDER BY official DESC, title`, [req.params.id]);
  const track = await query(`SELECT id, stage_no, title, body, prompt, official, official_note FROM edp_track_stages WHERE challenge_id=$1 ORDER BY sort, stage_no`, [req.params.id]);
  res.json({ challenge: c.rows[0], sections: sections.rows, resources: resources.rows, track: track.rows });
});

export default router;
