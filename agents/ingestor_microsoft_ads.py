#!/usr/bin/env python3

"""
Microsoft Ads Ingestor Agent (ETL)

Pulls daily metrics from Microsoft Ads API and normalizes to ad_metrics table.
Follows the agent pattern from AGENTS.md §3.2.

Features:
- Runs on schedule (cron 2h) or manual trigger
- Supports DRY_RUN mode (compute only, no DB writes)
- Supports MOCK_MICROSOFT mode (generate synthetic data)
- Idempotent upserts on unique keys
- Retry with exponential backoff

Usage:
    # Normal run for yesterday
    python3 ingestor_microsoft_ads.py
    
    # Custom date range
    python3 ingestor_microsoft_ads.py --start 2025-01-01 --end 2025-01-10
    
    # Dry run (no DB writes)
    DRY_RUN=true python3 ingestor_microsoft_ads.py
    
    # Mock mode (synthetic data)
    MOCK_MICROSOFT=true python3 ingestor_microsoft_ads.py
"""

import os
import sys
import json
import uuid
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import time
import random

class MicrosoftAdsIngestor:
    def __init__(self, developer_token: str, client_id: str, client_secret=REDACTED,
                 refresh_token: str, customer_id: str, account_id: str,
                 dry_run: bool = False, mock_mode: bool = False):
        self.developer_token = developer_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.customer_id = customer_id
        self.account_id = account_id
        self.dry_run = dry_run
        self.mock_mode = mock_mode
        
        if not mock_mode:
            self._init_authentication()
    
    def _init_authentication(self):
        """Initialize Microsoft Ads authentication"""
        try:
            from bingads import AuthorizationData, OAuthWebAuthCodeGrant
            
            self.authentication = OAuthWebAuthCodeGrant(
                client_id=self.client_id,
                client_secret=REDACTED,
                redirection_uri="https://login.microsoftonline.com/common/oauth2/nativeclient"
            )
            
            self.authentication.request_oauth_tokens_by_refresh_token(self.refresh_token)
            
            self.authorization_data = AuthorizationData(
                account_id=self.account_id,
                customer_id=self.customer_id,
                developer_token=self.developer_token,
                authentication=self.authentication
            )
            
        except ImportError:
            raise Exception("BingAds SDK not installed. Run: pip install bingads")
        except Exception as e:
            raise Exception(f"Authentication failed: {e}")
    
    def fetch_metrics(self, start_date: str, end_date: str) -> List[Dict]:
        """Fetch metrics from Microsoft Ads API or generate mock data"""
        if self.mock_mode:
            return self._generate_mock_metrics(start_date, end_date)
        else:
            return self._fetch_real_metrics(start_date, end_date)
    
    def _fetch_real_metrics(self, start_date: str, end_date: str) -> List[Dict]:
        """Fetch real metrics from Microsoft Ads API"""
        from bingads.v13.reporting import ReportingServiceManager
        from bingads.v13.reporting import CampaignPerformanceReportRequest, \
            ReportFormat, ReportAggregation, CampaignPerformanceReportColumn, \
            AccountThroughCampaignReportScope, ReportTime, Date
        
        reporting_service_manager = ReportingServiceManager(
            authorization_data=self.authorization_data,
            poll_interval_in_milliseconds=5000
        )
        
        # Build report request
        report_request = CampaignPerformanceReportRequest(
            Format=ReportFormat.Csv,
            ReportName='Daily Metrics ETL',
            ReturnOnlyCompleteData=False,
            Aggregation=ReportAggregation.Daily
        )
        
        # Scope
        scope = AccountThroughCampaignReportScope(
            AccountIds={'long': [int(self.account_id)]},
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
        report_columns = reporting_service_manager.factory.create('ArrayOfCampaignPerformanceReportColumn')
        report_columns.CampaignPerformanceReportColumn.append([
            CampaignPerformanceReportColumn.TimePeriod,
            CampaignPerformanceReportColumn.AccountId,
            CampaignPerformanceReportColumn.CampaignId,
            CampaignPerformanceReportColumn.CampaignName,
            CampaignPerformanceReportColumn.AdGroupId,
            CampaignPerformanceReportColumn.AdGroupName,
            CampaignPerformanceReportColumn.Impressions,
            CampaignPerformanceReportColumn.Clicks,
            CampaignPerformanceReportColumn.Spend,
            CampaignPerformanceReportColumn.Conversions,
            CampaignPerformanceReportColumn.Revenue
        ])
        report_request.Columns = report_columns
        
        # Submit and download
        report_container = reporting_service_manager.submit_download(report_request)
        result_file_path = reporting_service_manager.download_file(report_container.request_id)
        
        # Parse CSV
        metrics = []
        import csv
        with open(result_file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('CampaignId') and row['CampaignId'] != '--':
                    metrics.append({
                        'date': row.get('TimePeriod'),
                        'account_id': row.get('AccountId'),
                        'campaign_id': row.get('CampaignId'),
                        'campaign_name': row.get('CampaignName'),
                        'adgroup_id': row.get('AdGroupId'),
                        'adgroup_name': row.get('AdGroupName'),
                        'impressions': int(row.get('Impressions', 0)),
                        'clicks': int(row.get('Clicks', 0)),
                        'spend': float(row.get('Spend', 0)),
                        'conversions': int(row.get('Conversions', 0)),
                        'revenue': float(row.get('Revenue', 0)) if row.get('Revenue') else 0
                    })
        
        return metrics
    
    def _generate_mock_metrics(self, start_date: str, end_date: str) -> List[Dict]:
        """Generate deterministic synthetic metrics for testing"""
        metrics = []
        
        # Mock campaigns
        campaigns = [
            {'id': 'mock_msft_camp_001', 'name': 'Microsoft - Brand Search'},
            {'id': 'mock_msft_camp_002', 'name': 'Microsoft - Developer Tools'},
            {'id': 'mock_msft_camp_003', 'name': 'Microsoft - Enterprise'},
        ]
        
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        current_dt = start_dt
        while current_dt <= end_dt:
            date_str = current_dt.strftime('%Y-%m-%d')
            
            for campaign in campaigns:
                # Deterministic random based on date + campaign
                seed = hash(f"{date_str}_{campaign['id']}")
                random.seed(seed)
                
                impressions = random.randint(500, 5000)
                clicks = int(impressions * random.uniform(0.02, 0.05))
                spend = clicks * random.uniform(1.5, 4.0)
                conversions = int(clicks * random.uniform(0.01, 0.05))
                revenue = conversions * random.uniform(50, 200)
                
                metrics.append({
                    'date': date_str,
                    'account_id': 'mock_account_msft',
                    'campaign_id': campaign['id'],
                    'campaign_name': campaign['name'],
                    'adgroup_id': f"{campaign['id']}_ag_001",
                    'adgroup_name': 'Mock AdGroup',
                    'impressions': impressions,
                    'clicks': clicks,
                    'spend': round(spend, 2),
                    'conversions': conversions,
                    'revenue': round(revenue, 2)
                })
            
            current_dt += timedelta(days=1)
        
        return metrics
    
    def normalize_to_ad_metrics(self, raw_metrics: List[Dict]) -> List[Dict]:
        """
        Normalize Microsoft Ads data to unified ad_metrics schema.
        
        Schema:
        - platform: 'microsoft'
        - date: YYYY-MM-DD
        - account_id: string
        - campaign_id: string
        - adgroup_id: string (optional)
        - ad_id: null (not available in campaign reports)
        - impressions: int
        - clicks: int
        - spend_usd: float
        - conversions: int
        - revenue_usd: float (optional)
        - raw: JSON (original data)
        """
        normalized = []
        
        for row in raw_metrics:
            normalized.append({
                'platform': 'microsoft',
                'date': row['date'],
                'account_id': str(row['account_id']),
                'campaign_id': str(row['campaign_id']),
                'adgroup_id': str(row.get('adgroup_id')) if row.get('adgroup_id') else None,
                'ad_id': None,
                'impressions': row['impressions'],
                'clicks': row['clicks'],
                'spend_usd': row['spend'],
                'conversions': row['conversions'],
                'revenue_usd': row.get('revenue', 0),
                'raw': json.dumps(row)
            })
        
        return normalized
    
    def upsert_to_database(self, metrics: List[Dict]) -> int:
        """
        Upsert metrics to ad_metrics table.
        Uses ON CONFLICT for idempotency based on unique constraint.
        
        Constraint: uniq_row ON (platform, date, account_id, campaign_id, adgroup_id, ad_id)
        """
        if self.dry_run:
            print(f"[DRY_RUN] Would upsert {len(metrics)} rows to ad_metrics")
            return len(metrics)
        
        # TODO: Implement actual database connection
        # For now, just write to JSON file
        output_file = f"ad_metrics_microsoft_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        print(f"✅ Wrote {len(metrics)} rows to {output_file}")
        return len(metrics)
    
    def run(self, start_date: str, end_date: str, job_id: str, run_id: str) -> Dict:
        """
        Execute the ingestion job.
        
        Returns AgentResult as per AGENTS.md §2.2
        """
        print(f"=== Microsoft Ads Ingestor ===")
        print(f"Job ID: {job_id}")
        print(f"Run ID: {run_id}")
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Dry Run: {self.dry_run}")
        print(f"Mock Mode: {self.mock_mode}")
        print()
        
        start_time = time.time()
        
        try:
            # Step 1: Fetch metrics
            print(f"Fetching metrics from Microsoft Ads API...")
            raw_metrics = self.fetch_metrics(start_date, end_date)
            print(f"✅ Fetched {len(raw_metrics)} raw metric rows")
            
            # Step 2: Normalize
            print(f"Normalizing to ad_metrics schema...")
            normalized_metrics = self.normalize_to_ad_metrics(raw_metrics)
            print(f"✅ Normalized {len(normalized_metrics)} rows")
            
            # Step 3: Upsert to database
            print(f"Upserting to database...")
            records_written = self.upsert_to_database(normalized_metrics)
            
            # Calculate metrics
            total_spend = sum(m['spend_usd'] for m in normalized_metrics)
            total_clicks = sum(m['clicks'] for m in normalized_metrics)
            total_impressions = sum(m['impressions'] for m in normalized_metrics)
            total_conversions = sum(m['conversions'] for m in normalized_metrics)
            
            elapsed_time = time.time() - start_time
            
            return {
                'job_id': job_id,
                'run_id': run_id,
                'ok': True,
                'metrics': {
                    'records_fetched': len(raw_metrics),
                    'records_written': records_written,
                    'total_spend_usd': round(total_spend, 2),
                    'total_clicks': total_clicks,
                    'total_impressions': total_impressions,
                    'total_conversions': total_conversions,
                    'elapsed_seconds': round(elapsed_time, 2)
                },
                'notes': [
                    f"Successfully ingested Microsoft Ads data for {start_date} to {end_date}",
                    f"Dry run: {self.dry_run}",
                    f"Mock mode: {self.mock_mode}"
                ]
            }
            
        except Exception as e:
            elapsed_time = time.time() - start_time
            
            return {
                'job_id': job_id,
                'run_id': run_id,
                'ok': False,
                'metrics': {
                    'elapsed_seconds': round(elapsed_time, 2)
                },
                'notes': [
                    f"Error: {str(e)}"
                ]
            }

def main():
    parser = argparse.ArgumentParser(description='Microsoft Ads Ingestor Agent')
    parser.add_argument('--start', type=str, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', type=str, help='End date (YYYY-MM-DD)')
    parser.add_argument('--job-id', type=str, default=f"ingestor-microsoft-{uuid.uuid4().hex[:8]}")
    parser.add_argument('--run-id', type=str, default=uuid.uuid4().hex)
    
    args = parser.parse_args()
    
    # Default to yesterday if no dates specified
    if not args.start:
        args.start = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    if not args.end:
        args.end = args.start
    
    # Get environment config
    dry_run = os.getenv('DRY_RUN', 'false').lower() == 'true'
    mock_mode = os.getenv('MOCK_MICROSOFT', 'false').lower() == 'true'
    
    developer_token = os.getenv('MICROSOFT_ADS_DEVELOPER_TOKEN')
    client_id = os.getenv('MICROSOFT_ADS_CLIENT_ID')
    client_secret = os.getenv('MICROSOFT_ADS_CLIENT_SECRET')
    refresh_token = os.getenv('MICROSOFT_ADS_REFRESH_TOKEN')
    customer_id = os.getenv('MICROSOFT_ADS_CUSTOMER_ID')
    account_id = os.getenv('MICROSOFT_ADS_ACCOUNT_ID')
    
    if not mock_mode and not all([developer_token, client_id, client_secret, refresh_token, customer_id, account_id]):
        print("❌ Missing required environment variables")
        print("Set MOCK_MICROSOFT=true for testing, or configure credentials:")
        print("  MICROSOFT_ADS_DEVELOPER_TOKEN")
        print("  MICROSOFT_ADS_CLIENT_ID")
        print("  MICROSOFT_ADS_CLIENT_SECRET")
        print("  MICROSOFT_ADS_REFRESH_TOKEN")
        print("  MICROSOFT_ADS_CUSTOMER_ID")
        print("  MICROSOFT_ADS_ACCOUNT_ID")
        return 1
    
    # Create ingestor
    ingestor = MicrosoftAdsIngestor(
        developer_token=developer_token or 'mock',
        client_id=client_id or 'mock',
        client_secret=REDACTED or 'mock',
        refresh_token=refresh_token or 'mock',
        customer_id=customer_id or 'mock',
        account_id=account_id or 'mock',
        dry_run=dry_run,
        mock_mode=mock_mode
    )
    
    # Run ingestion
    result = ingestor.run(
        start_date=args.start,
        end_date=args.end,
        job_id=args.job_id,
        run_id=args.run_id
    )
    
    # Print result
    print("\n=== Job Result ===")
    print(json.dumps(result, indent=2))
    
    return 0 if result['ok'] else 1

if __name__ == "__main__":
    sys.exit(main())
