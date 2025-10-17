'use client';

import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WaitlistPendingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    // Check waitlist status
    const checkStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/waitlist/status');
        const data = await response.json();
        
        if (data.status === 'ACTIVATED') {
          router.push('/dashboard');
        } else {
          setLead(data);
        }
      } catch (error) {
        console.error('Error checking waitlist status:', error);
      }
    };

    checkStatus();
  }, [user, router]);

  const handleLogout = () => {
    router.push('/api/auth/logout');
  };

  return (
    <div className="min-h-screen bg-carbon-900 synter-grid">
      {/* Navigation */}
      <TopNav onLogin={() => {}} onSignup={() => {}} />

      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="panel max-w-2xl w-full p-12 text-center">
          <div className="text-6xl mb-6 animate-slide-up">⏳</div>
          
          <h1 className="font-display text-3xl font-bold text-text-hi mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            You're on the Waitlist
          </h1>
          
          <p className="text-lg text-text-mid mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Thanks for signing up! We're reviewing your application and will send you an invite soon.
          </p>

          <div className="panel bg-carbon-850/50 p-6 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-low font-mono uppercase tracking-wider">
                Status
              </span>
              <span className="inline-flex px-3 py-1 text-xs font-mono rounded border bg-accent-amber/10 text-accent-amber border-accent-amber/30">
                {lead?.status || 'JOINED'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-low font-mono uppercase tracking-wider">
                Email
              </span>
              <span className="text-sm text-text-hi">
                {user?.email}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-low font-mono uppercase tracking-wider">
                Signed Up
              </span>
              <span className="text-sm text-text-mid font-mono">
                {lead?.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-text-mid text-left animate-slide-up" style={{ animationDelay: '400ms' }}>
            <p>
              <strong className="text-text-hi">What happens next?</strong>
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Our team will review your application</li>
              <li>You'll receive an invite email with onboarding instructions</li>
              <li>Once activated, you'll have full access to Synter</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={handleLogout}
              className="btn-tactical-ghost px-6 py-3 text-sm"
            >
              Log Out
            </button>
            <a
              href="mailto:support@synter.ai"
              className="btn-tactical-primary px-6 py-3 text-sm"
            >
              Contact Support
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-stroke-1 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <p className="text-xs text-text-muted">
              Want to skip the line? Have high ad spend or unique requirements?{' '}
              <a href="mailto:sales@synter.ai" className="text-accent-cyan hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
