import { Router } from 'express';
export const router = Router();
// Minimal stubs; replace with real auth implementation
router.post('/signup', (req, res) => res.json({ ok: true }));
router.post('/login', (req, res) => res.json({ ok: true, sid: 'stub' }));
router.post('/logout', (req, res) => res.json({ ok: true }));
router.get('/me', (req, res) => res.json({ id: 1, email: 'you@example.com', role: 'admin' }));
