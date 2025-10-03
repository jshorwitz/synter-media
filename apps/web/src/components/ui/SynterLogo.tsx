import { cn } from '@/lib/utils';

interface SynterLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export function SynterLogo({ className, variant = 'full' }: SynterLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="relative group">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center group cursor-pointer', className)}>
      <div className="relative">
        <div className="w-11 h-11 bg-gradient-to-br from-lime-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg" />
      </div>
      <div className="ml-3">
        <span className="text-xl font-bold tracking-tight" style={{
          background: 'linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(217 91% 60%) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Synter
        </span>
        <div className="text-[10px] font-semibold tracking-wider uppercase" style={{color: 'hsl(215 20% 65%)'}}>
          AI Media Agent
        </div>
      </div>
    </div>
  );
}
