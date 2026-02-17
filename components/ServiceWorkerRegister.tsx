'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegister Component
 * Registers the service worker for PWA functionality
 * - Only registers in production
 * - Handles updates gracefully
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker after page load
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[SW] Registration successful:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version available
                    console.log('[SW] New version available');
                    // Could show a toast notification here
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[SW] Registration failed:', error);
          });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
