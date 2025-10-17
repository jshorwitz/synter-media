'use client';

import Image from 'next/image';

interface Screenshot {
  src: string;
  alt: string;
  title: string;
  description: string;
}

const screenshots: Screenshot[] = [
  {
    src: '/screenshots/dashboard-overview.png',
    alt: 'Dashboard Overview',
    title: 'Unified Dashboard',
    description: 'Real-time metrics across all platforms in one command center'
  },
  {
    src: '/screenshots/ppc-dashboard.png',
    alt: 'PPC Manager',
    title: 'PPC Manager',
    description: 'AI-powered recommendations and automated optimization'
  },
  {
    src: '/screenshots/ppc-recommendations.png',
    alt: 'AI Recommendations',
    title: 'Smart Recommendations',
    description: 'Frontier models analyze performance and suggest improvements'
  }
];

export function ScreenshotGallery() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-hi mb-4">
            Built for Performance Marketing Teams
          </h2>
          <p className="text-lg text-text-mid max-w-2xl mx-auto">
            Everything you need to manage, optimize, and scale your cross-channel campaigns
          </p>
        </div>

        {/* Screenshot grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* First screenshot spans full width */}
          <div className="lg:col-span-2 panel overflow-hidden group">
            <div className="aspect-video relative bg-carbon-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-red/10 to-accent-cyan/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-text-mid font-mono text-sm">
                    {screenshots[0].title}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold text-text-hi mb-2">
                {screenshots[0].title}
              </h3>
              <p className="text-text-mid text-sm">
                {screenshots[0].description}
              </p>
            </div>
          </div>

          {/* Remaining screenshots in grid */}
          {screenshots.slice(1).map((screenshot, i) => (
            <div key={i} className="panel overflow-hidden group">
              <div className="aspect-video relative bg-carbon-800 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-amber/10 to-accent-lime/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3">{i === 0 ? '⚡' : '🎯'}</div>
                    <p className="text-text-mid font-mono text-sm">
                      {screenshot.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-text-hi mb-2">
                  {screenshot.title}
                </h3>
                <p className="text-text-mid text-sm">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🧠',
              title: 'Frontier AI Models',
              description: 'Deep research and pattern recognition across your entire ad portfolio'
            },
            {
              icon: '🔄',
              title: 'Shared Learnings',
              description: 'Cross-pollinate insights between campaigns, accounts, and platforms'
            },
            {
              icon: '📈',
              title: 'Automated Optimization',
              description: 'Real-time budget allocation and bid adjustments based on performance'
            }
          ].map((feature, i) => (
            <div key={i} className="panel p-6 text-center group hover:border-accent-cyan/30 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="font-display text-lg font-semibold text-text-hi mb-2">
                {feature.title}
              </h4>
              <p className="text-text-mid text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
