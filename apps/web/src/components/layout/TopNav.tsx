'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SynterLogo } from '@/components/ui/SynterLogo';

interface TopNavProps {
  onLogin?: () => void;
  onSignup?: () => void;
  hideSignup?: boolean;
}

export function TopNav({ onLogin, onSignup, hideSignup = false }: TopNavProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-carbon-900/90 backdrop-blur-xl border-b border-stroke-1">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/waitlist"} className="flex items-center animate-slide-right">
            <SynterLogo />
          </Link>

          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-carbon-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-cyan flex items-center justify-center text-carbon-900 font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <span className="text-text-hi text-sm">{user.name || user.email}</span>
                  <svg className="w-4 h-4 text-text-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-carbon-850 border border-stroke-1 rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {onLogin && (
                  <button
                    onClick={onLogin}
                    className="btn-tactical-ghost text-xs px-4 py-2"
                  >
                    Log in
                  </button>
                )}
                {!hideSignup && onSignup && (
                  <button
                    onClick={onSignup}
                    className="btn-tactical-primary text-xs px-4 py-2"
                  >
                    Sign up
                  </button>
                )}
              </>
            )}
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
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-stroke-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-accent-cyan flex items-center justify-center text-carbon-900 font-bold">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-hi">{user.name || 'User'}</div>
                        <div className="text-xs text-text-low">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  {onLogin && (
                    <button
                      onClick={() => {
                        onLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="synter-btn synter-btn-ghost w-full justify-center"
                    >
                      Log in
                    </button>
                  )}
                  {!hideSignup && onSignup && (
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
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
