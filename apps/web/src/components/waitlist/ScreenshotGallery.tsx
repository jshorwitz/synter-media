'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Screenshot {
  src: string;
  alt: string;
  title: string;
  description: string;
}

const screenshots: Screenshot[] = [
  {
    src: '/screenshots/dashboard-overview.png',
    alt: 'Dashboard Overview showing unified metrics across all platforms',
    title: 'Unified Dashboard',
    description: 'Real-time metrics across all platforms in one command center'
  },
  {
    src: '/screenshots/ppc-dashboard.png',
    alt: 'PPC Manager campaign list with performance metrics',
    title: 'PPC Manager',
    description: 'Manage campaigns, budgets, and pacing with confidence'
  },
  {
    src: '/screenshots/ppc-recommendations.png',
    alt: 'AI-powered recommendations for campaign optimization',
    title: 'Smart Recommendations',
    description: 'Frontier models analyze performance and suggest improvements'
  },
  {
    src: '/screenshots/integrations.png',
    alt: 'Platform integrations and connections',
    title: 'Platform Integrations',
    description: 'Connect Google, LinkedIn, Reddit, X, and Microsoft in minutes'
  },
  {
    src: '/screenshots/onboarding.png',
    alt: 'Fast onboarding wizard',
    title: 'Quick Setup',
    description: 'Get up and running in minutes with our guided onboarding'
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
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-2 panel overflow-hidden group"
          >
            <div className="aspect-video relative bg-carbon-800 rounded-lg overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={screenshots[0].src}
                  alt={screenshots[0].alt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  priority
                />
              </motion.div>
            </div>
            <motion.div 
              className="p-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-xl font-semibold text-text-hi mb-2">
                {screenshots[0].title}
              </h3>
              <p className="text-text-mid text-sm">
                {screenshots[0].description}
              </p>
            </motion.div>
          </motion.div>

          {/* Remaining screenshots in grid */}
          {screenshots.slice(1).map((screenshot, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.7, 
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, amount: 0.2 }}
              className="panel overflow-hidden group"
            >
              <div className="aspect-video relative bg-carbon-800 rounded-lg overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    loading="lazy"
                  />
                </motion.div>
              </div>
              <motion.div 
                className="p-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="font-display text-lg font-semibold text-text-hi mb-2">
                  {screenshot.title}
                </h3>
                <p className="text-text-mid text-sm">
                  {screenshot.description}
                </p>
              </motion.div>
            </motion.div>
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
