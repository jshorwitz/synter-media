import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits } from '@/lib/subscription/creditManager';
import { getTotalCredits, getPackageById } from '@/lib/subscription/credits';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
    // Check if we've already processed this webhook
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { event_id: event.id },
    });

    if (existingEvent) {
      console.log('Webhook already processed:', event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Create webhook event record
    await prisma.webhookEvent.create({
      data: {
        provider: 'stripe',
        event_id: event.id,
        event_type: event.type,
        status: 'processing',
        payload_hash: payloadHash,
      },
    });

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

      // Mark as successfully processed
      await prisma.webhookEvent.update({
        where: { event_id: event.id },
        data: {
          status: 'success',
          processed_at: new Date(),
        },
      });

      return NextResponse.json({ received: true });
    } catch (error: any) {
      // Mark as failed
      await prisma.webhookEvent.update({
        where: { event_id: event.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      });
      throw error;
    }
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
  const userIdInt = parseInt(userId);

  // Use transaction to ensure both purchase record and credits are created atomically
  await prisma.$transaction(async (tx) => {
    // Create purchase record
    await tx.purchase.create({
      data: {
        user_id: userIdInt,
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        amount_cents: session.amount_total || 0,
        credits_awarded: totalCredits,
        package_id: packageId,
        status: 'succeeded',
        metadata: {
          package_name: pkg.name,
          base_credits: pkg.credits,
          bonus_credits: pkg.bonus,
          currency: session.currency,
        },
      },
    });

    // Add credits (this will create credit balance and transaction records)
    await addCredits(
      userIdInt,
      totalCredits,
      'PURCHASE',
      `Purchased ${pkg.credits} credits${pkg.bonus > 0 ? ` + ${pkg.bonus} bonus` : ''}`,
      {
        packageId,
        purchase_id: session.id,
        amount_paid: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        payment_intent: session.payment_intent,
      }
    );
  });

  console.log('Credit purchase processed:', {
    userId: userIdInt,
    credits: totalCredits,
    amount: session.amount_total,
  });
}
