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

/**
 * Check if a due date has passed (i.e. the invoice is overdue)
 */
export function isOverdue(dueDate: string): boolean {
  return dueDate < getTodayISO();
}

/**
 * Calculate days from due date
 * Positive = overdue by N days, Negative = due in N days, 0 = due today
 */
export function daysFromDue(dueDate: string): number {
  const today = new Date(getTodayISO());
  const due = new Date(dueDate);
  const diffMs = today.getTime() - due.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date falls within a given period relative to today
 */
export function isWithinPeriod(dateString: string, period: 'month' | 'quarter' | 'year'): boolean {
  const today = getTodayISO();
  const year = today.slice(0, 4);
  const month = today.slice(0, 7);

  switch (period) {
    case 'month':
      return dateString.startsWith(month);
    case 'quarter': {
      const currentMonth = parseInt(today.slice(5, 7), 10);
      const quarterStart = Math.floor((currentMonth - 1) / 3) * 3 + 1;
      const quarterStartStr = `${year}-${String(quarterStart).padStart(2, '0')}`;
      const quarterEndMonth = quarterStart + 2;
      const quarterEndStr = `${year}-${String(quarterEndMonth).padStart(2, '0')}`;
      const dateMonth = dateString.slice(0, 7);
      return dateMonth >= quarterStartStr && dateMonth <= quarterEndStr;
    }
    case 'year':
      return dateString.startsWith(year);
  }
}
