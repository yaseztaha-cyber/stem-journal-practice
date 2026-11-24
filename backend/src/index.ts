import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { pool } from './db';

import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import attemptRoutes from './routes/attempts';
import draftRoutes from './routes/drafts';
import sessionRoutes from './routes/sessions';
import progressRoutes from './routes/progress';
import projectRoutes from './routes/project';
import adminRoutes from './routes/admin';
import subjectRoutes from './routes/subjects';
import analyzeRoutes from './routes/analyze';
import academyRoutes from './routes/academy';
import researchRoutes from './routes/research';
import challengeRoutes from './routes/challenges';
import edpRoutes from './routes/edp';
import wordRoutes from './routes/words';
import contextRoutes from './routes/contexts';
import siteRoutes from './routes/site';
import communicationRoutes from './routes/communication';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];
      if (allowed.includes(origin) || origin === 'null' || /^app:\/\//i.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
const evalLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const analyzeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', async (_req, res) => {
  let db = false;
  try {
    await pool.query('SELECT 1');
    db = true;
  } catch {
    db = false;
  }
  res.json({ ok: true, version: '1.0.0', rubric: 'v1.0', db });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admin', adminRoutes);
// evaluation is inside attempts; apply stricter limit on POST
app.use('/api/attempts', (req, res, next) => (req.method === 'POST' ? evalLimiter(req, res, next) : next()), attemptRoutes);
app.use('/api/analyze', analyzeLimiter, analyzeRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/edp', edpRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/contexts', contextRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/communication', communicationRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// error handler (never leak internals, never lose content silently)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('unhandled error', err);
  res.status(500).json({ error: 'Something went wrong. Your work is safe — please try again.' });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`STEM Journal Practice API on :${config.port} (env=${config.nodeEnv})`);
  });
}

export default app;
