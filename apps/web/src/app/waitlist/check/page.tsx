'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { motion } from 'framer-motion';

function WaitlistCheckContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (token) {
      checkPositionByToken(token);
    } else if (emailParam) {
      setEmail(emailParam);
      checkPositionByEmailDirect(emailParam);
    }
  }, [token, emailParam]);

  const checkPositionByEmailDirect = async (emailAddress: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/waitlist/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPosition(data.position);
        setTotal(data.total);
        setStatus(data.status);
      } else {
        setError(data.error || 'Email not found on waitlist');
      }
    } catch (err) {
      setError('Failed to check position');
    } finally {
      setLoading(false);
    }
  };

  const checkPositionByToken = async (token: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/waitlist/position?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setPosition(data.position);
        setTotal(data.total);
        setStatus(data.status);
      } else {
        setError(data.error || 'Invalid or expired link');
      }
    } catch (err) {
      setError('Failed to check position');
    } finally {
      setLoading(false);
    }
  };

  const checkPositionByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPosition(null);
    
    try {
      const response = await fetch('/api/waitlist/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPosition(data.position);
        setTotal(data.total);
        setStatus(data.status);
      } else {
        setError(data.error || 'Email not found on waitlist');
      }
    } catch (err) {
      setError('Failed to check position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-900 relative overflow-hidden">
      <div className="absolute inset-0 synter-grid opacity-20"></div>
      
      <div className="relative z-10">
        <TopNav onLogin={() => {}} onSignup={() => {}} />
        
        <div className="min-h-screen flex items-center justify-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="panel max-w-2xl w-full p-12"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-bold text-text-hi mb-4">
                Check Your Waitlist Position
              </h1>
              <p className="text-text-mid">
                Enter your email to see where you are in line
              </p>
            </div>

            {position !== null ? (
              <div className="space-y-6">
                <div className="panel bg-gradient-to-br from-accent-cyan/10 to-accent-lime/10 border-accent-cyan/30 p-8 text-center">
                  <div className="text-sm font-mono uppercase tracking-wider text-text-low mb-2">
                    Your Position
                  </div>
                  <div className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-lime mb-2">
                    #{position}
                  </div>
                  <div className="text-text-mid">
                    of {total} waiting
                  </div>
                </div>

                <div className="panel bg-accent-cyan/5 border-accent-cyan/20 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="w-6 h-6 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-hi mb-2">Check Your Email</h3>
                      <p className="text-sm text-text-mid mb-4">
                        We've sent you a confirmation email with your waitlist position. Please check your inbox and <strong>spam/junk folder</strong> as this is a new service.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="https://mail.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-tactical-ghost text-sm py-2 px-4"
                        >
                          Open Gmail
                        </a>
                        <a
                          href="https://outlook.live.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-tactical-ghost text-sm py-2 px-4"
                        >
                          Open Outlook
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/waitlist/resend', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: email || searchParams.get('email') }),
                        });
                        if (response.ok) {
                          alert('Email resent! Check your inbox.');
                        } else {
                          alert('Failed to resend. Please try again later.');
                        }
                      } catch (err) {
                        alert('Failed to resend email.');
                      }
                    }}
                    className="text-sm text-accent-cyan hover:underline"
                  >
                    Didn't receive it? Resend email
                  </button>
                </div>

                <div className="panel bg-carbon-850/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-low">Status</span>
                    <span className={`px-3 py-1 text-xs font-mono rounded border ${
                      status === 'ACTIVATED' ? 'bg-accent-lime/10 text-accent-lime border-accent-lime/30' :
                      status === 'INVITED' ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30' :
                      'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-mid">
                    {status === 'ACTIVATED' ? 
                      'Your account is active! Sign in to access Synter.' :
                      status === 'INVITED' ?
                      'Check your email for your invitation link.' :
                      'Hang tight! We\'ll send you an invite soon.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPosition(null);
                    setTotal(null);
                    setStatus(null);
                    setEmail('');
                  }}
                  className="btn-tactical-ghost w-full"
                >
                  Check Another Email
                </button>
              </div>
            ) : (
              <form onSubmit={checkPositionByEmail} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-carbon-800 border border-stroke-1 rounded-lg px-6 py-4 text-text-hi placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                {error && (
                  <div className="panel bg-accent-red/10 border-accent-red/30 p-4 text-center">
                    <p className="text-accent-red text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactical-primary w-full py-4"
                >
                  {loading ? 'Checking...' : 'Check Position'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-stroke-1 text-center">
              <p className="text-sm text-text-muted">
                Not on the waitlist yet?{' '}
                <a href="/waitlist" className="text-accent-cyan hover:underline">
                  Join now
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function WaitlistCheckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <div className="text-text-mid">Loading...</div>
      </div>
    }>
      <WaitlistCheckContent />
    </Suspense>
  );
}
