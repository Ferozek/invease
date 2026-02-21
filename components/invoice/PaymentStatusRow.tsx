'use client';

import type { SavedInvoice } from '@/stores/historyStore';
import { daysFromDue } from '@/lib/dateUtils';

/**
 * PaymentStatusRow — the primary payment action for each invoice
 *
 * Apple principle: the most important action should be the most obvious thing on screen.
 * Shows explicit "Mark as Paid" button below each invoice — not a tiny hidden circle.
 *
 * States:
 * - PAID: green badge + "Undo" text button
 * - OVERDUE: red warning + solid green "Mark as Paid" button
 * - PENDING: orange due date + outlined green "Mark as Paid" button
 * - CREDIT NOTE: returns null (CNs don't have payment status)
 */

interface PaymentStatusRowProps {
  invoice: SavedInvoice;
  onMarkAsPaid: () => void;
  onMarkAsUnpaid: () => void;
}

export default function PaymentStatusRow({
  invoice,
  onMarkAsPaid,
  onMarkAsUnpaid,
}: PaymentStatusRowProps) {
  const isCreditNote = invoice.documentType === 'credit_note';
  if (isCreditNote) return null;

  const isPaid = invoice.status === 'paid';
  const days = invoice.dueDate ? daysFromDue(invoice.dueDate) : 0;
  const isOverdueNow = !isPaid && days > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPaid) {
      onMarkAsUnpaid();
    } else {
      onMarkAsPaid();
    }
  };

  // PAID state — green badge with undo option
  if (isPaid) {
    return (
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--surface-border)]">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-[#34C759] dark:text-[#30D158]" data-testid="status-indicator">Paid</span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--surface-elevated)]"
          aria-label="Mark as unpaid"
        >
          Undo
        </button>
      </div>
    );
  }

  // OVERDUE state — red warning + prominent green "Mark as Paid" button
  if (isOverdueNow) {
    return (
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--surface-border)]">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#FF3B30] dark:text-[#FF453A]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-[#FF3B30] dark:text-[#FF453A]" data-testid="status-indicator">
            {days}d overdue
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="cursor-pointer min-h-[44px] text-xs font-semibold text-white bg-[#34C759] dark:bg-[#30D158] hover:bg-[#2DB84E] dark:hover:bg-[#28C950] px-4 py-2 rounded-lg transition-colors"
          aria-label="Mark as paid"
          data-testid="mark-paid-button"
        >
          Mark as Paid
        </button>
      </div>
    );
  }

  // PENDING state — due date info + outlined green "Mark as Paid" button
  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--surface-border)]">
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-[#FF9500] dark:text-[#FF9F0A]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" />
        </svg>
        <span className="text-xs font-medium text-[#FF9500] dark:text-[#FF9F0A]" data-testid="status-indicator">
          {days === 0 ? 'Due today' : `Due in ${Math.abs(days)}d`}
        </span>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className="cursor-pointer min-h-[44px] text-xs font-semibold text-[#34C759] dark:text-[#30D158] border border-[#34C759] dark:border-[#30D158] hover:bg-[#34C759] hover:text-white dark:hover:bg-[#30D158] dark:hover:text-white px-4 py-2 rounded-lg transition-colors"
        aria-label="Mark as paid"
        data-testid="mark-paid-button"
      >
        Mark as Paid
      </button>
    </div>
  );
}
