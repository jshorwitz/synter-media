import { Db } from '../util/db.js';
export async function stepKeywords(db: Db, scan_id: string, brand: string) {
  await db.exec(`UPDATE scan_runs SET status='analyzing', progress=40 WHERE scan_id=?`, [scan_id]);

  // MOCK: seed KE-like results
  const terms = ['ai code assistant','intellij plugin','repo indexing'];
  for (const t of terms) {
    await db.exec(`INSERT INTO scan_keywords (scan_id, term, volume, cpc, competition, source) VALUES (?,?,?,?,?,?)`,
      [scan_id, t, 12000, 2.5, 0.38, 'ke']);
  }
  // Mock gaps
  await db.exec(`INSERT INTO scan_keywords (scan_id, term, source) VALUES (?,?,?),(?,?,?)`,
    [scan_id,'code review automation','heuristic', scan_id,'ide refactor assistant','heuristic']);

  return { ok: true };
}
