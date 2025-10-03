# Credential Vault System

Database-backed credential management for multi-platform ad operations (Google, Microsoft, LinkedIn, Reddit Ads).

## Features

- **No .env edits**: All credentials stored encrypted in database
- **No service restarts**: Add/update accounts via API without downtime
- **Automatic token refresh**: Background worker keeps tokens fresh
- **Multi-platform**: Single interface for Google, Microsoft, LinkedIn, and Reddit Ads
- **Secure**: Envelope encryption with KMS support
- **Provider abstraction**: Common interface across all platforms

## Architecture

```
┌─────────────────┐
│  Admin UI/API   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │ FastAPI  │
    └────┬─────┘
         │
    ┌────┴──────────────────────────────────┐
    │  Services Layer                       │
    ├───────────────────────────────────────┤
    │ • TokenService (auto-refresh)         │
    │ • CryptoService (encryption)          │
    │ • ProviderManager (dispatch)          │
    └────┬──────────────────────────────────┘
         │
    ┌────┴──────────────────────────────────┐
    │  Provider Adapters                    │
    ├───────────────────────────────────────┤
    │ • GoogleAdsProvider                   │
    │ • MicrosoftAdsProvider                │
    │ • LinkedInAdsProvider                 │
    │ • RedditAdsProvider                   │
    └────┬──────────────────────────────────┘
         │
    ┌────┴──────────────────────────────────┐
    │  Database (Encrypted)                 │
    ├───────────────────────────────────────┤
    │ • platforms                           │
    │ • oauth_app_credentials               │
    │ • ad_account_connections              │
    │ • oauth_tokens_vault                  │
    │ • credential_access_audit             │
    └───────────────────────────────────────┘
```

## Setup

### 1. Generate encryption master key

```bash
python -c "from cryptography.fernet import Fernet; print(f'CREDENTIAL_MASTER_KEY={Fernet.generate_key().decode()}')"
```

Add to `.env`:
```
CREDENTIAL_MASTER_KEY=<generated_key>
```

### 2. Run database migrations

```bash
cd apps/ppc-backend

# Create tables
alembic revision --autogenerate -m "Add credential vault tables"
alembic upgrade head

# Seed platforms
python seed_platforms.py
```

### 3. Import legacy credentials (optional)

```bash
python -c "
from services.credential_import import import_from_env
import_from_env()
"
```

## Usage

### Admin: Add OAuth App Credentials

```bash
curl -X POST http://localhost:8000/integrations/google_ads/apps \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Production Google Ads App",
    "client_id": "123456.apps.googleusercontent.com",
    "client_secret": "GOCSPX-...",
    "redirect_uri": "http://localhost:8000/integrations/google_ads/callback",
    "scopes": ["https://www.googleapis.com/auth/adwords"],
    "developer_token": "YOUR_DEV_TOKEN",
    "login_customer_id": "1234567890"
  }'
```

Repeat for other platforms:
- `/integrations/microsoft_ads/apps`
- `/integrations/linkedin_ads/apps`
- `/integrations/reddit_ads/apps`

### User: Connect Ad Account

**1. Start OAuth flow:**
```bash
curl http://localhost:8000/integrations/google_ads/connections/start
```

Response:
```json
{
  "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random_state_token"
}
```

**2. User visits `authorize_url`, grants permission**

**3. OAuth callback** (implement in your app):
```python
@app.get("/integrations/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    # Exchange code for tokens
    provider = ProviderManager.get_provider(platform)
    app_cred = get_app_credentials(db, platform)  # Your helper
    
    token_bundle = await provider.exchange_code_for_tokens(app_cred, code)
    
    # Create connection
    connection = AdAccountConnection(
        id=str(uuid.uuid4()),
        platform_id=get_platform_id(db, platform),
        oauth_app_credentials_id=app_cred.id,
        external_account_id="<account_id_from_token_or_api>",
        account_name="My Ad Account",
        status=ConnectionStatus.ACTIVE,
        connected_by="user_email",
    )
    db.add(connection)
    db.flush()
    
    # Store tokens
    await TokenService.store_new_tokens(db, connection.id, token_bundle)
    
    return {"status": "connected", "connection_id": connection.id}
```

### List Connections

```bash
curl http://localhost:8000/integrations/google_ads/connections
```

