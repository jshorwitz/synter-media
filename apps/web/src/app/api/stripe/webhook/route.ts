import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient, PlanTier, SubscriptionStatus } from '@prisma/client';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
}

const prisma = new PrismaClient();

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
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  await prisma.subscription.upsert({
    where: { user_id: parseInt(userId) },
    create: {
      user_id: parseInt(userId),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: 'ACTIVE',
    },
    update: {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: 'ACTIVE',
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const sub = await prisma.subscription.findUnique({
    where: { stripe_customer_id: customerId },
  });

  if (!sub) return;

  // Map Stripe price ID to our plan tier
  const priceId = subscription.items.data[0]?.price.id;
  const tier = mapPriceIdToTier(priceId);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      tier,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: {
      tier: 'FREE',
      status: 'CANCELED',
      stripe_subscription_id: null,
      stripe_price_id: null,
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: { status: 'ACTIVE' },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: { status: 'PAST_DUE' },
  });
}

function mapPriceIdToTier(priceId?: string): PlanTier {
  if (!priceId) return 'FREE';

  // Map Stripe price IDs to plan tiers
  const priceMap: Record<string, PlanTier> = {
    [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '']: 'STARTER',
    [process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID || '']: 'STARTER',
    [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '']: 'PRO',
    [process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '']: 'PRO',
    [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '']: 'ENTERPRISE',
    [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '']: 'ENTERPRISE',
  };

  return priceMap[priceId] || 'FREE';
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'CANCELED',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'PAST_DUE',
    paused: 'CANCELED',
  };

  return statusMap[status] || 'ACTIVE';
}
