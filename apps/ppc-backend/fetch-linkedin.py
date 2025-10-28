#!/usr/bin/env python3
"""
Fetch LinkedIn Ads weekly data for dashboard.
Usage: python fetch-linkedin.py --start 2025-10-20 --end 2025-10-26
"""
import argparse
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import httpx

# Load from parent .env.local
load_dotenv('../../.env.local')

def fetch_linkedin_ads(start_date, end_date):
    """Fetch LinkedIn Ads data using Marketing API."""
    print(f"🔍 Fetching LinkedIn Ads data for {start_date} to {end_date}...")
    
    client_id = os.getenv("LINKEDIN_ADS_CLIENT_ID")
    client_secret = os.getenv("LINKEDIN_ADS_CLIENT_SECRET")
    
    if not all([client_id, client_secret]):
        print("  ❌ LinkedIn Ads credentials not configured")
        return None
    
    # Check for token file
    token_file = os.path.join(os.path.dirname(__file__), '../../.linkedin_ads_tokens.json')
    
    if not os.path.exists(token_file):
        print(f"  ❌ Token file not found: {token_file}")
        print("  💡 Run LinkedIn Ads OAuth flow to generate tokens")
        return None
    
    try:
        import json
        with open(token_file, 'r') as f:
            tokens = json.load(f)
        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')
        
        if not access_token and not refresh_token:
            print("  ❌ No valid tokens in token file")
            return None
        
        # If access token expired, refresh it
        if not access_token and refresh_token:
            print("  🔄 Refreshing LinkedIn access token...")
            token_url = "https://www.linkedin.com/oauth/v2/accessToken"
            
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
                'client_id': client_id,
                'client_secret': client_secret
            }
            
            response = httpx.post(token_url, data=data)
            response.raise_for_status()
            
            token_response = response.json()
            access_token = token_response.get('access_token')
            
            # Update token file
            tokens['access_token'] = access_token
            tokens['expires_in'] = token_response.get('expires_in')
            with open(token_file, 'w') as f:
                json.dump(tokens, f, indent=2)
            
            print("  ✅ Token refreshed")
            
    except Exception as e:
        print(f"  ❌ Error with tokens: {e}")
        return None
    
    try:
        # LinkedIn Marketing API
        base_url = "https://api.linkedin.com/v2"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Get ad accounts
        print("  📊 Fetching ad accounts...")
        accounts_url = f"{base_url}/adAccountsV2?q=search"
        accounts_response = httpx.get(accounts_url, headers=headers)
        accounts_response.raise_for_status()
        accounts_data = accounts_response.json()
        
        if not accounts_data.get('elements'):
            print("  ❌ No ad accounts found")
            return None
        
        # Use first account
        account_id = accounts_data['elements'][0]['id']
        
        # Convert dates to LinkedIn format (Unix timestamps in milliseconds)
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        start_ts = int(start_dt.timestamp() * 1000)
        end_ts = int(end_dt.timestamp() * 1000)
        
        # Fetch analytics
        print(f"  📊 Fetching campaign analytics for account {account_id}...")
        
        # Get campaigns for this account
        campaigns_url = f"{base_url}/adCampaignsV2?q=search&search.account.values[0]=urn:li:sponsoredAccount:{account_id}"
        campaigns_response = httpx.get(campaigns_url, headers=headers)
        campaigns_response.raise_for_status()
        campaigns_data = campaigns_response.json()
        
        # Aggregate metrics across all campaigns
        total_impr = 0
        total_clicks = 0
        total_spend = 0
        total_conv = 0
        
        for campaign in campaigns_data.get('elements', []):
            campaign_urn = campaign['id']
            
            # Get analytics for this campaign
            analytics_url = f"{base_url}/adAnalyticsV2"
            params = {
                'q': 'analytics',
                'pivot': 'CAMPAIGN',
                'dateRange.start.day': start_dt.day,
                'dateRange.start.month': start_dt.month,
                'dateRange.start.year': start_dt.year,
                'dateRange.end.day': end_dt.day,
                'dateRange.end.month': end_dt.month,
                'dateRange.end.year': end_dt.year,
                'campaigns[0]': campaign_urn,
                'fields': 'impressions,clicks,costInUsd,externalWebsiteConversions'
            }
            
            analytics_response = httpx.get(analytics_url, headers=headers, params=params, timeout=30.0)
            
            if analytics_response.status_code == 200:
                analytics_data = analytics_response.json()
                
                for element in analytics_data.get('elements', []):
                    total_impr += int(element.get('impressions', 0))
                    total_clicks += int(element.get('clicks', 0))
                    total_spend += float(element.get('costInUsd', 0))
                    total_conv += int(element.get('externalWebsiteConversions', 0))
        
        result = {
            'impressions': total_impr,
            'clicks': total_clicks,
            'spend': round(total_spend, 2),
            'conversions': total_conv
        }
        
        print(f"  ✅ LinkedIn: ${result['spend']:,.2f} spend, {result['impressions']:,} impr, {result['clicks']:,} clicks, {result['conversions']} conv")
        return result
        
    except httpx.HTTPStatusError as e:
        print(f"  ❌ LinkedIn Ads API error: {e.response.status_code}")
        print(f"     {e.response.text}")
        return None
    except Exception as e:
        print(f"  ❌ LinkedIn Ads error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', default='2025-10-20')
    parser.add_argument('--end', default='2025-10-26')
    args = parser.parse_args()
    
    result = fetch_linkedin_ads(args.start, args.end)
    
    if result:
        print(f"\n{'='*80}")
        print("LINKEDIN ADS TOTALS")
        print(f"{'='*80}")
        print(f"Impressions: {result['impressions']:,}")
        print(f"Clicks: {result['clicks']:,}")
        print(f"Spend: ${result['spend']:,.2f}")
        print(f"Conversions: {result['conversions']}")
        print(f"{'='*80}")
    else:
        print("\n❌ Failed to fetch LinkedIn Ads data")
        sys.exit(1)

if __name__ == "__main__":
    main()
