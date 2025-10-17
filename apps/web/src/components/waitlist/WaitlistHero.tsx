'use client';

import { useState } from 'react';

interface WaitlistHeroProps {
  onSignup: () => void;
  onLogin: () => void;
}

export function WaitlistHero({ onSignup, onLogin }: WaitlistHeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 synter-grid opacity-40"></div>
      
      {/* Gradient accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-red/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stroke-1 bg-carbon-850/50 backdrop-blur-sm mb-8 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></span>
          <span className="text-xs font-mono text-text-mid uppercase tracking-wider">
            Early Access
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-hi mb-6 leading-[1.1] tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
          AI Media Agent for
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-accent-amber to-accent-lime">
            Cross-Channel Ads
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-text-mid max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
          Optimize your ads using <span className="text-text-hi font-medium">shared learnings</span> across accounts and <span className="text-text-hi font-medium">deep research by frontier models</span>. Deploy in minutes across Google, LinkedIn, Reddit, X, and more.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={onSignup}
            className="btn-tactical-primary px-8 py-4 text-base w-full sm:w-auto"
          >
            Join the Waitlist
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button
            onClick={onLogin}
            className="btn-tactical-ghost px-8 py-4 text-base w-full sm:w-auto"
          >
            Already have an account?
          </button>
        </div>

        {/* Key benefits */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
          {[
            { label: 'Multi-Platform', icon: '🌐' },
            { label: 'Real-Time Optimization', icon: '⚡' },
            { label: 'Unified Attribution', icon: '📊' },
            { label: 'Minutes to Deploy', icon: '🚀' }
          ].map((benefit, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-stroke-1 bg-carbon-850/30 backdrop-blur-sm">
              <span className="text-2xl">{benefit.icon}</span>
              <span className="text-xs font-mono text-text-mid text-center">{benefit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
