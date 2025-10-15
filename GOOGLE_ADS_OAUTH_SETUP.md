# Google Ads OAuth Setup

## Required Environment Variables

Add these to your Vercel environment variables:

```bash
# Google Ads OAuth
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REDIRECT_URI=https://synter-clean-web.vercel.app/api/oauth/google-ads/callback
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token

# App URL (if not already set)
NEXT_PUBLIC_APP_URL=https://synter-clean-web.vercel.app
```

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Ads API**

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in app information:
   - App name: **Synter**
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/adwords`
5. Add test users (for development)
6. Submit for verification (for production)

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **Synter Web**
5. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/oauth/google-ads/callback`
   - Production: `https://synter-clean-web.vercel.app/api/oauth/google-ads/callback`
6. Save and copy:
   - Client ID → `GOOGLE_ADS_CLIENT_ID`
   - Client secret → `GOOGLE_ADS_CLIENT_SECRET`

### 4. Get Developer Token

1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Apply for a developer token
3. Wait for approval (can take 24-48 hours)
4. Once approved, copy token → `GOOGLE_ADS_DEVELOPER_TOKEN`

**Note:** For testing, you can use a test account developer token immediately

### 5. Add to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 4 environment variables
3. Redeploy

## Testing

1. Complete onboarding to "Connect Platforms" step
2. Click "Google Ads" button
3. Authorize with your Google account
4. Should redirect back with success

## Security Notes

- Tokens are stored in the database (will be encrypted in production)
- Refresh tokens allow ongoing access without re-authentication
- State parameter prevents CSRF attacks
- Scopes are limited to `adwords` only
