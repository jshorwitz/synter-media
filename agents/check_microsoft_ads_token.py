#!/usr/bin/env python3

"""
Check Microsoft Ads API Token and Permissions

Tests connection to Microsoft Ads API and verifies credentials.
"""

import os
import sys

def check_microsoft_ads_access():
    """Test basic Microsoft Ads API access"""
    
    print("=== Microsoft Ads API Connection Check ===\n")
    
    # Check for required environment variables
    developer_token = os.getenv('MICROSOFT_ADS_DEVELOPER_TOKEN')
    client_id = os.getenv('MICROSOFT_ADS_CLIENT_ID')
    client_secret = os.getenv('MICROSOFT_ADS_CLIENT_SECRET')
    refresh_token = os.getenv('MICROSOFT_ADS_REFRESH_TOKEN')
    customer_id = os.getenv('MICROSOFT_ADS_CUSTOMER_ID')
    
    missing = []
    if not developer_token:
        missing.append('MICROSOFT_ADS_DEVELOPER_TOKEN')
    if not client_id:
        missing.append('MICROSOFT_ADS_CLIENT_ID')
    if not client_secret=REDACTED('MICROSOFT_ADS_CLIENT_SECRET')
    if not refresh_token:
        missing.append('MICROSOFT_ADS_REFRESH_TOKEN')
    if not customer_id:
        missing.append('MICROSOFT_ADS_CUSTOMER_ID')
    
    if missing:
        print("❌ Missing environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("\nRun setup first:")
        print("1. python3 microsoft_ads_auth.py")
        print("2. Set environment variables as shown")
        print("3. Run this script again")
        return False
    
    print("✅ All environment variables set")
    print(f"   Developer Token: {developer_token[:10]}...")
    print(f"   Client ID: {client_id[:10]}...")
    print(f"   Customer ID: {customer_id}")
    
    # Try to import and use BingAds SDK
    try:
        from bingads import AuthorizationData, OAuthWebAuthCodeGrant
        from bingads.service_client import ServiceClient
        from bingads.v13.reporting import ReportingServiceManager
        print("\n✅ BingAds SDK installed")
    except ImportError:
        print("\n❌ BingAds SDK not installed")
        print("Install with: pip install bingads")
        return False
    
    # Test OAuth token refresh
    print("\n=== Testing OAuth Token Refresh ===")
    try:
        authentication = OAuthWebAuthCodeGrant(
            client_id=client_id,
            client_secret=REDACTED,
            redirection_uri="https://login.microsoftonline.com/common/oauth2/nativeclient"
        )
        
        # Set the refresh token
        authentication.request_oauth_tokens_by_refresh_token(refresh_token)
        
        print("✅ Successfully refreshed access token")
        print(f"   Token expires in: {authentication.oauth_tokens.access_token_expires_in_seconds}s")
        
    except Exception as e:
        print(f"❌ Token refresh failed: {e}")
        return False
    
    # Test API access with Customer Management Service
    print("\n=== Testing API Access (Customer Management) ===")
    try:
        authorization_data = AuthorizationData(
            account_id=None,
            customer_id=customer_id,
            developer_token=developer_token,
            authentication=authentication
        )
        
        customer_service = ServiceClient(
            service='CustomerManagementService',
            version=13,
            authorization_data=authorization_data
        )
        
        # Get user info
        user = customer_service.GetUser(UserId=None).User
        print(f"✅ Connected as: {user.UserName}")
        print(f"   User ID: {user.Id}")
        print(f"   Customer ID: {user.CustomerId}")
        
    except Exception as e:
        print(f"❌ API access failed: {e}")
        return False
    
    # Test Campaign Management Service
    print("\n=== Testing Campaign Access ===")
    try:
        # Get accounts
        from bingads.v13.customermanagement import SearchAccountsRequest, Paging, Predicate
        
        paging = customer_service.factory.create('ns5:Paging')
        paging.Index = 0
        paging.Size = 10
        
        predicates = customer_service.factory.create('ns5:ArrayOfPredicate')
        predicate = customer_service.factory.create('ns5:Predicate')
        predicate.Field = 'UserId'
        predicate.Operator = 'Equals'
        predicate.Value = user.Id
        predicates.Predicate.append(predicate)
        
        accounts = customer_service.SearchAccounts(
            PageInfo=paging,
            Predicates=predicates
        )
        
        if accounts and hasattr(accounts, 'AdvertiserAccount'):
            print(f"✅ Found {len(accounts.AdvertiserAccount)} account(s)")
            for account in accounts.AdvertiserAccount:
                print(f"   - {account.Name} (ID: {account.Id})")
                print(f"     Currency: {account.CurrencyCode}")
                print(f"     TimeZone: {account.TimeZone}")
        else:
            print("⚠️  No accounts found")
        
    except Exception as e:
        print(f"⚠️  Campaign access check skipped: {e}")
    
    print("\n" + "="*50)
    print("✅ Microsoft Ads API connection successful!")
    print("="*50)
    print("\nNext step: python3 sourcegraph_microsoft_ads_analysis.py")
    
    return True

if __name__ == "__main__":
    try:
        success = check_microsoft_ads_access()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nAborted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
