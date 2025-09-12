import { Db } from '../util/db.js';
export async function stepKpiEstimate(db: Db, scan_id: string) {
  await db.exec(`UPDATE scan_runs SET status='analyzing', progress=60 WHERE scan_id=?`, [scan_id]);
  // Simple heuristic KPI estimate
  const impressions = 50000, clicks = 1200;
  const ctr = clicks / impressions;
  const cpc = 2.1;
  const cac = 180;
  await db.exec(`INSERT INTO scan_kpis (scan_id, impressions, clicks, ctr, cpc, cac) VALUES (?,?,?,?,?,?)`,
    [scan_id, impressions, clicks, ctr, cpc, cac]);
  return { ok: true };
}
