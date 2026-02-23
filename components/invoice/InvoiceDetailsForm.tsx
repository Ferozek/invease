'use client';

import { useState, useCallback } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryStore, findInvoiceByNumber } from '@/stores/historyStore';
import { formatDateUK } from '@/lib/dateUtils';
import { validateRequired } from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';
import { PAYMENT_TERMS_OPTIONS } from '@/config/constants';
import CreditNoteFields from './CreditNoteFields';

/**
 * InvoiceDetailsForm - Invoice metadata (date, number, payment terms)
 * Features Apple-style inline validation
 */
export default function InvoiceDetailsForm() {
  const { details, setInvoiceDetails } = useInvoiceStore();

  // Duplicate invoice number warning (non-blocking)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string | null>>({
    date: null,
    invoiceNumber: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    date: false,
    invoiceNumber: false,
  });

  // Validate field
  const handleBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let result;
    switch (field) {
      case 'date':
        result = validateRequired(value, 'Invoice date');
        break;
      case 'invoiceNumber':
        result = validateRequired(value, 'Invoice number');
        // Check for duplicate in history (non-blocking warning)
        if (value.trim()) {
          const savedAt = findInvoiceByNumber(useHistoryStore.getState(), value);
          setDuplicateWarning(
            savedAt
              ? `This number was used on ${formatDateUK(savedAt.slice(0, 10))}. Consider a unique number.`
              : null
          );
        } else {
          setDuplicateWarning(null);
        }
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.error }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="invoiceDate" className="form-label form-label-required">Invoice Date</label>
          <input
            id="invoiceDate"
            type="date"
            required
            aria-required="true"
            aria-invalid={touched.date && errors.date ? 'true' : undefined}
            aria-describedby={touched.date && errors.date ? 'invoiceDate-error' : undefined}
            className={`form-input ${touched.date && errors.date ? 'form-input-error' : ''}`}
            value={details.date}
            onChange={(e) => setInvoiceDetails({ date: e.target.value })}
            onBlur={(e) => handleBlur('date', e.target.value)}
          />
          <FieldError id="invoiceDate-error" error={touched.date ? errors.date : null} />
        </div>
        <div>
          <label htmlFor="supplyDate" className="form-label">Supply Date</label>
          <input
            id="supplyDate"
            type="date"
            className="form-input"
            value={details.supplyDate}
            onChange={(e) => setInvoiceDetails({ supplyDate: e.target.value })}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">If different from invoice date</p>
        </div>
        <div>
          <label htmlFor="invoiceNumber" className="form-label form-label-required">Invoice Number</label>
          <input
            id="invoiceNumber"
            type="text"
            required
            aria-required="true"
            aria-invalid={touched.invoiceNumber && errors.invoiceNumber ? 'true' : undefined}
            aria-describedby={touched.invoiceNumber && errors.invoiceNumber ? 'invoiceNumber-error' : undefined}
            className={`form-input ${touched.invoiceNumber && errors.invoiceNumber ? 'form-input-error' : ''}`}
            placeholder="e.g., INV-001"
            value={details.invoiceNumber}
            onChange={(e) => setInvoiceDetails({ invoiceNumber: e.target.value })}
            onBlur={(e) => handleBlur('invoiceNumber', e.target.value)}
          />
          <FieldError id="invoiceNumber-error" error={touched.invoiceNumber ? errors.invoiceNumber : null} />
          {duplicateWarning && !errors.invoiceNumber && (
            <div className="mt-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    {duplicateWarning}
                  </p>
                  <button
                    type="button"
                    className="mt-1.5 text-xs font-medium text-[var(--brand-blue)] hover:underline min-h-[44px] flex items-center"
                    onClick={() => {
                      const isCN = details.documentType === 'credit_note';
                      const nextNum = isCN
                        ? useSettingsStore.getState().getNextCreditNoteNumber()
                        : useSettingsStore.getState().getNextInvoiceNumber();
                      setInvoiceDetails({ invoiceNumber: nextNum });
                      setDuplicateWarning(null);
                    }}
                  >
                    Use next available number
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="poNumber" className="form-label">PO Number</label>
          <input
            id="poNumber"
            type="text"
            className="form-input"
            placeholder="e.g. PO-12345"
            value={details.poNumber}
            onChange={(e) => setInvoiceDetails({ poNumber: e.target.value })}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Customer&apos;s reference</p>
        </div>
        <div>
          <label htmlFor="paymentTerms" className="form-label form-label-required">Payment Terms</label>
          <select
            id="paymentTerms"
            required
            aria-required="true"
            className="form-input"
            value={details.paymentTerms}
            onChange={(e) => setInvoiceDetails({ paymentTerms: e.target.value })}
          >
            {PAYMENT_TERMS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Credit Note Fields */}
      {details.documentType === 'credit_note' && <CreditNoteFields />}

      {/* Notes/Terms */}
      <div>
        <label htmlFor="notes" className="form-label">Notes / Terms</label>
        <textarea
          id="notes"
          className="form-input min-h-[80px] resize-y"
          placeholder="Payment terms, thank you message, or other notes..."
          value={details.notes}
          onChange={(e) => setInvoiceDetails({ notes: e.target.value })}
          maxLength={500}
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {details.notes.length}/500 characters
        </p>
      </div>
    </div>
  );
}
