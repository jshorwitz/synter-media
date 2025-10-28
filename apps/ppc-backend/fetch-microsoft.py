#!/usr/bin/env python3
"""
Fetch Microsoft Ads weekly data for dashboard.
Usage: python fetch-microsoft.py --start 2025-10-20 --end 2025-10-26
"""
import argparse
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load from parent .env.local
load_dotenv('../../.env.local')

def fetch_microsoft_ads(start_date, end_date):
    """Fetch Microsoft Ads data using bingads SDK."""
    print(f"🔍 Fetching Microsoft Ads data for {start_date} to {end_date}...")
    
    developer_token = os.getenv("MICROSOFT_ADS_DEVELOPER_TOKEN")
    client_id = os.getenv("MICROSOFT_ADS_CLIENT_ID")
    customer_id = os.getenv("MICROSOFT_ADS_CUSTOMER_ID")
    account_id = os.getenv("MICROSOFT_ADS_ACCOUNT_ID")
    
    if not all([developer_token, client_id, customer_id, account_id]):
        print("  ❌ Microsoft Ads credentials not configured")
        return None
    
    # Check for refresh token in token file
    token_file = os.path.join(os.path.dirname(__file__), '../../.microsoft_ads_tokens.json')
    
    if not os.path.exists(token_file):
        print(f"  ❌ Token file not found: {token_file}")
        print("  💡 Run Microsoft Ads OAuth flow to generate tokens")
        return None
    
    try:
        import json
        with open(token_file, 'r') as f:
            tokens = json.load(f)
        refresh_token = tokens.get('refresh_token')
        
        if not refresh_token:
            print("  ❌ No refresh token in token file")
            return None
            
    except Exception as e:
        print(f"  ❌ Error reading token file: {e}")
        return None
    
    # Try to import bingads
    try:
        from bingads import AuthorizationData, OAuthWebAuthCodeGrant
        from bingads.v13.reporting import ReportingServiceManager, \
            CampaignPerformanceReportRequest, ReportFormat, ReportAggregation, \
            CampaignPerformanceReportColumn, AccountThroughCampaignReportScope, \
            ReportTime, Date
    except ImportError:
        print("  ❌ BingAds SDK not installed")
        print("  💡 Run: pip install bingads")
        return None
    
    try:
        # Authenticate
        authentication = OAuthWebAuthCodeGrant(
            client_id=client_id,
            redirection_uri="https://login.microsoftonline.com/common/oauth2/nativeclient"
        )
        
        # Use existing refresh token
        authentication._refresh_token = refresh_token
        authentication._access_token = tokens.get('access_token')
        authentication._access_token_expires_in_seconds = tokens.get('expires_in', 3600)
        
        # If token expired, refresh it
        if not authentication._access_token:
            print("  🔄 Refreshing access token...")
            authentication.request_oauth_tokens_by_refresh_token(refresh_token)
        
        authorization_data = AuthorizationData(
            account_id=account_id,
            customer_id=customer_id,
            developer_token=developer_token,
            authentication=authentication
        )
        
        # Create reporting service
        reporting_service = ReportingServiceManager(
            authorization_data=authorization_data,
            poll_interval_in_milliseconds=5000
        )
        
        # Build report request
        report_request = CampaignPerformanceReportRequest(
            Format=ReportFormat.Csv,
            ReportName='Weekly Dashboard Metrics',
            ReturnOnlyCompleteData=False,
            Aggregation=ReportAggregation.Summary
        )
        
        # Scope
        scope = AccountThroughCampaignReportScope(
            AccountIds={'long': [int(account_id)]},
            Campaigns=None
        )
        report_request.Scope = scope
        
        # Time period
        report_time = ReportTime()
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        custom_date_start = Date()
        custom_date_start.Day = start_dt.day
        custom_date_start.Month = start_dt.month
        custom_date_start.Year = start_dt.year
        
        custom_date_end = Date()
        custom_date_end.Day = end_dt.day
        custom_date_end.Month = end_dt.month
        custom_date_end.Year = end_dt.year
        
        report_time.CustomDateRangeStart = custom_date_start
        report_time.CustomDateRangeEnd = custom_date_end
        report_request.Time = report_time
        
        # Columns
        report_columns = reporting_service.factory.create('ArrayOfCampaignPerformanceReportColumn')
        report_columns.CampaignPerformanceReportColumn.append([
            CampaignPerformanceReportColumn.Impressions,
            CampaignPerformanceReportColumn.Clicks,
            CampaignPerformanceReportColumn.Spend,
            CampaignPerformanceReportColumn.Conversions
        ])
        report_request.Columns = report_columns
        
        # Submit and download
        print("  📊 Requesting report...")
        report_container = reporting_service.submit_download(report_request)
        result_file = reporting_service.download_file(report_container.request_id)
        
        # Parse CSV and aggregate
        import csv
        total_impr = 0
        total_clicks = 0
        total_spend = 0
        total_conv = 0
        
        with open(result_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                total_impr += int(row.get('Impressions', 0))
                total_clicks += int(row.get('Clicks', 0))
                total_spend += float(row.get('Spend', 0))
                total_conv += int(row.get('Conversions', 0))
        
        result = {
            'impressions': total_impr,
            'clicks': total_clicks,
            'spend': round(total_spend, 2),
            'conversions': total_conv
        }
        
        print(f"  ✅ Microsoft: ${result['spend']:,.2f} spend, {result['impressions']:,} impr, {result['clicks']:,} clicks, {result['conversions']} conv")
        return result
        
    except Exception as e:
        print(f"  ❌ Microsoft Ads API error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', default='2025-10-20')
    parser.add_argument('--end', default='2025-10-26')
    args = parser.parse_args()
    
    result = fetch_microsoft_ads(args.start, args.end)
    
    if result:
        print(f"\n{'='*80}")
        print("MICROSOFT ADS TOTALS")
        print(f"{'='*80}")
        print(f"Impressions: {result['impressions']:,}")
        print(f"Clicks: {result['clicks']:,}")
        print(f"Spend: ${result['spend']:,.2f}")
        print(f"Conversions: {result['conversions']}")
        print(f"{'='*80}")
    else:
        print("\n❌ Failed to fetch Microsoft Ads data")
        sys.exit(1)

if __name__ == "__main__":
    main()
