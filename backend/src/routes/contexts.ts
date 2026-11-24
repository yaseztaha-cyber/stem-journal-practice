import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Grade/semester/year reference data + per-context focus and challenge presence.
// Drives the frontend selector so it can never offer an invalid combination.
router.get('/', async (_req, res) => {
  const grades = await query(`SELECT grade, label FROM grades ORDER BY grade`);
  const semesters = await query(`SELECT semester, label FROM semesters ORDER BY semester`);
  const years = await query(`SELECT year FROM academic_years ORDER BY year`);
  const contexts = await query(
    `SELECT c.grade, c.semester, c.school_year, c.focus, c.active,
            EXISTS(SELECT 1 FROM edp_challenges h WHERE h.grade=c.grade AND h.semester=c.semester AND h.active=TRUE) AS has_challenge,
            (SELECT COUNT(*)::int FROM questions q WHERE q.active=TRUE AND q.grade=c.grade AND (q.semester IS NULL OR q.semester=c.semester)) AS question_count
     FROM grade_semester_contexts c ORDER BY c.grade, c.semester, c.school_year`,
  );
  res.json({ grades: grades.rows, semesters: semesters.rows, years: years.rows, contexts: contexts.rows });
});

export default router;
