# Ad Platform Connection Setup

## Overview

This guide explains how to set up OAuth connections for ad platforms (Google Ads, Meta, LinkedIn, Reddit, X/Twitter) in Synter.

## User Experience

1. User clicks "Connect" on a platform card in Settings
2. Redirects to platform OAuth consent screen
3. User approves access
4. Returns to Synter with all accessible ad accounts automatically connected
5. Clear status indicators show connection health

## Setup Instructions

### 1. Database Migration

Run the migration to create required tables:

```bash
psql $DATABASE_URL -f migrations/003_oauth_connections.sql
```

### 2. Environment Variables

Add these to your `.env` or deployment environment:

```bash
# Encryption key for token storage (32+ characters, keep secret!)
ENCRYPTION_KEY="your-secret-encryption-key-min-32-chars"

# Google Ads OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_DEVELOPER_TOKEN="your-google-ads-developer-token"

# Reddit Ads OAuth
REDDIT_CLIENT_ID="your-reddit-client-id"
REDDIT_CLIENT_SECRET="your-reddit-client-secret"

# LinkedIn Ads OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# X/Twitter Ads OAuth
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"

# Meta Ads OAuth
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
```

### 3. OAuth App Setup (Per Platform)

#### Google Ads

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Ads API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://yourdomain.com/api/connect/google/callback`
6. Copy Client ID and Client Secret
7. Apply for Google Ads API access (developer token)

**Required Scopes:**
- `https://www.googleapis.com/auth/adwords`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

#### Meta (Facebook) Ads

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add "Facebook Login" and "Marketing API" products
4. Configure OAuth redirect URI: `https://yourdomain.com/api/connect/meta/callback`
5. Submit for App Review to get `ads_read` and `ads_management` permissions
6. Copy App ID and App Secret

**Required Permissions:**
- `ads_read`
- `ads_management`
- `business_management`

#### LinkedIn Ads

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add "Marketing Developer Platform" product
4. Set redirect URL: `https://yourdomain.com/api/connect/linkedin/callback`
5. Request API access for Advertising API
6. Copy Client ID and Client Secret

**Required Scopes:**
- `r_ads`
- `r_ads_reporting`
- `r_basicprofile`
- `r_emailaddress`

#### Reddit Ads

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new "web app"
3. Set redirect URI: `https://yourdomain.com/api/connect/reddit/callback`
4. Copy Client ID and Client Secret
5. Contact Reddit to get Ads API access (if needed)

**Required Scopes:**
- `identity` (basic)
- Additional ads scopes when approved

#### X (Twitter) Ads

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Enable OAuth 2.0
4. Add redirect URI: `https://yourdomain.com/api/connect/x/callback`
5. Apply for Ads API access
6. Copy Client ID and Client Secret

**Required Scopes:**
- `tweet.read`
- `users.read`
- `offline.access`

### 4. Security Checklist

- ✅ Set strong `ENCRYPTION_KEY` (32+ random characters)
- ✅ Use HTTPS in production (required for OAuth)
- ✅ Set exact redirect URIs in each platform console
- ✅ Enable CORS only for your domain
- ✅ Rotate encryption key periodically (with migration plan)
- ✅ Monitor failed authentication attempts
- ✅ Set up alerts for token refresh failures

### 5. Testing

1. **Local Development:**
   - Use ngrok or similar for local HTTPS: `ngrok http 3000`
   - Update redirect URIs in platform consoles to use ngrok URL
   - Test each platform connection

2. **Verify:**
   - Connection status shows "Connected"
   - Ad accounts are listed
   - Tokens can be refreshed
   - Error states display correctly

## Architecture

```
User clicks Connect
    ↓
/api/connect/[provider]/start
    - Creates signed JWT state
    - Redirects to platform OAuth
    ↓
Platform OAuth consent screen
    ↓
/api/connect/[provider]/callback
    - Verifies state
    - Exchanges code for tokens
    - Encrypts and stores tokens
    - Fetches ad accounts
    - Returns to Settings
    ↓
Settings page shows connected status
```

## Token Lifecycle

1. **Obtain:** User authorizes, we get access_token + refresh_token
2. **Store:** Encrypt with AES-256-GCM, store in `oauth_tokens` table
3. **Use:** Decrypt on-demand when making API calls
4. **Refresh:** Auto-refresh if expires_at < 2 minutes from now
5. **Re-auth:** If refresh fails, mark connection as "needs_reauth"

## Troubleshooting

### "Provider not configured" error
- Check environment variables are set
- Verify CLIENT_ID and CLIENT_SECRET are correct

### "Redirect URI mismatch" error
- Ensure exact match in platform console
- Include protocol (https://) and no trailing slash

### Tokens expire quickly
- Google: Check `access_type=offline` is set
- Reddit: Verify `duration=permanent` is included
- LinkedIn: Ensure app has offline access enabled

### No ad accounts showing
- User may not have ad account access
- API permissions may not be approved yet
- Check provider API status page

## Next Steps

After setup:
1. Test connection flow with each platform
2. Implement account selection UI (if needed)
3. Set up token refresh cron job
4. Add monitoring for connection health
5. Implement disconnect flow

## Support

For issues:
- Check provider API status pages
- Review OAuth logs in `/api/connect/[provider]/callback`
- Verify token encryption/decryption works
- Test state JWT signing/verification
