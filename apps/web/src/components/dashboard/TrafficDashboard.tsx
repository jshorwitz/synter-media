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
      
      // Mock traffic data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTrafficData: TrafficData[] = [
        {
          source: 'Google',
          visitors: 3420,
          pageviews: 8540,
          percentage: 34.2,
          change: 12.5
        },
        {
          source: 'Meta',
          visitors: 2180,
          pageviews: 5320,
          percentage: 21.8,
          change: 8.3
        },
        {
          source: 'Direct',
          visitors: 1890,
          pageviews: 4200,
          percentage: 18.9,
          change: -3.2
        },
        {
          source: 'Organic Search',
          visitors: 1560,
          pageviews: 3780,
          percentage: 15.6,
          change: 15.7
        },
        {
          source: 'LinkedIn',
          visitors: 820,
          pageviews: 1950,
          percentage: 8.2,
          change: 22.1
        },
        {
          source: 'X',
          visitors: 130,
          pageviews: 290,
          percentage: 1.3,
          change: 45.8
        }
      ];
      
      setData(mockTrafficData);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period, timeRange]);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  const totalPageviews = data.reduce((sum, item) => sum + item.pageviews, 0);
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);

  if (loading) {
    return (
      <div className="synter-card">
        <div className="synter-card-header">
          <div className="synter-skeleton h-6 w-32 mb-2" />
          <div className="synter-skeleton h-4 w-48" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="synter-skeleton h-4 w-24" />
              <div className="synter-skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="synter-card">
      <div className="synter-card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="synter-card-title">Traffic Sources</h3>
            <p className="synter-card-subtitle">
              {formatNumber(totalVisitors)} visitors • {formatNumber(totalPageviews)} pageviews
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="synter-input w-auto text-sm"
          >
            <option value="today">Today</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div 
            key={item.source} 
            className="flex items-center justify-between animate-slide-right"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center flex-1">
              <div className={`w-3 h-3 rounded-full mr-3 ${getPlatformColor(item.source)}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium px-2 py-1 rounded-md ${getPlatformColor(item.source)}`}>
                  {item.source}
                </div>
                <div className="text-xs text-synter-ink-2">
                  {formatNumber(item.visitors)} visitors
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-synter-ink">
                  {item.percentage.toFixed(1)}%
                </div>
                <div className={`text-xs ${
                  item.change > 0 
                    ? 'text-synter-meadow' 
                    : item.change < 0 
                    ? 'text-synter-ember' 
                    : 'text-synter-ink-2'
                }`}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                </div>
              </div>
              
              <div className="w-20">
                <div className="w-full bg-synter-surface-3 rounded-full h-2">
                  <div 
                    className="bg-synter-volt h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(item.percentage * 2, 100)}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-synter-ink-2 mb-2">No traffic data available</div>
          <button 
            onClick={fetchTrafficData}
            className="synter-btn synter-btn-secondary synter-btn-sm"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
