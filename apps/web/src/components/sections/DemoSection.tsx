'use client';

import { useEffect, useRef, useState } from 'react';

export function DemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="demo" className="py-16 lg:py-24 bg-slate-950">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-100">
            See Synter optimize your campaigns
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-lg">
            Watch the agent balance budget and bids across Google, Meta, Reddit, LinkedIn—live.
          </p>
        </div>

        <div className="mt-8 rounded-2xl ring-1 ring-slate-800 overflow-hidden bg-slate-900">
          {isInView ? (
            <video
              ref={videoRef}
              className="w-full h-auto block"
              autoPlay
              muted
              loop
              playsInline
              poster="/demo/poster.jpg"
              preload="metadata"
            >
              <source src="/demo/synter-demo.mp4" type="video/mp4" />
              {/* Fallback GIF */}
              <img src="/demo/synter-demo.gif" alt="Synter product demo showing AI campaign optimization" className="w-full" />
            </video>
          ) : (
            // Placeholder while loading
            <div className="w-full h-96 bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading demo...</p>
              </div>
            </div>
          )}
        </div>

        {/* Demo highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-lime-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-medium">AI Analysis</h3>
            <p className="text-slate-400 text-sm mt-1">Analyzes website and creates personas</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-lime-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-medium">Multi-Platform Launch</h3>
            <p className="text-slate-400 text-sm mt-1">Deploys campaigns across all channels</p>
          </div>
          
          <div className="p-4">
            <div className="w-12 h-12 bg-lime-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-medium">Real-Time Optimization</h3>
            <p className="text-slate-400 text-sm mt-1">Continuously optimizes for performance</p>
          </div>
        </div>
      </div>
    </section>
  );
}
