'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatNumber, getPlatformColor } from '@/lib/utils';

interface TrafficData {
  source: string;
  visitors: number;
  pageviews: number;
  percentage: number;
  change: number;
}

interface TrafficDashboardProps {
  timeRange: string;
}

export function TrafficDashboard({ timeRange }: TrafficDashboardProps) {
  const [data, setData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');

  const fetchTrafficData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/traffic/utm?period=${period}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const trafficData = await response.json();
        setData(trafficData.data || []);
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  const totalPageviews = data.reduce((sum, item) => sum + item.pageviews, 0);
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Traffic Sources</h3>
            <p className="mt-1 text-sm text-slate-500">
              UTM source breakdown and performance
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="synter-input w-auto text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
            
            <button
              onClick={fetchTrafficData}
              className="p-2 text-slate-400 hover:text-slate-500 rounded-md border border-slate-300"
              title="Refresh"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(totalPageviews)}
            </div>
            <div className="text-sm text-slate-500">Total Pageviews</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(totalVisitors)}
            </div>
            <div className="text-sm text-slate-500">Unique Visitors</div>
          </div>
        </div>

        {/* Traffic table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="loading-skeleton h-8 w-8 rounded" />
                  <div className="space-y-1">
                    <div className="loading-skeleton h-4 w-20" />
                    <div className="loading-skeleton h-3 w-16" />
                  </div>
                </div>
                <div className="loading-skeleton h-4 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="synter-table">
              <thead className="synter-table-header">
                <tr>
                  <th className="synter-table-header-cell">Source</th>
                  <th className="synter-table-header-cell">Pageviews</th>
                  <th className="synter-table-header-cell">Visitors</th>
                  <th className="synter-table-header-cell">Share</th>
                  <th className="synter-table-header-cell">Change</th>
                </tr>
              </thead>
              <tbody className="synter-table-body">
                {data.map((item, index) => (
                  <tr key={index} className="synter-table-row">
                    <td className="synter-table-cell">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(item.source)}`}>
                          {item.source}
                        </span>
                      </div>
                    </td>
                    <td className="synter-table-cell font-medium">
                      {formatNumber(item.pageviews)}
                    </td>
                    <td className="synter-table-cell">
                      {formatNumber(item.visitors)}
                    </td>
                    <td className="synter-table-cell">
                      <div className="flex items-center">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-12">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="synter-table-cell">
                      <span
                        className={`inline-flex items-center text-sm ${
                          item.change > 0
                            ? 'text-green-600'
                            : item.change < 0
                            ? 'text-red-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.change > 0 && '+'}
                        {item.change.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No traffic data</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Traffic data will appear here once analytics are configured.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
