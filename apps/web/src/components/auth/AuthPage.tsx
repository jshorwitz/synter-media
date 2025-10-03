'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

type AuthMode = 'login' | 'signup';

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
    : "min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8";

  const cardClasses = isModal
    ? ""
    : "max-w-md w-full space-y-8";

  return (
    <div 
      className={containerClasses}
      data-theme="dark"
      style={!isModal ? {background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(220 39% 18%) 100%)'} : undefined}
    >
      <div className={cardClasses}>
        {!isModal && (
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              <h1 className="text-4xl font-bold" style={{color: 'hsl(210 40% 96%)'}}>
                Synter
              </h1>
            </div>
            <h2 className="text-3xl font-bold" style={{color: 'hsl(210 40% 96%)'}}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm" style={{color: 'hsl(215 20% 65%)'}}>
              {mode === 'login' 
                ? 'Sign in to manage your cross-channel ads' 
                : 'Start optimizing your ad campaigns across platforms'}
            </p>
          </div>
        )}

        {isModal && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold" style={{color: 'hsl(210 40% 96%)'}}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm" style={{color: 'hsl(215 20% 65%)'}}>
              {mode === 'login' 
                ? 'Sign in to your Synter account' 
                : 'Start managing your cross-channel ads'}
            </p>
          </div>
        )}

        <div 
          className={`${isModal ? '' : 'rounded-2xl p-8 backdrop-blur-lg animate-fade-in'}`}
          style={!isModal ? {
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          } : undefined}
        >
          {mode === 'login' ? <LoginForm /> : <SignupForm />}

          <div className="mt-8 pt-6" style={{borderTop: '1px solid rgba(51, 65, 85, 0.6)'}}>
            <p className="text-center text-sm" style={{color: 'hsl(215 20% 65%)'}}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold hover:underline transition-colors"
                style={{color: 'hsl(217 91% 60%)'}}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {!isModal && (
          <div className="text-center">
            <p className="text-xs" style={{color: 'hsl(215 20% 65%)'}}>
              By continuing, you agree to our{' '}
              <a href="#" className="hover:underline" style={{color: 'hsl(217 91% 60%)'}}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="hover:underline" style={{color: 'hsl(217 91% 60%)'}}>
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
