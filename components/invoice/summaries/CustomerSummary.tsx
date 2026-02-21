'use client';

import { useInvoiceStore } from '@/stores/invoiceStore';

/**
 * CustomerSummary - Compact collapsed view of customer details
 * Shows name and postcode, or a "not filled" state.
 */
export default function CustomerSummary() {
  const customer = useInvoiceStore((state) => state.customer);

  const hasData = customer.name?.trim();

  if (!hasData) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">Not yet filled</p>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <span className="font-medium text-[var(--text-primary)]">{customer.name}</span>
      {customer.postCode && (
        <>
          <span className="text-[var(--text-muted)]">—</span>
          <span>{customer.postCode}</span>
        </>
      )}
    </div>
  );
}
