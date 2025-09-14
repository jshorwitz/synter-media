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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center animate-slide-right">
            <SynterLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-300 hover:text-lime-400 transition-colors duration-200 font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-slate-300 hover:text-lime-400 transition-colors duration-200 font-medium"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-slate-300 hover:text-lime-400 transition-colors duration-200 font-medium"
            >
              Docs
            </a>
            <a
              href="#support"
              className="text-slate-300 hover:text-lime-400 transition-colors duration-200 font-medium"
            >
              Support
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-slate-300 hover:text-slate-100 px-4 py-2 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="bg-lime-500 text-slate-900 px-4 py-2 rounded-xl font-medium hover:bg-lime-400 transition-all"
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
            <div className="pt-4 pb-6 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-synter-ink-2 hover:text-synter-volt hover:bg-synter-hover rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-synter-ink-2 hover:text-synter-volt hover:bg-synter-hover rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="block px-3 py-2 text-synter-ink-2 hover:text-synter-volt hover:bg-synter-hover rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </a>
              <a
                href="#support"
                className="block px-3 py-2 text-synter-ink-2 hover:text-synter-volt hover:bg-synter-hover rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </a>
              
              <div className="pt-4 mt-4 space-y-3">
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
          </div>
        )}
      </div>
    </nav>
  );
}
