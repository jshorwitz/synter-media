import { db } from '../../lib/db.js';
export async function touchpointExtractor() {
    // Naive pass: derive touchpoints from recent events (last 3 days) with relevant identifiers
    const [insertResult] = await db.query(`INSERT INTO touchpoints (
       user_id, ts, platform, campaign, adgroup, ad_id, medium, source,
       gclid, rdt_cid, twclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, properties
     )
     SELECT
       e.user_id,
       e.ts,
       CASE
         WHEN e.gclid IS NOT NULL OR e.gbraid IS NOT NULL OR e.wbraid IS NOT NULL THEN 'google'
         WHEN e.rdt_cid IS NOT NULL THEN 'reddit'
         WHEN e.twclid IS NOT NULL THEN 'x'
         ELSE 'other'
       END as platform,
       e.utm_campaign as campaign,
       NULL as adgroup,
       NULL as ad_id,
       e.utm_medium as medium,
       e.utm_source as source,
       e.gclid,
       e.rdt_cid,
       e.twclid,
       e.utm_source,
       e.utm_medium,
       e.utm_campaign,
       e.utm_term,
       e.utm_content,
       JSON_OBJECT('referrer', e.referrer)
     FROM events e
     WHERE e.ts >= (NOW() - INTERVAL 3 DAY)
       AND (
         e.gclid IS NOT NULL OR e.gbraid IS NOT NULL OR e.wbraid IS NOT NULL OR
         e.rdt_cid IS NOT NULL OR e.twclid IS NOT NULL OR
         e.utm_source IS NOT NULL OR e.utm_medium IS NOT NULL OR e.utm_campaign IS NOT NULL
       )
  `);
    const affected = insertResult.affectedRows ?? 0;
    console.log(`touchpoint-extractor: inserted ~${affected} touchpoints from recent events`);
}
