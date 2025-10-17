'use client';

import { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { AuthModal } from '@/components/auth/AuthModal';
import { VideoHero } from '@/components/waitlist/VideoHero';
import { StickyProductDemo } from '@/components/waitlist/StickyProductDemo';
import { ScreenshotGallery } from '@/components/waitlist/ScreenshotGallery';
import { ROICalculator } from '@/components/waitlist/ROICalculator';
import { InteractiveBackground } from '@/components/waitlist/InteractiveBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const metadata = {
  title: 'Join the Waitlist - Synter AI Media Agent',
  description: 'Stop paying 10% agency fees. Let frontier AI models optimize your campaigns across Google, LinkedIn, Reddit, X, and Microsoft. Join the waitlist today.',
  openGraph: {
    title: 'Synter - AI Media Agent for Cross-Channel Ads',
    description: 'Optimize your ads using shared learnings and deep research by frontier models. Deploy in minutes. Pay-as-you-go pricing.',
    images: [
      {
        url: '/screenshots/waitlist-hero.png',
        width: 1440,
        height: 900,
        alt: 'Synter Waitlist - AI Media Agent Platform',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synter - AI Media Agent for Cross-Channel Ads',
    description: 'Stop paying agency fees. Let AI optimize your campaigns across all platforms.',
    images: ['/screenshots/waitlist-hero.png'],
  },
};

export default function WaitlistPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('signup');
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignup = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async () => {
    // Record waitlist signup
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          source: 'waitlist',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Optionally redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error recording waitlist signup:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-carbon-900 synter-grid">
        <TopNav onLogin={handleLogin} onSignup={handleSignup} />
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="panel max-w-2xl w-full p-12 text-center">
            <div className="text-6xl mb-6 animate-slide-up">🎉</div>
            <h2 className="font-display text-3xl font-bold text-text-hi mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
              You're on the list!
            </h2>
            <p className="text-text-mid mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              Welcome to Synter. We're setting up your account now and will notify you when it's ready.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-text-low animate-slide-up" style={{ animationDelay: '300ms' }}>
              <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></span>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-900 relative overflow-hidden">
      {/* Interactive Background */}
      <InteractiveBackground />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <TopNav onLogin={handleLogin} onSignup={handleSignup} />

        {/* Hero Section */}
        <VideoHero onSignup={handleSignup} onLogin={handleLogin} />

        {/* Sticky Product Demo */}
        <StickyProductDemo />

        {/* ROI Calculator */}
        <section className="relative py-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <ROICalculator />
          </motion.div>
        </section>

        {/* Value Props Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-20"
            >
              <h2 className="font-display text-5xl md:text-6xl font-bold text-text-hi mb-6">
                Why Performance Teams Choose Synter
              </h2>
              <p className="text-xl text-text-mid max-w-2xl mx-auto">
                Stop managing platforms in silos. Let AI orchestrate your entire media strategy.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Cross-Platform Intelligence',
                  description: 'Learn from your entire ad portfolio. Share insights between Google, LinkedIn, Reddit, X, and Microsoft.',
                },
                {
                  title: 'Frontier Model Research',
                  description: 'Advanced AI continuously researches your market, competitors, and audience—delivering strategic recommendations backed by deep analysis.',
                },
                {
                  title: 'Autonomous Optimization',
                  description: 'Set your goals and guardrails, then let Synter handle budget allocation, bid adjustments, and creative testing in real-time.',
                },
                {
                  title: 'Unified Attribution',
                  description: 'Track conversions across the entire customer journey with multi-touch attribution that works seamlessly across all channels.',
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="panel p-8 group hover:border-accent-cyan/50 transition-all hover:scale-[1.02]"
                >
                  <h3 className="font-display text-2xl font-semibold text-text-hi mb-3">
                    {item.title}
                  </h3>
                  <p className="text-text-mid leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-32 px-6 bg-carbon-850/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-5xl md:text-6xl font-bold text-text-hi mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-text-mid">
                No subscriptions. No hidden fees. Just pay for what you use.
              </p>
            </motion.div>

          <div className="panel p-12 text-center bg-gradient-to-br from-accent-cyan/5 to-accent-lime/5 border-accent-cyan/30">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-lime/10 border border-accent-lime/30 mb-8">
              <svg className="w-5 h-5 text-accent-lime" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-mono text-accent-lime uppercase tracking-wider">Pay-As-You-Go</span>
            </div>

            <h3 className="font-display text-4xl font-bold text-text-hi mb-4">
              Usage-Based Pricing
            </h3>
            <p className="text-text-mid text-lg mb-8 max-w-2xl mx-auto">
              Only pay for the AI actions and optimizations you use. No monthly minimums, no contracts, no setup fees.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="panel bg-carbon-850/50 p-6">
                <svg className="w-8 h-8 text-accent-cyan mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div className="text-sm font-mono text-text-mid uppercase tracking-wider mb-1">No Subscriptions</div>
                <div className="text-xs text-text-low">Cancel anytime, no commitments</div>
              </div>

              <div className="panel bg-carbon-850/50 p-6">
                <svg className="w-8 h-8 text-accent-lime mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-mono text-text-mid uppercase tracking-wider mb-1">No Hidden Fees</div>
                <div className="text-xs text-text-low">Transparent usage-based billing</div>
              </div>

              <div className="panel bg-carbon-850/50 p-6">
                <svg className="w-8 h-8 text-accent-amber mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <div className="text-sm font-mono text-text-mid uppercase tracking-wider mb-1">Scale With You</div>
                <div className="text-xs text-text-low">Grows as your business grows</div>
              </div>
            </div>

            <p className="text-xs text-text-muted">
              Get started with $100 in free credits. Pay only for AI research, optimization actions, and platform integrations you activate.
            </p>
          </div>
        </div>
      </section>

        {/* FAQ Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              className="font-display text-5xl md:text-6xl font-bold text-text-hi mb-16 text-center"
            >
              Frequently Asked Questions
            </motion.h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does the waitlist work?',
                a: 'Sign up now to secure early access. We are rolling out invites in batches, prioritizing teams with the highest ad spend and platform diversity.'
              },
              {
                q: 'Which platforms does Synter support?',
                a: 'Currently: Google Ads, LinkedIn Ads, Reddit Ads, X (Twitter) Ads, and Microsoft Advertising. More platforms coming soon.'
              },
              {
                q: 'What is included in early access?',
                a: 'Full platform access, dedicated onboarding support, and direct input into our product roadmap. Early access users get lifetime priority support.'
              },
              {
                q: 'How is Synter priced?',
                a: 'Flexible pricing based on ad spend and platform count. Early access users receive special founding member rates locked in for 12 months.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                className="panel p-8 hover:border-accent-cyan/30 transition-colors"
              >
                <h3 className="font-display text-xl font-semibold text-text-hi mb-3">
                  {faq.q}
                </h3>
                <p className="text-text-mid leading-relaxed text-lg">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Final CTA */}
        <section className="relative py-40 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              className="panel p-16 bg-gradient-to-br from-accent-cyan/10 to-accent-lime/10 border-accent-cyan/30"
            >
              <h2 className="font-display text-5xl md:text-6xl font-bold text-text-hi mb-6 leading-tight">
                Ready to Transform Your Ad Operations?
              </h2>
              <p className="text-xl text-text-mid mb-10 max-w-2xl mx-auto">
                Join performance marketing teams already on the waitlist.
              </p>
              <button
                onClick={handleSignup}
                className="btn-tactical-primary px-12 py-6 text-lg group"
              >
                Join the Waitlist
                <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-stroke-1 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-text-muted text-sm font-mono">
            <p>© 2025 Synter. Built for performance marketing teams.</p>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />
    </div>
  );
}
