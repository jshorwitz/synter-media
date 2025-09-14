'use client';

import { useState } from 'react';
import { HeroVisualization } from './HeroVisualization';
import Link from 'next/link';

interface HeroSectionProps {
  onGetStarted?: (websiteUrl: string) => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    
    // Simple URL validation
    try {
      if (value && (value.startsWith('http://') || value.startsWith('https://') || value.includes('.'))) {
        new URL(value.startsWith('http') ? value : `https://${value}`);
        setIsValidUrl(true);
      } else {
        setIsValidUrl(false);
      }
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleGetStarted = () => {
    if (isValidUrl && onGetStarted) {
      const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      onGetStarted(cleanUrl);
    }
  };
  return (
    <section className="relative bg-slate-950 text-slate-100">
      {/* Hero */}
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI Media Agent</p>
          <h1 className="mt-3 text-4xl lg:text-6xl font-semibold leading-none">
            <span className="text-lime-400">Think faster.</span><br/>
            Decide smarter.
          </h1>
          <p className="mt-5 text-slate-300 max-w-xl text-lg">
            Synter orchestrates paid media across every channel with real-time optimization and clear insights.
          </p>
            
          {/* URL input + CTA */}
          <form className="mt-7" onSubmit={(e) => { e.preventDefault(); handleGetStarted(); }}>
            <div className="relative flex w-full lg:max-w-xl items-center rounded-2xl ring-1 ring-slate-800 bg-slate-900/80 backdrop-blur">
              <input
                type="url"
                value={websiteUrl}
                onChange={handleUrlChange}
                className="flex-1 bg-transparent px-4 py-4 text-base placeholder:text-slate-500 focus:outline-none"
                placeholder="Enter your website URL (e.g., yoursite.com)"
              />
              <button 
                type="submit" 
                disabled={!isValidUrl}
                className="m-1 shrink-0 rounded-xl bg-lime-500 px-4 py-2.5 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Get Started →
              </button>
            </div>
            {websiteUrl && !isValidUrl && (
              <p className="mt-2 text-sm text-red-400">
                Please enter a valid website URL
              </p>
            )}
            <p className="mt-2 text-sm text-slate-400">
              We&apos;ll analyze your site and start optimizing in minutes.
            </p>
          </form>

          {/* Secondary CTAs */}
          <div className="mt-6 flex gap-3">
            <a href="#demo" className="rounded-xl ring-1 ring-slate-800 px-4 py-2.5 text-slate-300 hover:text-slate-100 hover:ring-slate-700 transition-all">
              Watch Demo
            </a>
            <a href="#docs" className="rounded-xl ring-1 ring-slate-800 px-4 py-2.5 text-slate-300 hover:text-slate-100 hover:ring-slate-700 transition-all">
              View Docs
            </a>
          </div>
        </div>

        {/* Visual (d3 canvas with mask/overlay) */}
        <div className="relative h-[360px] lg:h-[520px]">
          <HeroVisualization className="absolute inset-0" />
          {/* Mask / scrim overlay */}
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_80%_at_60%_50%,_#000_60%,_transparent_100%)] opacity-90" />
          <div className="pointer-events-none absolute inset-0 bg-slate-950/30 mix-blend-multiply" />
        </div>
      </div>
    </section>

  );
}
