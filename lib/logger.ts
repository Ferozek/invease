/**
 * Centralized Logging Utility
 *
 * Provides a unified logging interface that:
 * - In development: logs to console
 * - In production: sends errors/warnings to Sentry
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('Something failed', error);
 *   logger.warn('Deprecated feature used');
 *   logger.info('User completed action');
 */

import * as Sentry from '@sentry/nextjs';

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
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message, ...context } });
    } else if (error) {
      Sentry.captureException(new Error(message), { extra: { originalError: error, ...context } });
    } else {
      Sentry.captureMessage(message, { level: 'error', extra: context });
    }
  },

  /**
   * Log a warning
   * Use for non-fatal issues that should be monitored
   */
  warn: (message: string, context?: LogContext) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, context);
    }
    Sentry.captureMessage(message, { level: 'warning', extra: context });
  },

  /**
   * Log informational message
   * Use for significant events (development only — not sent to Sentry)
   */
  info: (message: string, context?: LogContext) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, context);
    }
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
