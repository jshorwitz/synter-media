'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect logged-in users to PPC dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/ppc');
    }
  }, [loading, user, router]);
  
  // Redirect to waitlist for non-logged-in users
  if (typeof window !== 'undefined' && !loading && !user) {
    window.location.href = '/waitlist';
  }
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const handleLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    // Redirect to waitlist instead of opening signup modal
    window.location.href = '/waitlist';
  };

  const handleGetStarted = (websiteUrl: string) => {
    // Clean the URL and redirect to onboarding with analysis
    const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    // Store URL in localStorage for auth flow
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_website_url', cleanUrl);
    }
    
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
      <div className="min-h-screen overflow-y-auto synter-grid" data-theme="tactical">
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
