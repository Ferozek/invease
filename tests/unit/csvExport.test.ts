import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  invoiceToLineItemRows,
  invoiceToSummaryRow,
  rowsToCsv,
  generateLineItemsCsv,
  generateSummaryCsv,
  generateHistoryExportCsv,
} from '@/lib/export/csvExport';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';
import type { SavedInvoice } from '@/stores/historyStore';

// ===== Test Fixtures =====

function makeInvoiceData(overrides?: Partial<InvoiceData>): InvoiceData {
  return {
    invoicer: {
      logo: null,
      logoFileName: null,
      companyName: 'Test Ltd',
      companyNumber: '12345678',
      vatNumber: 'GB123456789',
      eoriNumber: '',
      address: '1 Test Street',
      postCode: 'SW1A 1AA',
      cisStatus: 'not_applicable',
      cisUtr: '',
    },
    customer: {
      name: 'Acme Corp',
      email: 'info@acme.com',
      phone: '',
      address: '2 Customer Road',
      postCode: 'EC1A 1BB',
    },
    details: {
      date: '2026-01-15',
      supplyDate: '',
      invoiceNumber: 'INV-001',
      poNumber: '',
      paymentTerms: '30',
      notes: '',
      documentType: 'invoice',
    },
    lineItems: [
      {
        id: '1',
        description: 'Web Development',
        quantity: 10,
        netAmount: 100,
        vatRate: '20',
        cisCategory: 'not_applicable',
      },
    ],
    bankDetails: {
      accountNumber: '12345678',
      sortCode: '12-34-56',
      accountName: 'Test Ltd',
      bankName: 'Test Bank',
      reference: 'INV-001',
    },
    ...overrides,
  };
}

function makeTotals(overrides?: Partial<InvoiceTotals>): InvoiceTotals {
  return {
    subtotal: 1000,
    vatBreakdown: [{ rate: '20', amount: 200 }],
    totalVat: 200,
    total: 1200,
    ...overrides,
  };
}

function makeSavedInvoice(overrides?: Partial<SavedInvoice>): SavedInvoice {
  const invoice = makeInvoiceData();
  return {
    id: 'saved-1',
    invoice,
    totals: makeTotals(),
    savedAt: '2026-01-15T10:00:00Z',
    customerName: 'Acme Corp',
    invoiceNumber: 'INV-001',
    total: 1200,
    documentType: 'invoice',
    status: 'unpaid',
    dueDate: '2026-02-14',
    amountPaid: 0,
    ...overrides,
  };
}

// ===== escapeCSV (tested indirectly via rowsToCsv) =====

describe('rowsToCsv', () => {
  it('generates headers + data rows', () => {
    const headers = ['Name', 'Amount'];
    const rows = [
      { Name: 'Item A', Amount: 100 },
      { Name: 'Item B', Amount: 200 },
    ];
    const csv = rowsToCsv(rows, headers);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('Name,Amount');
    expect(lines[1]).toBe('Item A,100');
    expect(lines[2]).toBe('Item B,200');
    expect(lines).toHaveLength(3);
  });

  it('handles empty rows', () => {
    const csv = rowsToCsv([], ['Col1', 'Col2']);
    expect(csv).toBe('Col1,Col2');
  });

  it('escapes values with commas', () => {
    const csv = rowsToCsv(
      [{ Address: '1 Test Street, London' }],
      ['Address']
    );
    expect(csv).toContain('"1 Test Street, London"');
  });

  it('escapes values with quotes', () => {
    const csv = rowsToCsv(
      [{ Note: 'Said "hello"' }],
      ['Note']
    );
    expect(csv).toContain('"Said ""hello"""');
  });

  it('escapes values with newlines', () => {
    const csv = rowsToCsv(
      [{ Note: 'Line 1\nLine 2' }],
      ['Note']
    );
    expect(csv).toContain('"Line 1\nLine 2"');
  });

  it('handles missing keys with empty string', () => {
    const csv = rowsToCsv(
      [{ Name: 'Test' }],
      ['Name', 'Missing']
    );
    const lines = csv.split('\n');
    expect(lines[1]).toBe('Test,');
  });
});

// ===== invoiceToLineItemRows =====

