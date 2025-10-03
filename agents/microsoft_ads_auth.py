#!/usr/bin/env python3

"""
Microsoft Ads OAuth Authentication Helper

This script helps you obtain a refresh token for Microsoft Ads API access.
The refresh token can be used long-term to access the API without repeated logins.

Requirements:
    pip install bingads msal requests
"""

import sys
import webbrowser
from urllib.parse import urlencode, parse_qs, urlparse

# Microsoft Ads OAuth Configuration
DEVELOPER_TOKEN = "11085M29YT845526"
REDIRECT_URI = "https://login.microsoftonline.com/common/oauth2/nativeclient"
AUTHORIZATION_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

# Required scopes for Microsoft Advertising
SCOPE = "https://ads.microsoft.com/ads.manage offline_access"

def get_authorization_url(client_id):
    """Generate Microsoft OAuth authorization URL"""
    params = {
        'client_id': client_id,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'scope': SCOPE,
        'response_mode': 'query'
    }
    
    return f"{AUTHORIZATION_ENDPOINT}?{urlencode(params)}"

def exchange_code_for_token(client_id, client_secret, code):
    """Exchange authorization code for access and refresh tokens"""
    import requests
    
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code'
    }
    
    response = requests.post(TOKEN_ENDPOINT, data=data)
    
    if response.status_code != 200:
        raise Exception(f"Token exchange failed: {response.status_code} - {response.text}")
    
    return response.json()

def main():
    print("=== Microsoft Ads API OAuth Setup ===\n")
    print(f"Developer Token: {DEVELOPER_TOKEN}\n")
    
    # Get credentials
    client_id = input("Enter your Azure App Client ID: ").strip()
    if not client_id:
        print("Error: Client ID is required")
        return 1
    
    client_secret = input("Enter your Azure App Client Secret: ").strip()
    if not client_secret=REDACTED("Error: Client Secret is required")
        return 1
    
    # Step 1: Generate authorization URL
    auth_url = get_authorization_url(client_id)
    
    print("\n=== Step 1: Authorize Application ===")
    print("Opening browser for Microsoft login...")
    print(f"\nIf browser doesn't open, visit this URL:")
    print(f"\n{auth_url}\n")
    
    try:
        webbrowser.open(auth_url)
    except:
        pass
    
    print("=== Step 2: Get Authorization Code ===")
    print("After authorizing, you'll be redirected to a URL like:")
    print(f"{REDIRECT_URI}?code=AUTHORIZATION_CODE")
    print("\nCopy the ENTIRE URL from your browser and paste it below:")
    
    redirect_url = input("\nPaste redirect URL: ").strip()
    
    # Parse authorization code
    parsed = urlparse(redirect_url)
    params = parse_qs(parsed.query)
    
    if 'code' not in params:
        print("Error: Could not find authorization code in URL")
        print("Make sure you copied the complete redirect URL")
        return 1
    
    code = params['code'][0]
    print(f"\n✅ Authorization code received: {code[:20]}...")
    
    # Step 2: Exchange code for tokens
    print("\n=== Step 3: Exchange Code for Tokens ===")
    try:
        token_response = exchange_code_for_token(client_id, client_secret, code)
        
        access_token = token_response.get('access_token')
        refresh_token = token_response.get('refresh_token')
        expires_in = token_response.get('expires_in')
        
        print("✅ Successfully obtained tokens!\n")
        
        # Display tokens
        print("=== Your Microsoft Ads API Credentials ===")
        print(f"\nDeveloper Token: {DEVELOPER_TOKEN}")
        print(f"Client ID: {client_id}")
        print(f"Client Secret: {client_secret}")
        print(f"Refresh Token: {refresh_token}")
        print(f"\nAccess Token (expires in {expires_in}s): {access_token[:50]}...")
        
        # Environment variables
        print("\n=== Set Environment Variables ===")
        print("Add these to your shell profile or .env file:\n")
        print(f"export MICROSOFT_ADS_DEVELOPER_TOKEN='{DEVELOPER_TOKEN}'")
        print(f"export MICROSOFT_ADS_CLIENT_ID='{client_id}'")
        print(f"export MICROSOFT_ADS_CLIENT_SECRET='{client_secret}'")
        print(f"export MICROSOFT_ADS_REFRESH_TOKEN='{refresh_token}'")
        print("export MICROSOFT_ADS_CUSTOMER_ID='your_customer_id_here'")
        
        print("\n=== Next Steps ===")
        print("1. Find your Customer ID at: https://ui.ads.microsoft.com/")
        print("2. Set the environment variables above")
        print("3. Run: python3 check_microsoft_ads_token.py")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nAborted by user")
        sys.exit(1)
