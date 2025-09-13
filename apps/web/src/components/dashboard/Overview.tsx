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
      const response = await fetch(`/api/dashboard/overview?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        console.error('Failed to fetch dashboard data');
      }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="loading-skeleton h-4 w-16 mb-3" />
                <div className="loading-skeleton h-8 w-24 mb-2" />
                <div className="loading-skeleton h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        
        {/* Time range selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="timeRange" className="text-sm font-medium text-slate-700">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="synter-input w-auto"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
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
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="synter-button-primary">
            Run URL Scan
          </button>
          <button className="synter-button-secondary">
            View Attribution Report
          </button>
          <button className="synter-button-secondary">
            Manage Settings
          </button>
          {canViewAgents && (
            <button className="synter-button-secondary">
              Trigger Agents
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