describe('invoiceToLineItemRows', () => {
  it('maps a single line item correctly', () => {
    const invoice = makeInvoiceData();
    const totals = makeTotals();
    const rows = invoiceToLineItemRows(invoice, totals);

    expect(rows).toHaveLength(1);
    expect(rows[0]['Invoice Number']).toBe('INV-001');
    expect(rows[0]['Customer Name']).toBe('Acme Corp');
    expect(rows[0]['Description']).toBe('Web Development');
    expect(rows[0]['Quantity']).toBe(10);
    expect(rows[0]['Unit Price']).toBe(100);
    expect(rows[0]['Net Total']).toBe(1000);
    expect(rows[0]['VAT Rate']).toBe('20%');
    expect(rows[0]['VAT Amount']).toBe(200);
    expect(rows[0]['Gross Total']).toBe(1200);
  });

  it('handles percentage discount', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Service',
          quantity: 1,
          netAmount: 100,
          vatRate: '20',
          cisCategory: 'not_applicable',
          discountType: 'percentage',
          discountValue: 10,
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    expect(rows[0]['Discount Type']).toBe('percentage');
    expect(rows[0]['Discount Value']).toBe(10);
    expect(rows[0]['Discount Amount']).toBe(10); // 10% of 100
    expect(rows[0]['Net Total']).toBe(90);       // 100 - 10
    expect(rows[0]['VAT Amount']).toBe(18);      // 20% of 90
    expect(rows[0]['Gross Total']).toBe(108);
  });

  it('handles fixed discount', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Service',
          quantity: 2,
          netAmount: 50,
          vatRate: '20',
          cisCategory: 'not_applicable',
          discountType: 'fixed',
          discountValue: 25,
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    // grossBeforeDiscount = 50 * 2 = 100; fixed discount = min(100, 25) = 25
    expect(rows[0]['Discount Amount']).toBe(25);
    expect(rows[0]['Net Total']).toBe(75);
  });

  it('clamps fixed discount to gross amount', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Service',
          quantity: 1,
          netAmount: 10,
          vatRate: '0',
          cisCategory: 'not_applicable',
          discountType: 'fixed',
          discountValue: 50, // More than the line total
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    // Fixed discount capped at grossBeforeDiscount (10)
    expect(rows[0]['Discount Amount']).toBe(10);
    expect(rows[0]['Net Total']).toBe(0);
  });

  it('handles reverse charge VAT', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Service',
          quantity: 1,
          netAmount: 100,
          vatRate: 'reverse_charge',
          cisCategory: 'not_applicable',
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    expect(rows[0]['VAT Rate']).toBe('RC');
    expect(rows[0]['VAT Amount']).toBe(0);
    expect(rows[0]['Gross Total']).toBe(100);
  });

  it('handles zero percent VAT', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Service',
          quantity: 1,
          netAmount: 100,
          vatRate: '0',
          cisCategory: 'not_applicable',
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    expect(rows[0]['VAT Rate']).toBe('0%');
    expect(rows[0]['VAT Amount']).toBe(0);
    expect(rows[0]['Gross Total']).toBe(100);
  });

  it('handles multiple line items', () => {
    const invoice = makeInvoiceData({
      lineItems: [
        {
          id: '1',
          description: 'Item A',
          quantity: 1,
          netAmount: 100,
          vatRate: '20',
          cisCategory: 'not_applicable',
        },
        {
          id: '2',
          description: 'Item B',
          quantity: 2,
          netAmount: 50,
          vatRate: '5',
          cisCategory: 'not_applicable',
        },
      ],
    });
    const rows = invoiceToLineItemRows(invoice, makeTotals());

    expect(rows).toHaveLength(2);
    expect(rows[0]['Description']).toBe('Item A');
    expect(rows[1]['Description']).toBe('Item B');
    expect(rows[1]['Net Total']).toBe(100);       // 50 * 2
    expect(rows[1]['VAT Amount']).toBe(5);         // 5% of 100
    expect(rows[1]['Gross Total']).toBe(105);
  });

  it('shows no discount fields when no discount applied', () => {
    const rows = invoiceToLineItemRows(makeInvoiceData(), makeTotals());
    expect(rows[0]['Discount Type']).toBe('');
    expect(rows[0]['Discount Value']).toBe('');
    expect(rows[0]['Discount Amount']).toBe(0);
  });
});

// ===== invoiceToSummaryRow =====

