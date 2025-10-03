import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPackageById } from '@/lib/subscription/credits';
import { getCurrentUser } from '@/lib/auth/session';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { packageId } = await req.json();

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID required' },
        { status: 400 }
      );
    }

    const pkg = getPackageById(packageId);
    if (!pkg || !pkg.stripePriceId) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Create Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment, not subscription
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://synter-clean-web.vercel.app'}/dashboard?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://synter-clean-web.vercel.app'}/credits?purchase=canceled`,
      metadata: {
        userId: user.id.toString(),
        packageId,
        credits: pkg.credits.toString(),
        bonus: pkg.bonus.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
