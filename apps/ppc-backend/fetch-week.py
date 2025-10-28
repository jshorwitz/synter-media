#!/usr/bin/env python3
"""
Fetch weekly Google Ads data for dashboard update.
Usage: python fetch-week.py --start 2025-10-20 --end 2025-10-26
"""
import argparse
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load from parent .env.local
load_dotenv('../../.env.local')

# Add current dir to path
sys.path.insert(0, os.path.dirname(__file__))

from ads.client import GoogleAdsClientFactory

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', default='2025-10-20', help='Start date YYYY-MM-DD')
    parser.add_argument('--end', default='2025-10-26', help='End date YYYY-MM-DD')
    args = parser.parse_args()
    
    print(f"🔍 Fetching Google Ads data for {args.start} to {args.end}...\n")
    
    try:
        # Get client
        factory = GoogleAdsClientFactory()
        client = factory.get_client()
        customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")
        
        if not customer_id:
            print("❌ GOOGLE_ADS_CUSTOMER_ID not set")
            sys.exit(1)
        
        print(f"🔑 Customer ID: {customer_id}\n")
        
        ga_service = client.get_service("GoogleAdsService")
        
        # Simplified query without problematic fields
        query = f"""
            SELECT
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions
            FROM campaign
            WHERE segments.date BETWEEN '{args.start}' AND '{args.end}'
                AND campaign.status != 'REMOVED'
        """
        
        print("📊 Fetching campaign performance...\n")
        response = ga_service.search(customer_id=customer_id, query=query)
        
        # Aggregate totals
        total_impr = 0
        total_clicks = 0
        total_cost = 0
        total_conv = 0
        
        for row in response:
            total_impr += row.metrics.impressions
            total_clicks += row.metrics.clicks
            total_cost += row.metrics.cost_micros / 1_000_000
            total_conv += row.metrics.conversions
        
        # Print results
        print("=" * 80)
        print(f"GOOGLE ADS WEEK TOTALS ({args.start} to {args.end})")
        print("=" * 80)
        print(f"Impressions: {total_impr:,}")
        print(f"Clicks: {total_clicks:,}")
        print(f"Spend: ${total_cost:,.2f}")
        print(f"Conversions: {total_conv:,.1f}")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
