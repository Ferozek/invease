import { useMemo } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';

/**
 * useFormCompletion - Platform-agnostic form completion tracking
 *
 * Derives whether each form section is complete and provides a
 * human-readable summary for the collapsed accordion state.
 *
 * Designed for reuse in web (Next.js) and mobile (Expo).
 * No DOM dependencies — reads directly from Zustand stores.
 */

export interface SectionCompletion {
  isComplete: boolean;
  summary: string;
}

export interface FormCompletion {
  company: SectionCompletion;
  customer: SectionCompletion;
  invoiceDetails: SectionCompletion;
  lineItems: SectionCompletion;
  bankDetails: SectionCompletion;
}

export function useFormCompletion(): FormCompletion {
  const companyName = useCompanyStore((state) => state.companyName);
  const address = useCompanyStore((state) => state.address);
  const bankDetails = useCompanyStore((state) => state.bankDetails);

  const customer = useInvoiceStore((state) => state.customer);
  const details = useInvoiceStore((state) => state.details);
  const lineItems = useInvoiceStore((state) => state.lineItems);
  const getTotals = useInvoiceStore((state) => state.getTotals);
  const cisStatus = useCompanyStore((state) => state.cisStatus);

  return useMemo(() => {
    // Company: complete if name exists
    const companyComplete = !!companyName?.trim();

    // Customer: complete if name + address + postCode
    const customerComplete = !!(
      customer.name?.trim() &&
      customer.address?.trim() &&
      customer.postCode?.trim()
    );
    const customerSummary = customerComplete
      ? `${customer.name} — ${customer.postCode}`
      : 'Not yet filled';

    // Invoice Details: complete if invoiceNumber + date
    const invoiceDetailsComplete = !!(
      details.invoiceNumber?.trim() &&
      details.date?.trim()
    );
    const paymentLabel = details.paymentTerms ? `${details.paymentTerms} days` : '';
    const invoiceDetailsSummary = invoiceDetailsComplete
      ? [details.invoiceNumber, formatDateShort(details.date), paymentLabel]
          .filter(Boolean)
          .join(' · ')
      : 'Not yet filled';

    // Line Items: complete if at least 1 item with description + amount > 0
    const validItems = lineItems.filter(
      (item) => item.description?.trim() && item.netAmount > 0
    );
    const lineItemsComplete = validItems.length > 0;
    const totals = getTotals(cisStatus);
    const lineItemsSummary = lineItemsComplete
      ? `${validItems.length} item${validItems.length !== 1 ? 's' : ''} · £${totals.subtotal.toFixed(2)}${totals.totalVat > 0 ? ' + VAT' : ''}`
      : 'No items added';

    // Bank Details: always "complete" (it's optional)
    const hasBankDetails = !!(bankDetails.accountNumber || bankDetails.sortCode);
    const bankSummary = hasBankDetails
      ? `${bankDetails.bankName || 'Bank'} · ****${bankDetails.accountNumber?.slice(-4) || ''}`
      : 'Not added — optional';

    return {
      company: {
        isComplete: companyComplete,
        summary: companyComplete ? `${companyName} — ${address}` : 'Not yet filled',
      },
      customer: {
        isComplete: customerComplete,
        summary: customerSummary,
      },
      invoiceDetails: {
        isComplete: invoiceDetailsComplete,
        summary: invoiceDetailsSummary,
      },
      lineItems: {
        isComplete: lineItemsComplete,
        summary: lineItemsSummary,
      },
      bankDetails: {
        isComplete: true, // Always "complete" — it's optional
        summary: bankSummary,
      },
    };
  }, [companyName, address, customer, details, lineItems, getTotals, cisStatus, bankDetails]);
}

/** Format ISO date to DD/MM/YYYY */
function formatDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export default useFormCompletion;
