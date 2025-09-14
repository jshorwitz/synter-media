# Reddit API Setup Guide

This guide walks you through getting Reddit API credentials and access tokens for the Synter ads platform.

## 📋 Prerequisites

You need Reddit API credentials (Client ID and Secret) before getting access tokens.

### 1. Create Reddit Application

1. **Go to Reddit Apps**: https://www.reddit.com/prefs/apps
2. **Click "Create App"** or "Create Another App"
3. **Fill out the form**:
   - **Name**: `Synter Ads Platform`
   - **App type**: `Web app` (not script)
   - **Description**: `Cross-platform ads attribution and automation`
   - **About URL**: `https://your-domain.com` (optional)
   - **Redirect URI**: `http://localhost:3000/callback`
4. **Click "Create app"**

### 2. Get Your Credentials

After creating the app, you'll see:
- **Client ID**: The string under your app name (looks like: `abc123defgh`)
- **Client Secret**: Click "edit" to reveal it (looks like: `xyz789uvwxyz`)

### 3. Add to Environment

Add these to your `.env` file:
```env
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
```

## 🔑 Getting Access Tokens

There are **two types** of Reddit access tokens:

### Option 1: Application Token (Recommended)

**Best for**: Ads API, general Reddit data without user-specific actions

```bash
# Get application-only access token
pnpm reddit:app-token
```

This will:
- ✅ Generate an access token for your app
- ✅ Test the token with Reddit API
- ✅ Show you the token to add to `.env`

**Example output:**
```
✅ Reddit application token obtained!
📋 Access Token: abc123...xyz789
⏰ Expires in: 3600 seconds
🔧 Token Type: bearer

📝 Add this to your .env file:
REDDIT_ACCESS_TOKEN=abc123...xyz789
```

### Option 2: User Token (Advanced)

**Best for**: User-specific actions, posting, voting, etc.

```bash
# Interactive user authorization
pnpm reddit:user-token
```

This will:
1. 🌐 Start a local server on port 3000
2. 🔗 Open Reddit authorization in your browser
3. ✅ Get both access and refresh tokens
4. 🧪 Test the tokens

**Manual user flow:**
```bash
# Generate auth URL manually
node scripts/reddit-auth.js auth-url

# Exchange code for tokens
node scripts/reddit-auth.js exchange YOUR_CODE_HERE
```

## 🔧 Available Commands

```bash
# Quick setup (recommended)
pnpm reddit:app-token           # Get application token

# Interactive flows  
pnpm reddit:user-token          # Interactive user authorization
pnpm reddit:auth               # Show all Reddit auth options

# Manual operations
node scripts/reddit-auth.js app          # Application token
node scripts/reddit-auth.js user         # User token (interactive)
node scripts/reddit-auth.js auth-url     # Generate auth URL
node scripts/reddit-auth.js exchange CODE    # Exchange code for tokens
node scripts/reddit-auth.js refresh TOKEN    # Refresh access token
node scripts/reddit-auth.js test TOKEN       # Test a token
```

## 🧪 Testing Your Setup

After getting your token:

```bash
# Test Reddit API configuration
pnpm tokens:check-reddit

# Test specific token
node scripts/reddit-auth.js test YOUR_TOKEN
```

## 📝 Environment Variables Summary

After setup, your `.env` should have:

```env
# Reddit API Credentials
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

# Reddit Access Token (from app-token command)
REDDIT_ACCESS_TOKEN=your_access_token

# Optional: Refresh Token (from user-token command)
REDDIT_REFRESH_TOKEN=your_refresh_token
```

## 🚨 Common Issues & Solutions

### ❌ "Invalid client_id" Error
- Double-check your `REDDIT_CLIENT_ID` in `.env`
- Make sure you copied the client ID correctly from Reddit

### ❌ "Invalid redirect_uri" Error  
- Your Reddit app redirect URI must be exactly: `http://localhost:3000/callback`
- Make sure it's "Web app" type, not "Script"

### ❌ "Insufficient scope" Error
- Use user authorization flow instead of application flow
- The user token has more permissions than application token

### ❌ Token Expired
- Application tokens expire in 1 hour
- Use refresh token to get new access token:
  ```bash
  node scripts/reddit-auth.js refresh YOUR_REFRESH_TOKEN
  ```

### ❌ "Ads API access denied"
- You need a Reddit Ads account for ads API access
- Apply at: https://advertising.reddithelp.com/
- Use application token for general API access

## 🔄 Token Refresh Strategy

**Application Tokens**: 
- Expire in 1 hour
- Get new token as needed with `pnpm reddit:app-token`

**User Tokens**:
- Expire in 1 hour  
- Use refresh token to get new access token
- Refresh tokens are permanent (until user revokes)

```bash
# Auto-refresh in your app
node scripts/reddit-auth.js refresh $REDDIT_REFRESH_TOKEN
```

## 🎯 Which Token Type to Use?

| Use Case | Token Type | Command |
|----------|------------|---------|
| **Reddit Ads API** | Application | `pnpm reddit:app-token` |
| **General data fetching** | Application | `pnpm reddit:app-token` |
| **User-specific actions** | User | `pnpm reddit:user-token` |
| **Posting/commenting** | User | `pnpm reddit:user-token` |

**For Synter ads platform**: Use **Application Token** - it's simpler and perfect for ads API access.

## 🔗 Useful Links

- **Reddit Apps Management**: https://www.reddit.com/prefs/apps
- **Reddit API Documentation**: https://www.reddit.com/dev/api/
- **Reddit Ads API**: https://ads-api.reddit.com/
- **Apply for Ads Access**: https://advertising.reddithelp.com/
