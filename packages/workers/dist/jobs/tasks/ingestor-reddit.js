import { db } from '../../lib/db.js';
function ymd(d) { return d.toISOString().slice(0, 10); }
export async function ingestorReddit(date) {
    if (process.env.MOCK_REDDIT !== 'true') {
        console.log('ingestor-reddit: MOCK_REDDIT != true, skipping');
        return;
    }
    const day = ymd(date);
    const platform = 'reddit';
    const rows = Array.from({ length: 3 }).map((_, i) => {
        const idx = i + 1;
        return {
            platform,
            date: day,
            account_id: 'r_acc_1',
            campaign_id: `r_c_${idx}`,
            adgroup_id: `r_ag_${idx}`,
            ad_id: `r_ad_${idx}`,
            impressions: 500 + idx * 77,
            clicks: 25 + idx * 4,
            spend: +(12 + idx * 2.25).toFixed(2),
            conversions: 1 + (idx % 2),
            revenue: +((1 + (idx % 2)) * 40).toFixed(2),
            raw: { mock: true, idx }
        };
    });
    const sql = `
    INSERT INTO ad_metrics
      (platform, date, account_id, campaign_id, adgroup_id, ad_id, impressions, clicks, spend, conversions, revenue, raw)
    VALUES ${rows.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?)').join(',')}
    ON DUPLICATE KEY UPDATE impressions=VALUES(impressions), clicks=VALUES(clicks), spend=VALUES(spend), conversions=VALUES(conversions), revenue=VALUES(revenue), raw=VALUES(raw)
  `;
    const params = [];
    for (const r of rows) {
        params.push(r.platform, r.date, r.account_id, r.campaign_id, r.adgroup_id, r.ad_id, r.impressions, r.clicks, r.spend, r.conversions, r.revenue, JSON.stringify(r.raw));
    }
    await db.query(sql, params);
    console.log(`ingestor-reddit: upserted ${rows.length} rows for ${day}`);
}
