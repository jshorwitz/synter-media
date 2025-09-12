import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { enqueueAgent } from '../lib/queue.js';
import { db } from '../lib/db.js';

export const router = Router();

router.get('/list', (_req, res) => {
  res.json({ agents: ['ingestor-google','ingestor-reddit','ingestor-x','touchpoint-extractor','conversion-uploader','budget-optimizer','analyst','creative'] });
});

router.get('/runs', requireAuth, requireRole(['admin','analyst','viewer']), async (req, res) => {
  const agent = (req.query.agent as string | undefined) || undefined;
  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 200);
  if (agent) {
    const [rows] = await db.query('SELECT * FROM agent_runs WHERE agent = ? ORDER BY id DESC LIMIT ?', [agent, limit]);
    return res.json({ data: rows });
  }
  const [rows] = await db.query('SELECT * FROM agent_runs ORDER BY id DESC LIMIT ?', [limit]);
  return res.json({ data: rows });
});

const RunSchema = z.object({
  agent: z.string(),
  window: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
  dryRun: z.boolean().optional(),
});

router.post('/run', requireAuth, requireRole(['admin','analyst']), async (req, res) => {
  const parse = RunSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'invalid_body', details: parse.error.flatten() });

  // Create a run_id row first (idempotent insert by unique key when re-run)
  const run_id = crypto.randomUUID();
  const agent = parse.data.agent;
  try {
    await db.query('INSERT INTO agent_runs (agent, run_id, ok) VALUES (?, ?, NULL)', [agent, run_id]);
  } catch (e) {
    // ignore duplicates
  }

  const msg = await enqueueAgent({ ...parse.data, agent, run_id });
  res.json({ ok: true, enqueued: msg });
});
