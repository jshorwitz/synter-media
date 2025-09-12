import { Db } from '../util/db.js';
export async function stepDiscover(db: Db, scan_id: string, domain: string) {
  // Update status
  await db.exec(`UPDATE scan_runs SET status='discovering', progress=10, started_at=NOW(6) WHERE scan_id=?`, [scan_id]);

  // MOCK path: seed with fixture ads if enabled
  const mock = (process.env.MOCK_DISCOVERY === 'true');
  if (mock) {
    const now = new Date();
    await db.exec(`INSERT INTO scan_ads (scan_id, source, title, text, landing_url, captured_at) VALUES
      (?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?)`,
      [scan_id,'google','Faster Code in JetBrains','Repo-aware AI. Try free.','https://example.com', now,
       scan_id,'reddit','AI that knows your codebase','Fix bugs faster with context.','https://example.com', now,
       scan_id,'x','Ship faster with AI','Context-aware suggestions.','https://example.com', now]);
  }
  // TODO: real discovery (Google Ads Transparency parsing, etc.)

  // Mock competitors
  await db.exec(`INSERT INTO scan_competitors (scan_id,name) VALUES (?,?),(?,?)`, [scan_id,'CompetitorOne', scan_id,'CompetitorTwo']);

  return { ok: true };
}
