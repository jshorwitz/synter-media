/**
 * Platform brand colors and styling utilities
 */

export const PLATFORM_COLORS = {
  Google: '#4285F4',
  Meta: '#1877F2', 
  Facebook: '#1877F2',
  X: '#000000',
  Twitter: '#1DA1F2',
  LinkedIn: '#0A66C2',
  TikTok: '#FF0050',
  YouTube: '#FF0000',
  Reddit: '#FF4500',
  Direct: '#6B7280',
  'Organic Search': '#10B981',
  Programmatic: '#8B5CF6'
} as const;

export type PlatformName = keyof typeof PLATFORM_COLORS;

/**
 * Get the brand color for a platform
 */
export function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform as PlatformName] || '#6B7280';
}

/**
 * Get a CSS class name for platform color styling
 */
export function getPlatformColorClass(platform: string): string {
  const colorMap: Record<string, string> = {
    Google: 'text-blue-500 bg-blue-50',
    Meta: 'text-blue-600 bg-blue-50',
    Facebook: 'text-blue-600 bg-blue-50',
    X: 'text-black bg-gray-50',
    Twitter: 'text-blue-400 bg-blue-50',
    LinkedIn: 'text-blue-700 bg-blue-50',
    TikTok: 'text-pink-500 bg-pink-50',
    YouTube: 'text-red-600 bg-red-50',
    Reddit: 'text-orange-500 bg-orange-50',
    Direct: 'text-gray-600 bg-gray-50',
    'Organic Search': 'text-green-500 bg-green-50',
    Programmatic: 'text-purple-500 bg-purple-50'
  };
  
  return colorMap[platform] || 'text-gray-500 bg-gray-50';
}

/**
 * Generate a platform badge component props
 */
export function getPlatformBadgeProps(platform: string) {
  return {
    color: getPlatformColor(platform),
    className: getPlatformColorClass(platform)
  };
}
