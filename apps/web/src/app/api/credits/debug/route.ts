import { NextRequest, NextResponse } from 'next/server';
import { CREDIT_PACKAGES } from '@/lib/subscription/credits';

export async function GET(req: NextRequest) {
  const packages = CREDIT_PACKAGES.map(pkg => ({
    id: pkg.id,
    credits: pkg.credits,
    price: pkg.price,
    hasPriceId: !!pkg.stripePriceId,
    priceId: pkg.stripePriceId ? pkg.stripePriceId.substring(0, 15) + '...' : 'MISSING',
  }));

  const envCheck = {
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  return NextResponse.json({ packages, envCheck });
}
