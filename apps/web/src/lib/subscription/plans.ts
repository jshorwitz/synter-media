export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';

export type PlanFeatures = {
  maxCampaigns: number;
  maxPlatforms: number;
  maxChatQueries: number; // per month
  budgetOptimization: boolean;
  multiTouchAttribution: boolean;
  customReporting: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  dedicatedSupport: boolean;
};

export type Plan = {
  id: PlanTier;
  name: string;
  price: number; // monthly in USD
  yearlyPrice: number;
  stripePriceId?: string; // Set in env
  stripeYearlyPriceId?: string;
  features: PlanFeatures;
  description: string;
  popular?: boolean;
};

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    features: {
      maxCampaigns: 3,
      maxPlatforms: 1,
      maxChatQueries: 10,
      budgetOptimization: false,
      multiTouchAttribution: false,
      customReporting: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedSupport: false,
    },
    description: 'Perfect for testing and small projects',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    yearlyPrice: 470, // ~20% discount
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID,
    features: {
      maxCampaigns: 10,
      maxPlatforms: 2,
      maxChatQueries: 100,
      budgetOptimization: true,
      multiTouchAttribution: false,
      customReporting: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedSupport: false,
    },
    description: 'Great for growing businesses',
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 149,
    yearlyPrice: 1430, // ~20% discount
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    features: {
      maxCampaigns: 50,
      maxPlatforms: 4,
      maxChatQueries: 500,
      budgetOptimization: true,
      multiTouchAttribution: true,
      customReporting: true,
      apiAccess: true,
      whiteLabel: false,
      dedicatedSupport: false,
    },
    description: 'For agencies and power users',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    yearlyPrice: 4790,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    features: {
      maxCampaigns: -1, // unlimited
      maxPlatforms: -1, // unlimited
      maxChatQueries: -1, // unlimited
      budgetOptimization: true,
      multiTouchAttribution: true,
      customReporting: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedSupport: true,
    },
    description: 'Custom solutions for large organizations',
  },
};

export function getPlanById(tier: PlanTier): Plan {
  return PLANS[tier];
}

export function canAccessFeature(
  userTier: PlanTier,
  feature: keyof PlanFeatures
): boolean {
  const plan = PLANS[userTier];
  return plan.features[feature] === true || plan.features[feature] === -1;
}

export function isWithinLimit(
  userTier: PlanTier,
  feature: keyof PlanFeatures,
  currentUsage: number
): boolean {
  const plan = PLANS[userTier];
  const limit = plan.features[feature];
  
  if (typeof limit !== 'number') return true;
  if (limit === -1) return true; // unlimited
  
  return currentUsage < limit;
}

export function getFeatureLimit(
  userTier: PlanTier,
  feature: keyof PlanFeatures
): number {
  const plan = PLANS[userTier];
  const limit = plan.features[feature];
  return typeof limit === 'number' ? limit : 0;
}
