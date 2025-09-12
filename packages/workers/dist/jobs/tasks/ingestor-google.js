import { db } from '../../lib/db.js';
function ymd(d) {
    return d.toISOString().slice(0, 10);
}
export async function ingestorGoogle(date) {
    const day = ymd(date);
    const platform = 'google';
    const rows = [];
    for (let i = 1; i <= 5; i++) {
        const account = 'g_acc_1';
        const campaign = `g_c_${i}`;
        const adgroup = `g_ag_${i}`;
        const ad = `g_ad_${i}`;
        const impressions = 1000 + i * 111;
        const clicks = 50 + i * 5;
        const spend = +(20 + i * 3.5).toFixed(2);
        const conversions = 2 + (i % 3);
        const revenue = +(conversions * 50).toFixed(2);
        rows.push({
            platform,
            date: day,
            account_id: account,
            campaign_id: campaign,
            adgroup_id: adgroup,
            ad_id: ad,
            impressions,
            clicks,
            spend,
            conversions,
            revenue,
            raw: { mock: true, i }
        });
    }
    const sql = `
    INSERT INTO ad_metrics
      (platform, date, account_id, campaign_id, adgroup_id, ad_id, impressions, clicks, spend, conversions, revenue, raw)
    VALUES
      ${rows.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?)').join(',')}
    ON DUPLICATE KEY UPDATE
      impressions = VALUES(impressions),
      clicks = VALUES(clicks),
      spend = VALUES(spend),
      conversions = VALUES(conversions),
      revenue = VALUES(revenue),
      raw = VALUES(raw)
  `;
    const params = [];
    for (const r of rows) {
        params.push(r.platform, r.date, r.account_id, r.campaign_id, r.adgroup_id, r.ad_id, r.impressions, r.clicks, r.spend, r.conversions, r.revenue, JSON.stringify(r.raw));
    }
    await db.query(sql, params);
    console.log(`ingestor-google: upserted ${rows.length} rows for ${day}`);
}
