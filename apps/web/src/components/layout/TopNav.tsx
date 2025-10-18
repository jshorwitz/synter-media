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
          <Link href={user ? "/ppc" : "/waitlist"} className="flex items-center animate-slide-right">
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
                  <div className="w-8 h-8 rounded-md bg-carbon-800 border border-stroke-1 flex items-center justify-center text-accent-cyan font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-text-hi text-sm leading-tight">{user.name || user.email.split('@')[0]}</span>
                    <span className="text-text-low text-xs uppercase font-mono tracking-wider">{user.role}</span>
                  </div>
                  <svg className="w-4 h-4 text-text-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-carbon-850 border border-stroke-1 rounded-md shadow-lg py-3 z-50">
                      {/* User Info Header */}
                      <div className="px-4 pb-3 border-b border-stroke-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-carbon-800 border border-stroke-1 flex items-center justify-center text-accent-cyan font-bold text-lg">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-hi">{user.name || user.email.split('@')[0]}</div>
                            <div className="text-xs text-text-low">{user.email}</div>
                            <div className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider bg-accent-lime/10 text-accent-lime border border-accent-lime/20">
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/settings/account"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Account Settings</span>
                        </Link>
                        <Link
                          href="/settings/billing"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Billing & Usage</span>
                        </Link>
                        <Link
                          href="https://docs.syntermedia.ai"
                          target="_blank"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-2 border-t border-stroke-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-accent-red hover:bg-carbon-800 transition-colors w-full"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
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
                    href="/settings/account"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </Link>
                  <Link
                    href="/settings/billing"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Billing & Usage
                  </Link>
                  <Link
                    href="https://docs.syntermedia.ai"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-hi hover:bg-carbon-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
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
