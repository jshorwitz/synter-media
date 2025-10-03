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
    cost: 1,
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
    id: 'mini',
    credits: 50,
    price: 5,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_MINI_PRICE_ID,
  },
  {
    id: 'starter',
    credits: 100,
    price: 10,
    bonus: 0,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_STARTER_PRICE_ID,
  },
  {
    id: 'growth',
    credits: 500,
    price: 45,
    bonus: 50, // 10% bonus
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_GROWTH_PRICE_ID,
  },
  {
    id: 'scale',
    credits: 1000,
    price: 80,
    bonus: 150, // 15% bonus
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_SCALE_PRICE_ID,
  },
  {
    id: 'enterprise',
    credits: 5000,
    price: 350,
    bonus: 1000, // 20% bonus
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_ENTERPRISE_PRICE_ID,
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
