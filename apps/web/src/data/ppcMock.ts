export type RecommendationType = 'keywords' | 'budgets' | 'bids' | 'ad_copy' | 'audience';
export type Priority = 'high' | 'medium' | 'low';
export type Status = 'proposed' | 'applied' | 'dismissed';

export interface PpcRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  potentialSavingsUSD: number;
  impact: {
    expectedCPAChangePct?: number;
    expectedROASChangePct?: number;
    expectedConvLiftPct?: number;
    expectedReachGainPct?: number;
  };
  campaign: string;
  adGroup?: string;
  createdAt: string;
}

export interface PpcMock {
  lastUpdated: string;
  summary: {
    potentialSavingsUSD: number;
    appliedSavingsToDateUSD: number;
    countsByPriority: Record<Priority, number>;
    countsByStatus: Record<Status, number>;
  };
  charts: {
    dailyDates: string[];
    cpaBaseline: number[];
    cpaProjected: number[];
    roasBaseline: number[];
    roasProjected: number[];
    conversionsBaseline: number[];
    conversionsProjected: number[];
    spendBaselineUSD: number[];
    spendProjectedUSD: number[];
    savingsByTypeUSD: Record<RecommendationType, number>;
  };
  recommendations: PpcRecommendation[];
}

export const ppcMock: PpcMock = {
  lastUpdated: new Date().toISOString(),
  summary: {
    potentialSavingsUSD: 12850,
    appliedSavingsToDateUSD: 3120,
    countsByPriority: { high: 5, medium: 4, low: 3 },
    countsByStatus: { proposed: 7, applied: 3, dismissed: 2 },
  },
  charts: {
    dailyDates: [
      '2025-10-05','2025-10-06','2025-10-07','2025-10-08','2025-10-09','2025-10-10','2025-10-11',
      '2025-10-12','2025-10-13','2025-10-14','2025-10-15','2025-10-16','2025-10-17','2025-10-18'
    ],
    cpaBaseline:          [52,51,50,51,49,50,49,48,49,48,47,48,47,47],
    cpaProjected:         [52,51,50,49,47,46,45,45,44,44,43,43,42,42],
    roasBaseline:         [2.8,2.9,2.7,2.8,2.9,2.8,2.9,2.8,2.9,3.0,2.9,3.0,3.0,3.1],
    roasProjected:        [2.8,2.9,2.8,3.0,3.1,3.2,3.3,3.3,3.4,3.4,3.5,3.5,3.6,3.6],
    conversionsBaseline:  [62,64,61,63,66,65,64,67,68,70,69,71,72,73],
    conversionsProjected: [62,64,63,66,70,72,75,77,79,81,83,84,86,88],
    spendBaselineUSD:     [820,815,830,810,825,835,840,845,850,855,860,870,875,880],
    spendProjectedUSD:    [820,815,828,800,805,810,812,815,818,820,822,825,828,830],
    savingsByTypeUSD: {
      keywords: 3450,
      budgets:  2800,
      bids:     2550,
      ad_copy:  1950,
      audience: 2100
    }
  },
  recommendations: [
    {
      id: 'r1',
      type: 'keywords',
      title: 'Add 12 long-tail keywords to "Brand Shoes – US"',
      description: 'Identify high-intent variants with low CPC and strong historical CVR; expected CPA drop from $48 to $43.',
      priority: 'high',
      status: 'proposed',
      potentialSavingsUSD: 1400,
      impact: { expectedCPAChangePct: -10, expectedROASChangePct: 8, expectedConvLiftPct: 12 },
      campaign: 'Brand – US',
      adGroup: 'Brand Shoes',
      createdAt: '2025-10-16T09:00:00Z'
    },
    {
      id: 'r2',
      type: 'budgets',
      title: 'Reallocate $500/day from "Generic Apparel – CA" to "Brand – US"',
      description: 'Shift budget from low-ROAS to high-ROAS campaign based on last 14 days.',
      priority: 'high',
      status: 'proposed',
      potentialSavingsUSD: 1800,
      impact: { expectedROASChangePct: 12, expectedConvLiftPct: 9, expectedReachGainPct: 5 },
      campaign: 'Brand – US',
      createdAt: '2025-10-15T14:20:00Z'
    },
    {
      id: 'r3',
      type: 'bids',
      title: 'Lower bids by 12% on non-brand mobile terms',
      description: 'Reduce CPC on low-margin segments while preserving volume.',
      priority: 'high',
      status: 'applied',
      potentialSavingsUSD: 950,
      impact: { expectedCPAChangePct: -8, expectedConvLiftPct: 3 },
      campaign: 'Generic – US',
      createdAt: '2025-10-12T11:10:00Z'
    },
    {
      id: 'r4',
      type: 'ad_copy',
      title: 'Test new headline variant with free shipping CTA',
      description: 'A/B test suggests +6% CTR and +4% CVR; roll out to top 3 ad groups.',
      priority: 'medium',
      status: 'proposed',
      potentialSavingsUSD: 1200,
      impact: { expectedConvLiftPct: 6, expectedROASChangePct: 5 },
      campaign: 'Brand – US',
      createdAt: '2025-10-17T08:15:00Z'
    },
    {
      id: 'r5',
      type: 'audience',
      title: 'Expand to Similar Audiences (7-day cart viewers)',
      description: 'Add lookalikes with bid cap to control CPA; incremental reach ~8%.',
      priority: 'medium',
      status: 'proposed',
      potentialSavingsUSD: 1100,
      impact: { expectedReachGainPct: 8, expectedCPAChangePct: -6 },
      campaign: 'Remarketing – US',
      createdAt: '2025-10-14T16:35:00Z'
    },
    {
      id: 'r6',
      type: 'keywords',
      title: 'Pause 9 non-converting broad keywords',
      description: 'Low CTR and zero conversions over 30 days; reallocate budget.',
      priority: 'high',
      status: 'applied',
      potentialSavingsUSD: 1250,
      impact: { expectedCPAChangePct: -12 },
      campaign: 'Generic – US',
      adGroup: 'Broad Shoes',
      createdAt: '2025-10-10T10:05:00Z'
    },
    {
      id: 'r7',
      type: 'budgets',
      title: 'Increase daily cap by $300 on "Brand – US" (limited by budget)',
      description: 'Campaign is hitting limits before peak hours; incremental conversions expected.',
      priority: 'medium',
      status: 'proposed',
      potentialSavingsUSD: 900,
      impact: { expectedConvLiftPct: 7, expectedROASChangePct: 6 },
      campaign: 'Brand – US',
      createdAt: '2025-10-16T19:25:00Z'
    },
    {
      id: 'r8',
      type: 'bids',
      title: 'Raise bids by 8% for high-CVR exact terms (desktop)',
      description: 'Capture more impression share on profitable SKUs.',
      priority: 'low',
      status: 'proposed',
      potentialSavingsUSD: 700,
      impact: { expectedROASChangePct: 5, expectedConvLiftPct: 4 },
      campaign: 'Brand – US',
      createdAt: '2025-10-13T07:40:00Z'
    },
    {
      id: 'r9',
      type: 'ad_copy',
      title: 'Retire underperforming description lines (low CTR)',
      description: 'Consolidate creative to variants with CTR > 4.5%.',
      priority: 'low',
      status: 'dismissed',
      potentialSavingsUSD: 500,
      impact: { expectedCPAChangePct: -3 },
      campaign: 'Generic – US',
      createdAt: '2025-10-09T09:30:00Z'
    },
    {
      id: 'r10',
      type: 'audience',
      title: 'Exclude recent purchasers (30 days) from prospecting',
      description: 'Reduce wasted spend on users unlikely to convert again immediately.',
      priority: 'high',
      status: 'proposed',
      potentialSavingsUSD: 1550,
      impact: { expectedCPAChangePct: -9 },
      campaign: 'Prospecting – US',
      createdAt: '2025-10-17T13:00:00Z'
    },
    {
      id: 'r11',
      type: 'keywords',
      title: 'Switch match type: Broad → Phrase on 5 head terms',
      description: 'Improve relevance and quality score; maintain volume via negatives.',
      priority: 'medium',
      status: 'applied',
      potentialSavingsUSD: 920,
      impact: { expectedCPAChangePct: -7, expectedROASChangePct: 4 },
      campaign: 'Generic – CA',
      createdAt: '2025-10-11T18:45:00Z'
    },
    {
      id: 'r12',
      type: 'budgets',
      title: 'Cap spend during 1–5am (hourly schedule)',
      description: 'Time-of-day performance analysis shows CPA +34% overnight.',
      priority: 'low',
      status: 'dismissed',
      potentialSavingsUSD: 730,
      impact: { expectedCPAChangePct: -5 },
      campaign: 'Brand – US',
      createdAt: '2025-10-08T06:10:00Z'
    }
  ]
};
