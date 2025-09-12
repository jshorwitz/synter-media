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
  const [rows] = await db.query('SELECT 1 as ok');
  res.json({ ok: true, db: rows[0].ok === 1 });
});

app.use('/auth', auth);
app.use('/reports', reports);
app.use('/agents', agents);
app.use('/creative', creative);

const port = Number(process.env.PORT || 8088);
app.listen(port, () => console.log(`API listening on :${port}`));
