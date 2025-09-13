// POST /api/v1/billing/purchase - Purchase credits with Stripe
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRole } from '../../../../../lib/auth';
import { db, updateWalletBalance, getOrCreateWallet, generateId } from '../../../../../lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const purchaseSchema = z.object({
  packageCredits: z.number().int().positive().optional(),
  customCredits: z.number().int().positive().min(100).max(100000).optional(),
  promoCode: z.string().optional(),
  paymentMethodId: z.string().optional(),
  taxInfo: z.object({
    country: z.string().min(2).max(2),
    vatId: z.string().optional(),
  }).optional(),
  enableAutoRecharge: z.boolean().optional(),
  topup: z.object({
    threshold: z.number().int().positive(),
    amount: z.number().int().positive(),
  }).optional(),
});

// Credit packages configuration
const CREDIT_PACKAGES = {
  1000: { credits: 1000, priceCents: 1000, priceId: process.env.BILLING_PRICE_1K },   // $10
  5000: { credits: 5000, priceCents: 4500, priceId: process.env.BILLING_PRICE_5K },   // $45 (10% discount)
  10000: { credits: 10000, priceCents: 8000, priceId: process.env.BILLING_PRICE_10K }, // $80 (20% discount)
};

export const POST = requireRole(['OWNER', 'BILLING_ADMIN'])(async (request) => {
  const { workspaceId, userId } = request.context;

  try {
    const body = await request.json();
    const data = purchaseSchema.parse(body);

    // Determine credits and price
    let credits: number;
    let priceCents: number;
    let stripeProductId: string | undefined;

    if (data.packageCredits) {
      const package_ = CREDIT_PACKAGES[data.packageCredits as keyof typeof CREDIT_PACKAGES];
      if (!package_) {
        return new Response(
          JSON.stringify({ error: 'Invalid package size' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      credits = package_.credits;
      priceCents = package_.priceCents;
      stripeProductId = package_.priceId;
    } else if (data.customCredits) {
      credits = data.customCredits;
      priceCents = Math.round(credits * 0.01 * 100); // $0.01 per credit
    } else {
      return new Response(
        JSON.stringify({ error: 'Must specify packageCredits or customCredits' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or create wallet
    const wallet = await getOrCreateWallet(workspaceId);

    // Create Stripe Payment Intent
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: priceCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        workspaceId,
        userId,
        credits: credits.toString(),
        type: 'credit_purchase',
      },
    };

    // Add payment method if specified
    if (data.paymentMethodId) {
      paymentIntentData.payment_method = data.paymentMethodId;
      paymentIntentData.confirmation_method = 'manual';
      paymentIntentData.confirm = true;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // Create invoice record
    const invoice = await db.invoice.create({
      data: {
        id: generateId(),
        workspaceId,
        totalCents: priceCents,
        taxCents: 0, // TODO: Calculate tax based on taxInfo
        currency: 'USD',
        status: paymentIntent.status === 'succeeded' ? 'paid' : 'open',
        providerId: paymentIntent.id,
      },
    });

    // If payment succeeded immediately, update wallet
    if (paymentIntent.status === 'succeeded') {
      await updateWalletBalance(
        wallet.id,
        credits,
        'PURCHASE',
        'invoice',
        invoice.id,
        { paymentIntentId: paymentIntent.id }
      );

      // Update auto-recharge settings if requested
      if (data.enableAutoRecharge && data.topup) {
        await db.creditWallet.update({
          where: { id: wallet.id },
          data: {
            autoEnabled: true,
            threshold: data.topup.threshold,
            topupAmount: data.topup.amount,
          },
        });
      }

      // TODO: Send receipt email
      // TODO: Emit audit event

      return new Response(
        JSON.stringify({
          invoiceId: invoice.id,
          wallet: { balance: wallet.balance + credits },
          receiptUrl: `/billing/invoices/${invoice.id}`,
          status: 'succeeded',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return payment intent for client-side confirmation
    return new Response(
      JSON.stringify({
        invoiceId: invoice.id,
        clientSecret: paymentIntent.client_secret,
        status: 'requires_confirmation',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Purchase failed:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Purchase failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
