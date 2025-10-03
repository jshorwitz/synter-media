import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPostHogServer() {
  if (client) return client;
  
  const key = process.env.POSTHOG_SERVER_KEY;
  
  if (!key) {
    console.warn('PostHog server key not configured');
    return null;
  }
  
  client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    flushAt: 1,
  });
  
  return client;
}

export async function captureServer(event: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
  groups?: Record<string, string>;
  timestamp?: Date;
}) {
  const ph = getPostHogServer();
  
  if (!ph) {
    console.warn('PostHog not initialized - skipping event:', event.event);
    return;
  }
  
  ph.capture({
    distinctId: event.distinctId,
    event: event.event,
    properties: event.properties,
    groups: event.groups,
    timestamp: event.timestamp,
  });
  
  await ph.flush();
}
