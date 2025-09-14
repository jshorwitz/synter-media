import { getPlatformColor, getPlatformColorClass } from '@/utils/platform-colors';

interface PlatformBadgeProps {
  platform: string;
  className?: string;
  showIcon?: boolean;
}

export function PlatformBadge({ platform, className = '', showIcon = true }: PlatformBadgeProps) {
  const colorClass = getPlatformColorClass(platform);
  const brandColor = getPlatformColor(platform);
  
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${colorClass} ${className}`}>
      {showIcon && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: brandColor }}
        />
      )}
      <span>{platform}</span>
    </div>
  );
}
