import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Custom STEM dictionary for the offline writing checker (one array, cached).
router.get('/', async (_req, res) => {
  const r = await query(`SELECT word FROM custom_words ORDER BY word`);
  res.json({ words: r.rows.map((x: any) => x.word) });
});

export default router;
