'use client';

import Image from 'next/image';

interface DeviceFrameProps {
  src: string;
  alt: string;
  type?: 'laptop' | 'desktop';
}

export function DeviceFrame({ src, alt, type = 'laptop' }: DeviceFrameProps) {
  if (type === 'desktop') {
    return (
      <div className="relative w-full">
        {/* Monitor frame */}
        <div className="relative bg-carbon-900 rounded-t-2xl border-8 border-carbon-700 shadow-2xl">
          {/* Screen */}
          <div className="relative aspect-video bg-carbon-900 rounded-lg overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1200px) 100vw, 60vw"
            />
          </div>
        </div>
        
        {/* Monitor stand */}
        <div className="mx-auto w-1/3 h-12 bg-gradient-to-b from-carbon-700 to-carbon-800 relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-carbon-700 rounded-t"></div>
        </div>
        
        {/* Base */}
        <div className="mx-auto w-2/3 h-3 bg-carbon-800 rounded-b-xl"></div>
      </div>
    );
  }

  // Laptop mockup (default)
  return (
    <div className="relative w-full">
      {/* Laptop screen */}
      <div className="relative bg-carbon-900 rounded-t-xl border-t-8 border-x-8 border-carbon-700 shadow-2xl">
        {/* Camera notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-carbon-900 rounded-b-full z-10"></div>
        
        {/* Screen content */}
        <div className="relative aspect-video bg-carbon-900 rounded-t-lg overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1200px) 100vw, 60vw"
          />
        </div>
      </div>
      
      {/* Laptop base */}
      <div className="relative h-6 bg-gradient-to-b from-carbon-800 to-carbon-700 rounded-b-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-carbon-900/50"></div>
      </div>
      
      {/* Keyboard deck */}
      <div className="relative -mt-1">
        <svg viewBox="0 0 1000 40" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,10 Q500,40 1000,10 L1000,40 L0,40 Z"
            fill="url(#laptopGradient)"
          />
          <defs>
            <linearGradient id="laptopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#171E28" />
              <stop offset="100%" stopColor="#0F131A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
