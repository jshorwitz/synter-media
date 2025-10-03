# Microsoft Ads Integration Setup

This guide walks you through setting up Microsoft Ads API integration for Synter.

## Prerequisites

- Microsoft Ads account with API access
- Azure account for OAuth app registration
- Developer Token: **11085M29YT845526** (already configured)

## Quick Start

### 1. Create Azure OAuth Application

1. Go to [Azure Portal - App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **"New registration"**
3. Configure:
   - **Name**: "Synter Microsoft Ads Integration"
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. Click **"Register"**

### 2. Get Credentials

**Client ID:**
- Copy the "Application (client) ID" from the app overview page

**Client Secret:**
1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "Synter API Access"
4. Expiration: 24 months
5. Copy the secret value **immediately** (won't be shown again)

**Customer ID:**
1. Go to [Microsoft Ads](https://ui.ads.microsoft.com/)
2. Click your account name (top right)
3. Copy the "Account ID" or "Customer ID"

### 3. Generate Refresh Token

```bash
cd agents
python3 microsoft_ads_auth.py
```

Follow the OAuth flow in your browser to generate a refresh token.

### 4. Configure Environment Variables

Add to your `.env` file:

```bash
MICROSOFT_ADS_DEVELOPER_TOKEN=11085M29YT845526
MICROSOFT_ADS_CLIENT_ID=your_client_id_here
MICROSOFT_ADS_CLIENT_SECRET=your_client_secret_here
MICROSOFT_ADS_REFRESH_TOKEN=your_refresh_token_here
MICROSOFT_ADS_CUSTOMER_ID=your_customer_id_here
MICROSOFT_ADS_ACCOUNT_ID=your_account_id_here
```

### 5. Test Connection

```bash
python3 agents/check_microsoft_ads_token.py
```

### 6. Run Ingestor Agent

**Manual run (yesterday's data):**
```bash
python3 agents/ingestor_microsoft_ads.py
```

**Custom date range:**
```bash
python3 agents/ingestor_microsoft_ads.py --start 2025-01-01 --end 2025-01-10
```

**Dry run (no database writes):**
```bash
DRY_RUN=true python3 agents/ingestor_microsoft_ads.py
```

**Mock mode (synthetic data):**
```bash
MOCK_MICROSOFT=true python3 agents/ingestor_microsoft_ads.py
```

## Agent Features

The Microsoft Ads ingestor (`ingestor_microsoft_ads.py`) implements:

- ✅ Scheduled runs (every 2 hours) or manual triggers
- ✅ DRY_RUN mode (compute only, no writes)
- ✅ MOCK_MICROSOFT mode (synthetic data for testing)
- ✅ Idempotent upserts on unique keys
- ✅ Retry with exponential backoff
- ✅ Normalization to `ad_metrics` table

## Data Schema

Metrics are normalized to the `ad_metrics` table:

| Column | Description |
|--------|-------------|
| `platform` | Always 'microsoft' |
| `date` | Campaign date (YYYY-MM-DD) |
| `account_id` | Microsoft Ads customer ID |
| `campaign_id` | Campaign identifier |
| `adgroup_id` | Ad group identifier |
| `ad_id` | Ad identifier |
| `impressions` | Number of impressions |
| `clicks` | Number of clicks |
| `spend` | Cost in USD |
| `conversions` | Number of conversions |
| `raw` | Full JSON response from API |

## Troubleshooting

### "Invalid client_id"
- Verify Client ID from Azure Portal
- Ensure app is registered for Microsoft Advertising API

### "Invalid redirect_uri"
- Must use: `https://login.microsoftonline.com/common/oauth2/nativeclient`
- Must match Azure app registration exactly

### "Developer token is not valid"
- Confirm token: `11085M29YT845526`
- Verify Microsoft Ads account has API access enabled

### Refresh token expired
- Re-run `python3 agents/microsoft_ads_auth.py` to get new token
- Update `.env` with new `MICROSOFT_ADS_REFRESH_TOKEN`

## API Resources

- [Microsoft Advertising API Docs](https://docs.microsoft.com/en-us/advertising/guides/)
- [Bing Ads Python SDK](https://github.com/BingAds/BingAds-Python-SDK)
- [OAuth Guide](https://docs.microsoft.com/en-us/advertising/guides/authentication-oauth)
- [Azure App Registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

## Integration with Synter Platform

Once configured, Microsoft Ads data will:
1. Be ingested every 2 hours via the agent
2. Populate the `ad_metrics` table alongside Google/Reddit/X data
3. Appear in the unified dashboard with tactical UI
4. Be available for attribution modeling
5. Support budget optimization across platforms

---

**Status**: Ready for production deployment  
**Developer Token**: Pre-configured (11085M29YT845526)  
**Next Steps**: Configure OAuth credentials and test connection
