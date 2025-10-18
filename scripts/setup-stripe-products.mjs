import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const creditPackages = [
  {
    id: 'mini',
    name: 'Mini Credit Pack',
    description: '1,000 credits for small projects',
    credits: 1000,
    bonus: 0,
    price: 1000, // $10.00 in cents
  },
  {
    id: 'starter',
    name: 'Starter Credit Pack',
    description: '5,000 credits with 10% bonus',
    credits: 5000,
    bonus: 500,
    price: 4500, // $45.00 in cents
  },
  {
    id: 'growth',
    name: 'Growth Credit Pack',
    description: '15,000 credits with 15% bonus',
    credits: 15000,
    bonus: 2250,
    price: 12000, // $120.00 in cents
  },
  {
    id: 'scale',
    name: 'Scale Credit Pack',
    description: '50,000 credits with 20% bonus',
    credits: 50000,
    bonus: 10000,
    price: 35000, // $350.00 in cents
  },
];

async function createProducts() {
  console.log('🚀 Creating Stripe products and prices...\n');

  const results = [];

  for (const pkg of creditPackages) {
    try {
      // Create product
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

      console.log(`✅ Created product: ${product.name} (${product.id})`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price,
        currency: 'usd',
        metadata: {
          package_id: pkg.id,
        },
      });

      console.log(`   Price: $${(pkg.price / 100).toFixed(2)} (${price.id})\n`);

      results.push({
        package_id: pkg.id,
        product_id: product.id,
        price_id: price.id,
        amount: pkg.price,
      });
    } catch (error) {
      console.error(`❌ Error creating ${pkg.name}:`, error.message);
    }
  }

  console.log('\n📋 Add these environment variables to Vercel:\n');
  console.log('─────────────────────────────────────────────────────────────');
  
  results.forEach(result => {
    const envVarName = `NEXT_PUBLIC_STRIPE_CREDITS_${result.package_id.toUpperCase()}_PRICE_ID`;
    console.log(`${envVarName}=${result.price_id}`);
  });
  
  console.log('─────────────────────────────────────────────────────────────\n');
}

// Check for Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('   Run: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

createProducts().catch(console.error);
