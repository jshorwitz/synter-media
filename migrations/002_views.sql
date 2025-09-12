CREATE OR REPLACE VIEW fact_attribution_last_touch AS
SELECT
  c.id as conversion_id,
  c.user_id,
  c.event_name as conversion_event,
  c.ts as conversion_time,
  tp.platform,
  tp.campaign,
  tp.adgroup,
  tp.ad_id
FROM conversions c
LEFT JOIN LATERAL (
  SELECT * FROM touchpoints t
  WHERE t.user_id = c.user_id
    AND t.ts <= c.ts
    AND (t.medium IS NULL OR t.medium <> 'direct')
  ORDER BY t.ts DESC
  LIMIT 1
) tp ON true;
