'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { DeviceFrame } from './DeviceFrame';

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
    screenshot: '/screenshots/ppc-dashboard.png',
  },
  {
    title: 'One-Click Integration',
    subtitle: 'Deploy in Minutes',
    description: 'Connect your ad accounts in under 5 minutes. No dev work required.',
    screenshot: '/screenshots/integrations.png',
  },
];

export function StickyProductDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const screenshotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentSceneRef = useRef(0);

  useEffect(() => {
    let ctx: any;
    
    (async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !demoRef.current) return;

      const sceneElements = gsap.utils.toArray<HTMLElement>('.demo-scene');
      
      ctx = gsap.context(() => {
        // Pin the demo panel
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (scenes.length - 0.5)}`,
          pin: demoRef.current,
          pinSpacing: false,
        });

        // Swap screenshots on scroll
        sceneElements.forEach((scene, i) => {
          ScrollTrigger.create({
            trigger: scene,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setActiveScene(i),
            onEnterBack: () => setActiveScene(i),
          });
        });
      });
    })();

    function setActiveScene(index: number) {
      if (currentSceneRef.current === index) return;
      currentSceneRef.current = index;
      
      screenshotRefs.current.forEach((ref, i) => {
        if (!ref) return;
        if (i === index) {
          ref.style.opacity = '1';
          ref.style.transform = 'scale(1)';
        } else {
          ref.style.opacity = '0';
          ref.style.transform = 'scale(0.95)';
        }
      });
    }

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[400vh] py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Scrolling scenes */}
          <div className="lg:col-span-5 space-y-[100vh]">
            {scenes.map((scene, i) => (
              <motion.div
                key={i}
                className="demo-scene min-h-[60vh] flex flex-col justify-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stroke-1 bg-carbon-850/50 backdrop-blur-sm mb-6 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                  <span className="text-xs font-mono text-text-low uppercase tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <h3 className="font-display text-4xl md:text-5xl font-bold text-text-hi mb-4 leading-tight">
                  {scene.title}
                </h3>
                
                <p className="text-xl text-accent-cyan font-mono mb-6">
                  {scene.subtitle}
                </p>
                
                <p className="text-lg text-text-mid leading-relaxed max-w-xl">
                  {scene.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Sticky demo */}
          <div className="lg:col-span-7 relative h-screen hidden lg:block">
            <div ref={demoRef} className="sticky top-0 h-screen flex items-center justify-center py-12">
              <div className="relative w-full max-w-5xl">
                {/* Stacked device frames */}
                {scenes.map((scene, i) => (
                  <div
                    key={i}
                    ref={(el) => { screenshotRefs.current[i] = el; }}
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      opacity: i === 0 ? 1 : 0,
                      transform: i === 0 ? 'scale(1)' : 'scale(0.95)',
                    }}
                  >
                    <DeviceFrame
                      src={scene.screenshot}
                      alt={scene.title}
                      type="laptop"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Static grid */}
          <div className="lg:hidden space-y-12">
            {scenes.map((scene, i) => (
              <div key={i} className="panel overflow-hidden">
                <div className="aspect-video relative bg-carbon-800">
                  <Image
                    src={scene.screenshot}
                    alt={scene.title}
                    fill
                    className="object-cover object-top"
                    sizes="100vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
