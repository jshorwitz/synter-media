# Stripe Setup for Synter Credit Billing

## 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create these one-time payment products:

### Mini Package
- **Name:** Synter Credits - Mini
- **Description:** 50 credits for $5
- **Pricing:** One-time, $5.00 USD
- **Copy the Price ID** (starts with `price_...`)

### Starter Package
- **Name:** Synter Credits - Starter  
- **Description:** 100 credits for $10
- **Pricing:** One-time, $10.00 USD
- **Copy the Price ID**

### Growth Package
- **Name:** Synter Credits - Growth (Popular)
- **Description:** 500 credits + 50 bonus (550 total) for $45
- **Pricing:** One-time, $45.00 USD
- **Copy the Price ID**

### Scale Package
- **Name:** Synter Credits - Scale
- **Description:** 1000 credits + 150 bonus (1150 total) for $80
- **Pricing:** One-time, $80.00 USD
- **Copy the Price ID**

### Enterprise Package
- **Name:** Synter Credits - Enterprise
- **Description:** 5000 credits + 1000 bonus (6000 total) for $350
- **Pricing:** One-time, $350.00 USD
- **Copy the Price ID**

## 2. Set Environment Variables

Add these to your Vercel project environment variables:

```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_CREDITS_MINI_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CREDITS_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CREDITS_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CREDITS_SCALE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_CREDITS_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://synter-clean-web.vercel.app
```

## 3. Set Up Webhook for Receipt/Credit Fulfillment

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Set endpoint URL to: `https://synter-clean-web.vercel.app/api/credits/webhook`
4. Select these events:
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to Vercel env vars:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 4. Quick Test

After setup:
1. Go to Settings → Billing
2. Click on $5 or $10 package
3. Should redirect to Stripe checkout
4. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. After payment, credits should be added automatically
