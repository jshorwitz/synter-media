# Quick Start: Multi-Platform Ad Credential Management

Get started with the credential vault system in 5 minutes.

## Prerequisites

- Python 3.9+
- PostgreSQL database
- Ad platform OAuth app registrations

## Step 1: Install Dependencies

```bash
cd apps/ppc-backend
pip install -r requirements.txt
```

## Step 2: Configure Environment

```bash
# Generate encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" > .master_key

# Add to .env
cat >> .env <<EOF
DATABASE_URL=postgresql://user:pass@localhost:5432/synter_ppc
CREDENTIAL_MASTER_KEY=$(cat .master_key)
EOF
```

## Step 3: Initialize Database

```bash
# Run migration
alembic upgrade head

# Seed platforms
python seed_platforms.py
```

Output:
```
✓ Added platform: google_ads
✓ Added platform: microsoft_ads
✓ Added platform: linkedin_ads
✓ Added platform: reddit_ads
✅ Platform seeding complete!
```

## Step 4: Start API Server

```bash
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs for interactive API documentation.

## Step 5: Register OAuth Apps

### Google Ads

```bash
curl -X POST http://localhost:8000/integrations/google_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Google Ads Production",
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8000/auth/google_ads/callback",
    "scopes": ["https://www.googleapis.com/auth/adwords"],
    "developer_token": "YOUR_DEVELOPER_TOKEN",
    "login_customer_id": "YOUR_MCC_ID"
  }'
```

### Reddit Ads

```bash
curl -X POST http://localhost:8000/integrations/reddit_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Reddit Ads Production",
    "client_id": "YOUR_REDDIT_CLIENT_ID",
    "client_secret": "YOUR_REDDIT_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8000/auth/reddit_ads/callback",
    "scopes": ["ads.read", "ads.write"]
  }'
```

### Microsoft Ads

```bash
curl -X POST http://localhost:8000/integrations/microsoft_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Microsoft Ads Production",
    "client_id": "YOUR_AZURE_CLIENT_ID",
    "client_secret": "YOUR_AZURE_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8000/auth/microsoft_ads/callback",
    "scopes": ["https://ads.microsoft.com/ads.manage", "offline_access"],
    "developer_token": "YOUR_MS_DEVELOPER_TOKEN"
  }'
```

### LinkedIn Ads

```bash
curl -X POST http://localhost:8000/integrations/linkedin_ads/apps \
  -u admin:your-password \
  -H "Content-Type: application/json" \
  -d '{
    "label": "LinkedIn Ads Production",
    "client_id": "YOUR_LINKEDIN_CLIENT_ID",
    "client_secret": "YOUR_LINKEDIN_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8000/auth/linkedin_ads/callback",
    "scopes": ["r_ads", "r_ads_reporting", "rw_ads"]
  }'
```

## Step 6: Connect an Ad Account (Example: Google Ads)

**1. Get authorization URL:**

```bash
curl http://localhost:8000/integrations/google_ads/connections/start \
  -u admin:your-password
```

**2. Visit the URL in browser, grant permissions**

**3. Implement callback handler** (add to your app):

```python
# In your OAuth callback route
from ads.providers import ProviderManager
from services.token_service import TokenService
from models_vault import AdAccountConnection, ConnectionStatus
import uuid

@app.get("/auth/{platform}/callback")
async def handle_oauth_callback(
    platform: str,
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    # Get app credentials
    app_cred_model = db.query(OAuthAppCredential).filter(
        OAuthAppCredential.platform_id == get_platform_id(platform),
        OAuthAppCredential.is_active == True
    ).first()
    
    # Exchange code for tokens
    provider = ProviderManager.get_provider(platform)
    app_cred = decrypt_app_cred(app_cred_model)  # Helper function
    token_bundle = await provider.exchange_code_for_tokens(app_cred, code)
    
    # Create connection record
    connection = AdAccountConnection(
        id=str(uuid.uuid4()),
        platform_id=get_platform_id(platform),
        oauth_app_credentials_id=app_cred_model.id,
        external_account_id="<get from API>",  # Fetch account ID
        account_name="My Account",
        status=ConnectionStatus.ACTIVE,
        connected_by="user@example.com",
    )
    db.add(connection)
    db.flush()
    
    # Store tokens
    await TokenService.store_new_tokens(db, connection.id, token_bundle)
    
    return RedirectResponse(url="/success")
```

## Step 7: Use in Your Code

```python
from services.token_service import TokenService
from ads.providers import ProviderManager

# Get token (auto-refreshes)
access_token = await TokenService.get_valid_access_token(db, connection_id)

# Use provider
provider = ProviderManager.get_provider("google_ads")
campaigns = await provider.list_campaigns(access_token, account_id, app_cred)

# Update budget
await provider.update_campaign_budget(
    access_token,
    account_id,
    campaign_id,
    new_budget_micros=100_000_000,  # $100/day
    validate_only=False,
    app_cred=app_cred
)
```

## Verify Setup

```bash
# List all platforms
curl http://localhost:8000/integrations/platforms -u admin:your-password

# List connections
curl http://localhost:8000/integrations/google_ads/connections -u admin:your-password

# Check capabilities
curl http://localhost:8000/integrations/reddit_ads/capabilities -u admin:your-password
```

## What's Next?

1. ✅ Credentials stored encrypted in database
2. ✅ No more .env file updates
3. ✅ Automatic token refresh
4. ✅ Multi-platform support

### Optional Enhancements:

- [ ] Build admin UI for credential management
- [ ] Add background scheduler for proactive token refresh
- [ ] Implement Redis-based distributed locking
- [ ] Set up KMS for production encryption
- [ ] Add webhook notifications for token expiry

## Troubleshooting

### "CREDENTIAL_MASTER_KEY not set"
```bash
python -c "from cryptography.fernet import Fernet; print(f'CREDENTIAL_MASTER_KEY={Fernet.generate_key().decode()}')" >> .env
```

### Database migration fails
```bash
alembic downgrade base
alembic upgrade head
```

### OAuth callback not working
- Verify redirect URI matches exactly in platform console
- Check state parameter validation
- Ensure callback route is implemented

## Support

- 📖 [Full Documentation](./CREDENTIAL_VAULT_README.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Ask Questions](https://github.com/your-repo/discussions)
