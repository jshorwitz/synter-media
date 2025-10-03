import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type QueryResult = {
  message: string;
  data?: any;
};

// Get top performing campaigns by a metric
export async function getTopCampaigns(
  metric: 'spend' | 'clicks' | 'conversions' | 'roas' = 'conversions',
  limit: number = 5,
  days: number = 30
): Promise<QueryResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const campaigns = await prisma.$queryRaw<any[]>`
    SELECT 
      campaign_id,
      campaign_name,
      platform,
      SUM(spend) as total_spend,
      SUM(clicks) as total_clicks,
      SUM(conversions) as total_conversions,
      CASE 
        WHEN SUM(spend) > 0 THEN SUM(conversions) / SUM(spend)
        ELSE 0 
      END as roas
    FROM ad_metrics
    WHERE date >= ${startDate.toISOString().split('T')[0]}
    GROUP BY campaign_id, campaign_name, platform
    ORDER BY ${metric === 'roas' ? 'roas' : `total_${metric}`} DESC
    LIMIT ${limit}
  `;

  if (campaigns.length === 0) {
    return {
      message: "I couldn't find any campaign data for the specified period.",
    };
  }

  const metricLabel = metric === 'roas' ? 'ROAS' : metric;
  const topCampaign = campaigns[0];

  let message = `Your top performing campaign by ${metricLabel} is **${topCampaign.campaign_name}** (${topCampaign.platform}).\n\n`;
  message += `**Stats (last ${days} days):**\n`;
  message += `- Spend: $${Number(topCampaign.total_spend).toFixed(2)}\n`;
  message += `- Clicks: ${topCampaign.total_clicks}\n`;
  message += `- Conversions: ${topCampaign.total_conversions}\n`;
  message += `- ROAS: ${Number(topCampaign.roas).toFixed(2)}x`;

  return {
    message,
    data: campaigns,
  };
}

// Get spend trends over time
export async function getSpendTrends(days: number = 30, platform?: string): Promise<QueryResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const query = platform
    ? `SELECT date, platform, SUM(spend) as total_spend
       FROM ad_metrics
       WHERE date >= ${startDate.toISOString().split('T')[0]} AND platform = '${platform}'
       GROUP BY date, platform
       ORDER BY date ASC`
    : `SELECT date, platform, SUM(spend) as total_spend
       FROM ad_metrics
       WHERE date >= ${startDate.toISOString().split('T')[0]}
       GROUP BY date, platform
       ORDER BY date ASC`;

  const trends = await prisma.$queryRawUnsafe<any[]>(query);

  if (trends.length === 0) {
    return {
      message: `No spend data found for the last ${days} days${platform ? ` on ${platform}` : ''}.`,
    };
  }

  const totalSpend = trends.reduce((sum, row) => sum + Number(row.total_spend), 0);
  const avgDailySpend = totalSpend / days;

  let message = `**Spend Trends (last ${days} days${platform ? ` - ${platform}` : ''}):**\n\n`;
  message += `- Total Spend: $${totalSpend.toFixed(2)}\n`;
  message += `- Average Daily Spend: $${avgDailySpend.toFixed(2)}\n`;
  message += `- Days with data: ${new Set(trends.map(t => t.date)).size}`;

  return {
    message,
    data: trends,
  };
}