### Manually Refresh Token

```bash
curl -X POST http://localhost:8000/integrations/google_ads/connections/{connection_id}/refresh
```

### Use in Application Code

```python
from services.token_service import TokenService
from ads.providers import ProviderManager

# Get valid access token (auto-refreshes if needed)
access_token = await TokenService.get_valid_access_token(db, connection_id)

# Use provider
provider = ProviderManager.get_provider("google_ads")
campaigns = await provider.list_campaigns(access_token, account_id, app_cred)

# Update budget
result = await provider.update_campaign_budget(
    access_token,
    account_id,
    campaign_id,
    new_budget_micros=50_000_000,  # $50/day
    validate_only=False,
    app_cred=app_cred
)
```

## Platform-Specific Notes

### Google Ads
- Requires `developer_token` and `login_customer_id`
- True `validate_only` support
- Supports keywords, budgets, pausing

### Microsoft Ads
- Requires `developer_token`
- OAuth via Azure AD
- Full implementation requires `bingads` SDK

### LinkedIn Ads
- No keyword concept (audience-based)
- Budgets in dollars (converted to micros internally)
- `validate_only` simulated (no actual API call)

### Reddit Ads
- Simpler API, REST-based
- `validate_only` simulated
- No keyword support

## Security

### Encryption
- Secrets encrypted with Fernet (symmetric AES)
- Master key from environment (`CREDENTIAL_MASTER_KEY`)
- Production: use cloud KMS (AWS KMS, GCP KMS, HashiCorp Vault)

### Token Storage
- Access tokens: encrypted, short-lived
- Refresh tokens: encrypted, used to obtain new access tokens
- Automatic expiry tracking and refresh

### Audit
- All credential access logged to `credential_access_audit`
- IP address and user agent tracked

## Automatic Token Refresh

### Background Worker (TODO)

```python
# scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import and_
from datetime import datetime, timedelta

async def refresh_expiring_tokens():
    """Proactively refresh tokens expiring in next 30 minutes."""
    threshold = datetime.utcnow() + timedelta(minutes=30)
    
    expiring_tokens = db.query(OAuthTokenVault).filter(
        and_(
            OAuthTokenVault.expires_at <= threshold,
            OAuthTokenVault.revoked_at == None
        )
    ).all()
    
    for token in expiring_tokens:
        try:
            await TokenService.get_valid_access_token(
                db,
                token.ad_account_connection_id,
                force_refresh=True
            )
        except Exception as e:
            logger.error(f"Failed to refresh token {token.id}: {e}")

scheduler = AsyncIOScheduler()
scheduler.add_job(refresh_expiring_tokens, 'interval', minutes=10)
scheduler.start()
```

## Migration from .env

1. Create OAuth apps in DB for each platform
2. Connect accounts via OAuth flow
3. Verify connections work
4. Remove .env credentials
5. Restart service (last time!)

## API Reference

### Platforms

- `GET /integrations/platforms` - List all platforms and capabilities

### OAuth Apps (Admin)

- `POST /integrations/{platform}/apps` - Create OAuth app
- `GET /integrations/{platform}/apps` - List OAuth apps

### Connections (User)

- `POST /integrations/{platform}/connections/start` - Start OAuth flow
- `GET /integrations/{platform}/connections` - List connections
- `POST /integrations/{platform}/connections/{id}/refresh` - Manual refresh
- `POST /integrations/{platform}/connections/{id}/revoke` - Revoke connection

### Capabilities

- `GET /integrations/{platform}/capabilities` - Get platform capabilities

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Encryption (REQUIRED)
CREDENTIAL_MASTER_KEY=<fernet_key>

# Optional: Redis for distributed locking
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### Token refresh fails
- Check connection status: `GET /integrations/{platform}/connections`
- Look at `status_message` field
- Verify OAuth app is still active in provider console

### "Invalid CREDENTIAL_MASTER_KEY"
- Regenerate key
- Re-encrypt all secrets (see rotation script)

### Connection shows "ERROR" status
- Token refresh failed 3+ times
- User may need to re-authorize
- Revoke and reconnect

## Next Steps

1. Implement OAuth callback route
2. Add background token refresh scheduler
3. Build admin UI for managing apps/connections
4. Set up KMS for production encryption
5. Add RBAC for admin-only operations
