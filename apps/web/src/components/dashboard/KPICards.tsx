'use client';

import { formatCurrency, formatNumber, formatPercentage, calculatePercentageChange } from '@/lib/utils';

interface KPI {
  spend: number;
  clicks: number;
  conversions: number;
  cac: number;
  roas: number;
  revenue: number;
}

interface KPICardsProps {
  kpis?: KPI;
  previousKpis?: KPI;
}

export function KPICards({ kpis, previousKpis }: KPICardsProps) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="synter-card animate-pulse">
            <div className="synter-skeleton h-4 w-16 mb-3" />
            <div className="synter-skeleton h-8 w-24 mb-2" />
            <div className="synter-skeleton h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      name: 'Total Spend',
      value: formatCurrency(kpis.spend || 0),
      change: previousKpis ? calculatePercentageChange(kpis.spend || 0, previousKpis.spend || 0) : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: 'synter-volt',
    },
    {
      name: 'Total Clicks',
      value: formatNumber(kpis.clicks || 0),
      change: previousKpis ? calculatePercentageChange(kpis.clicks || 0, previousKpis.clicks || 0) : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.307l-1.591 1.591M6 10.5H3.75m4.007-4.243-1.59-1.591" />
        </svg>
      ),
      color: 'synter-sky',
    },
    {
      name: 'Conversions',
      value: formatNumber(kpis.conversions || 0),
      change: previousKpis ? calculatePercentageChange(kpis.conversions || 0, previousKpis.conversions || 0) : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: 'synter-meadow',
    },
    {
      name: 'CAC',
      value: formatCurrency(kpis.cac || 0),
      change: previousKpis ? calculatePercentageChange(kpis.cac || 0, previousKpis.cac || 0) : null,
      inverted: true, // Lower is better for CAC
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H3.75m0 0h15v.75c0 .414-.336.75-.75.75H18m0 0h-.375c0-.621-.504-1.125-1.125-1.125H18m0 0V3.75A.75.75 0 0 0 17.25 3H6.75A.75.75 0 0 0 6 3.75v.75h12Z" />
        </svg>
      ),
      color: 'synter-ember',
    },
    {
      name: 'ROAS',
      value: `${(kpis.roas || 0).toFixed(2)}x`,
      change: previousKpis ? calculatePercentageChange(kpis.roas || 0, previousKpis.roas || 0) : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
      color: 'synter-volt',
    },
    {
      name: 'Revenue',
      value: formatCurrency(kpis.revenue || 0),
      change: previousKpis ? calculatePercentageChange(kpis.revenue || 0, previousKpis.revenue || 0) : null,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      color: 'synter-meadow',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric, index) => (
        <div 
          key={metric.name} 
          className="synter-metric animate-slide-up" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-${metric.color}/10`}>
              <div className={`text-${metric.color}`}>
                {metric.icon}
              </div>
            </div>
            {metric.change !== null && (
              <div
                className={`synter-metric-change ${
                  metric.inverted 
                    ? metric.change < 0 ? 'positive' : 'negative'
                    : metric.change > 0 ? 'positive' : 'negative'
                }`}
              >
                <span className="flex items-center">
                  {metric.inverted ? (
                    metric.change < 0 ? (
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                      </svg>
                    )
                  ) : metric.change > 0 ? (
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  )}
                  {formatPercentage(Math.abs(metric.change))}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="synter-metric-value">{metric.value}</div>
            <div className="synter-metric-label">{metric.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
