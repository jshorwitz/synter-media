'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav } from '@/components/layout/TopNav';
import { AuthModal } from '@/components/auth/AuthModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Overview } from '@/components/dashboard/Overview';
import { HeroSection } from '@/components/hero/HeroSection';
import { DemoSection } from '@/components/sections/DemoSection';
import { ValuePropsSection } from '@/components/sections/ValuePropsSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const handleLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const handleGetStarted = (websiteUrl: string) => {
    // Clean the URL and redirect to onboarding with analysis
    const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    // Redirect to onboarding which will analyze the website first
    window.location.href = `/onboarding?url=${encodeURIComponent(cleanUrl)}`;
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    
    // If there's a website URL stored, redirect to onboarding
    if (typeof window !== 'undefined') {
      const websiteUrl = localStorage.getItem('onboarding_website_url');
      if (websiteUrl) {
        // Redirect to onboarding with the website URL
        window.location.href = `/onboarding?website=${encodeURIComponent(websiteUrl)}`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-synter-surface">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 overflow-y-auto">
        <TopNav onLogin={handleLogin} onSignup={handleSignup} />
        <HeroSection onGetStarted={handleGetStarted} />
        <SocialProofSection />
        <DemoSection />
        <ValuePropsSection />
        <FeaturesSection />
        <StatsSection />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Overview />
    </DashboardLayout>
  );
}
