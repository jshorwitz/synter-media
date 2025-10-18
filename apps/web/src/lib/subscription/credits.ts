export type CreditAction = 
  | 'chat_query'
  | 'campaign_launch'
  | 'budget_optimization'
  | 'attribution_analysis'
  | 'platform_connection'
  | 'api_call';

export type CreditCost = {
  action: CreditAction;
  cost: number; // in credits
  description: string;
};

// Credit pricing
export const CREDIT_COSTS: Record<CreditAction, CreditCost> = {
  chat_query: {
    action: 'chat_query',
    cost: 0.5, // ~200 queries per 100 credits = 1+ hour of chatting
    description: 'Ask the AI assistant a question',
  },
  campaign_launch: {
    action: 'campaign_launch',
    cost: 10,
    description: 'Launch a new advertising campaign',
  },
  budget_optimization: {
    action: 'budget_optimization',
    cost: 5,
    description: 'Run budget optimization agent',
  },
  attribution_analysis: {
    action: 'attribution_analysis',
    cost: 3,
    description: 'Generate attribution report',
  },
  platform_connection: {
    action: 'platform_connection',
    cost: 0,
    description: 'Connect a new platform (free)',
  },
  api_call: {
    action: 'api_call',
    cost: 2,
    description: 'API request',
  },
};

// Credit packages for purchase
export type CreditPackage = {
  id: string;
  credits: number;
  price: number; // USD
  bonus: number; // bonus credits
  popular?: boolean;
  stripePriceId?: string;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'tier_10',
    credits: 100,
    price: 10,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_10_PRICE_ID,
  },
  {
    id: 'tier_20',
    credits: 200,
    price: 20,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_20_PRICE_ID,
  },
  {
    id: 'tier_30',
    credits: 300,
    price: 30,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_30_PRICE_ID,
  },
  {
    id: 'tier_40',
    credits: 400,
    price: 40,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_40_PRICE_ID,
  },
  {
    id: 'tier_50',
    credits: 500,
    price: 50,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_50_PRICE_ID,
  },
  {
    id: 'tier_100_bonus',
    credits: 1000,
    price: 100,
    bonus: 100, // 10% bonus = 1,100 total credits
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_TIER_100_PRICE_ID,
  },
];

// Free credits for new users
export const FREE_SIGNUP_CREDITS = 100;

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action].cost;
}

export function calculateValue(credits: number): string {
  // Rough estimate based on average action costs
  const avgCost = 2; // average credits per action
  const actions = Math.floor(credits / avgCost);
  return `~${actions} actions`;
}

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(p => p.id === id);
}

export function getTotalCredits(pkg: CreditPackage): number {
  return pkg.credits + pkg.bonus;
}
