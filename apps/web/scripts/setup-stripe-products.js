#!/usr/bin/env node

/**
 * Script to create Stripe products for credit packages
 * Run with: node scripts/setup-stripe-products.js
 * 
 * Make sure to set STRIPE_SECRET_KEY environment variable first:
 * export STRIPE_SECRET_KEY=sk_test_...
 */

import Stripe from 'stripe';

const CREDIT_PACKAGES = [
  {
    id: 'mini',
    name: 'Mini Credit Pack',
    description: '50 credits for Synter',
    credits: 50,
    price: 500, // $5.00 in cents
  },
  {
    id: 'starter',
    name: 'Starter Credit Pack',
    description: '100 credits for Synter',
    credits: 100,
    price: 1000, // $10.00 in cents
  },
  {
    id: 'growth',
    name: 'Growth Credit Pack',
    description: '550 credits for Synter (500 + 50 bonus)',
    credits: 550,
    price: 4500, // $45.00 in cents
  },
  {
    id: 'scale',
    name: 'Scale Credit Pack',
    description: '1150 credits for Synter (1000 + 150 bonus)',
    credits: 1150,
    price: 8000, // $80.00 in cents
  },
  {
    id: 'enterprise',
    name: 'Enterprise Credit Pack',
    description: '6000 credits for Synter (5000 + 1000 bonus)',
    credits: 6000,
    price: 35000, // $350.00 in cents
  },
];

async function setupStripeProducts() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable not set');
    console.error('   Run: export STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-11-20.acacia',
  });

  console.log('🔧 Setting up Stripe credit packages...\n');

  const priceIds = {};

  for (const pkg of CREDIT_PACKAGES) {
    try {
      console.log(`📦 Creating: ${pkg.name} ($${pkg.price / 100})`);

      // Create product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description,
        metadata: {
          package_id: pkg.id,
          credits: pkg.credits.toString(),
        },
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price,
        currency: 'usd',
        metadata: {
          package_id: pkg.id,
          credits: pkg.credits.toString(),
        },
      });

      console.log(`   ✅ Price created: ${price.id}\n`);

      priceIds[pkg.id] = price.id;
    } catch (error) {
      console.error(`   ❌ Error creating ${pkg.name}:`, error.message);
      console.error('      (Product may already exist - check Stripe dashboard)\n');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 Add these environment variables to Vercel:\n');
  console.log(`NEXT_PUBLIC_STRIPE_CREDITS_MINI_PRICE_ID=${priceIds.mini || 'price_...'}`);
  console.log(`NEXT_PUBLIC_STRIPE_CREDITS_STARTER_PRICE_ID=${priceIds.starter || 'price_...'}`);
  console.log(`NEXT_PUBLIC_STRIPE_CREDITS_GROWTH_PRICE_ID=${priceIds.growth || 'price_...'}`);
  console.log(`NEXT_PUBLIC_STRIPE_CREDITS_SCALE_PRICE_ID=${priceIds.scale || 'price_...'}`);
  console.log(`NEXT_PUBLIC_STRIPE_CREDITS_ENTERPRISE_PRICE_ID=${priceIds.enterprise || 'price_...'}`);
  console.log('='.repeat(80) + '\n');

  console.log('✨ Done! Check your Stripe dashboard to verify the products.');
  console.log('   Dashboard: https://dashboard.stripe.com/test/products\n');
}

setupStripeProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
