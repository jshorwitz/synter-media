'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard } from './StatCard';
import { AttributionTable } from './AttributionTable';
import { AgentStatus } from './AgentStatus';
import { useAuth } from '@/contexts/AuthContext';
import TimeSeriesLine from '../charts/TimeSeriesLine';
import BarChart from '../charts/BarChart';
import DonutChart from '../charts/DonutChart';

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
            platform: 'Microsoft',
            campaign: 'Search Network',
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
            platform: 'Reddit',
            campaign: 'Tech Communities',
            clicks: 1000,
            conversions: 50,
            spend: 1030,
            cac: 20.6,
            roas: 3.0,
            revenue: 3090
          }
        ],
        agents: [
          { name: 'Google Ingestor', status: 'success', last_run: '2024-01-07 14:30:00' },
          { name: 'Microsoft Ingestor', status: 'success', last_run: '2024-01-07 14:25:00' },
          { name: 'Attribution Agent', status: 'running', last_run: '2024-01-07 15:00:00' },
          { name: 'Budget Optimizer', status: 'idle', last_run: '2024-01-07 12:00:00', next_run: '2024-01-08 00:00:00' }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const canViewAgents = user?.role === 'admin' || user?.role === 'analyst';

  // Generate chart data
  const timeSeriesData = [
    { date: new Date('2025-01-01'), value: 5200 },
    { date: new Date('2025-01-02'), value: 6100 },
    { date: new Date('2025-01-03'), value: 5800 },
    { date: new Date('2025-01-04'), value: 7200 },
    { date: new Date('2025-01-05'), value: 6900 },
    { date: new Date('2025-01-06'), value: 8100 },
    { date: new Date('2025-01-07'), value: 9400 },
  ];

  const platformSpendData = data?.attribution.map(a => ({
    label: a.platform,
    value: a.spend
  })) || [];

  const campaignPerformanceData = data?.attribution.slice(0, 4).map(a => ({
    label: a.campaign.split(' ').slice(0, 2).join(' '),
    value: a.revenue
  })) || [];

  if (loading) {
    return (
      <section className="space-y-6" data-theme="dark">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold" style={{color: 'hsl(210 40% 96%)'}}>Dashboard Overview</h1>
            <p className="mt-2" style={{color: 'hsl(215 20% 65%)'}}>Loading your data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-32" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6" data-theme="dark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'hsl(210 40% 96%)'}}>
            Dashboard Overview
          </h1>
          <p className="mt-2" style={{color: 'hsl(215 20% 65%)'}}>
            Welcome back, <span style={{color: 'hsl(142 76% 36%)', fontWeight: 600}}>{user?.name || user?.email}</span>
          </p>
          <div className="flex items-center mt-3 text-sm" style={{color: 'hsl(215 20% 65%)'}}>
            <div className="h-2 w-2 rounded-full mr-2 animate-pulse" style={{background: 'hsl(142 76% 36%)'}}></div>
            All systems operational
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label htmlFor="timeRange" className="text-sm font-medium" style={{color: 'hsl(215 20% 65%)'}}>
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderColor: 'rgba(51, 65, 85, 0.6)',
              color: 'hsl(210 40% 96%)'
            }}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Refresh data"
            style={{color: 'hsl(215 20% 65%)'}}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Spend"
          value={`$${data?.kpis.spend.toLocaleString()}`}
          change={8.2}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Clicks"
          value={data?.kpis.clicks.toLocaleString() || '0'}
          change={12.5}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
        />
        <StatCard
          label="Conversions"
          value={data?.kpis.conversions.toLocaleString() || '0'}
          change={15.3}
          color="green"
          progress={65}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <StatCard
          label="CAC"
          value={`$${data?.kpis.cac.toFixed(2)}`}
          change={-5.2}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="ROAS"
          value={`${data?.kpis.roas.toFixed(1)}x`}
          change={18.7}
          color="amber"
          progress={84}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={`$${data?.kpis.revenue.toLocaleString()}`}
          change={22.1}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Over Time - Spans 2 columns */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{
          background: 'rgba(30, 41, 59, 0.8)',
          borderColor: 'rgba(51, 65, 85, 0.6)',
          border: '1px solid'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{color: 'hsl(217 91% 60%)'}}>
            📈 Daily Spend Trend
          </h3>
          <TimeSeriesLine data={timeSeriesData} height={300} />
        </div>

        {/* Platform Distribution Donut */}
        <div className="rounded-xl p-6" style={{
          background: 'rgba(30, 41, 59, 0.8)',
          borderColor: 'rgba(51, 65, 85, 0.6)',
          border: '1px solid'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{color: 'hsl(217 91% 60%)'}}>
            🎯 Platform Mix
          </h3>
          <DonutChart data={platformSpendData} height={300} />
        </div>
      </div>

      {/* Campaign Performance Bar Chart */}
      <div className="rounded-xl p-6" style={{
        background: 'rgba(30, 41, 59, 0.8)',
        borderColor: 'rgba(51, 65, 85, 0.6)',
        border: '1px solid'
      }}>
        <h3 className="text-lg font-semibold mb-4" style={{color: 'hsl(217 91% 60%)'}}>
          💰 Top Campaign Revenue
        </h3>
        <BarChart data={campaignPerformanceData} height={300} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttributionTable data={data?.attribution} />
        {canViewAgents && <AgentStatus agents={data?.agents} />}
      </div>
    </section>
  );
}
