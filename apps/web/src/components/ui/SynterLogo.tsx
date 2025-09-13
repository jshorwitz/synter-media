import { cn } from '@/lib/utils';

interface SynterLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export function SynterLogo({ className, variant = 'full' }: SynterLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
      </div>
      <span className="ml-3 text-2xl font-bold text-slate-900">
        Synter
      </span>
    </div>
  );
}
