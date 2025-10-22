'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface VideoHeroProps {
  onSubmit: (data: { name: string; email: string; website?: string; firstName?: string; lastName?: string }) => void;
  onLogin: () => void;
}

export function VideoHero({ onSubmit, onLogin }: VideoHeroProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;
    
    setLoading(true);
    const name = `${firstName} ${lastName}`.trim();
    await onSubmit({ name, email, website: website || undefined, firstName, lastName });
    setLoading(false);
  };
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-16">
      {/* Gradient accents - semi-transparent to show particle background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-cyan/8 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-lime/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
        {/* Badges Container */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-lime/30 bg-accent-lime/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></span>
            <span className="text-xs font-mono text-accent-lime uppercase tracking-widest">
              Early Access • Limited Spots
            </span>
          </motion.div>
        </div>

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
          <form onSubmit={handleSubmit} className="panel p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Company website (optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-carbon-800 border border-stroke-1 rounded px-4 py-3 text-base text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactical-primary w-full px-8 py-4 text-base group disabled:opacity-50 inline-flex items-center justify-center"
            >
              {loading ? 'Joining...' : 'Join Waitlist'}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>
          
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <svg className="w-6 h-6 animate-bounce text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </motion.div>
    </section>
  );
}
