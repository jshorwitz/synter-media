import { db } from '../../lib/db.js';
function ymd(d) { return d.toISOString().slice(0, 10); }
export async function ingestorX(date) {
    if (process.env.MOCK_TWITTER !== 'true') {
        console.log('ingestor-x: MOCK_TWITTER != true, skipping');
        return;
    }
    const day = ymd(date);
    const platform = 'x';
    const rows = Array.from({ length: 3 }).map((_, i) => {
        const idx = i + 1;
        return {
            platform,
            date: day,
            account_id: 'x_acc_1',
            campaign_id: `x_c_${idx}`,
            adgroup_id: `x_ag_${idx}`,
            ad_id: `x_ad_${idx}`,
            impressions: 800 + idx * 90,
            clicks: 35 + idx * 3,
            spend: +(15 + idx * 2.8).toFixed(2),
            conversions: 1 + (idx % 3),
            revenue: +((1 + (idx % 3)) * 45).toFixed(2),
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
    console.log(`ingestor-x: upserted ${rows.length} rows for ${day}`);
}
