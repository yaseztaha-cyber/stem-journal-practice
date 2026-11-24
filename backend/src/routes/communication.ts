import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// ---------- Validation ----------
const feedbackCreateSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(10000),
});

const notificationPreferenceSchema = z.object({
  email_announcements: z.boolean().default(true),
  email_feedback_replies: z.boolean().default(true),
  in_app_announcements: z.boolean().default(true),
});

// ---------- Student: submit feedback ----------
router.post('/feedback', async (req, res) => {
  const parsed = feedbackCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const user = (req as any).user;
  const d = parsed.data as any;
  const r = await query(
    `INSERT INTO feedback_messages(student_id, subject, message) VALUES ($1,$2,$3) RETURNING *`,
    [user.id, d.subject.trim(), d.message.trim()],
  );
  res.status(201).json({ feedback: r.rows[0] });
});

// ---------- Student: my announcements ----------
router.get('/announcements', async (req, res) => {
  const user = (req as any).user;
  const r = await query(
    `SELECT a.*,
            ar.delivered_at, ar.read_at
     FROM announcements a
     JOIN announcement_recipients ar ON ar.announcement_id = a.id
     WHERE ar.student_id = $1
       AND (a.target_roles = '{}' OR $2 = ANY(a.target_roles))
       AND (a.target_grades = '{}' OR $3 = ANY(a.target_grades))
       AND (a.target_semesters = '{}' OR $4 = ANY(a.target_semesters))
     ORDER BY a.scheduled_at DESC, a.created_at DESC`,
    [user.id, user.role, user.grade, user.semester],
  );
  res.json({ announcements: r.rows });
});

// ---------- Student: mark announcement read ----------
router.put('/announcements/:id/read', async (req, res) => {
  const user = (req as any).user;
  const r = await query(
    `UPDATE announcement_recipients SET read_at=now() WHERE announcement_id=$1 AND student_id=$2 RETURNING *`,
    [req.params.id, user.id],
  );
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Student: notification preferences ----------
router.get('/notification-preferences', async (req, res) => {
  const user = (req as any).user;
  let r = await query(`SELECT * FROM notification_preferences WHERE user_id=$1`, [user.id]);
  if (r.rows.length === 0) {
    r = await query(`INSERT INTO notification_preferences(user_id) VALUES ($1) RETURNING *`, [user.id]);
  }
  res.json({ preferences: r.rows[0] });
});

router.put('/notification-preferences', async (req, res) => {
  const parsed = notificationPreferenceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const user = (req as any).user;
  const d = parsed.data as any;
  const r = await query(
    `INSERT INTO notification_preferences(user_id, email_announcements, email_feedback_replies, in_app_announcements)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE SET
       email_announcements=$2, email_feedback_replies=$3, in_app_announcements=$4, updated_at=now()
     RETURNING *`,
    [user.id, d.email_announcements, d.email_feedback_replies, d.in_app_announcements],
  );
  res.json({ preferences: r.rows[0] });
});

export default router;