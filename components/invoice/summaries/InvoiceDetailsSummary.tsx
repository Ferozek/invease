'use client';

import { useInvoiceStore } from '@/stores/invoiceStore';

/**
 * InvoiceDetailsSummary - Compact collapsed view of invoice details
 * Shows invoice number, date, and payment terms.
 */
export default function InvoiceDetailsSummary() {
  const details = useInvoiceStore((state) => state.details);

  const hasData = details.invoiceNumber?.trim();

  if (!hasData) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">Not yet filled</p>
    );
  }

  const formattedDate = formatDate(details.date);
  const paymentLabel = details.paymentTerms ? `${details.paymentTerms} days` : '';
  const docLabel = details.documentType === 'credit_note' ? 'CN' : 'INV';

  return (
    <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
      <span className="font-medium text-[var(--text-primary)]">{details.invoiceNumber}</span>
      {formattedDate && (
        <>
          <span className="text-[var(--text-muted)]">·</span>
          <span>{formattedDate}</span>
        </>
      )}
      {paymentLabel && (
        <>
          <span className="text-[var(--text-muted)]">·</span>
          <span>{paymentLabel}</span>
        </>
      )}
    </div>
  );
}

function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}
