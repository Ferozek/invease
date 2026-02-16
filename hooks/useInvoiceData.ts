'use client';

import { useMemo } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

/**
 * useInvoiceData - Consolidates invoice data from multiple stores
 *
 * Returns:
 * - invoiceData: Complete invoice data for PDF generation
 * - totals: Calculated totals including CIS breakdown
 *
 * This hook consolidates selectors from companyStore and invoiceStore
 * to provide a single source for invoice-related data.
 */
export function useInvoiceData() {
  // Company store - invoicer details
  const logo = useCompanyStore((state) => state.logo);
  const logoFileName = useCompanyStore((state) => state.logoFileName);
  const companyName = useCompanyStore((state) => state.companyName);
  const companyNumber = useCompanyStore((state) => state.companyNumber);
  const vatNumber = useCompanyStore((state) => state.vatNumber);
  const eoriNumber = useCompanyStore((state) => state.eoriNumber);
  const address = useCompanyStore((state) => state.address);
  const postCode = useCompanyStore((state) => state.postCode);
  const cisStatus = useCompanyStore((state) => state.cisStatus);
  const cisUtr = useCompanyStore((state) => state.cisUtr);
  const bankDetails = useCompanyStore((state) => state.bankDetails);

  // Invoice store - customer and invoice details
  const customer = useInvoiceStore((state) => state.customer);
  const details = useInvoiceStore((state) => state.details);
  const lineItems = useInvoiceStore((state) => state.lineItems);
  const getTotals = useInvoiceStore((state) => state.getTotals);

  // Calculate totals (includes CIS breakdown)
  const totals: InvoiceTotals = useMemo(
    () => getTotals(cisStatus),
    [getTotals, cisStatus, lineItems]
  );

  // Construct complete invoice data for PDF
  const invoiceData: InvoiceData = useMemo(
    () => ({
      invoicer: {
        logo,
        logoFileName,
        companyName,
        companyNumber,
        vatNumber,
        eoriNumber,
        address,
        postCode,
        cisStatus,
        cisUtr,
      },
      customer,
      details,
      lineItems,
      bankDetails,
    }),
    [
      logo,
      logoFileName,
      companyName,
      companyNumber,
      vatNumber,
      eoriNumber,
      address,
      postCode,
      cisStatus,
      cisUtr,
      customer,
      details,
      lineItems,
      bankDetails,
    ]
  );

  return {
    invoiceData,
    totals,
    // Expose commonly needed individual values for convenience
    cisStatus,
    lineItems,
    customer,
    details,
  };
}
