import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../lib/db.js';

export const router = Router();

function makeScanId(): string {
  return crypto.randomBytes(12).toString('hex'); // 24 chars
}

/**
 * POST /onboarding/scan
 * Body: { url: string }
 */
router.post('/scan', async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
    const scan_id = makeScanId();
    const domain = new URL(url).hostname.replace(/^www\./,'').toLowerCase();
    await db.query(
      `INSERT INTO scan_runs (scan_id, url, domain, status, progress, mock) VALUES (?,?,?,?,?,?)`,
      [scan_id, url, domain, 'queued', 0, process.env.MOCK_DISCOVERY === 'true']
    );
    // Enqueue job: here we simply write a row the worker will pick up (or you can push to a queue)
    res.json({ scan_id });
  } catch (e) { next(e); }
});

/**
 * GET /onboarding/status?scan_id=...
 */
router.get('/status', async (req, res, next) => {
  try {
    const { scan_id } = req.query as any;
    const [rows] = await db.query(`SELECT scan_id, status, progress, mock, started_at, finished_at, error FROM scan_runs WHERE scan_id=?`, [scan_id]);
    if (!(rows as any[]).length) return res.status(404).json({ error: 'not found' });
    res.json((rows as any[])[0]);
  } catch (e) { next(e); }
});

/**
 * GET /onboarding/result?scan_id=...
 */
router.get('/result', async (req, res, next) => {
  try {
    const { scan_id } = req.query as any;
    const [[run]] = await db.query(`SELECT * FROM scan_runs WHERE scan_id=?`, [scan_id]);
    if (!run) return res.status(404).json({ error: 'not found' });

    const [ads] = await db.query(`SELECT source,title,text,image_url,landing_url,captured_at FROM scan_ads WHERE scan_id=?`, [scan_id]);
    const [kws] = await db.query(`SELECT term,volume,cpc,competition,source FROM scan_keywords WHERE scan_id=?`, [scan_id]);
    const [comps] = await db.query(`SELECT name FROM scan_competitors WHERE scan_id=?`, [scan_id]);
    const [[kpi]] = await db.query(`SELECT impressions,clicks,ctr,cpc,cac FROM scan_kpis WHERE scan_id=?`, [scan_id]);
    const [[llm]] = await db.query(`SELECT summary_md, personas_md, plan_json FROM scan_llm WHERE scan_id=?`, [scan_id]);

    // simple brand guess
    const brand = { name: run.domain.split('.')[0].replace(/\b\w/g, (c:any)=>c.toUpperCase()), domain: run.domain };

    res.json({
      brand,
      ads: groupAds(ads as any[]),
      keywords: splitKeywords(kws as any[]),
      kpis: kpi || {},
      competitors: (comps as any[]).map(r=>r.name),
      llm: llm || {},
      meta: { elapsed_ms: run.finished_at ? (new Date(run.finished_at)-new Date(run.started_at)) : null, mock: !!run.mock }
    });
  } catch (e) { next(e); }
});

function groupAds(rows: any[]) {
  const out: any = { google: [], reddit: [], x: [] };
  for (const r of rows) {
    if (r.source in out) out[r.source].push(r);
  }
  return out;
}
function splitKeywords(rows: any[]) {
  return {
    discovered: rows.filter((r:any)=> r.source !== 'heuristic'),
    gaps: rows.filter((r:any)=> r.source === 'heuristic')
  };
}

export default router;
