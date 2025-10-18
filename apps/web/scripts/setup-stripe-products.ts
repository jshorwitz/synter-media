#!/usr/bin/env tsx
/**
 * Setup Stripe Products and Prices for Credit Packages
 * 
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/setup-stripe-products.ts
 * 
 * This will create all credit packages in Stripe and output the price IDs
 * to add to your environment variables.
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('Usage: STRIPE_SECRET_KEY=sk_... npx tsx scripts/setup-stripe-products.ts');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  description: string;
};

const packages: CreditPackage[] = [
  {
    id: 'tier_10',
    name: '100 Credits',
    credits: 100,
    price: 10,
    bonus: 0,
    description: '100 credits for advertising campaigns and AI optimization',
  },
  {
    id: 'tier_20',
    name: '200 Credits',
    credits: 200,
    price: 20,
    bonus: 0,
    description: '200 credits for advertising campaigns and AI optimization',
  },
  {
    id: 'tier_30',
    name: '300 Credits',
    credits: 300,
    price: 30,
    bonus: 0,
    description: '300 credits for advertising campaigns and AI optimization',
  },
  {
    id: 'tier_40',
    name: '400 Credits',
    credits: 400,
    price: 40,
    bonus: 0,
    description: '400 credits for advertising campaigns and AI optimization',
  },
  {
    id: 'tier_50',
    name: '500 Credits',
    credits: 500,
    price: 50,
    bonus: 0,
    description: '500 credits for advertising campaigns and AI optimization',
  },
  {
    id: 'tier_100_bonus',
    name: '1,100 Credits (10% Bonus)',
    credits: 1000,
    price: 100,
    bonus: 100,
    description: '1,000 credits + 100 bonus credits (10% bonus) - Best value!',
  },
];

async function main() {
  console.log('🚀 Setting up Stripe products for Synter credit packages...\n');
  
  const envVars: Record<string, string> = {};

  for (const pkg of packages) {
    console.log(`\n📦 Creating: ${pkg.name} ($${pkg.price})`);
    
    try {
      // Create or retrieve product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description,
        metadata: {
          package_id: pkg.id,
          credits: pkg.credits.toString(),
          bonus: pkg.bonus.toString(),
          total_credits: (pkg.credits + pkg.bonus).toString(),
        },
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create one-time price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          package_id: pkg.id,
          credits: pkg.credits.toString(),
          bonus: pkg.bonus.toString(),
        },
      });

      console.log(`   ✅ Price created: ${price.id}`);
      console.log(`   💰 ${pkg.credits + pkg.bonus} total credits for $${pkg.price}`);

      // Store env var
      const envKey = `NEXT_PUBLIC_STRIPE_CREDITS_${pkg.id.toUpperCase()}_PRICE_ID`;
      envVars[envKey] = price.id;

    } catch (error: any) {
      console.error(`   ❌ Error creating ${pkg.name}:`, error.message);
    }
  }

  console.log('\n\n✅ All products created!\n');
  console.log('📋 Add these environment variables to Vercel:\n');
  console.log('─'.repeat(80));
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('─'.repeat(80));
  console.log('\n💡 Next steps:');
  console.log('1. Copy the environment variables above');
  console.log('2. Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('3. Add each variable (Production, Preview, and Development)');
  console.log('4. Redeploy your application\n');
  console.log('🎉 Done! Your billing packages are ready.\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
