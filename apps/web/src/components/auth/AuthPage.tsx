'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { SynterLogo } from '@/components/ui/SynterLogo';

type AuthMode = 'login' | 'signup' | 'magic-link';

interface AuthPageProps {
  defaultTab?: 'login' | 'signup';
  onSuccess?: () => void;
  isModal?: boolean;
}

export function AuthPage({ defaultTab = 'login', onSuccess, isModal = false }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(defaultTab);

  useEffect(() => {
    setMode(defaultTab);
  }, [defaultTab]);

  const containerClasses = isModal 
    ? "w-full space-y-6" 
    : "min-h-screen flex items-center justify-center bg-gradient-to-br from-synter-surface to-synter-surface-2 py-12 px-4 sm:px-6 lg:px-8";

  const cardClasses = isModal
    ? ""
    : "max-w-md w-full space-y-8";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {!isModal && (
          <div className="text-center animate-slide-up">
            <SynterLogo className="mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-synter-ink">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'magic-link' && 'Sign in with magic link'}
            </h2>
            <p className="mt-2 text-sm text-synter-ink-2">
              {mode === 'login' && 'Sign in to your Synter account'}
              {mode === 'signup' && 'Start managing your cross-channel ads'}
              {mode === 'magic-link' && 'We\'ll send you a secure link to sign in'}
            </p>
          </div>
        )}

        {isModal && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-synter-ink">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'magic-link' && 'Sign in with magic link'}
            </h2>
            <p className="mt-2 text-sm text-synter-ink-2">
              {mode === 'login' && 'Sign in to your Synter account'}
              {mode === 'signup' && 'Start managing your cross-channel ads'}
              {mode === 'magic-link' && 'We\'ll send you a secure link to sign in'}
            </p>
          </div>
        )}

        <div className={isModal ? "" : "synter-card animate-slide-up [animation-delay:0.2s]"}>
          {mode === 'login' && <LoginForm onSuccess={onSuccess} />}
          {mode === 'signup' && <SignupForm onSuccess={onSuccess} />}
          {mode === 'magic-link' && <MagicLinkForm onSuccess={onSuccess} />}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-synter-surface-2 text-synter-ink-2">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {mode !== 'login' && (
                <button
                  onClick={() => setMode('login')}
                  className="synter-btn synter-btn-secondary w-full"
                >
                  Sign in to existing account
                </button>
              )}
              
              {mode !== 'signup' && (
                <button
                  onClick={() => setMode('signup')}
                  className="synter-btn synter-btn-secondary w-full"
                >
                  Create new account
                </button>
              )}
              
              {mode !== 'magic-link' && (
                <button
                  onClick={() => setMode('magic-link')}
                  className="synter-btn synter-btn-ghost w-full"
                >
                  Use magic link instead
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-synter-ink-2">
            By signing in, you agree to our{' '}
            <a href="#" className="text-synter-volt hover:text-synter-volt-2 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-synter-volt hover:text-synter-volt-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
