#!/usr/bin/env python3
"""
Fetch Reddit Ads weekly data for dashboard.
Usage: python fetch-reddit.py --start 2025-10-20 --end 2025-10-26
"""
import argparse
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import httpx

# Load from parent .env.local
load_dotenv('../../.env.local')

def fetch_reddit_ads(start_date, end_date):
    """Fetch Reddit Ads data using REST API."""
    print(f"🔍 Fetching Reddit Ads data for {start_date} to {end_date}...")
    
    client_id = os.getenv("REDDIT_ADS_CLIENT_ID")
    client_secret = os.getenv("REDDIT_ADS_CLIENT_SECRET")
    
    if not all([client_id, client_secret]):
        print("  ❌ Reddit Ads credentials not configured")
        return None
    
    # Check for token file
    token_file = os.path.join(os.path.dirname(__file__), '../../.reddit_ads_tokens.json')
    
    if not os.path.exists(token_file):
        print(f"  ❌ Token file not found: {token_file}")
        print("  💡 Run Reddit Ads OAuth flow to generate tokens")
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
        
        # If access token expired, try to refresh
        if not access_token and refresh_token:
            print("  🔄 Refreshing Reddit access token...")
            token_url = "https://www.reddit.com/api/v1/access_token"
            
            auth = (client_id, client_secret)
            data = {
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token
            }
            headers = {'User-Agent': 'Synter Dashboard/1.0'}
            
            response = httpx.post(token_url, auth=auth, data=data, headers=headers)
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
        # Reddit Ads API endpoint
        base_url = "https://ads-api.reddit.com/api/v2.0"
        
        # Get account info first
        headers = {
            'Authorization': f'Bearer {access_token}',
            'User-Agent': 'Synter Dashboard/1.0'
        }
        
        # Get accounts
        print("  📊 Fetching account data...")
        accounts_response = httpx.get(f"{base_url}/accounts", headers=headers)
        accounts_response.raise_for_status()
        accounts_data = accounts_response.json()
        
        if not accounts_data or 'data' not in accounts_data:
            print("  ❌ No accounts found")
            return None
        
        # Use first account
        account_id = accounts_data['data'][0]['id']
        
        # Fetch campaign performance
        # Reddit Ads API uses ISO dates
        params = {
            'start_date': start_date,
            'end_date': end_date,
            'granularity': 'total'
        }
        
        print(f"  📊 Fetching campaign metrics for account {account_id}...")
        stats_url = f"{base_url}/accounts/{account_id}/campaigns/metrics"
        stats_response = httpx.get(stats_url, headers=headers, params=params, timeout=30.0)
        stats_response.raise_for_status()
        stats_data = stats_response.json()
        
        # Aggregate metrics
        total_impr = 0
        total_clicks = 0
        total_spend = 0
        total_conv = 0
        
        if 'data' in stats_data:
            for campaign in stats_data['data']:
                metrics = campaign.get('metrics', {})
                total_impr += int(metrics.get('impressions', 0))
                total_clicks += int(metrics.get('clicks', 0))
                total_spend += float(metrics.get('spend', 0))
                total_conv += int(metrics.get('conversions', 0))
        
        result = {
            'impressions': total_impr,
            'clicks': total_clicks,
            'spend': round(total_spend, 2),
            'conversions': total_conv
        }
        
        print(f"  ✅ Reddit: ${result['spend']:,.2f} spend, {result['impressions']:,} impr, {result['clicks']:,} clicks, {result['conversions']} conv")
        return result
        
    except httpx.HTTPStatusError as e:
        print(f"  ❌ Reddit Ads API error: {e.response.status_code}")
        print(f"     {e.response.text}")
        return None
    except Exception as e:
        print(f"  ❌ Reddit Ads error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', default='2025-10-20')
    parser.add_argument('--end', default='2025-10-26')
    args = parser.parse_args()
    
    result = fetch_reddit_ads(args.start, args.end)
    
    if result:
        print(f"\n{'='*80}")
        print("REDDIT ADS TOTALS")
        print(f"{'='*80}")
        print(f"Impressions: {result['impressions']:,}")
        print(f"Clicks: {result['clicks']:,}")
        print(f"Spend: ${result['spend']:,.2f}")
        print(f"Conversions: {result['conversions']}")
        print(f"{'='*80}")
    else:
        print("\n❌ Failed to fetch Reddit Ads data")
        sys.exit(1)

if __name__ == "__main__":
    main()
