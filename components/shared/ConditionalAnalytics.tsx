'use client';

import { useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const CONSENT_KEY = 'invease-cookie-consent';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  // Listen for the custom consent event dispatched by CookieConsent
  window.addEventListener('invease-consent', callback);
  return () => window.removeEventListener('invease-consent', callback);
}

/**
 * Only loads Vercel Analytics + Speed Insights after cookie consent.
 * Uses useSyncExternalStore to subscribe to the consent state.
 */
export default function ConditionalAnalytics() {
  const consented = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!consented) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
