import { NextResponse } from 'next/server';
import { canUseFeature, FeatureType } from '@/lib/subscription/usage';

export async function checkFeatureAccess(
  userId: number,
  feature: FeatureType
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const check = await canUseFeature(userId, feature);

  if (!check.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Feature limit reached',
          message: `You've reached your ${feature} limit (${check.current}/${check.limit}). Please upgrade your plan.`,
          limit: check.limit,
          current: check.current,
          tier: check.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true };
}

export function featureGate(feature: FeatureType) {
  return async (
    handler: (req: Request, context: any) => Promise<NextResponse>
  ) => {
    return async (req: Request, context: any) => {
      // Extract user ID from request (you'll need to implement your auth logic)
      // For now, this is a placeholder
      const userId = await getUserIdFromRequest(req);

      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const accessCheck = await checkFeatureAccess(userId, feature);

      if (!accessCheck.allowed && accessCheck.response) {
        return accessCheck.response;
      }

      return handler(req, context);
    };
  };
}

// Helper to extract user ID from request
// You should implement this based on your auth system
async function getUserIdFromRequest(req: Request): Promise<number | null> {
  // Placeholder - implement based on your session/JWT logic
  // For example, decode JWT from Authorization header or session cookie
  return null;
}
