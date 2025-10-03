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
    
    if (!pkg) {
      return NextResponse.json({ error: `Package not found: ${packageId}` }, { status: 400 });
    }

    if (!pkg.stripePriceId) {
      console.error(`Missing Stripe price ID for package ${packageId}`, pkg);
      return NextResponse.json(
        { error: `Package ${packageId} is not configured for purchases. Please contact support.` },
        { status: 400 }
      );
    }

    console.log('Creating checkout session:', {
      packageId,
      priceId: pkg.stripePriceId,
      userId: user.id,
      email: user.email,
    });

    // Create Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
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
  } catch (error: any) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
