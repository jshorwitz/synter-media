import { Router } from 'express';
import { db } from '../lib/db.js';
export const router = Router();

router.get('/kpis', async (req, res) => {
  const { start, end } = req.query as any;
  const [rows] = await db.query(`
    SELECT platform, date, SUM(spend) as spend, SUM(clicks) as clicks, SUM(conversions) as conversions
    FROM ad_metrics
    WHERE date BETWEEN ? AND ?
    GROUP BY platform, date
    ORDER BY date ASC
  `, [start, end]);
  res.json({ data: rows });
});

router.get('/attribution', async (req, res) => {
  const { start, end } = req.query as any;
  const [rows] = await db.query(`
    SELECT * FROM fact_attribution_last_touch
    WHERE conversion_time BETWEEN ? AND ?
  `, [start, end]);
  res.json({ data: rows });
});
