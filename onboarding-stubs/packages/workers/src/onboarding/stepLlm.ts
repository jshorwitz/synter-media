import { Db } from '../util/db.js';
export async function stepLlm(db: Db, scan_id: string, brand: string, domain: string) {
  await db.exec(`UPDATE scan_runs SET status='summarizing', progress=85 WHERE scan_id=?`, [scan_id]);

  // Stub: generate a placeholder markdown summary & personas
  const summary = `### KPI Summary\n- Estimates based on public signals for **${brand}** (${domain}).\n- CTR ~2.4%, CPC ~$2.10, CAC ~$180.`;
  const personas = `### Personas\n1) Backend Engineer\n2) DevOps Lead\n3) Engineering Manager\n\nEach: prioritize Google Search + Reddit dev subs; emphasize repo-aware AI.`;
  const plan = { brand, timeframe: new Date().toISOString().slice(0,10), channels: { google: [], reddit: [], x: [] } };

  await db.exec(`INSERT INTO scan_llm (scan_id, summary_md, personas_md, plan_json) VALUES (?,?,?,?)`,
    [scan_id, summary, personas, JSON.stringify(plan)]);

  await db.exec(`UPDATE scan_runs SET status='done', progress=100, finished_at=NOW(6) WHERE scan_id=?`, [scan_id]);
  return { ok: true };
}
