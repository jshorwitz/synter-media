import type { Request, Response, NextFunction } from 'express';
import { getUserBySession } from '../lib/auth.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid) return res.status(401).json({ error: 'unauthenticated' });
  const user = await getUserBySession(sid);
  if (!user) return res.status(401).json({ error: 'unauthenticated' });
  res.locals.user = user;
  next();
}

export function requireRole(roles: Array<'admin' | 'analyst' | 'viewer'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role as any)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}
