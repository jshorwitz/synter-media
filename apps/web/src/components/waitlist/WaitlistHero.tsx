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

        {/* Key features with tactical icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="panel p-4 text-center group hover:border-accent-cyan/50 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 flex items-center justify-center border border-accent-cyan/30">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="text-xs font-mono text-text-mid uppercase tracking-wider">Multi-Platform</div>
          </div>

          <div className="panel p-4 text-center group hover:border-accent-lime/50 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-lime/20 to-accent-lime/5 flex items-center justify-center border border-accent-lime/30">
              <svg className="w-6 h-6 text-accent-lime" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="text-xs font-mono text-text-mid uppercase tracking-wider">Real-Time</div>
          </div>

          <div className="panel p-4 text-center group hover:border-accent-amber/50 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-amber/20 to-accent-amber/5 flex items-center justify-center border border-accent-amber/30">
              <svg className="w-6 h-6 text-accent-amber" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div className="text-xs font-mono text-text-mid uppercase tracking-wider">Attribution</div>
          </div>

          <div className="panel p-4 text-center group hover:border-accent-red/50 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-accent-red/20 to-accent-red/5 flex items-center justify-center border border-accent-red/30">
              <svg className="w-6 h-6 text-accent-red" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <div className="text-xs font-mono text-text-mid uppercase tracking-wider">Deploy Fast</div>
          </div>
        </div>
      </div>
    </section>
  );
}
