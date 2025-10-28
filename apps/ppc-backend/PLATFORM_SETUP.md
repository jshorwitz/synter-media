# Ad Platform API Setup Guide

This guide helps you complete the OAuth setup for Microsoft, Reddit, and LinkedIn Ads APIs.

## ✅ Already Working
- **Google Ads**: Fully integrated and working

## 🔧 Setup Required

### Microsoft Ads

**1. Get OAuth Tokens**

You already have the credentials in `.env.local`:
- `MICROSOFT_ADS_DEVELOPER_TOKEN`
- `MICROSOFT_ADS_CLIENT_ID`
- `MICROSOFT_ADS_CUSTOMER_ID`
- `MICROSOFT_ADS_ACCOUNT_ID`

You need to generate the refresh token:

```bash
cd ~/work/synter-media/apps/ppc-backend
./venv/bin/pip install bingads

# Run OAuth flow
./venv/bin/python3 << 'EOF'
from bingads import AuthorizationData, OAuthWebAuthCodeGrant
import os
from dotenv import load_dotenv

load_dotenv('../../.env.local')

client_id = os.getenv('MICROSOFT_ADS_CLIENT_ID')

auth = OAuthWebAuthCodeGrant(
    client_id=client_id,
    redirection_uri="https://login.microsoftonline.com/common/oauth2/nativeclient"
)

print(auth.get_authorization_endpoint())
print("\n1. Open the URL above in your browser")
print("2. Sign in with your Microsoft Ads account")
print("3. Paste the full redirect URL here:")

redirect_url = input()
code = redirect_url.split('code=')[1].split('&')[0]

auth.request_oauth_tokens_by_authorization_code(code)

import json
tokens = {
    'access_token': auth.access_token,
    'refresh_token': auth.refresh_token,
    'expires_in': auth.access_token_expires_in_seconds
}

with open('../../.microsoft_ads_tokens.json', 'w') as f:
    json.dump(tokens, f, indent=2)

print("\n✅ Tokens saved to .microsoft_ads_tokens.json")
EOF
```

**2. Test Integration**
```bash
./venv/bin/python3 fetch-microsoft.py --start 2025-10-20 --end 2025-10-26
```

---

### Reddit Ads

**1. Get OAuth Tokens**

You have:
- `REDDIT_ADS_CLIENT_ID`
- `REDDIT_ADS_CLIENT_SECRET`

Generate refresh token:

```bash
./venv/bin/python3 << 'EOF'
import os
import httpx
from dotenv import load_dotenv
import json

load_dotenv('../../.env.local')

client_id = os.getenv('REDDIT_ADS_CLIENT_ID')
client_secret = os.getenv('REDDIT_ADS_CLIENT_SECRET')

# Reddit OAuth URL
auth_url = f"https://www.reddit.com/api/v1/authorize?client_id={client_id}&response_type=code&state=random&redirect_uri=http://localhost:8080/callback&duration=permanent&scope=adsread"

print(auth_url)
print("\n1. Open the URL above")
print("2. Authorize the app")
print("3. Paste the 'code' parameter from redirect URL:")

code = input()

# Exchange for tokens
token_url = "https://www.reddit.com/api/v1/access_token"
auth = (client_id, client_secret)
data = {
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': 'http://localhost:8080/callback'
}
headers = {'User-Agent': 'Synter Dashboard/1.0'}

response = httpx.post(token_url, auth=auth, data=data, headers=headers)
tokens = response.json()

with open('../../.reddit_ads_tokens.json', 'w') as f:
    json.dump(tokens, f, indent=2)

print("\n✅ Tokens saved to .reddit_ads_tokens.json")
EOF
```

**2. Test Integration**
```bash
./venv/bin/python3 fetch-reddit.py --start 2025-10-20 --end 2025-10-26
```

---

### LinkedIn Ads

**1. Get OAuth Tokens**

You need to add to `.env.local`:
```
LINKEDIN_ADS_CLIENT_ID=your_client_id
LINKEDIN_ADS_CLIENT_SECRET=your_client_secret
```

Then generate tokens:

```bash
./venv/bin/python3 << 'EOF'
import os
from dotenv import load_dotenv
import json

load_dotenv('../../.env.local')

client_id = os.getenv('LINKEDIN_ADS_CLIENT_ID')

# LinkedIn OAuth URL
auth_url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri=http://localhost:8080/callback&scope=r_ads_reporting%20r_ads"

print(auth_url)
print("\n1. Open the URL above")
print("2. Authorize the app")
print("3. Paste the 'code' parameter from redirect URL:")

code = input()

client_secret = os.getenv('LINKEDIN_ADS_CLIENT_SECRET')

import httpx
token_url = "https://www.linkedin.com/oauth/v2/accessToken"
data = {
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': 'http://localhost:8080/callback',
    'client_id': client_id,
    'client_secret': client_secret
}

response = httpx.post(token_url, data=data)
tokens = response.json()

with open('../../.linkedin_ads_tokens.json', 'w') as f:
    json.dump(tokens, f, indent=2)

print("\n✅ Tokens saved to .linkedin_ads_tokens.json")
EOF
```

**2. Test Integration**
```bash
./venv/bin/python3 fetch-linkedin.py --start 2025-10-20 --end 2025-10-26
```

---

## 🧪 Testing All Platforms

Once tokens are set up:

```bash
cd ~/work/synter-media/apps/ppc-backend
./venv/bin/python3 fetch-all-platforms.py --start 2025-10-20 --end 2025-10-26
```

This will fetch from all 4 platforms and show weekly totals.

---

## 🔄 Auto-Update Dashboard

Once all platforms are working:

```bash
cd ~/work/weekly-performance-dashboard
./weekly-update.sh
```

This will:
1. Fetch data from all 4 ad platforms
2. Update the dashboard
3. Commit and deploy to Vercel

---

## 🔐 Token Files (Do NOT commit these)

After setup, you'll have:
- `~/work/synter-media/.microsoft_ads_tokens.json`
- `~/work/synter-media/.reddit_ads_tokens.json`
- `~/work/synter-media/.linkedin_ads_tokens.json`

These are already in `.gitignore`.

---

## ⚠️ Graceful Fallback

If any platform API fails, the system automatically:
- Falls back to previous week's data
- Continues fetching from other platforms
- Logs the error but doesn't stop the update

---

## 📝 Token Refresh

All scripts automatically refresh expired tokens using the refresh_token.

Token files are updated with new access tokens when refreshed.
