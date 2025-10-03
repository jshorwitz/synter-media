# Setup and Test Guide - Multi-Platform Ad Credential Vault

## ✅ Implementation Complete

All code has been committed to GitHub. Here's how to set up and test the system.

## Quick Setup (5 Minutes)

### 1. Install Dependencies

```bash
cd apps/ppc-backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Generate Encryption Key

```bash
# Generate master key for encrypting credentials
python3 -c "from cryptography.fernet import Fernet; print(f'CREDENTIAL_MASTER_KEY={Fernet.generate_key().decode()}')"
```

Copy the output to your `.env` file.

### 3. Configure Environment

Create or update `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/synter_ppc
# Or for local testing:
# DATABASE_URL=sqlite:///./ppc.db

# Encryption (REQUIRED)
CREDENTIAL_MASTER_KEY=<paste_generated_key_here>

# Basic Auth
APP_BASIC_AUTH_USER=admin
APP_BASIC_AUTH_PASS=your-secure-password
```

### 4. Initialize Database

```bash
# Run migrations
alembic upgrade head

# Seed platforms (Google, Microsoft, LinkedIn, Reddit)
python seed_platforms.py
```

Expected output:
```
✓ Added platform: google_ads
✓ Added platform: microsoft_ads
✓ Added platform: linkedin_ads
✓ Added platform: reddit_ads
✅ Platform seeding complete!
```

### 5. Start Server

```bash
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
🚀 Token refresh scheduler started
  - Refresh expiring tokens: every 10 minutes
  - Health check: every hour
  - Cleanup expired: every 6 hours
```

## Testing the System

### Test 1: List Platforms

```bash
curl http://localhost:8000/integrations/platforms
```

Expected response:
```json
{
  "platforms": [
    {
      "name": "google_ads",
      "capabilities": ["keywords", "budgets", "pause_campaign", "pause_ad", "negative_keywords", "bid_adjustments"]
    },
    {
      "name": "reddit_ads",
      "capabilities": ["budgets", "pause_campaign", "pause_ad", "audience_targeting"]
    },
    {
      "name": "linkedin_ads",
      "capabilities": ["budgets", "pause_campaign", "pause_ad", "audience_targeting"]
    },
    {
      "name": "microsoft_ads",
      "capabilities": ["keywords", "budgets", "pause_campaign", "pause_ad", "negative_keywords", "bid_adjustments"]
    }
  ]
}
```

### Test 2: Register OAuth App (Google Ads Example)

```bash
curl -X POST http://localhost:8000/integrations/google_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Test Google Ads App",
    "client_id": "test-client-id",
    "client_secret": "test-secret",
    "redirect_uri": "http://localhost:8000/auth/google_ads/callback",
    "scopes": ["https://www.googleapis.com/auth/adwords"],
    "developer_token": "test-dev-token",
    "login_customer_id": "1234567890"
  }'
```

### Test 3: Start OAuth Flow

```bash
curl http://localhost:8000/integrations/google_ads/connections/start \
  -u admin:your-password
```

Response:
```json
{
  "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random_secure_token"
}
```

### Test 4: Check Scheduler Status

```bash
curl http://localhost:8000/scheduler/status -u admin:your-password
```

Response:
```json
{
  "running": true,
  "total_jobs": 3,
  "jobs": [
    {
      "id": "refresh_tokens",
      "name": "Refresh expiring tokens",
      "next_run": "2025-10-02T12:10:00",
      "trigger": "interval[0:10:00]"
    },
    {
      "id": "health_check",
      "name": "Connection health check",
      "next_run": "2025-10-02T13:00:00",
      "trigger": "interval[1:00:00]"
    },
    {
      "id": "cleanup_expired",
      "name": "Cleanup expired connections",
      "next_run": "2025-10-02T18:00:00",
      "trigger": "interval[6:00:00]"
    }
  ]
}
```

### Test 5: Manual Token Refresh Trigger

```bash
curl -X POST http://localhost:8000/scheduler/refresh-now \
  -u admin:your-password
```

## Complete OAuth Flow Test

### For Reddit Ads (Easiest to Test)

1. **Get Reddit App Credentials**
   - Go to https://www.reddit.com/prefs/apps
   - Create app: type "web app"
   - Set redirect URI: `http://localhost:8000/auth/reddit_ads/callback`
   - Copy client ID and secret

2. **Register in System**
```bash
curl -X POST http://localhost:8000/integrations/reddit_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Reddit Test",
    "client_id": "YOUR_REDDIT_CLIENT_ID",
    "client_secret": "YOUR_REDDIT_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8000/auth/reddit_ads/callback",
    "scopes": ["ads.read", "ads.write"]
  }'
```

3. **Start OAuth Flow**
```bash
curl http://localhost:8000/integrations/reddit_ads/connections/start \
  -u admin:your-password
```

4. **Visit Authorization URL**
   - Copy the `authorize_url` from response
   - Open in browser
   - Click "Allow"
   - You'll be redirected to callback with success message

5. **Verify Connection**
```bash
curl http://localhost:8000/integrations/reddit_ads/connections \
  -u admin:your-password
```

Expected response:
```json
[
  {
    "id": "uuid-here",
    "platform": "reddit_ads",
    "external_account_id": "account_id",
    "account_name": "My Reddit Account",
    "status": "active",
    "created_at": "2025-10-02T12:00:00",
    "expires_at": "2025-10-02T13:00:00"
  }
]
```

