import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits } from '@/lib/subscription/creditManager';
import { getTotalCredits, getPackageById } from '@/lib/subscription/credits';

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process one-time payments (credit purchases)
        if (session.mode === 'payment') {
          await handleCreditPurchase(session);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;

  if (!userId || !packageId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const pkg = getPackageById(packageId);
  if (!pkg) {
    console.error('Invalid package ID:', packageId);
    return;
  }

  const totalCredits = getTotalCredits(pkg);

  await addCredits(
    parseInt(userId),
    totalCredits,
    'PURCHASE',
    `Purchased ${pkg.credits} credits${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''}`,
    {
      packageId,
      amount_paid: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      payment_intent: session.payment_intent,
    }
  );
}
