/**
 * CSV Export Utility
 * Generates CSV from invoice data for accountant import
 *
 * Design: Pure functions, no side effects, easily testable
 */

import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

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
  'Net Amount',
  'VAT Rate',
  'VAT Amount',
  'Line Total',
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
    const net = item.netAmount * item.quantity;
    const vatRate = item.vatRate === 'reverse_charge' ? 0 : parseInt(item.vatRate);
    const vatAmount = net * (vatRate / 100);
    const lineTotal = net + vatAmount;

    return {
      'Invoice Number': invoice.details.invoiceNumber,
      'Invoice Date': dateFormatted,
      'Customer Name': invoice.customer.name,
      'Description': item.description,
      'Quantity': item.quantity,
      'Net Amount': item.netAmount,
      'VAT Rate': item.vatRate === 'reverse_charge' ? 'RC' : `${item.vatRate}%`,
      'VAT Amount': vatAmount,
      'Line Total': lineTotal,
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
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
