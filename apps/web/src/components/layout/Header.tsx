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
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden btn-tactical-ghost p-2"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Tactical timestamp */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="text-xs font-mono text-text-low uppercase tracking-wider">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
              </div>
              <div className="h-3 w-px bg-stroke-1"></div>
              <div className="text-xs font-mono text-text-mid">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/campaigns/new" className="btn-tactical-secondary text-xs px-3 py-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">New Campaign</span>
              </Link>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="btn-tactical-ghost p-2 relative">
                <span className="sr-only">View notifications</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {/* Notification badge */}
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-accent-red rounded-full">
                  <div className="h-2 w-2 bg-accent-red rounded-full animate-pulse"></div>
                </div>
              </button>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 p-1.5 rounded-tactical text-text-mid hover:text-text-hi hover:bg-carbon-800 transition-all group"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-7 w-7 rounded-tactical bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center group-hover:border-accent-cyan transition-all">
                  <span className="text-xs font-bold font-mono text-accent-cyan">
                    {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-mono text-text-hi leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] font-mono text-text-low uppercase tracking-wider">
                    {user?.role}
                  </p>
                </div>
                <svg className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="panel absolute right-0 z-20 mt-2 w-64 origin-top-right animate-slide-up bg-carbon-850 border-stroke-1">
                  <div className="p-3 border-b border-stroke-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-tactical bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center">
                          <span className="text-sm font-bold font-mono text-accent-cyan">
                            {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-text-hi font-semibold truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs font-mono text-text-low truncate">{user?.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="status-pill success text-[10px]">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        href="/settings/account"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-mid hover:text-text-hi hover:bg-carbon-800 rounded-tactical transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.240.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Account Settings
                      </Link>
                      
                      <Link
                        href="/settings/billing"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-mid hover:text-text-hi hover:bg-carbon-800 rounded-tactical transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                        Billing & Usage
                      </Link>
                      
                      <Link
                        href="/help"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-text-mid hover:text-text-hi hover:bg-carbon-800 rounded-tactical transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c0-1.035.84-1.875 1.875-1.875s1.875.84 1.875 1.875c0 1.036-.84 1.875-1.875 1.875s-1.875-.84-1.875-1.875ZM15 12.75v3.75M9 12.75v3.75m6-7.5V21a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 21v-8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75Z" />
                        </svg>
                        Help & Support
                      </Link>
                    </div>
                    
                    <div className="p-2 border-t border-stroke-2">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-accent-red hover:bg-accent-red/10 rounded-tactical transition-all"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
