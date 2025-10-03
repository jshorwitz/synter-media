'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Launcher } from '@/components/ui/Launcher';
import CampaignChat from '@/components/chat/CampaignChat';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="h-dvh w-dvw grid grid-cols-[240px_1fr] bg-carbon-900 text-text-hi antialiased font-mono"
      style={{ ['--topbar-h' as any]: '48px' }}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-carbon-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="col-[1] overflow-y-auto bg-carbon-850 border-r border-stroke-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main column */}
      <div className="col-[2] grid grid-rows-[auto_1fr] min-w-0">
        {/* Top app bar */}
        <div className="row-[1] h-[var(--topbar-h)] sticky top-0 z-50 bg-carbon-850/90 backdrop-blur border-b border-stroke-1">
          <div className="mx-auto max-w-[1400px] px-6 h-full flex items-center">
            <Header onMenuClick={() => setSidebarOpen(true)} />
          </div>
        </div>

        {/* Scrollable content area */}
        <main className="row-[2] overflow-y-auto min-h-0">
          <div className="mx-auto max-w-[1400px] px-6 py-6">
            {children}
          </div>
        </main>
        
        {/* Global launcher - positioned in top-right of main content area */}
        <Launcher />
        
        {/* Campaign chat assistant */}
        <CampaignChat />
      </div>
    </div>
  );
}
