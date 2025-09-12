import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { cookieOptions, createSession, destroySession, hashPassword, verifyPassword, getUserBySession } from '../lib/auth.js';

export const router = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).optional(),
  name: z.string().min(1).max(128).optional(),
});

router.post('/signup', async (req, res) => {
  const parse = SignupSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body', details: parse.error.flatten() });
  const { email, password, name } = parse.data;

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if ((existing as any[]).length > 0) return res.status(409).json({ error: 'email_exists' });

  let password_hash: string | null = null;
  if (password) {
    password_hash = await hashPassword(password);
  }

  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [email, password_hash, name || null, 'viewer']
  );

  if (!password) {
    return res.status(202).json({ ok: true, message: 'User created; magic link flow not yet enabled. Set a password to login.' });
  }

  const userId = (result as any).insertId as number;
  const sid = await createSession(userId, req.get('user-agent') || undefined, req.ip);
  res.cookie('sid', sid, cookieOptions());
  return res.json({ ok: true });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body', details: parse.error.flatten() });
  const { email, password } = parse.data;

  const [rows] = await db.query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
  const arr = rows as any[];
  if (!arr || arr.length === 0) return res.status(401).json({ error: 'invalid_credentials' });
  const { id, password_hash } = arr[0] as { id: number; password_hash: string | null };

  const ok = await verifyPassword(password, password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const sid = await createSession(id, req.get('user-agent') || undefined, req.ip);
  res.cookie('sid', sid, cookieOptions());
  return res.json({ ok: true });
});

router.post('/logout', async (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (sid) {
    await destroySession(sid);
    res.clearCookie('sid', { path: '/' });
  }
  return res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid) return res.status(401).json({ error: 'unauthenticated' });
  const user = await getUserBySession(sid);
  if (!user) return res.status(401).json({ error: 'unauthenticated' });
  return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});