// Get campaign performance metrics
export async function getCampaignMetrics(campaignName: string): Promise<QueryResult> {
  const metrics = await prisma.$queryRaw<any[]>`
    SELECT 
      campaign_id,
      campaign_name,
      platform,
      SUM(impressions) as total_impressions,
      SUM(clicks) as total_clicks,
      SUM(spend) as total_spend,
      SUM(conversions) as total_conversions,
      CASE 
        WHEN SUM(impressions) > 0 THEN (SUM(clicks)::float / SUM(impressions)) * 100
        ELSE 0 
      END as ctr,
      CASE 
        WHEN SUM(clicks) > 0 THEN SUM(spend) / SUM(clicks)
        ELSE 0 
      END as cpc,
      CASE 
        WHEN SUM(conversions) > 0 THEN SUM(spend) / SUM(conversions)
        ELSE 0 
      END as cpa
    FROM ad_metrics
    WHERE campaign_name ILIKE ${`%${campaignName}%`}
    GROUP BY campaign_id, campaign_name, platform
    LIMIT 1
  `;

  if (metrics.length === 0) {
    return {
      message: `I couldn't find a campaign matching "${campaignName}". Try checking the campaign name or list all campaigns.`,
    };
  }

  const m = metrics[0];
  let message = `**${m.campaign_name}** (${m.platform})\n\n`;
  message += `- Impressions: ${Number(m.total_impressions).toLocaleString()}\n`;
  message += `- Clicks: ${Number(m.total_clicks).toLocaleString()}\n`;
  message += `- CTR: ${Number(m.ctr).toFixed(2)}%\n`;
  message += `- Spend: $${Number(m.total_spend).toFixed(2)}\n`;
  message += `- CPC: $${Number(m.cpc).toFixed(2)}\n`;
  message += `- Conversions: ${m.total_conversions}\n`;
  message += `- CPA: $${Number(m.cpa).toFixed(2)}`;

  return {
    message,
    data: m,
  };
}

// Get platform comparison
export async function getPlatformComparison(days: number = 30): Promise<QueryResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const comparison = await prisma.$queryRaw<any[]>`
    SELECT 
      platform,
      COUNT(DISTINCT campaign_id) as campaign_count,
      SUM(spend) as total_spend,
      SUM(clicks) as total_clicks,
      SUM(conversions) as total_conversions,
      CASE 
        WHEN SUM(spend) > 0 THEN SUM(conversions) / SUM(spend)
        ELSE 0 
      END as roas
    FROM ad_metrics
    WHERE date >= ${startDate.toISOString().split('T')[0]}
    GROUP BY platform
    ORDER BY total_spend DESC
  `;

  if (comparison.length === 0) {
    return {
      message: `No platform data found for the last ${days} days.`,
    };
  }

  let message = `**Platform Comparison (last ${days} days):**\n\n`;
  comparison.forEach((p) => {
    message += `**${p.platform.toUpperCase()}**\n`;
    message += `- Campaigns: ${p.campaign_count}\n`;
    message += `- Spend: $${Number(p.total_spend).toFixed(2)}\n`;
    message += `- Conversions: ${p.total_conversions}\n`;
    message += `- ROAS: ${Number(p.roas).toFixed(2)}x\n\n`;
  });

  return {
    message,
    data: comparison,
  };
}

// Get CAC (Customer Acquisition Cost) analysis
export async function getCACAnalysis(days: number = 30): Promise<QueryResult> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const cac = await prisma.$queryRaw<any[]>`
    SELECT 
      platform,
      campaign_name,
      SUM(spend) as total_spend,
      SUM(conversions) as total_conversions,
      CASE 
        WHEN SUM(conversions) > 0 THEN SUM(spend) / SUM(conversions)
        ELSE 0 
      END as cac
    FROM ad_metrics
    WHERE date >= ${startDate.toISOString().split('T')[0]}
    GROUP BY platform, campaign_name
    HAVING SUM(conversions) > 0
    ORDER BY cac ASC
    LIMIT 10
  `;

  if (cac.length === 0) {
    return {
      message: `No conversion data found for CAC analysis in the last ${days} days.`,
    };
  }

  const bestCAC = cac[0];
  const worstCAC = cac[cac.length - 1];

  let message = `**CAC Analysis (last ${days} days):**\n\n`;
  message += `**Best CAC:** ${bestCAC.campaign_name} - $${Number(bestCAC.cac).toFixed(2)}\n`;
  message += `**Worst CAC:** ${worstCAC.campaign_name} - $${Number(worstCAC.cac).toFixed(2)}\n\n`;
  message += `Average CAC across all campaigns: $${(
    cac.reduce((sum, c) => sum + Number(c.cac), 0) / cac.length
  ).toFixed(2)}`;

  return {
    message,
    data: cac,
  };
}
