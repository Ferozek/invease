'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';

export default function CreditNoteFields() {
  const details = useInvoiceStore((state) => state.details);
  const setInvoiceDetails = useInvoiceStore((state) => state.setInvoiceDetails);
  const [touched, setTouched] = useState(false);

  const creditNoteFields = details.creditNoteFields;
  if (!creditNoteFields) return null;

  const updateField = (field: string, value: string | boolean) => {
    setInvoiceDetails({
      creditNoteFields: {
        ...creditNoteFields,
        [field]: value,
      },
    });
  };

  const showError = touched && !creditNoteFields.relatedInvoiceNumber?.trim();

  return (
    <div className="space-y-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
      <p className="text-sm font-medium text-red-700 dark:text-red-400">
        Credit Note Details
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="relatedInvoiceNumber" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Original Invoice Number <span className="text-red-500">*</span>
          </label>
          <input
            id="relatedInvoiceNumber"
            type="text"
            className={`w-full px-3 py-2 rounded-lg border
              ${showError
                ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
                : 'border-[var(--input-border)] focus:ring-red-500/30 focus:border-red-500'}
              bg-[var(--input-bg)] text-[var(--text-primary)]
              focus:outline-none focus:ring-2 transition-colors`}
            placeholder="e.g., INV-0001"
            value={creditNoteFields.relatedInvoiceNumber}
            onChange={(e) => updateField('relatedInvoiceNumber', e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
            aria-describedby={showError ? 'related-invoice-error' : undefined}
          />
          {showError && (
            <p id="related-invoice-error" className="mt-1 text-xs text-red-600" role="alert">
              Original invoice number is required for credit notes
            </p>
          )}
        </div>
        <div>
          <label htmlFor="creditNoteReason" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Reason
          </label>
          <input
            id="creditNoteReason"
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-[var(--input-border)]
              bg-[var(--input-bg)] text-[var(--text-primary)]
              focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500
              transition-colors"
            placeholder="e.g., Goods returned, pricing error"
            value={creditNoteFields.reason}
            onChange={(e) => updateField('reason', e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={creditNoteFields.isPartial}
          onChange={(e) => updateField('isPartial', e.target.checked)}
          className="w-4 h-4 rounded border-[var(--input-border)] text-red-600 focus:ring-red-600"
        />
        <span className="text-sm text-[var(--text-secondary)]">
          Partial credit (adjust line items below)
        </span>
      </label>
    </div>
  );
}
