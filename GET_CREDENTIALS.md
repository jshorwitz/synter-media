# 🔐 Get Your API Credentials

Follow these steps to get all the necessary credentials for your Synter app:

## 1. Google OAuth (User Login) 

**Go to:** https://console.cloud.google.com/apis/credentials

1. Click "Create Credentials" → "OAuth 2.0 Client IDs"
2. Choose "Web application"
3. Name it "Synter App"
4. Under "Authorized redirect URIs", add:
   - `http://localhost:8088/auth/google/callback` (for local development)
   - `https://your-railway-domain.railway.app/auth/google/callback` (for production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## 2. Google Ads API (Campaign Data)

**Go to:** https://ads.google.com/aw/apicenter

1. Apply for "Basic Access" (this may take a few days for approval)
2. Once approved, you'll get a **Developer Token**
3. Create OAuth credentials (same as above) for API access
4. Generate a **Refresh Token** using Google's OAuth 2.0 Playground:
   - Go to https://developers.google.com/oauthplayground/
   - Select "Google Ads API v15" in the scope list
   - Authorize and get the refresh token

## 3. OpenAI API (AI Features)

**Go to:** https://platform.openai.com/account/api-keys

1. Click "Create new secret key"
2. Name it "Synter App"
3. Copy the **API Key** (starts with `sk-...`)

## 4. Generate Secrets

Run this in your terminal to generate secure secrets:
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "SESSION_SECRET=$(openssl rand -hex 32)"
```

---

## Quick Setup

Once you have all the credentials above, I can help you create the .env file with all the values!

Just let me know when you have:
- ✅ Google OAuth Client ID & Secret
- ✅ Google Ads Developer Token & Refresh Token  
- ✅ OpenAI API Key
