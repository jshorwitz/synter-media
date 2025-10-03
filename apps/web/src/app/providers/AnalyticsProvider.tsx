"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/posthog/client';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthog?.capture) return;
    posthog.capture('$pageview');
  }, [pathname, searchParams]);

  return <>{children}</>;
}
