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

app.get('/health', async (_req, res) => {
  try {
    // Basic health check - don't fail if DB isn't configured yet
    if (process.env.DB_HOST) {
      const [rows] = await db.query('SELECT 1 as ok');
      const result = rows as any[];
      res.json({ ok: true, db: result[0].ok === 1 });
    } else {
      res.json({ ok: true, db: 'not configured' });
    }
  } catch (error) {
    // Return healthy even if DB fails during initial deployment
    res.json({ ok: true, db: 'unavailable', error: (error as Error).message });
  }
});

app.use('/auth', auth);
app.use('/reports', reports);
app.use('/agents', agents);
app.use('/creative', creative);

const port = Number(process.env.PORT || 8088);
app.listen(port, '0.0.0.0', () => console.log(`API listening on :${port}`));
