# Stripe Setup Guide

## Step 1: Create Products Using the API

Run this command to automatically create all credit products in Stripe:

```bash
# Get your Stripe secret key from Vercel dashboard or .env file
export STRIPE_SECRET_KEY=sk_test_...  # or sk_live_...

# Run the setup script
cd /Users/joelhorwitz/synter-fresh
node scripts/setup-stripe-products.mjs
```

The script will:
- Create 4 products (Mini, Starter, Growth, Scale)
- Create prices for each product
- Output environment variable names and price IDs

## Step 2: Add Price IDs to Vercel

Copy the output from the script and add to Vercel:

```bash
vercel env add NEXT_PUBLIC_STRIPE_CREDITS_MINI_PRICE_ID
vercel env add NEXT_PUBLIC_STRIPE_CREDITS_STARTER_PRICE_ID
vercel env add NEXT_PUBLIC_STRIPE_CREDITS_GROWTH_PRICE_ID
vercel env add NEXT_PUBLIC_STRIPE_CREDITS_SCALE_PRICE_ID
```

Or add them manually in [Vercel Dashboard → Settings → Environment Variables](https://vercel.com/your-team/synter-fresh/settings/environment-variables)

## Step 3: Configure Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://syntermedia.ai/api/credits/webhook`
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"

The webhook secret is already configured in Vercel ✅

## Step 4: Test the Integration

### Test Mode (Recommended First)
```bash
# Use test mode secret key (sk_test_...)
export STRIPE_SECRET_KEY=sk_test_...
node scripts/setup-stripe-products.mjs
```

### Test Purchase Flow
1. Visit https://syntermedia.ai/dashboard/billing
2. Click "Buy Credits"  
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Credits should appear immediately

### Monitor Webhooks
- View webhook logs: https://dashboard.stripe.com/test/webhooks
- Check successful deliveries
- Retry failed webhooks if needed

## Step 5: Go Live

Once tested:
```bash
# Use live mode secret key
export STRIPE_SECRET_KEY=sk_live_...
node scripts/setup-stripe-products.mjs
```

Then update the price IDs in Vercel to use the live `price_` IDs.

---

## Credit Package Pricing

| Package | Credits | Bonus | Total | Price |
|---------|---------|-------|-------|-------|
| Mini    | 1,000   | 0     | 1,000 | $10   |
| Starter | 5,000   | 500   | 5,500 | $45   |
| Growth  | 15,000  | 2,250 | 17,250| $120  |
| Scale   | 50,000  | 10,000| 60,000| $350  |

## Troubleshooting

### "STRIPE_SECRET_KEY not found"
Make sure you've exported the environment variable:
```bash
export STRIPE_SECRET_KEY=sk_test_...
```

### "Product already exists"
Products are idempotent by name. Either:
- Delete existing products in Stripe dashboard
- Or manually note the price IDs from existing products

### Webhook not receiving events
1. Check webhook is configured for production URL
2. Verify `STRIPE_WEBHOOK_SECRET` matches in Vercel
3. Check webhook delivery logs in Stripe dashboard
