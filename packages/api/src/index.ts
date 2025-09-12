import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router as auth } from './routes/auth.js';
import { router as reports } from './routes/reports.js';
import { router as agents } from './routes/agents.js';
import { router as creative } from './routes/creative.js';
import { db } from './lib/db.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  // Fast, non-blocking healthcheck for platform probes
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Optional DB health (may block); do not use for platform health checks
app.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as ok');
    const result = rows as any[];
    res.json({ ok: true, db: result[0].ok === 1 });
  } catch (error) {
    res.status(200).json({ ok: false, db: 'unavailable', error: (error as Error).message });
  }
});

app.use('/auth', auth);
app.use('/reports', reports);
app.use('/agents', agents);
app.use('/creative', creative);

const port = Number(process.env.PORT || 8088);
app.listen(port, '0.0.0.0', () => console.log(`API listening on :${port}`));
