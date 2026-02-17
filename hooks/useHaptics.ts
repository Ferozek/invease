'use client';

import { useCallback, useMemo } from 'react';

/**
 * Haptic feedback patterns following Apple's Taptic Engine conventions
 *
 * Apple HIG Haptic Types:
 * - Selection: Light tap for UI selection (10ms)
 * - Light: Subtle feedback for minor actions (15ms)
 * - Medium: Standard feedback for button presses (25ms)
 * - Heavy: Strong feedback for significant actions (35ms)
 * - Success: Double tap pattern for completion
 * - Warning: Alert pattern for caution
 * - Error: Strong pattern for errors
 */
export type HapticType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  selection: 10,
  light: 15,
  medium: 25,
  heavy: 35,
  success: [15, 50, 15], // Double tap
  warning: [25, 50, 25, 50, 25], // Triple tap
  error: [50, 100, 50], // Strong double
};

/**
 * Check if haptic feedback is supported
 * Stable check that can be called anywhere
 */
function checkHapticsSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * useHaptics - Provides haptic feedback using the Vibration API
 *
 * Apple HIG Principles:
 * - Use haptics sparingly and purposefully
 * - Match intensity to action significance
 * - Never use haptics for purely decorative purposes
 * - Respect user's accessibility settings
 *
 * Supported devices:
 * - Android (Chrome, Firefox, Edge)
 * - iOS 16.4+ Safari (limited support)
 * - Not supported on desktop browsers
 *
 * @example
 * const { trigger, isSupported } = useHaptics();
 *
 * // Trigger on button press
 * <button onClick={() => { trigger('medium'); handleAction(); }}>
 *   Action
 * </button>
 *
 * // Trigger on success
 * if (success) trigger('success');
 */
export function useHaptics() {
  // Check support once per component mount (stable reference)
  const isSupported = useMemo(() => checkHapticsSupport(), []);

  const trigger = useCallback(
    (type: HapticType = 'medium') => {
      if (!isSupported) return false;

      try {
        const pattern = HAPTIC_PATTERNS[type];
        return navigator.vibrate(pattern);
      } catch {
        // Silently fail if vibration is blocked
        return false;
      }
    },
    [isSupported]
  );

  // Cancel any ongoing vibration
  const cancel = useCallback(() => {
    if (!isSupported) return;
    try {
      navigator.vibrate(0);
    } catch {
      // Silently fail
    }
  }, [isSupported]);

  return {
    /** Trigger haptic feedback */
    trigger,
    /** Cancel any ongoing vibration */
    cancel,
    /** Whether haptic feedback is supported on this device */
    isSupported,
  };
}

/**
 * Convenience hook for common haptic patterns
 */
export function useHapticFeedback() {
  const { trigger, isSupported } = useHaptics();

  return {
    /** Light tap for selections */
    selection: useCallback(() => trigger('selection'), [trigger]),
    /** Button press feedback */
    impact: useCallback(() => trigger('medium'), [trigger]),
    /** Success completion */
    success: useCallback(() => trigger('success'), [trigger]),
    /** Warning/caution */
    warning: useCallback(() => trigger('warning'), [trigger]),
    /** Error feedback */
    error: useCallback(() => trigger('error'), [trigger]),
    /** Whether supported */
    isSupported,
  };
}

export default useHaptics;
