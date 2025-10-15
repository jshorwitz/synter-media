'use client';

import { useState } from 'react';
import { SynterLogo } from '@/components/ui/SynterLogo';

interface TopNavProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function TopNav({ onLogin, onSignup }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-carbon-900/90 backdrop-blur-xl border-b border-stroke-1">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center animate-slide-right">
            <SynterLogo />
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className="btn-tactical-ghost text-xs px-4 py-2"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="btn-tactical-primary text-xs px-4 py-2"
            >
              Sign up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="synter-btn synter-btn-ghost p-2"
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="pt-4 pb-6 space-y-3">
              <button
                onClick={() => {
                  onLogin();
                  setMobileMenuOpen(false);
                }}
                className="synter-btn synter-btn-ghost w-full justify-center"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  onSignup();
                  setMobileMenuOpen(false);
                }}
                className="synter-btn synter-btn-primary w-full justify-center"
              >
                Sign up
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
