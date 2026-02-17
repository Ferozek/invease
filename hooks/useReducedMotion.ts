'use client';

import { useSyncExternalStore } from 'react';

/**
 * Get the current reduced motion preference
 */
function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Server-side fallback - assume no reduced motion preference
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Subscribe to reduced motion preference changes
 */
function subscribeToReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

/**
 * useReducedMotion - Respects user's motion preferences
 *
 * Apple Accessibility Guidelines:
 * - Users with vestibular disorders may experience discomfort from animations
 * - System setting: Settings > Accessibility > Motion > Reduce Motion
 * - Web equivalent: prefers-reduced-motion media query
 *
 * Uses useSyncExternalStore for proper subscription to browser APIs.
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3 };
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );
}

/**
 * Get motion-safe animation props for Framer Motion
 * Returns instant transitions when reduced motion is preferred
 */
export function useMotionSafeTransition() {
  const prefersReducedMotion = useReducedMotion();

  return {
    // For spring animations
    spring: prefersReducedMotion
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 500, damping: 30 },

    // For tween animations
    tween: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.2, ease: 'easeOut' as const },

    // For fade animations
    fade: prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.15 },

    // Whether to skip animations entirely
    skipAnimations: prefersReducedMotion,
  };
}

export default useReducedMotion;
