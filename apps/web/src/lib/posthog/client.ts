"use client";

import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!key) {
    console.warn('PostHog key not configured');
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'cookie',
    disable_session_recording: false,
    session_recording: { sampling: 0.1 },
    respect_dnt: true,
  });
  
  initialized = true;
}

export { posthog };
