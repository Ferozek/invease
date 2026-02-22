/**
 * Statement of Account Utilities
 * Builds data for customer account statements from invoice history.
 */

import type { SavedInvoice } from '@/stores/historyStore';
import { formatDateUK, calculateDueDate } from '@/lib/dateUtils';

export interface StatementRow {
  date: string;          // UK formatted date
  invoiceNumber: string;
  description: string;   // "Invoice" or "Credit Note" + first line item desc
  amount: number;        // Positive for invoices, negative for credit notes
  paid: number;
  balance: number;       // Running balance
}

export interface StatementSummary {
  totalInvoiced: number;
  totalCredited: number;
  totalPaid: number;
  outstanding: number;
}

/** Filter invoices for a specific customer (case-insensitive match) */
export function getCustomerInvoices(
  invoices: SavedInvoice[],
  customerName: string
): SavedInvoice[] {
  const lower = customerName.toLowerCase().trim();
  return invoices
    .filter((inv) => inv.customerName.toLowerCase().trim() === lower)
    .sort((a, b) => a.invoice.details.date.localeCompare(b.invoice.details.date));
}

/** Build statement rows with running balance */
export function buildStatementRows(invoices: SavedInvoice[]): StatementRow[] {
  let runningBalance = 0;
  return invoices.map((inv) => {
    const isCreditNote = inv.documentType === 'credit_note';
    const amount = isCreditNote ? -inv.total : inv.total;
    const paid = inv.amountPaid || 0;

    runningBalance += amount - paid;

    const firstItem = inv.invoice.lineItems[0]?.description || '';
    const description = isCreditNote
      ? `Credit Note${firstItem ? ` — ${firstItem}` : ''}`
      : `Invoice${firstItem ? ` — ${firstItem}` : ''}`;

    return {
      date: formatDateUK(inv.invoice.details.date),
      invoiceNumber: inv.invoiceNumber,
      description,
      amount,
      paid,
      balance: runningBalance,
    };
  });
}

/** Calculate statement summary totals */
export function getStatementSummary(invoices: SavedInvoice[]): StatementSummary {
  let totalInvoiced = 0;
  let totalCredited = 0;
  let totalPaid = 0;

  for (const inv of invoices) {
    if (inv.documentType === 'credit_note') {
      totalCredited += inv.total;
    } else {
      totalInvoiced += inv.total;
    }
    totalPaid += inv.amountPaid || 0;
  }

  return {
    totalInvoiced,
    totalCredited,
    totalPaid,
    outstanding: totalInvoiced - totalCredited - totalPaid,
  };
}
