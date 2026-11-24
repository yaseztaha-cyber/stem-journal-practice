import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, wordCount } from '../db';
import { config } from '../config';
import { loginSchema, registerSchema } from '../lib/validation';
import { requireAuth, signToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const { email, password, display_name } = parsed.data;
  const lower = email.toLowerCase();
  const existing = await query(`SELECT id FROM users WHERE email=$1`, [lower]);
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, config.bcryptRounds);
  const r = await query(`INSERT INTO users(email, password_hash, role, display_name) VALUES ($1,$2,'student',$3) RETURNING id, email, role, display_name`, [
    lower,
    hash,
    display_name.trim(),
  ]);
  const user = r.rows[0];
  await query(`INSERT INTO student_profiles(user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [user.id]);
  const token = signToken(user);
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const lower = parsed.data.email.toLowerCase();
  const r = await query(`SELECT id, email, role, display_name, password_hash FROM users WHERE email=$1`, [lower]);
  if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
  const u = r.rows[0];
  const ok = await bcrypt.compare(parsed.data.password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const { password_hash, ...safe } = u;
  const token = signToken(safe);
  res.json({ user: safe, token });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
