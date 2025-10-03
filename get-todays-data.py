#!/usr/bin/env python3
"""
Fetch today's Google Ads performance data for Sourcegraph.
Run from synter-fresh directory.
"""
import os
import sys
from datetime import date, datetime, timedelta
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def load_client():
    """Load Google Ads client from environment variables."""
    credentials = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
        "use_proto_plus": True,
    }
    
    missing = [k for k, v in credentials.items() if not v and k != "use_proto_plus"]
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}", file=sys.stderr)
        print("Please ensure .env.local is set up correctly.", file=sys.stderr)
        sys.exit(1)
    
    return GoogleAdsClient.load_from_dict(credentials)

def fetch_campaign_performance(client, customer_id, start_date, end_date):
    """Fetch campaign performance for date range."""
    ga_service = client.get_service("GoogleAdsService")
    
    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            segments.date,
            segments.device,
            segments.hour,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.conversion_rate,
            metrics.search_impression_share,
            metrics.search_top_impression_share,
            metrics.search_absolute_top_impression_share,
            metrics.search_budget_lost_impression_share,
            metrics.search_rank_lost_impression_share
        FROM campaign
        WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
            AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC
    """
    
    try:
        response = ga_service.search(customer_id=customer_id, query=query)
        return list(response)
    except GoogleAdsException as ex:
        print(f"❌ Google Ads API error: {ex}", file=sys.stderr)
        for error in ex.failure.errors:
            print(f"   {error.message}", file=sys.stderr)
        sys.exit(1)

def fetch_search_terms(client, customer_id, start_date, end_date, limit=25):
    """Fetch top search terms by cost."""
    ga_service = client.get_service("GoogleAdsService")
    
    query = f"""
        SELECT
            search_term_view.search_term,
            campaign.name,
            ad_group.name,
            search_term_view.status,
            segments.keyword.info.match_type,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversion_rate
        FROM search_term_view
        WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
        ORDER BY metrics.cost_micros DESC
        LIMIT {limit}
    """
    
    try:
        response = ga_service.search(customer_id=customer_id, query=query)
        return list(response)
    except GoogleAdsException as ex:
        print(f"❌ Google Ads API error fetching search terms: {ex}", file=sys.stderr)
        return []

def format_currency(micros):
    """Convert micros to dollars."""
    return micros / 1_000_000

def format_percent(value):
    """Format as percentage."""
    return value * 100

def main():
    print("🔍 Fetching Sourcegraph Google Ads performance data...")
    print()
    
    # Load client
    client = load_client()
    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")
    
    if not customer_id:
        print("❌ GOOGLE_ADS_CUSTOMER_ID not set", file=sys.stderr)
        sys.exit(1)
    
    # Date range: today
    today = date.today()
    today_str = today.strftime("%Y-%m-%d")
    
    print(f"📅 Date: {today_str}")
    print(f"🔑 Customer ID: {customer_id}")
    print()
    
    # Fetch campaign performance
    print("📊 Fetching campaign performance...")
    campaigns = fetch_campaign_performance(client, customer_id, today_str, today_str)
    
    # Aggregate by campaign
    campaign_data = {}
    for row in campaigns:
        cid = row.campaign.id
        if cid not in campaign_data:
            campaign_data[cid] = {
                "id": cid,
                "name": row.campaign.name,
                "status": row.campaign.status.name,
                "impressions": 0,
                "clicks": 0,
                "cost_micros": 0,
                "conversions": 0,
                "conversions_value": 0,
                "devices": {},
                "hours": {}
            }
        
        cd = campaign_data[cid]
        cd["impressions"] += row.metrics.impressions
        cd["clicks"] += row.metrics.clicks
        cd["cost_micros"] += row.metrics.cost_micros
        cd["conversions"] += row.metrics.conversions
        cd["conversions_value"] += row.metrics.conversions_value
        
        # Track by device
        device = row.segments.device.name
        if device not in cd["devices"]:
            cd["devices"][device] = {"impressions": 0, "clicks": 0, "cost": 0}
        cd["devices"][device]["impressions"] += row.metrics.impressions
        cd["devices"][device]["clicks"] += row.metrics.clicks
        cd["devices"][device]["cost"] += format_currency(row.metrics.cost_micros)
        
        # Track by hour
        hour = row.segments.hour
        if hour not in cd["hours"]:
            cd["hours"][hour] = {"impressions": 0, "clicks": 0, "cost": 0}
        cd["hours"][hour]["impressions"] += row.metrics.impressions
        cd["hours"][hour]["clicks"] += row.metrics.clicks
        cd["hours"][hour]["cost"] += format_currency(row.metrics.cost_micros)
    
    # Print summary
    print()
    print("=" * 100)
    print("CAMPAIGN PERFORMANCE (Today)")
    print("=" * 100)
    print(f"{'Campaign':<40} {'Impr':>8} {'Clicks':>8} {'CTR':>8} {'Cost':>10} {'Conv':>6} {'CVR':>8} {'CPA':>10}")
    print("-" * 100)
    
    total_impressions = 0
    total_clicks = 0
    total_cost = 0
    total_conversions = 0
    
    for cid, cd in sorted(campaign_data.items(), key=lambda x: x[1]["cost_micros"], reverse=True):
        impr = cd["impressions"]
        clicks = cd["clicks"]
        cost = format_currency(cd["cost_micros"])
        conv = cd["conversions"]
        
        ctr = (clicks / impr * 100) if impr > 0 else 0
        cvr = (conv / clicks * 100) if clicks > 0 else 0
        cpa = (cost / conv) if conv > 0 else 0
        
        name = cd["name"][:38]
        print(f"{name:<40} {impr:>8} {clicks:>8} {ctr:>7.2f}% ${cost:>9.2f} {conv:>6.1f} {cvr:>7.2f}% ${cpa:>9.2f}")
        
        total_impressions += impr
        total_clicks += clicks
        total_cost += cost
        total_conversions += conv
    
    print("-" * 100)
    total_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    total_cvr = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
    total_cpa = (total_cost / total_conversions) if total_conversions > 0 else 0
    print(f"{'TOTAL':<40} {total_impressions:>8} {total_clicks:>8} {total_ctr:>7.2f}% ${total_cost:>9.2f} {total_conversions:>6.1f} {total_cvr:>7.2f}% ${total_cpa:>9.2f}")
    print()
    
    # Fetch top search terms
    print()
    print("=" * 120)
    print("TOP 25 SEARCH TERMS BY COST (Today)")
    print("=" * 120)
    print(f"{'Search Term':<35} {'Campaign':<25} {'Match':>10} {'Impr':>8} {'Clicks':>8} {'CTR':>8} {'Cost':>10} {'Conv':>6}")
    print("-" * 120)
    
    search_terms = fetch_search_terms(client, customer_id, today_str, today_str, 25)
    for row in search_terms:
        term = row.search_term_view.search_term[:33]
        campaign = row.campaign.name[:23]
        match_type = str(row.segments.keyword.info.match_type).split(".")[-1][:8]
        impr = row.metrics.impressions
        clicks = row.metrics.clicks
        ctr = row.metrics.ctr * 100
        cost = format_currency(row.metrics.cost_micros)
        conv = row.metrics.conversions
        
        print(f"{term:<35} {campaign:<25} {match_type:>10} {impr:>8} {clicks:>8} {ctr:>7.2f}% ${cost:>9.2f} {conv:>6.1f}")
    
    print()
    print("✅ Data fetch complete!")
    print()
    print("💡 Next step: Share this output with the oracle for tailored recommendations.")

if __name__ == "__main__":
    main()
