'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Scene {
  title: string;
  subtitle: string;
  description: string;
  screenshot: string;
}

const scenes: Scene[] = [
  {
    title: 'Unified Command Center',
    subtitle: 'Monitor Everything',
    description: 'Track performance across all platforms in real-time. No more switching between dashboards.',
    screenshot: '/screenshots/dashboard-overview.png',
  },
  {
    title: 'AI-Powered Recommendations',
    subtitle: 'Optimize Continuously',
    description: 'Frontier models analyze your campaigns 24/7 and suggest high-impact optimizations.',
    screenshot: '/screenshots/ppc-recommendations.png',
  },
  {
    title: 'Cross-Channel Orchestration',
    subtitle: 'Share Learnings',
    description: 'Insights from Google inform LinkedIn. Reddit performance shapes X strategy. Everything connected.',
    screenshot: '/screenshots/optimizations.png',
  },
  {
    title: 'One-Click Integration',
    subtitle: 'Deploy in Minutes',
    description: 'Connect your ad accounts in under 5 minutes. No dev work required.',
    screenshot: '/screenshots/integrations.png',
  },
];

export function StickyProductDemo() {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-24">
          {scenes.map((scene, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
            >
              {/* Text Content */}
              <div className={`space-y-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stroke-1 bg-carbon-850/50 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                  <span className="text-xs font-mono text-text-low uppercase tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-hi leading-tight">
                  {scene.title}
                </h3>
                
                <p className="text-lg md:text-xl text-accent-cyan font-mono">
                  {scene.subtitle}
                </p>
                
                <p className="text-base md:text-lg text-text-mid leading-relaxed">
                  {scene.description}
                </p>
              </div>

              {/* Screenshot */}
              <motion.div 
                className={`relative ${i % 2 === 1 ? 'lg:order-1' : ''}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? 60 : -60, rotateY: i % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1]
                }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div 
                  className="panel p-2 bg-carbon-850/50 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(77, 214, 255, 0.2)"
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full"
                    >
                      <Image
                        src={scene.screenshot}
                        alt={scene.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
