import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { parseScope } from '../lib/scope';
import { stagesForScope } from '../lib/edpStages';

const router = Router();
router.use(requireAuth);

/**
 * EDP stages available for a scope. The student picks the stage their teamwork
 * answer is about; the mock then grades that answer against the stage.
 * Platform study guide — not official EDP stages.
 */
router.get('/stages', async (req, res) => {
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  const stages = await stagesForScope(scope?.grade ?? null, scope?.semester ?? null);
  res.json({ stages });
});

export default router;
