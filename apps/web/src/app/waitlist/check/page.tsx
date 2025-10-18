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
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralsCount, setReferralsCount] = useState<number>(0);
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
        setReferralCode(data.referralCode);
        setReferralsCount(data.referralsCount || 0);
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
        setReferralCode(data.referralCode);
        setReferralsCount(data.referralsCount || 0);
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
        <TopNav onLogin={() => {}} hideSignup={true} />
        
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

                {/* Viral Share Section */}
                {referralCode && (
                  <div className="panel bg-gradient-to-br from-accent-lime/10 to-accent-amber/10 border-accent-lime/30 p-8">
                    <h3 className="font-display text-2xl font-bold text-text-hi mb-4 text-center">
                      🚀 Jump the Line
                    </h3>
                    <p className="text-text-mid text-center mb-6">
                      Share your referral link. Each person who joins = <strong className="text-accent-lime">7 spots up</strong>!
                    </p>

                    {/* OG Image Preview */}
                    <div className="mb-6 rounded-lg overflow-hidden border-2 border-stroke-1">
                      <img 
                        src={`/api/waitlist/og?code=${referralCode}`}
                        alt="Share Card"
                        className="w-full"
                      />
                    </div>

                    {/* Referral Link */}
                    <div className="panel bg-carbon-850/50 p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={`https://syntermedia.ai/r/${referralCode}`}
                          readOnly
                          className="flex-1 bg-carbon-900 border border-stroke-1 rounded px-4 py-2 text-sm text-text-hi font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://syntermedia.ai/r/${referralCode}`);
                            alert('Link copied!');
                          }}
                          className="btn-tactical-primary px-4 py-2 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm #${position} on the Synter waitlist. Each invite bumps me 7 spots. Help me jump the line!`)}&url=${encodeURIComponent(`https://syntermedia.ai/r/${referralCode}`)}&hashtags=AI,Waitlist`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tactical-primary px-6 py-3 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Share on X
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://syntermedia.ai/r/${referralCode}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tactical-ghost px-6 py-3 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Share on LinkedIn
                      </a>
                    </div>

                    {/* Stats */}
                    {referralsCount > 0 && (
                      <div className="mt-6 text-center panel bg-carbon-850/50 p-4">
                        <div className="text-accent-lime font-bold text-lg">
                          🎯 {referralsCount} referrals • {referralsCount * 7} spots gained!
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
