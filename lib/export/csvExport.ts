/**
 * CSV Export Utility
 * Generates CSV from invoice data for accountant import
 *
 * Design: Pure functions, no side effects, easily testable
 */

import type { InvoiceData, InvoiceTotals } from '@/types/invoice';
import type { SavedInvoice } from '@/stores/historyStore';

// ===== Types =====

export interface CsvRow {
  [key: string]: string | number;
}

export interface ExportOptions {
  includeHeaders?: boolean;
  dateFormat?: 'uk' | 'iso';
  filename?: string;
}

// ===== Line Items Export =====

const LINE_ITEM_HEADERS = [
  'Invoice Number',
  'Invoice Date',
  'Customer Name',
  'Description',
  'Quantity',
  'Unit Price',
  'Discount Type',
  'Discount Value',
  'Discount Amount',
  'Net Total',
  'VAT Rate',
  'VAT Amount',
  'Gross Total',
];

/**
 * Converts invoice line items to CSV rows
 */
export function invoiceToLineItemRows(
  invoice: InvoiceData,
  _totals: InvoiceTotals
): CsvRow[] {
  const dateFormatted = formatDateUK(invoice.details.date);

  return invoice.lineItems.map((item) => {
    const grossBeforeDiscount = item.netAmount * item.quantity;
    const discountAmount = item.discountType && item.discountValue
      ? (item.discountType === 'percentage'
        ? grossBeforeDiscount * (item.discountValue / 100)
        : Math.min(grossBeforeDiscount, item.discountValue))
      : 0;
    const netTotal = Math.max(0, grossBeforeDiscount - discountAmount);
    const vatRate = item.vatRate === 'reverse_charge' ? 0 : parseInt(item.vatRate);
    const vatAmount = netTotal * (vatRate / 100);

    return {
      'Invoice Number': invoice.details.invoiceNumber,
      'Invoice Date': dateFormatted,
      'Customer Name': invoice.customer.name,
      'Description': item.description,
      'Quantity': item.quantity,
      'Unit Price': item.netAmount,
      'Discount Type': item.discountType || '',
      'Discount Value': item.discountValue || '',
      'Discount Amount': discountAmount,
      'Net Total': netTotal,
      'VAT Rate': item.vatRate === 'reverse_charge' ? 'RC' : `${item.vatRate}%`,
      'VAT Amount': vatAmount,
      'Gross Total': netTotal + vatAmount,
    };
  });
}

// ===== Invoice Summary Export =====

const SUMMARY_HEADERS = [
  'Invoice Number',
  'Invoice Date',
  'Due Date',
  'Customer Name',
  'Customer Address',
  'Subtotal',
  'Total VAT',
  'Total',
  'Payment Terms',
];

/**
 * Converts invoice to summary CSV row
 */
export function invoiceToSummaryRow(
  invoice: InvoiceData,
  totals: InvoiceTotals
): CsvRow {
  const dueDate = calculateDueDate(invoice.details.date, invoice.details.paymentTerms);

  return {
    'Invoice Number': invoice.details.invoiceNumber,
    'Invoice Date': formatDateUK(invoice.details.date),
    'Due Date': dueDate,
    'Customer Name': invoice.customer.name,
    'Customer Address': `${invoice.customer.address}, ${invoice.customer.postCode}`,
    'Subtotal': totals.subtotal,
    'Total VAT': totals.totalVat,
    'Total': totals.total,
    'Payment Terms': `${invoice.details.paymentTerms} days`,
  };
}

// ===== CSV Generation =====

/**
 * Converts rows to CSV string
 */
export function rowsToCsv(rows: CsvRow[], headers: string[]): string {
  const csvLines: string[] = [];

  // Header row
  csvLines.push(headers.map(escapeCSV).join(','));

  // Data rows
  for (const row of rows) {
    const values = headers.map((header) => {
      const value = row[header];
      return escapeCSV(String(value ?? ''));
    });
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

/**
 * Escapes a value for CSV (handles commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ===== Export Functions =====

/**
 * Generates CSV for line items export
 */
export function generateLineItemsCsv(
  invoice: InvoiceData,
  totals: InvoiceTotals
): string {
  const rows = invoiceToLineItemRows(invoice, totals);
  return rowsToCsv(rows, LINE_ITEM_HEADERS);
}

/**
 * Generates CSV for invoice summary export
 */
export function generateSummaryCsv(
  invoice: InvoiceData,
  totals: InvoiceTotals
): string {
  const row = invoiceToSummaryRow(invoice, totals);
  return rowsToCsv([row], SUMMARY_HEADERS);
}

/**
 * Triggers browser download of CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // UTF-8 BOM ensures Excel opens with correct encoding for £ signs etc.
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== History Export =====

const HISTORY_HEADERS = [
  'Invoice Number',
  'Date',
  'Due Date',
  'Customer',
  'Type',
  'Subtotal',
  'VAT',
  'Total',
  'Status',
  'Amount Paid',
  'Outstanding',
];

/**
 * Derives a human-readable payment status for CSV export
 */
function derivePaymentStatus(inv: SavedInvoice): string {
  const isCreditNote = inv.documentType === 'credit_note';
  if (isCreditNote) return 'Credit Note';
  const paid = inv.amountPaid || 0;
  if (paid >= inv.total) return 'Paid';
  const today = new Date().toISOString().split('T')[0];
  if (inv.dueDate && inv.dueDate < today) return 'Overdue';
  if (paid > 0) return 'Partial';
  return 'Unpaid';
}

/**
 * Generates CSV for history export (respects pre-filtered list)
 */
export function generateHistoryExportCsv(invoices: SavedInvoice[]): string {
  const rows: CsvRow[] = invoices.map((inv) => {
    const paid = inv.amountPaid || 0;
    const outstanding = Math.max(0, inv.total - paid);

    return {
      'Invoice Number': inv.invoiceNumber,
      'Date': formatDateUK(inv.invoice.details.date),
      'Due Date': inv.dueDate ? formatDateUK(inv.dueDate) : '',
      'Customer': inv.customerName,
      'Type': inv.documentType === 'credit_note' ? 'Credit Note' : 'Invoice',
      'Subtotal': inv.totals.subtotal,
      'VAT': inv.totals.totalVat,
      'Total': inv.total,
      'Status': derivePaymentStatus(inv),
      'Amount Paid': paid,
      'Outstanding': outstanding,
    };
  });

  return rowsToCsv(rows, HISTORY_HEADERS);
}

// ===== Helpers =====

function formatDateUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
}

function calculateDueDate(invoiceDate: string, paymentTerms: string): string {
  const date = new Date(invoiceDate);
  const days = parseInt(paymentTerms) || 0;
  date.setDate(date.getDate() + days);
  return formatDateUK(date.toISOString());
}
