/**
 * Error Handler
 * Centralized error handling with toast notifications
 */

import { toast } from 'sonner';
import type { ErrorLog } from '@/types/invoice';

const MAX_ERROR_LOGS = 10;
const ERROR_STORAGE_KEY = 'invease-error-logs';

/**
 * Store error log in sessionStorage for debugging
 */
function storeErrorLog(errorLog: ErrorLog): void {
  try {
    const existingLogs = sessionStorage.getItem(ERROR_STORAGE_KEY);
    const logs: ErrorLog[] = existingLogs ? JSON.parse(existingLogs) : [];

    logs.unshift(errorLog);

    // Keep only the last MAX_ERROR_LOGS entries
    if (logs.length > MAX_ERROR_LOGS) {
      logs.length = MAX_ERROR_LOGS;
    }

    sessionStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Silently fail if sessionStorage is not available
    console.warn('[Invease] Could not store error log');
  }
}

/**
 * Log an error with optional context
 */
export function logError(
  error: Error,
  type: ErrorLog['type'],
  context?: Record<string, unknown>
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    type,
    message: error.message,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Invease Error]', errorLog);
  }

  // Store for debugging
  storeErrorLog(errorLog);
}

/**
 * Handle PDF generation errors
 */
export function handlePDFError(error: Error): void {
  logError(error, 'pdf_generation');
  toast.error('Failed to generate PDF', {
    description: 'Please try again. If the problem persists, check your browser console.',
  });
}

/**
 * Handle validation errors
 */
export function handleValidationError(errors: string[]): void {
  logError(new Error(errors.join(', ')), 'validation');
  toast.error('Please fix the following errors', {
    description: errors[0],
  });
}

/**
 * Handle storage errors
 */
export function handleStorageError(error: Error): void {
  logError(error, 'storage');
  toast.warning('Could not save your details', {
    description: 'Your company details may not persist between sessions.',
  });
}

/**
 * Show success notification for invoice/credit note creation
 */
export function showInvoiceSuccess(documentType?: string): void {
  const label = documentType === 'credit_note' ? 'Credit note' : 'Invoice';
  toast.success(`${label} downloaded!`);
}

/**
 * Show success notification for company details saved
 */
export function showDetailsSaved(): void {
  toast.success('Details saved', {
    description: 'Your company details have been saved for future invoices.',
  });
}

/**
 * Show info notification
 */
export function showInfo(title: string, description?: string): void {
  toast.info(title, { description });
}

/**
 * Show warning notification
 */
export function showWarning(title: string, description?: string): void {
  toast.warning(title, { description });
}

/**
 * Get stored error logs (for debugging)
 */
export function getErrorLogs(): ErrorLog[] {
  try {
    const logs = sessionStorage.getItem(ERROR_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored error logs
 */
export function clearErrorLogs(): void {
  try {
    sessionStorage.removeItem(ERROR_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
