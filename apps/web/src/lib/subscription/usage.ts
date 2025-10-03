import { PrismaClient } from '@prisma/client';
import { PlanTier } from './plans';
import { getFeatureLimit, isWithinLimit } from './plans';

const prisma = new PrismaClient();

export type FeatureType =
  | 'campaigns'
  | 'chat_queries'
  | 'platforms'
  | 'api_calls';

export async function getUserTier(userId: number): Promise<PlanTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { user_id: userId },
  });

  if (!subscription || !subscription.tier) {
    return 'free';
  }

  return subscription.tier.toLowerCase() as PlanTier;
}

export async function trackUsage(
  userId: number,
  feature: FeatureType,
  count: number = 1
): Promise<void> {
  const period = getCurrentPeriod();

  await prisma.usageRecord.upsert({
    where: {
      user_id_feature_period: {
        user_id: userId,
        feature,
        period,
      },
    },
    create: {
      user_id: userId,
      feature,
      period,
      count,
    },
    update: {
      count: {
        increment: count,
      },
    },
  });
}

export async function getUsage(
  userId: number,
  feature: FeatureType,
  period?: string
): Promise<number> {
  const targetPeriod = period || getCurrentPeriod();

  const record = await prisma.usageRecord.findUnique({
    where: {
      user_id_feature_period: {
        user_id: userId,
        feature,
        period: targetPeriod,
      },
    },
  });

  return record?.count || 0;
}

export async function canUseFeature(
  userId: number,
  feature: FeatureType
): Promise<{ allowed: boolean; limit: number; current: number; tier: PlanTier }> {
  const tier = await getUserTier(userId);
  
  // Map feature names to plan feature keys
  const featureMap: Record<FeatureType, keyof import('./plans').PlanFeatures> = {
    campaigns: 'maxCampaigns',
    chat_queries: 'maxChatQueries',
    platforms: 'maxPlatforms',
    api_calls: 'maxChatQueries', // Reuse chat queries limit for now
  };

  const planFeature = featureMap[feature];
  const limit = getFeatureLimit(tier, planFeature);
  const current = await getUsage(userId, feature);

  return {
    allowed: isWithinLimit(tier, planFeature, current),
    limit,
    current,
    tier,
  };
}

export async function getCampaignCount(userId: number): Promise<number> {
  // This would actually query campaigns table - for now use usage tracking
  return getUsage(userId, 'campaigns');
}

export async function incrementFeatureUsage(
  userId: number,
  feature: FeatureType
): Promise<boolean> {
  const check = await canUseFeature(userId, feature);
  
  if (!check.allowed) {
    return false;
  }

  await trackUsage(userId, feature, 1);
  return true;
}

function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function resetMonthlyUsage(userId: number): Promise<void> {
  const period = getCurrentPeriod();
  
  // Reset monthly-limited features
  const monthlyFeatures: FeatureType[] = ['chat_queries', 'api_calls'];
  
  for (const feature of monthlyFeatures) {
    await prisma.usageRecord.upsert({
      where: {
        user_id_feature_period: {
          user_id: userId,
          feature,
          period,
        },
      },
      create: {
        user_id: userId,
        feature,
        period,
        count: 0,
      },
      update: {
        count: 0,
      },
    });
  }
}