describe('invoiceToSummaryRow', () => {
  it('maps invoice to summary row', () => {
    const invoice = makeInvoiceData();
    const totals = makeTotals();
    const row = invoiceToSummaryRow(invoice, totals);

    expect(row['Invoice Number']).toBe('INV-001');
    expect(row['Customer Name']).toBe('Acme Corp');
    expect(row['Customer Address']).toBe('2 Customer Road, EC1A 1BB');
    expect(row['Subtotal']).toBe(1000);
    expect(row['Total VAT']).toBe(200);
    expect(row['Total']).toBe(1200);
    expect(row['Payment Terms']).toBe('30 days');
  });

  it('formats date in UK format', () => {
    const row = invoiceToSummaryRow(makeInvoiceData(), makeTotals());
    // 2026-01-15 → 15/01/2026
    expect(row['Invoice Date']).toBe('15/01/2026');
  });

  it('calculates due date from payment terms', () => {
    const row = invoiceToSummaryRow(makeInvoiceData(), makeTotals());
    // 2026-01-15 + 30 days = 2026-02-14
    expect(row['Due Date']).toBe('14/02/2026');
  });
});

// ===== generateLineItemsCsv =====

describe('generateLineItemsCsv', () => {
  it('produces valid CSV with headers and data', () => {
    const csv = generateLineItemsCsv(makeInvoiceData(), makeTotals());
    const lines = csv.split('\n');

    // First line should be headers
    expect(lines[0]).toContain('Invoice Number');
    expect(lines[0]).toContain('Description');
    expect(lines[0]).toContain('Gross Total');

    // Second line should be data
    expect(lines[1]).toContain('INV-001');
    expect(lines[1]).toContain('Web Development');
  });
});

// ===== generateSummaryCsv =====

describe('generateSummaryCsv', () => {
  it('produces valid CSV with headers and data', () => {
    const csv = generateSummaryCsv(makeInvoiceData(), makeTotals());
    const lines = csv.split('\n');

    expect(lines[0]).toContain('Invoice Number');
    expect(lines[0]).toContain('Due Date');
    expect(lines[1]).toContain('INV-001');
    expect(lines[1]).toContain('Acme Corp');
  });
});

// ===== generateHistoryExportCsv =====

describe('generateHistoryExportCsv', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('produces CSV with history headers', () => {
    const csv = generateHistoryExportCsv([makeSavedInvoice()]);
    const lines = csv.split('\n');
    const header = lines[0];

    expect(header).toContain('Invoice Number');
    expect(header).toContain('Status');
    expect(header).toContain('Amount Paid');
    expect(header).toContain('Outstanding');
  });

  it('derives "Unpaid" status for invoice with no payments', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ amountPaid: 0, dueDate: '2026-03-15' }),
    ]);
    expect(csv).toContain('Unpaid');
  });

  it('derives "Paid" status for fully paid invoice', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ amountPaid: 1200, total: 1200 }),
    ]);
    expect(csv).toContain('Paid');
  });

  it('derives "Partial" status for partially paid invoice', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ amountPaid: 500, total: 1200, dueDate: '2026-03-15' }),
    ]);
    expect(csv).toContain('Partial');
  });

  it('derives "Overdue" status for unpaid past-due invoice', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ amountPaid: 0, dueDate: '2026-01-01' }),
    ]);
    expect(csv).toContain('Overdue');
  });

  it('derives "Credit Note" status for credit notes', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ documentType: 'credit_note' }),
    ]);
    expect(csv).toContain('Credit Note');
  });

  it('calculates outstanding correctly', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ amountPaid: 300, total: 1200, dueDate: '2026-03-15' }),
    ]);
    // Outstanding = max(0, 1200 - 300) = 900
    expect(csv).toContain('900');
  });

  it('handles empty invoice list', () => {
    const csv = generateHistoryExportCsv([]);
    const lines = csv.split('\n');
    // Only header row
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('Invoice Number');
  });

  it('handles multiple invoices', () => {
    const invoices = [
      makeSavedInvoice({ invoiceNumber: 'INV-001', customerName: 'Client A' }),
      makeSavedInvoice({ id: 'saved-2', invoiceNumber: 'INV-002', customerName: 'Client B' }),
    ];
    const csv = generateHistoryExportCsv(invoices);
    const lines = csv.split('\n');
    // Header + 2 data rows
    expect(lines).toHaveLength(3);
    expect(csv).toContain('INV-001');
    expect(csv).toContain('INV-002');
  });

  it('shows document type correctly', () => {
    const csv = generateHistoryExportCsv([
      makeSavedInvoice({ documentType: 'invoice' }),
    ]);
    // Type column should show "Invoice"
    expect(csv).toContain('Invoice');
  });
});
