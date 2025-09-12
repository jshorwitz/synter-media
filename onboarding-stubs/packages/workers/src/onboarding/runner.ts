import { Db } from '../util/db.js';
import { stepDiscover } from './stepDiscover.js';
import { stepKeywords } from './stepKeywords.js';
import { stepKpiEstimate } from './stepKpiEstimate.js';
import { stepLlm } from './stepLlm.js';

/**
 * Polls for queued scans and processes them sequentially.
 * Replace with a real queue (BullMQ) in production.
 */
export async function runOnboardingLoop(db: Db) {
  console.log('[onboarding] loop started');
  while (true) {
    const [rows]: any = await db.conn.query(`SELECT * FROM scan_runs WHERE status IN ('queued') ORDER BY started_at ASC LIMIT 1`);
    if (rows.length === 0) {
      await sleep(1500);
      continue;
    }
    const run = rows[0];
    try {
      const domain = run.domain;
      await db.exec(`UPDATE scan_runs SET started_at=NOW(6) WHERE scan_id=?`, [run.scan_id]);
      await stepDiscover(db, run.scan_id, domain);
      await stepKeywords(db, run.scan_id, domain.split('.')[0]);
      await stepKpiEstimate(db, run.scan_id);
      await stepLlm(db, run.scan_id, domain.split('.')[0], domain);
    } catch (e:any) {
      console.error('[onboarding] error', e);
      await db.exec(`UPDATE scan_runs SET status='error', error=? WHERE scan_id=?`, [String(e?.message || e), run.scan_id]);
    }
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
