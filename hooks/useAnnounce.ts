'use client';

import { useCallback } from 'react';

/**
 * useAnnounce - Hook for screen reader announcements
 *
 * Uses the global aria-live region (#status-announcer) to announce
 * dynamic content changes to screen readers.
 *
 * @example
 * const announce = useAnnounce();
 * announce('Invoice saved successfully');
 * announce('3 items added', 'assertive'); // For important updates
 */
export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('status-announcer');
    if (!announcer) return;

    // Update aria-live if priority differs
    if (priority === 'assertive') {
      announcer.setAttribute('aria-live', 'assertive');
    } else {
      announcer.setAttribute('aria-live', 'polite');
    }

    // Clear first to ensure screen reader picks up the change
    announcer.textContent = '';

    // Small delay for screen readers to register the change
    requestAnimationFrame(() => {
      announcer.textContent = message;

      // Clear after announcement to avoid repeated readings
      setTimeout(() => {
        announcer.textContent = '';
        // Reset to polite after assertive announcement
        if (priority === 'assertive') {
          announcer.setAttribute('aria-live', 'polite');
        }
      }, 1000);
    });
  }, []);
}

export default useAnnounce;
