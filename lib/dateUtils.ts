/**
 * Date Utilities
 * Shared date formatting functions
 */

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 * Used for invoice dates and default values
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format a date string for display (UK format: DD/MM/YYYY)
 */
export function formatDateUK(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calculate due date from invoice date and payment terms
 * @param invoiceDate - Invoice date (YYYY-MM-DD)
 * @param paymentTerms - Days until payment due (as string)
 * @returns Due date as ISO string
 */
export function calculateDueDate(invoiceDate: string, paymentTerms: string): string {
  const date = new Date(invoiceDate);
  const days = parseInt(paymentTerms, 10) || 30;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