6. **Test API Call Using Connection**
```python
from services.token_service import TokenService
from ads.providers import ProviderManager
from database import get_db

db = next(get_db())
connection_id = "your-connection-id"

# Get valid token (auto-refreshes if needed)
access_token = await TokenService.get_valid_access_token(db, connection_id)

# Use provider
provider = ProviderManager.get_provider("reddit_ads")
campaigns = await provider.list_campaigns(access_token, account_id)

print(f"Found {len(campaigns)} campaigns")
```

## Troubleshooting

### Issue: "CREDENTIAL_MASTER_KEY not set"
**Solution:** Generate and add to .env:
```bash
python -c "from cryptography.fernet import Fernet; print(f'CREDENTIAL_MASTER_KEY={Fernet.generate_key().decode()}')" >> .env
```

### Issue: "Platform not found"
**Solution:** Run seed script:
```bash
python seed_platforms.py
```

### Issue: Database errors
**Solution:** Run migrations:
```bash
alembic upgrade head
```

### Issue: Scheduler not starting
**Solution:** Check logs for errors. Ensure DATABASE_URL is set.

### Issue: OAuth callback fails
**Solution:**
1. Verify redirect URI matches exactly in platform console
2. Check that app is approved for Ads API access (LinkedIn, Microsoft)
3. Ensure scopes are correct

## Next Steps

### Production Deployment

1. **Use Cloud KMS**
   - Replace `CREDENTIAL_MASTER_KEY` with AWS KMS / GCP KMS
   - Update `services/crypto_service.py` to use KMS

2. **Set Up PostgreSQL**
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - Update `DATABASE_URL`

3. **Add Redis for Locking**
   - For multi-instance deployments
   - Update TokenService to use Redis locks

4. **Configure RBAC**
   - Add user authentication
   - Restrict admin endpoints

5. **Set Up Monitoring**
   - Monitor scheduler job execution
   - Alert on token refresh failures
   - Track API quota usage

### Register Real OAuth Apps

**Google Ads:**
1. Create OAuth app at https://console.cloud.google.com/
2. Enable Google Ads API
3. Get developer token at https://ads.google.com/
4. Register via API

**Microsoft Ads:**
1. Create Azure AD app
2. Get developer token from Microsoft Advertising
3. Register via API

**LinkedIn Ads:**
1. Apply for Marketing Developer Platform access
2. Create OAuth app
3. Register via API

**Reddit Ads:**
1. Create app at https://www.reddit.com/prefs/apps
2. Get Reddit Ads account access
3. Register via API

## API Documentation

Full interactive docs at: http://localhost:8000/docs

### Key Endpoints

**Platforms:**
- `GET /integrations/platforms` - List all platforms

**OAuth Apps (Admin):**
- `POST /integrations/{platform}/apps` - Register app
- `GET /integrations/{platform}/apps` - List apps

**Connections:**
- `POST /integrations/{platform}/connections/start` - Start OAuth
- `GET /integrations/{platform}/connections` - List connections
- `POST /integrations/{platform}/connections/{id}/refresh` - Force refresh
- `POST /integrations/{platform}/connections/{id}/revoke` - Revoke

**Scheduler:**
- `GET /scheduler/status` - View job status
- `POST /scheduler/refresh-now` - Manual refresh trigger

**OAuth Callbacks:**
- `GET /auth/{platform}/callback` - OAuth redirect endpoint
- `GET /auth/{platform}/status` - Connection health

## Files Reference

```
apps/ppc-backend/
├── CREDENTIAL_VAULT_README.md          # Full documentation
├── QUICK_START_VAULT.md               # Quick start guide
├── SETUP_AND_TEST.md                  # This file
│
├── models_vault.py                    # Database models
├── scheduler.py                       # Background token refresh
├── seed_platforms.py                  # Platform seeder
│
├── services/
│   ├── crypto_service.py              # Encryption
│   └── token_service.py               # Token management
│
├── ads/providers/
│   ├── base.py                        # Provider interface
│   ├── google.py                      # Google Ads
│   ├── microsoft.py                   # Microsoft Ads
│   ├── linkedin.py                    # LinkedIn Ads
│   └── reddit.py                      # Reddit Ads
│
└── routers/
    ├── integrations.py                # Credential management API
    ├── oauth_callbacks.py             # OAuth handlers
    └── scheduler_status.py            # Scheduler monitoring
```

## Support

- 📖 Docs: See [CREDENTIAL_VAULT_README.md](./CREDENTIAL_VAULT_README.md)
- 🚀 Quick Start: See [QUICK_START_VAULT.md](./QUICK_START_VAULT.md)
- 📝 Implementation: See [MULTI_PLATFORM_ADS_IMPLEMENTATION.md](../../MULTI_PLATFORM_ADS_IMPLEMENTATION.md)

## Success Criteria

✅ Server starts without errors
✅ Scheduler shows 3 running jobs
✅ Can list platforms via API
✅ Can register OAuth apps
✅ Can start OAuth flow
✅ Callback handler processes authorization
✅ Tokens are encrypted in database
✅ Automatic refresh works
✅ Health checks run successfully

**System is production-ready when all criteria pass!**
