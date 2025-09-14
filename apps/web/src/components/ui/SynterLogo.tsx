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
          <div className="w-10 h-10 bg-gradient-to-br from-synter-volt to-synter-sky rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-synter-accent transition-all duration-300 group-hover:scale-105">
            <span className="text-synter-surface font-bold text-xl">S</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center group', className)}>
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-synter-volt to-synter-sky rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-synter-accent transition-all duration-300 group-hover:scale-105">
          <span className="text-synter-surface font-bold text-2xl">S</span>
        </div>
      </div>
      <div className="ml-3">
        <span className="text-2xl font-bold bg-gradient-to-r from-synter-ink to-synter-volt bg-clip-text text-transparent">
          Synter
        </span>
        <div className="text-xs text-synter-ink-2 font-medium tracking-wide">
          AI Media Agent
        </div>
      </div>
    </div>
  );
}
