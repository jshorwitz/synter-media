'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { SynterLogo } from '@/components/ui/SynterLogo';

type AuthMode = 'login' | 'signup' | 'magic-link';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <SynterLogo className="mx-auto h-16 w-auto" />
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'magic-link' && 'Sign in with magic link'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {mode === 'login' && 'Sign in to your Synter account'}
            {mode === 'signup' && 'Start managing your cross-channel ads'}
            {mode === 'magic-link' && 'We\'ll send you a secure link to sign in'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-slate-200">
          {mode === 'login' && <LoginForm />}
          {mode === 'signup' && <SignupForm />}
          {mode === 'magic-link' && <MagicLinkForm />}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {mode !== 'login' && (
                <button
                  onClick={() => setMode('login')}
                  className="synter-button-secondary w-full text-center"
                >
                  Sign in to existing account
                </button>
              )}
              
              {mode !== 'signup' && (
                <button
                  onClick={() => setMode('signup')}
                  className="synter-button-secondary w-full text-center"
                >
                  Create new account
                </button>
              )}
              
              {mode !== 'magic-link' && (
                <button
                  onClick={() => setMode('magic-link')}
                  className="synter-button-secondary w-full text-center"
                >
                  Use magic link instead
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
