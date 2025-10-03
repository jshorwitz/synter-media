#!/usr/bin/env python3
"""
Standalone script to fetch today's Google Ads data using existing client.
Run from ppc-backend directory.
"""
import os
import sys
from datetime import date
from dotenv import load_dotenv

# Load from parent .env.local
load_dotenv('../../.env.local')

# Add current dir to path
sys.path.insert(0, os.path.dirname(__file__))

from ads.client import GoogleAdsClientFactory

def main():
    print("🔍 Fetching today's Google Ads data...\n")
    
    try:
        # Get client
        factory = GoogleAdsClientFactory()
        client = factory.get_client()
        customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")
        
        if not customer_id:
            print("❌ GOOGLE_ADS_CUSTOMER_ID not set")
            sys.exit(1)
        
        today = date.today().strftime("%Y-%m-%d")
        print(f"📅 Date: {today}")
        print(f"🔑 Customer ID: {customer_id}\n")
        
        ga_service = client.get_service("GoogleAdsService")
        
        # Campaign performance query
        query = f"""
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                segments.device,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr,
                metrics.average_cpc,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversion_rate,
                metrics.search_impression_share,
                metrics.search_absolute_top_impression_share,
                metrics.search_budget_lost_impression_share,
                metrics.search_rank_lost_impression_share
            FROM campaign
            WHERE segments.date = '{today}'
                AND campaign.status != 'REMOVED'
            ORDER BY metrics.cost_micros DESC
        """
        
        print("📊 Fetching campaign performance...\n")
        response = ga_service.search(customer_id=customer_id, query=query)
        
        # Aggregate by campaign
        campaigns = {}
        for row in response:
            cid = row.campaign.id
            if cid not in campaigns:
                campaigns[cid] = {
                    "name": row.campaign.name,
                    "status": row.campaign.status.name,
                    "impressions": 0,
                    "clicks": 0,
                    "cost": 0,
                    "conversions": 0,
                }
            
            c = campaigns[cid]
            c["impressions"] += row.metrics.impressions
            c["clicks"] += row.metrics.clicks
            c["cost"] += row.metrics.cost_micros / 1_000_000
            c["conversions"] += row.metrics.conversions
        
        # Print results
        print("=" * 110)
        print("CAMPAIGN PERFORMANCE (Today)")
        print("=" * 110)
        print(f"{'Campaign':<45} {'Impr':>8} {'Clicks':>8} {'CTR':>8} {'Cost':>10} {'Conv':>6} {'CVR':>8} {'CPA':>10}")
        print("-" * 110)
        
        total_impr = 0
        total_clicks = 0
        total_cost = 0
        total_conv = 0
        
        for cid, c in sorted(campaigns.items(), key=lambda x: x[1]["cost"], reverse=True):
            name = c["name"][:43]
            impr = c["impressions"]
            clicks = c["clicks"]
            cost = c["cost"]
            conv = c["conversions"]
            
            ctr = (clicks / impr * 100) if impr > 0 else 0
            cvr = (conv / clicks * 100) if clicks > 0 else 0
            cpa = (cost / conv) if conv > 0 else 0
            
            print(f"{name:<45} {impr:>8} {clicks:>8} {ctr:>7.2f}% ${cost:>9.2f} {conv:>6.1f} {cvr:>7.2f}% ${cpa:>9.2f}")
            
            total_impr += impr
            total_clicks += clicks
            total_cost += cost
            total_conv += conv
        
        print("-" * 110)
        total_ctr = (total_clicks / total_impr * 100) if total_impr > 0 else 0
        total_cvr = (total_conv / total_clicks * 100) if total_clicks > 0 else 0
        total_cpa = (total_cost / total_conv) if total_conv > 0 else 0
        print(f"{'TOTAL':<45} {total_impr:>8} {total_clicks:>8} {total_ctr:>7.2f}% ${total_cost:>9.2f} {total_conv:>6.1f} {total_cvr:>7.2f}% ${total_cpa:>9.2f}")
        print()
        
        # Top search terms
        print("\n" + "=" * 110)
        print("TOP 25 SEARCH TERMS BY COST (Today)")
        print("=" * 110)
        
        query_st = f"""
            SELECT
                search_term_view.search_term,
                campaign.name,
                segments.keyword.info.match_type,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions
            FROM search_term_view
            WHERE segments.date = '{today}'
            ORDER BY metrics.cost_micros DESC
            LIMIT 25
        """
        
        response_st = ga_service.search(customer_id=customer_id, query=query_st)
        
        print(f"{'Search Term':<38} {'Campaign':<25} {'Match':>10} {'Impr':>8} {'Clicks':>8} {'Cost':>10} {'Conv':>6}")
        print("-" * 110)
        
        for row in response_st:
            term = row.search_term_view.search_term[:36]
            camp = row.campaign.name[:23]
            match = str(row.segments.keyword.info.match_type).split(".")[-1][:8]
            impr = row.metrics.impressions
            clicks = row.metrics.clicks
            cost = row.metrics.cost_micros / 1_000_000
            conv = row.metrics.conversions
            
            print(f"{term:<38} {camp:<25} {match:>10} {impr:>8} {clicks:>8} ${cost:>9.2f} {conv:>6.1f}")
        
        print("\n✅ Data fetch complete!\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
