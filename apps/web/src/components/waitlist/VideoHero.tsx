'use client';

import { motion } from 'framer-motion';

interface VideoHeroProps {
  onSignup: () => void;
  onLogin: () => void;
}

export function VideoHero({ onSignup, onLogin }: VideoHeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient accents - semi-transparent to show particle background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-cyan/8 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-lime/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-lime/30 bg-accent-lime/5 backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></span>
          <span className="text-xs font-mono text-accent-lime uppercase tracking-widest">
            Early Access • Limited Spots
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-6xl md:text-8xl font-bold text-text-hi mb-8 leading-[0.95] tracking-tight"
        >
          AI Media Agent for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-accent-amber to-accent-lime">
            Cross-Channel Ads
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-text-mid max-w-3xl mx-auto mb-12 leading-relaxed font-light"
        >
          Stop paying 10% agency fees. Let frontier AI models optimize your campaigns across Google, LinkedIn, Reddit, X, and Microsoft.
        </motion.p>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="panel p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Full name"
                className="bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
              <input
                type="email"
                placeholder="Email address"
                className="bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            
            <div className="mb-4">
              <input
                type="url"
                placeholder="Company website (optional)"
                className="w-full bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>

            <button
              onClick={onSignup}
              className="btn-tactical-primary w-full px-8 py-4 text-base group"
            >
              Join Waitlist
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
          
          <p className="mt-4 text-sm text-text-muted text-center">
            Already have an account?{' '}
            <button onClick={onLogin} className="text-accent-cyan hover:underline">
              Sign in
            </button>
          </p>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <span className="text-xs font-mono uppercase tracking-wider">Scroll to explore</span>
          <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
