import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db';

const EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');
let warnedEphemeral = false;

function getSigningSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (!warnedEphemeral && process.env.GOO_SKIP_LISTEN !== '1') {
    warnedEphemeral = true;
    console.info('[auth] SESSION_SECRET not set; using ephemeral in-memory signing secret for this session.');
  }
  return EPHEMERAL_SECRET;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hashHex] = parts;
    if (!salt || !hashHex || !/^[0-9a-f]+$/i.test(hashHex)) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  userId: number;
  email: string;
  role: 'user' | 'astrologer' | 'admin';
  exp: number;
}

export function signToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: 'user' | 'astrologer' | 'admin';
    preferredLanguage: string;
  };
}

export function attachUserOptional(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    const session = verifyToken(token);
    if (session) {
      const row = db
        .prepare('SELECT id, email, full_name, role, preferred_language FROM users WHERE id = ?')
        .get(session.userId) as
        | { id: number; email: string; full_name: string; role: 'user' | 'astrologer' | 'admin'; preferred_language: string }
        | undefined;
      if (row) {
        req.user = {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          role: row.role,
          preferredLanguage: row.preferred_language,
        };
      }
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  attachUserOptional(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    next();
  });
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }
    next();
  });
}

// Simple sliding-window rate limiter
const rateBuckets = new Map<string, number[]>();

export function clearRateLimitBuckets(): void {
  rateBuckets.clear();
}

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const recent = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }
    recent.push(now);
    rateBuckets.set(key, recent);
    next();
  };
}
