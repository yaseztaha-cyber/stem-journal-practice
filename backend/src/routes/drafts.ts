import { Router } from 'express';
import { query, wordCount } from '../db';
import { requireAuth } from '../middleware/auth';
import { draftSchema } from '../lib/validation';
import { sanitizeAnswer } from '../lib/sanitize';

const router = Router();
router.use(requireAuth);

// Upsert draft (autosave)
router.put('/', async (req, res) => {
  const parsed = draftSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const userId = (req as any).user.id;
  const clean = sanitizeAnswer(parsed.data.answer_text);
  const wc = wordCount(clean);
  // verify question active
  const q = await query(`SELECT id FROM questions WHERE id=$1 AND active=TRUE`, [parsed.data.question_id]);
  if (q.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
  const r = await query(
    `INSERT INTO drafts(user_id, question_id, session_id, answer_text, word_count, updated_at)
     VALUES ($1,$2,$3,$4,$5,now())
     ON CONFLICT (user_id, question_id) DO UPDATE SET answer_text=EXCLUDED.answer_text, word_count=EXCLUDED.word_count, session_id=EXCLUDED.session_id, updated_at=now()
     RETURNING *`,
    [userId, parsed.data.question_id, parsed.data.session_id ?? null, clean, wc],
  );
  res.json({ draft: r.rows[0], saved_at: r.rows[0].updated_at });
});

router.get('/:questionId', async (req, res) => {
  const r = await query(`SELECT * FROM drafts WHERE user_id=$1 AND question_id=$2`, [(req as any).user.id, req.params.questionId]);
  if (r.rows.length === 0) return res.json({ draft: null });
  res.json({ draft: r.rows[0] });
});

router.delete('/:questionId', async (req, res) => {
  await query(`DELETE FROM drafts WHERE user_id=$1 AND question_id=$2`, [(req as any).user.id, req.params.questionId]);
  res.json({ ok: true });
});

export default router;
