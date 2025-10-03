"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  progress?: number;
  target?: number; // Target value for comparison
  current?: number; // Current actual value
}

export function StatCard({ label, value, change, icon, color = 'blue', progress, target, current }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
  };

  const progressColors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  // Calculate progress from target if provided
  let calculatedProgress = progress;
  let isOnTrack = true;
  
  if (target && current !== undefined) {
    calculatedProgress = (current / target) * 100;
    isOnTrack = current >= target * 0.9; // On track if at 90% or above
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-lg
        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
        bg-gradient-to-br ${colorClasses[color]}
      `}
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        borderColor: 'rgba(51, 65, 85, 0.6)',
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-1 mb-3">
            {change >= 0 ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm font-semibold text-emerald-400">
                  +{change.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-sm font-semibold text-red-400">
                  {change.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-xs text-slate-500 ml-1">vs last period</span>
          </div>
        )}

        {/* Progress bar - Always show if target is set or progress is provided */}
        {(calculatedProgress !== undefined || target) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">
                {target && current !== undefined ? (
                  <>Target: {target.toLocaleString()}</>
                ) : (
                  'Progress'
                )}
              </span>
              <span className={`text-xs font-semibold ${isOnTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
                {calculatedProgress !== undefined ? `${Math.round(calculatedProgress)}%` : '0%'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  isOnTrack 
                    ? `bg-gradient-to-r ${progressColors[color]}` 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, calculatedProgress || 0))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
