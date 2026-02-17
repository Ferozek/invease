/**
 * Centralized Logging Utility
 *
 * Provides a unified logging interface that:
 * - In development: logs to console
 * - In production: can be upgraded to Sentry (when configured)
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('Something failed', error);
 *   logger.warn('Deprecated feature used');
 *   logger.info('User completed action');
 */

const isDev = process.env.NODE_ENV !== 'production';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Log levels matching Sentry severity
 */
export const logger = {
  /**
   * Log an error with optional context
   * Use for exceptions and failures that need attention
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    // TODO: When Sentry is configured:
    // Sentry.captureException(error, { extra: { message, ...context } });
  },

  /**
   * Log a warning
   * Use for non-fatal issues that should be monitored
   */
  warn: (message: string, context?: LogContext) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, context);
    }
    // TODO: When Sentry is configured:
    // Sentry.captureMessage(message, { level: 'warning', extra: context });
  },

  /**
   * Log informational message
   * Use for significant events (user actions, state changes)
   */
  info: (message: string, context?: LogContext) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, context);
    }
    // In production, info logs are typically not sent to Sentry
    // Consider adding to analytics instead
  },

  /**
   * Log debug information (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, context);
    }
  },
};

export default logger;
