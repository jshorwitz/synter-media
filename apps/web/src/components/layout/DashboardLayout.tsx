'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Launcher } from '@/components/ui/Launcher';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="h-dvh w-dvw grid grid-cols-[240px_1fr] bg-synter-surface text-synter-ink antialiased"
      style={{ ['--topbar-h' as any]: '56px' }}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-synter-surface/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="col-[1] overflow-y-auto">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main column */}
      <div className="col-[2] grid grid-rows-[auto_auto_1fr] min-w-0">
        {/* Top app bar */}
        <div className="row-[1] h-[var(--topbar-h)] sticky top-0 z-50 bg-synter-surface/80 backdrop-blur supports-[backdrop-filter]:bg-synter-surface/60">
          <div className="mx-auto max-w-[1400px] px-6 h-full flex items-center">
            <Header onMenuClick={() => setSidebarOpen(true)} />
          </div>
        </div>

        {/* Page header (the "Dashboard" bar) */}
        <header className="row-[2] bg-synter-surface/60">
          <div className="mx-auto max-w-[1400px] px-6 h-10 flex items-center">
            <h1 className="text-sm tracking-wide text-synter-ink-2 font-medium">Dashboard</h1>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="row-[3] overflow-y-auto min-h-0">
          <div className="mx-auto max-w-[1400px] px-6 py-6">
            {children}
          </div>
        </main>
        
        {/* Global launcher - positioned in top-right of main content area */}
        <Launcher />
      </div>
    </div>
  );
}
