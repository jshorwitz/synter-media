import { ReactNode } from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  delta?: number;
  sparkline?: ReactNode;
  className?: string;
}

export function MetricTile({ label, value, delta, sparkline, className = '' }: MetricTileProps) {
  return (
    <div className={`metric-tile ${className}`}>
      <div className="panel-title">{label}</div>
      <div className="flex items-end justify-between mt-2">
        <div className="metric-value">{value}</div>
        {delta !== undefined && (
          <div className={`metric-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      {sparkline && (
        <div className="sparkline mt-2">
          {sparkline}
        </div>
      )}
    </div>
  );
}
