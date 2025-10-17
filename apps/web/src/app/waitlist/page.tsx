'use client';

import { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { AuthModal } from '@/components/auth/AuthModal';
import { WaitlistHero } from '@/components/waitlist/WaitlistHero';
import { ScreenshotGallery } from '@/components/waitlist/ScreenshotGallery';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-carbon-900 synter-grid">
      {/* Navigation */}
      <TopNav onLogin={handleLogin} onSignup={handleSignup} />

      {/* Hero Section */}
      <WaitlistHero onSignup={handleSignup} onLogin={handleLogin} />

      {/* Screenshot Gallery */}
      <ScreenshotGallery />

      {/* Value Props Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-hi mb-4">
              Why Performance Teams Choose Synter
            </h2>
            <p className="text-lg text-text-mid max-w-2xl mx-auto">
              Stop managing platforms in silos. Let AI orchestrate your entire media strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Cross-Platform Intelligence',
                description: 'Synter learns from your entire ad portfolio, identifying patterns and opportunities that single-platform tools miss. Share insights between Google, LinkedIn, Reddit, X, and more.',
                icon: '🌐'
              },
              {
                title: 'Frontier Model Research',
                description: 'Advanced AI models continuously research your market, competitors, and audience behavior—delivering strategic recommendations backed by deep analysis.',
                icon: '🔬'
              },
              {
                title: 'Autonomous Optimization',
                description: 'Set your goals and guardrails, then let Synter handle budget allocation, bid adjustments, and creative testing in real-time.',
                icon: '⚡'
              },
              {
                title: 'Unified Attribution',
                description: 'Track conversions across the entire customer journey with multi-touch attribution that works seamlessly across all your channels.',
                icon: '📊'
              }
            ].map((item, i) => (
              <div key={i} className="panel p-8 group hover:border-accent-cyan/30 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display text-2xl font-semibold text-text-hi mb-3">
                  {item.title}
                </h3>
                <p className="text-text-mid leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="relative py-24 px-6 bg-carbon-850/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-hi mb-12">
            Results That Matter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { metric: '3.2x', label: 'Average ROAS Improvement' },
              { metric: '47%', label: 'Reduction in CAC' },
              { metric: '12hrs', label: 'Time Saved Per Week' }
            ].map((stat, i) => (
              <div key={i} className="panel p-8">
                <div className="text-5xl font-display font-bold text-accent-lime mb-2">
                  {stat.metric}
                </div>
                <div className="text-text-mid font-mono text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-hi mb-12 text-center">
            Frequently Asked Questions
          </h2>
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
              <div key={i} className="panel p-6">
                <h3 className="font-display text-lg font-semibold text-text-hi mb-2">
                  {faq.q}
                </h3>
                <p className="text-text-mid leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="panel p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-hi mb-4">
              Ready to Transform Your Ad Operations?
            </h2>
            <p className="text-lg text-text-mid mb-8 max-w-2xl mx-auto">
              Join hundreds of performance marketing teams already on the waitlist.
            </p>
            <button
              onClick={handleSignup}
              className="btn-tactical-primary px-8 py-4 text-base"
            >
              Join the Waitlist
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stroke-1 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-text-muted text-sm font-mono">
          <p>© 2025 Synter. Built for performance marketing teams.</p>
        </div>
      </footer>

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
