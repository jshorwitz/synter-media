# Microsoft Ads API Setup Guide

## Credentials

You have been provided with a **Developer Token**: `11085M29YT845526`

## What You Need

To access Microsoft Ads API, you need:

1. **Developer Token** ✅ (provided above)
2. **Client ID** - OAuth app client ID
3. **Client Secret** - OAuth app client secret
4. **Refresh Token** - Long-lived token for API access
5. **Customer ID** - Your Microsoft Ads account ID

## Step 1: Create Microsoft Ads OAuth Application

1. **Go to Microsoft Azure Portal:**
   - https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

2. **Register a new application:**
   - Click "New registration"
   - Name: "Synter Microsoft Ads Integration"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
   - Click "Register"

3. **Get Client ID:**
   - After registration, copy the "Application (client) ID"

4. **Create Client Secret:**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "Synter API Access"
   - Expiration: 24 months
   - Click "Add" and copy the secret value immediately (it won't be shown again)

## Step 2: Get Your Customer ID

1. **Go to Microsoft Ads:**
   - https://ui.ads.microsoft.com/

2. **Find your Customer ID:**
   - Click on your account name (top right)
   - Look for "Account ID" or "Customer ID" (usually a number like 123456789)

## Step 3: Generate Refresh Token

Once you have your Client ID and Client Secret, run:

```bash
python3 microsoft_ads_auth.py
```

This will guide you through OAuth flow to get a refresh token.

## Step 4: Set Environment Variables

```bash
export MICROSOFT_ADS_DEVELOPER_TOKEN='11085M29YT845526'
export MICROSOFT_ADS_CLIENT_ID='your_client_id_here'
export MICROSOFT_ADS_CLIENT_SECRET='your_client_secret_here'
export MICROSOFT_ADS_REFRESH_TOKEN='your_refresh_token_here'
export MICROSOFT_ADS_CUSTOMER_ID='your_customer_id_here'
```

## Step 5: Test Connection

```bash
python3 check_microsoft_ads_token.py
```

## Step 6: Analyze Campaigns

```bash
python3 sourcegraph_microsoft_ads_analysis.py
```

---

## API Documentation

- **Microsoft Advertising API Docs:** https://docs.microsoft.com/en-us/advertising/guides/
- **Bing Ads Python SDK:** https://github.com/BingAds/BingAds-Python-SDK
- **OAuth Guide:** https://docs.microsoft.com/en-us/advertising/guides/authentication-oauth

## Common Issues

### Issue: "Invalid client_id"
- Verify you copied the Application (client) ID correctly from Azure Portal
- Make sure the app is registered for Microsoft Advertising API

### Issue: "Invalid redirect_uri"
- Use exact redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
- Must match what's configured in Azure app registration

### Issue: "Developer token is not valid"
- Confirm token: `11085M29YT845526`
- Make sure your Microsoft Ads account has API access enabled

---

*Generated for Synter cross-platform ads integration*
