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

  const normalizeUrl = (input: string): string => {
    let url = input.trim();
    
    // Remove protocol if present to normalize
    url = url.replace(/^https?:\/\//i, '');
    
    // Remove www. prefix to normalize
    url = url.replace(/^www\./i, '');
    
    // Add https:// for validation
    return `https://${url}`;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    
    // Quick validation: check if it looks like a domain
    const trimmed = value.trim();
    if (!trimmed) {
      setIsValidUrl(false);
      return;
    }
    
    // Clean the input for testing
    const cleanedForTest = trimmed
      .replace(/^https?:\/\//i, '')  // Remove protocol
      .replace(/^www\./i, '')         // Remove www
      .split('/')[0];                 // Remove path
    
    // Very permissive pattern: something.something (allows subdomains, hyphens, numbers)
    const hasDot = cleanedForTest.includes('.');
    const parts = cleanedForTest.split('.');
    
    // Valid if: has at least 2 parts (domain.tld), each part has at least 1 char, TLD is 2+ letters
    if (hasDot && parts.length >= 2 && parts.every(p => p.length > 0) && /^[a-zA-Z]{2,}$/.test(parts[parts.length - 1])) {
      setIsValidUrl(true);
    } else {
      setIsValidUrl(false);
    }
  };

  const handleGetStarted = () => {
    if (isValidUrl && onGetStarted) {
      const cleanUrl = normalizeUrl(websiteUrl);
      onGetStarted(cleanUrl);
    }
  };
  return (
    <section className="relative bg-carbon-900 text-text-hi font-mono">
      {/* Hero */}
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-low">AI MEDIA AGENT</p>
          <h1 className="mt-3 text-4xl lg:text-6xl font-bold font-display leading-none">
            <span className="text-accent-lime">Think faster.</span><br/>
            Decide smarter.
          </h1>
          <p className="mt-5 text-text-mid max-w-xl text-lg leading-relaxed">
            Synter orchestrates paid media across every channel with real-time optimization and clear insights.
          </p>
            
          {/* URL input + CTA */}
          <form className="mt-7" onSubmit={(e) => { e.preventDefault(); handleGetStarted(); }}>
            <div className="relative flex w-full lg:max-w-xl items-center rounded-tactical border border-stroke-1 bg-carbon-800 backdrop-blur">
              <input
                type="text"
                value={websiteUrl}
                onChange={handleUrlChange}
                className="flex-1 bg-transparent px-4 py-4 text-base text-text-hi placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                placeholder="example.com"
                autoComplete="off"
              />
              <button 
                type="submit" 
                disabled={!isValidUrl}
                className="m-1 shrink-0 rounded-tactical bg-accent-lime px-4 py-2.5 text-carbon-900 font-bold font-mono text-sm uppercase tracking-wide hover:bg-accent-lime/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Get Started →
              </button>
            </div>
            {websiteUrl && !isValidUrl && (
              <p className="mt-2 text-sm text-accent-red">
                Please enter a valid website URL
              </p>
            )}
            <p className="mt-2 text-sm text-text-low">
              We&apos;ll analyze your site and start optimizing in minutes.
            </p>
          </form>


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
