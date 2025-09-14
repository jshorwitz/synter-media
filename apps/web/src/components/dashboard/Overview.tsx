'use client';

import { useState, useEffect, useCallback } from 'react';
import { KPICards } from './KPICards';
import { AttributionTable } from './AttributionTable';
import { TrafficDashboard } from './TrafficDashboard';
import { AgentStatus } from './AgentStatus';
import { useAuth } from '@/contexts/AuthContext';

interface AttributionData {
  platform: string;
  campaign: string;
  clicks: number;
  conversions: number;
  spend: number;
  cac: number;
  roas: number;
  revenue: number;
}

interface TrafficData {
  date: string;
  visitors: number;
  pageviews: number;
  bounce_rate: number;
}

interface AgentData {
  name: string;
  status: 'running' | 'success' | 'failed' | 'idle';
  last_run: string;
  next_run?: string;
}

interface DashboardData {
  kpis: {
    spend: number;
    clicks: number;
    conversions: number;
    cac: number;
    roas: number;
    revenue: number;
  };
  attribution: AttributionData[];
  traffic: TrafficData[];
  agents: AgentData[];
}

export function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with real API call later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockData: DashboardData = {
        kpis: {
          spend: 45230.50,
          clicks: 18420,
          conversions: 892,
          cac: 50.70,
          roas: 4.2,
          revenue: 189680.40
        },
        attribution: [
          {
            platform: 'Google',
            campaign: 'Brand Search',
            clicks: 8420,
            conversions: 420,
            spend: 21400,
            cac: 51.0,
            roas: 4.8,
            revenue: 102720
          },
          {
            platform: 'Meta',
            campaign: 'Lookalike Audiences',
            clicks: 6200,
            conversions: 310,
            spend: 15600,
            cac: 50.3,
            roas: 3.9,
            revenue: 60840
          },
          {
            platform: 'LinkedIn',
            campaign: 'B2B Targeting',
            clicks: 2800,
            conversions: 112,
            spend: 7200,
            cac: 64.3,
            roas: 3.2,
            revenue: 23040
          },
          {
            platform: 'X',
            campaign: 'Tech Audience',
            clicks: 1000,
            conversions: 50,
            spend: 1030,
            cac: 20.6,
            roas: 3.0,
            revenue: 3090
          }
        ],
        traffic: [
          { date: '2024-01-01', visitors: 1200, pageviews: 3400, bounce_rate: 0.35 },
          { date: '2024-01-02', visitors: 1180, pageviews: 3200, bounce_rate: 0.38 },
          { date: '2024-01-03', visitors: 1350, pageviews: 3800, bounce_rate: 0.32 },
          { date: '2024-01-04', visitors: 1420, pageviews: 4100, bounce_rate: 0.29 },
          { date: '2024-01-05', visitors: 1380, pageviews: 3900, bounce_rate: 0.31 },
          { date: '2024-01-06', visitors: 1290, pageviews: 3600, bounce_rate: 0.34 },
          { date: '2024-01-07', visitors: 1450, pageviews: 4200, bounce_rate: 0.28 }
        ],
        agents: [
          { name: 'Google Ingestor', status: 'success', last_run: '2024-01-07 14:30:00' },
          { name: 'Meta Ingestor', status: 'success', last_run: '2024-01-07 14:25:00' },
          { name: 'Attribution Agent', status: 'running', last_run: '2024-01-07 15:00:00' },
          { name: 'Budget Optimizer', status: 'idle', last_run: '2024-01-07 12:00:00', next_run: '2024-01-08 00:00:00' }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data on error
      setData({
        kpis: {
          spend: 0,
          clicks: 0,
          conversions: 0,
          cac: 0,
          roas: 0,
          revenue: 0
        },
        attribution: [],
        traffic: [],
        agents: []
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const canViewAgents = user?.role === 'admin' || user?.role === 'analyst';

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-synter-ink">Dashboard Overview</h1>
            <p className="mt-2 text-synter-ink-2">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="synter-card animate-pulse">
              <div className="synter-skeleton h-4 w-16 mb-3" />
              <div className="synter-skeleton h-8 w-24 mb-2" />
              <div className="synter-skeleton h-3 w-12" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 synter-card">
            <div className="synter-skeleton h-6 w-32 mb-4" />
            <div className="synter-skeleton h-48 w-full" />
          </div>
          <div className="synter-card">
            <div className="synter-skeleton h-6 w-24 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="synter-skeleton h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="synter-card">
            <div className="synter-skeleton h-6 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="synter-skeleton h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-synter-ink animate-float">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-synter-ink-2">
            Welcome back, <span className="font-medium text-synter-volt">{user?.name || user?.email}</span>
          </p>
          <div className="flex items-center mt-3 text-sm text-synter-ink-2">
            <div className="h-2 w-2 bg-synter-meadow rounded-full mr-2 animate-pulse"></div>
            All systems operational
          </div>
        </div>
        
        {/* Time range selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="timeRange" className="text-sm font-medium text-synter-ink-2">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="synter-input w-auto min-w-[140px]"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="synter-btn synter-btn-ghost p-2"
            title="Refresh data"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={data?.kpis} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Dashboard */}
        <div className="lg:col-span-2">
          <TrafficDashboard timeRange={timeRange} />
        </div>

        {/* Attribution Table */}
        <div className="lg:col-span-1">
          <AttributionTable data={data?.attribution} />
        </div>

        {/* Agent Status */}
        {canViewAgents && (
          <div className="lg:col-span-1">
            <AgentStatus agents={data?.agents} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="synter-card">
        <div className="synter-card-header">
          <h3 className="synter-card-title">Quick Actions</h3>
          <p className="synter-card-subtitle">Common tasks and operations</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="synter-btn synter-btn-primary synter-btn-sm group">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Run URL Scan
          </button>
          
          <button className="synter-btn synter-btn-secondary synter-btn-sm group">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Attribution Report
          </button>
          
          <button className="synter-btn synter-btn-secondary synter-btn-sm group">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.240.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          
          {canViewAgents && (
            <button className="synter-btn synter-btn-secondary synter-btn-sm group">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Run Agents
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
