'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SynterLogo } from '@/components/ui/SynterLogo';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const processMagicLink = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/auth/magic?token=${token}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setStatus('success');
        // Refresh auth context
        await refresh();
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const data = await response.json();
        setStatus('error');
        setError(data.error || 'Magic link is invalid or expired');
      }
    } catch {
      setStatus('error');
      setError('Failed to process magic link');
    }
  }, [refresh]);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError('Invalid magic link - missing token');
      return;
    }

    // Process magic link
    processMagicLink(token);
  }, [searchParams, processMagicLink]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <SynterLogo className="mx-auto h-16 w-auto" />
          
          {status === 'loading' && (
            <>
              <h2 className="mt-6 text-3xl font-bold text-slate-900">
                Signing you in...
              </h2>
              <div className="mt-8 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Please wait while we process your magic link
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="mt-6 text-3xl font-bold text-green-900">
                Successfully signed in!
              </h2>
              <div className="mt-8 flex justify-center">
                <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className="mt-6 text-3xl font-bold text-red-900">
                Sign in failed
              </h2>
              <div className="mt-8 flex justify-center">
                <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-red-600">
                {error}
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="synter-button-primary"
                >
                  Try signing in again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <SynterLogo className="mx-auto h-16 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              Loading...
            </h2>
            <div className="mt-8 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
