import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../db';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'admin';
  display_name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    const r = await query(`SELECT id, email, role, display_name FROM users WHERE id=$1`, [payload.id]);
    if (r.rows.length === 0) {
      // Token is well-formed but the account is gone (e.g. database was reset/
      // reseeded). Tell the client to sign in again instead of erroring forever.
      return res.status(401).json({ error: 'Account not found — please sign in again', code: 'token_invalid' });
    }
    req.user = r.rows[0] as AuthUser;
    next();
  } catch (e: any) {
    if (e?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired — please sign in again', code: 'token_expired' });
    }
    return res.status(401).json({ error: 'Invalid access token — please sign in again', code: 'token_invalid' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
