'use client';

import { useMemo } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useCompanyStore } from '@/stores/companyStore';

/**
 * LineItemsSummary - Compact collapsed view of line items
 * Shows item count and subtotal.
 */
export default function LineItemsSummary() {
  const lineItems = useInvoiceStore((state) => state.lineItems);
  const getTotals = useInvoiceStore((state) => state.getTotals);
  const cisStatus = useCompanyStore((state) => state.cisStatus);

  const { validCount, subtotal, hasVat } = useMemo(() => {
    const valid = lineItems.filter(
      (item) => item.description?.trim() && item.netAmount > 0
    );
    const totals = getTotals(cisStatus);
    return {
      validCount: valid.length,
      subtotal: totals.subtotal,
      hasVat: totals.totalVat > 0,
    };
  }, [lineItems, getTotals, cisStatus]);

  if (validCount === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">No items added</p>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
      <span className="font-medium text-[var(--text-primary)]">
        {validCount} item{validCount !== 1 ? 's' : ''}
      </span>
      <span className="text-[var(--text-muted)]">·</span>
      <span>£{subtotal.toFixed(2)}{hasVat ? ' + VAT' : ''}</span>
    </div>
  );
}
