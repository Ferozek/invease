'use client';

import { useState, useCallback } from 'react';
import type { SavedInvoice } from '@/stores/historyStore';
import { daysFromDue } from '@/lib/dateUtils';
import { formatCurrency } from '@/lib/formatters';

/**
 * PaymentStatusRow — the primary payment action for each invoice
 *
 * States:
 * - PAID: green badge + "Undo" text button
 * - PARTIAL: blue indicator + outstanding amount + "Record Payment" / "Paid"
 * - OVERDUE: red warning + outstanding amount + "Record Payment" / "Paid"
 * - PENDING: orange due date + "Record Payment" / "Paid"
 * - CREDIT NOTE: returns null (CNs don't have payment status)
 */

interface PaymentStatusRowProps {
  invoice: SavedInvoice;
  onMarkAsPaid: () => void;
  onMarkAsUnpaid: () => void;
  onRecordPayment: (amount: number) => void;
}

export default function PaymentStatusRow({
  invoice,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onRecordPayment,
}: PaymentStatusRowProps) {
  const isCreditNote = invoice.documentType === 'credit_note';

  const amountPaid = invoice.amountPaid || 0;
  const outstanding = invoice.total - amountPaid;
  const isFullyPaid = amountPaid >= invoice.total;
  const isPartial = amountPaid > 0 && !isFullyPaid;
  const days = invoice.dueDate ? daysFromDue(invoice.dueDate) : 0;
  const isOverdueNow = !isFullyPaid && days > 0;

  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullyPaid) {
      onMarkAsUnpaid();
    } else {
      onMarkAsPaid();
    }
  }, [isFullyPaid, onMarkAsPaid, onMarkAsUnpaid]);

  const handleRecordPayment = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      onRecordPayment(amount);
      setPaymentAmount('');
      setShowPaymentInput(false);
    }
  }, [paymentAmount, onRecordPayment]);

  const handleShowInput = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentAmount(outstanding > 0 ? outstanding.toFixed(2) : '');
    setShowPaymentInput(true);
  }, [outstanding]);

  const handleCancelInput = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setShowPaymentInput(false);
    setPaymentAmount('');
  }, []);

  // Credit notes don't have payment status
  if (isCreditNote) return null;

  // PAID state — green badge with undo option
  if (isFullyPaid) {
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

  // Inline payment recording form
  if (showPaymentInput) {
    return (
      <div className="mt-2 pt-2 border-t border-[var(--surface-border)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] shrink-0">Record</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">&pound;</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={outstanding}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRecordPayment(e); if (e.key === 'Escape') handleCancelInput(e); }}
              className="form-input w-full pl-5 py-1.5 text-sm"
              placeholder="0.00"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleRecordPayment}
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            className="cursor-pointer min-h-[44px] text-xs font-semibold text-white bg-[#34C759] dark:bg-[#30D158] hover:bg-[#2DB84E] dark:hover:bg-[#28C950] px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancelInput}
            className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Status indicator + outstanding info
  const statusIndicator = isOverdueNow ? (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-[#FF3B30] dark:text-[#FF453A]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <div>
        <span className="text-xs font-medium text-[#FF3B30] dark:text-[#FF453A]" data-testid="status-indicator">
          {days}d overdue
        </span>
        {isPartial && (
          <span className="text-[10px] text-[var(--text-muted)] ml-1.5">
            {formatCurrency(amountPaid)} of {formatCurrency(invoice.total)} paid
          </span>
        )}
      </div>
    </div>
  ) : isPartial ? (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
      </svg>
      <div>
        <span className="text-xs font-medium text-[#007AFF] dark:text-[#0A84FF]" data-testid="status-indicator">
          {formatCurrency(outstanding)} outstanding
        </span>
        <span className="text-[10px] text-[var(--text-muted)] ml-1.5">
          {formatCurrency(amountPaid)} paid
        </span>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-[#FF9500] dark:text-[#FF9F0A]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" />
      </svg>
      <span className="text-xs font-medium text-[#FF9500] dark:text-[#FF9F0A]" data-testid="status-indicator">
        {days === 0 ? 'Due today' : `Due in ${Math.abs(days)}d`}
      </span>
    </div>
  );

  // UNPAID / PARTIAL / OVERDUE — status + action buttons
  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--surface-border)]">
      {statusIndicator}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleShowInput}
          className="cursor-pointer min-h-[44px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
          aria-label="Record a payment"
        >
          + Payment
        </button>
        <button
          type="button"
          onClick={handleToggle}
          className={`cursor-pointer min-h-[44px] text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
            isOverdueNow
              ? 'text-white bg-[#34C759] dark:bg-[#30D158] hover:bg-[#2DB84E] dark:hover:bg-[#28C950]'
              : 'text-[#34C759] dark:text-[#30D158] border border-[#34C759] dark:border-[#30D158] hover:bg-[#34C759] hover:text-white dark:hover:bg-[#30D158] dark:hover:text-white'
          }`}
          aria-label="Mark as paid"
          data-testid="mark-paid-button"
        >
          Paid
        </button>
      </div>
    </div>
  );
}
