'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center w-full h-full">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden synter-btn synter-btn-ghost p-2"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Breadcrumb or title */}
            <div className="hidden lg:flex items-center ml-4">
              <h1 className="text-lg font-semibold text-synter-ink">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/campaigns/new" className="synter-btn synter-btn-ghost synter-btn-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">New Campaign</span>
              </Link>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="synter-btn synter-btn-ghost p-2 relative">
                <span className="sr-only">View notifications</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-synter-ember rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-synter-ember rounded-full animate-pulse"></div>
                </div>
              </button>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center p-2 rounded-lg text-synter-ink-2 hover:text-synter-ink hover:bg-synter-hover transition-all duration-200 group"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-synter-volt to-synter-sky flex items-center justify-center shadow-lg group-hover:shadow-synter-accent transition-all duration-300 group-hover:scale-105">
                  <span className="text-sm font-bold text-synter-surface">
                    {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block ml-3 text-left">
                  <p className="text-sm font-medium text-synter-ink">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-synter-ink-2 capitalize">
                    {user?.role}
                  </p>
                </div>
                <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-xl border shadow-lg animate-slide-up" style={{
                    background: 'hsl(var(--synter-surface-2))',
                    borderColor: 'hsl(var(--synter-border))',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                  }}>
                  <div className="p-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-synter-volt to-synter-sky flex items-center justify-center shadow-lg">
                          <span className="text-base font-bold text-synter-surface">
                            {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-synter-ink">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-sm text-synter-ink-2">{user?.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="synter-badge synter-badge-info text-xs capitalize">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        href="/settings/account"
                        className="flex items-center px-3 py-2 text-sm text-synter-ink-2 hover:text-synter-ink hover:bg-synter-hover rounded-lg transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.240.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Account Settings
                      </Link>
                      
                      <Link
                        href="/settings/billing"
                        className="flex items-center px-3 py-2 text-sm text-synter-ink-2 hover:text-synter-ink hover:bg-synter-hover rounded-lg transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                        Billing & Usage
                      </Link>
                      
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2 text-sm text-synter-ink-2 hover:text-synter-ink hover:bg-synter-hover rounded-lg transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c0-1.035.84-1.875 1.875-1.875s1.875.84 1.875 1.875c0 1.036-.84 1.875-1.875 1.875s-1.875-.84-1.875-1.875ZM15 12.75v3.75M9 12.75v3.75m6-7.5V21a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 21v-8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75Z" />
                        </svg>
                        Help & Support
                      </Link>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-synter-ember hover:bg-synter-ember/10 rounded-lg transition-all duration-200"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
  );
}
