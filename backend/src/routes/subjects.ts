import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { SUBJECT_LIBRARY } from '../data/subjectLibrary';

const router = Router();
router.use(requireAuth);

// Subject reference library (curated from the STEM curriculum / Learning Outcome documents)
router.get('/', (_req, res) => {
  res.json({ subjects: SUBJECT_LIBRARY });
});

export default router;