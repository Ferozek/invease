'use client';

import { useState, useCallback } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
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
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.error }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="invoiceDate" className="form-label form-label-required">Invoice Date</label>
          <input
            id="invoiceDate"
            type="date"
            className={`form-input ${touched.date && errors.date ? 'form-input-error' : ''}`}
            value={details.date}
            onChange={(e) => setInvoiceDetails({ date: e.target.value })}
            onBlur={(e) => handleBlur('date', e.target.value)}
          />
          <FieldError error={touched.date ? errors.date : null} />
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
            className={`form-input ${touched.invoiceNumber && errors.invoiceNumber ? 'form-input-error' : ''}`}
            placeholder="e.g., INV-001"
            value={details.invoiceNumber}
            onChange={(e) => setInvoiceDetails({ invoiceNumber: e.target.value })}
            onBlur={(e) => handleBlur('invoiceNumber', e.target.value)}
          />
          <FieldError error={touched.invoiceNumber ? errors.invoiceNumber : null} />
        </div>
        <div>
          <label htmlFor="paymentTerms" className="form-label form-label-required">Payment Terms</label>
          <select
            id="paymentTerms"
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
