'use client';

import { useEffect } from 'react';
import logger from '@/lib/logger';

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
      let intervalId: ReturnType<typeof setInterval> | undefined;
      let registration: ServiceWorkerRegistration | undefined;

      // Request persistent storage so browser won't evict localStorage/IndexedDB
      if (navigator.storage?.persist) {
        navigator.storage.persist().then((granted) => {
          if (granted) {
            logger.info('Persistent storage granted');
          }
        });
      }

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          registration = reg;
          logger.info('Service worker registered', { scope: reg.scope });

          // Check for updates periodically
          intervalId = setInterval(() => {
            reg.update();
          }, 60 * 60 * 1000); // Every hour

          // Handle updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available
                  logger.info('New service worker version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          logger.error('Service worker registration failed', error);
        });

      return () => {
        if (intervalId) clearInterval(intervalId);
        if (registration) registration.unregister();
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
