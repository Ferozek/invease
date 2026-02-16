/**
 * Haptic Feedback Utility
 *
 * Provides haptic feedback on supported devices using the Vibration API.
 * Falls back gracefully on unsupported devices.
 *
 * Based on Apple HIG haptic patterns:
 * - Light: Selection changes, subtle confirmations
 * - Medium: Standard interactions
 * - Heavy: Important actions
 * - Success: Positive confirmations
 * - Error: Validation errors, failed actions
 *
 * @example
 * hapticFeedback.light();    // For selections
 * hapticFeedback.success();  // After PDF download
 * hapticFeedback.error();    // For validation errors
 */

/**
 * Check if haptic feedback is supported
 */
export const isHapticsSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Haptic feedback patterns
 */
export const hapticFeedback = {
  /**
   * Light tap - for selections, toggles, subtle feedback
   * Duration: 10ms
   */
  light: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate(10);
  },

  /**
   * Medium tap - for standard button presses
   * Duration: 20ms
   */
  medium: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate(20);
  },

  /**
   * Heavy tap - for important actions, confirmations
   * Duration: 30ms
   */
  heavy: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate(30);
  },

  /**
   * Success pattern - double tap for positive feedback
   * Pattern: tap-pause-tap (10ms, 50ms pause, 10ms)
   */
  success: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate([10, 50, 10]);
  },

  /**
   * Warning pattern - attention-getting
   * Pattern: tap-pause-tap-pause-tap
   */
  warning: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate([15, 30, 15]);
  },

  /**
   * Error pattern - double heavy tap for negative feedback
   * Pattern: heavy-pause-heavy (30ms, 50ms pause, 30ms)
   */
  error: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate([30, 50, 30]);
  },

  /**
   * Custom vibration pattern
   * @param pattern - Vibration pattern (ms values: vibrate, pause, vibrate, ...)
   */
  custom: (pattern: number | number[]): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate(pattern);
  },

  /**
   * Stop any ongoing vibration
   */
  stop: (): boolean => {
    if (!isHapticsSupported()) return false;
    return navigator.vibrate(0);
  },
};

export default hapticFeedback;
