# X (Twitter) Ads OAuth Setup

## Required Environment Variables

Add these to your Vercel environment variables:

```bash
# X Ads OAuth (OAuth 1.0a)
X_ADS_CONSUMER_KEY=your-consumer-key
X_ADS_CONSUMER_SECRET=your-consumer-secret
X_ADS_REDIRECT_URI=https://synter-clean-web.vercel.app/api/oauth/x-ads/callback

# App URL (if not already set)
NEXT_PUBLIC_APP_URL=https://synter-clean-web.vercel.app
```

## Setup Steps

### 1. Create X Developer Account

1. Go to [developer.x.com](https://developer.x.com/)
2. Sign up for a developer account (if you don't have one)
3. Complete the developer application

### 2. Create an App

1. In the [Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Click **Create App**
3. Fill in app details:
   - App name: **Synter**
   - Description: **Cross-platform ads management and optimization**
   - Website URL: `https://synter-clean-web.vercel.app`
4. Save and navigate to your app

### 3. Configure App Settings

1. Go to **App Settings** → **Authentication settings**
2. Enable **3-legged OAuth**
3. Set **Callback URL**:
   - Development: `http://localhost:3000/api/oauth/x-ads/callback`
   - Production: `https://synter-clean-web.vercel.app/api/oauth/x-ads/callback`
4. Set **Website URL**: `https://synter-clean-web.vercel.app`
5. Save settings

### 4. Get API Keys

1. Go to **Keys and tokens** tab
2. Copy:
   - **API Key** → `X_ADS_CONSUMER_KEY`
   - **API Secret Key** → `X_ADS_CONSUMER_SECRET`

### 5. Apply for Ads API Access (CRITICAL)

⚠️ **X Ads API requires approval** - you can't use it without being whitelisted.

1. Go to [X Ads API Developer Portal](https://developer.x.com/en/products/x-ads-api)
2. Click **Apply for access**
3. Fill out the application:
   - Business use case: Platform for managing cross-channel ad campaigns
   - Expected API usage
   - Company information
4. Submit and wait for approval (can take days to weeks)

**Note:** Until approved, the OAuth flow will complete but API calls will return 403.

### 6. Set App Permissions

1. In your app settings → **User authentication settings**
2. Set **App permissions**: **Read and write** (for managing campaigns)
3. Save

### 7. Add to Vercel

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the 2 environment variables (consumer key & secret)
3. Redeploy

## Testing

1. Once approved for Ads API access:
2. Complete onboarding to "Connect Platforms" step
3. Click "X Ads" button
4. Authorize with your X account
5. Should redirect back with success

## Technical Notes

- **OAuth 1.0a** (not 2.0) - Requires request signing for every API call
- **No refresh tokens** - Access tokens don't expire but can be revoked
- **No scopes** - App permissions are set at the app level
- Uses `oauth_token` and `oauth_token_secret` (stored in our DB)

## Ads API Endpoints

Once connected, you'll use these endpoints (all require OAuth 1.0a signing):

- List ad accounts: `GET https://ads-api.x.com/12/accounts`
- Campaign management: `https://ads-api.x.com/12/accounts/:account_id/campaigns`
- Analytics: `https://ads-api.x.com/12/stats/accounts/:account_id`

## Resources

- [X Ads API Documentation](https://developer.x.com/en/docs/x-ads-api)
- [OAuth 1.0a Flow](https://developer.x.com/en/docs/authentication/oauth-1-0a)
- [Apply for Access](https://developer.x.com/en/products/x-ads-api)
