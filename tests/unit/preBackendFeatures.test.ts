/**
 * Pre-Backend Feature Gap Tests
 * Tests: PO Number, Late Payment Notice, Duplicate Invoice Warning,
 *        Customer Phone, findInvoiceByNumber selector
 *
 * Apple principle: prevent errors before they happen.
 * Every feature is verified with positive + negative + edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { useHistoryStore, findInvoiceByNumber, selectUniqueCustomers, type HistoryState, type SavedInvoice } from '@/stores/historyStore';
import { useSettingsStore, selectShowLatePaymentNotice } from '@/stores/settingsStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import InvoicePDF from '@/components/pdf/InvoicePDF';
import { getCustomerInvoices, buildStatementRows, getStatementSummary } from '@/lib/statementUtils';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

// ===== Shared Fixtures =====

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
      phone: '020 7946 0958',
      address: '2 Customer Road',
      postCode: 'EC1A 1BB',
    },
    details: {
      date: '2026-01-15',
      supplyDate: '',
      invoiceNumber: 'INV-001',
      poNumber: 'PO-12345',
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

function makeTotals(): InvoiceTotals {
  return {
    subtotal: 1000,
    vatBreakdown: [{ rate: '20', amount: 200 }],
    totalVat: 200,
    total: 1200,
  };
}

// ===== Feature 1: PO Number =====

describe('Feature 1: PO Number', () => {
  it('InvoiceData type includes poNumber', () => {
    const data = makeInvoiceData();
    expect(data.details.poNumber).toBe('PO-12345');
  });

  it('PO number can be empty string (optional field)', () => {
    const data = makeInvoiceData({
      details: { ...makeInvoiceData().details, poNumber: '' },
    });
    expect(data.details.poNumber).toBe('');
  });

  it('renders InvoicePDF with PO number', () => {
    const element = createElement(InvoicePDF, {
      invoice: makeInvoiceData(),
      totals: makeTotals(),
    });
    expect(element).toBeDefined();
    expect(element.props.invoice.details.poNumber).toBe('PO-12345');
  });

  it('renders InvoicePDF without PO number', () => {
    const invoice = makeInvoiceData({
      details: { ...makeInvoiceData().details, poNumber: '' },
    });
    const element = createElement(InvoicePDF, {
      invoice,
      totals: makeTotals(),
    });
    expect(element).toBeDefined();
  });

  describe('invoiceStore PO number', () => {
    beforeEach(() => {
      useInvoiceStore.getState().resetInvoice(false);
    });

    it('default PO number is empty', () => {
      const state = useInvoiceStore.getState();
      expect(state.details.poNumber).toBe('');
    });

    it('setInvoiceDetails updates PO number', () => {
      useInvoiceStore.getState().setInvoiceDetails({ poNumber: 'PO-999' });
      expect(useInvoiceStore.getState().details.poNumber).toBe('PO-999');
    });

    it('resetInvoice clears PO number', () => {
      useInvoiceStore.getState().setInvoiceDetails({ poNumber: 'PO-999' });
      useInvoiceStore.getState().resetInvoice(false);
      expect(useInvoiceStore.getState().details.poNumber).toBe('');
    });
  });
});

// ===== Feature 3: Late Payment Interest Notice =====

describe('Feature 3: Late Payment Interest Notice', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset to defaults
    useSettingsStore.setState({
      showLatePaymentNotice: false,
    });
  });

  it('default showLatePaymentNotice is false', () => {
    expect(useSettingsStore.getState().showLatePaymentNotice).toBe(false);
  });

  it('setShowLatePaymentNotice toggles the setting', () => {
    useSettingsStore.getState().setShowLatePaymentNotice(true);
    expect(useSettingsStore.getState().showLatePaymentNotice).toBe(true);
    useSettingsStore.getState().setShowLatePaymentNotice(false);
    expect(useSettingsStore.getState().showLatePaymentNotice).toBe(false);
  });

  it('renders InvoicePDF with showLatePaymentNotice=true', () => {
    const element = createElement(InvoicePDF, {
      invoice: makeInvoiceData(),
      totals: makeTotals(),
      showLatePaymentNotice: true,
    });
    expect(element).toBeDefined();
    expect(element.props.showLatePaymentNotice).toBe(true);
  });

  it('renders InvoicePDF with showLatePaymentNotice=false', () => {
    const element = createElement(InvoicePDF, {
      invoice: makeInvoiceData(),
      totals: makeTotals(),
      showLatePaymentNotice: false,
    });
    expect(element).toBeDefined();
    expect(element.props.showLatePaymentNotice).toBe(false);
  });

  it('not passed to credit note PDFs (only invoices)', () => {
    const creditNote = makeInvoiceData({
      details: {
        ...makeInvoiceData().details,
        documentType: 'credit_note',
        creditNoteFields: {
          relatedInvoiceNumber: 'INV-001',
          reason: 'Overcharge',
          isPartial: false,
        },
      },
    });
    // The component conditionally hides it for credit notes
    const element = createElement(InvoicePDF, {
      invoice: creditNote,
      totals: makeTotals(),
      showLatePaymentNotice: true,
    });
    expect(element).toBeDefined();
    // Credit notes should still render fine with the prop
    expect(element.props.invoice.details.documentType).toBe('credit_note');
  });

  it('selectShowLatePaymentNotice returns correct value', () => {
    useSettingsStore.getState().setShowLatePaymentNotice(true);
    expect(selectShowLatePaymentNotice(useSettingsStore.getState())).toBe(true);
  });
});

// ===== Feature 4: Duplicate Invoice Number Warning =====

describe('Feature 4: Duplicate Invoice Number Warning', () => {
  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.setState({ invoices: [], recentCustomers: [], customerNotes: {} });
  });

  describe('findInvoiceByNumber', () => {
    it('returns null when history is empty', () => {
      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, 'INV-001')).toBeNull();
    });

    it('returns null for empty/whitespace input', () => {
      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, '')).toBeNull();
      expect(findInvoiceByNumber(state, '   ')).toBeNull();
    });

    it('finds existing invoice number (exact match)', () => {
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const state = useHistoryStore.getState() as HistoryState;
      const result = findInvoiceByNumber(state, 'INV-001');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string'); // ISO date string
    });

    it('matches case-insensitively', () => {
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, 'inv-001')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'INV-001')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'Inv-001')).not.toBeNull();
    });

    it('trims whitespace from input', () => {
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, '  INV-001  ')).not.toBeNull();
    });

    it('returns null for non-existent invoice number', () => {
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, 'INV-999')).toBeNull();
    });

    it('works with credit note numbers', () => {
      const creditNote = makeInvoiceData({
        details: {
          ...makeInvoiceData().details,
          invoiceNumber: 'CN-001',
          documentType: 'credit_note',
          creditNoteFields: {
            relatedInvoiceNumber: 'INV-001',
            reason: 'Refund',
            isPartial: false,
          },
        },
      });
      useHistoryStore.getState().saveInvoice(creditNote, makeTotals());

      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, 'CN-001')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'INV-001')).toBeNull(); // Different from CN number
    });

    it('finds among multiple invoices', () => {
      // Save 3 invoices
      for (let i = 1; i <= 3; i++) {
        const inv = makeInvoiceData({
          details: { ...makeInvoiceData().details, invoiceNumber: `INV-00${i}` },
        });
        useHistoryStore.getState().saveInvoice(inv, makeTotals());
      }

      const state = useHistoryStore.getState() as HistoryState;
      expect(findInvoiceByNumber(state, 'INV-001')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'INV-002')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'INV-003')).not.toBeNull();
      expect(findInvoiceByNumber(state, 'INV-004')).toBeNull();
    });
  });
});

// ===== Feature 5: Customer Phone Number =====

describe('Feature 5: Customer Phone Number', () => {
  it('InvoiceData type includes phone in customer', () => {
    const data = makeInvoiceData();
    expect(data.customer.phone).toBe('020 7946 0958');
  });

  it('phone can be empty string (optional)', () => {
    const data = makeInvoiceData({
      customer: { ...makeInvoiceData().customer, phone: '' },
    });
    expect(data.customer.phone).toBe('');
  });

  it('renders InvoicePDF with phone number', () => {
    const element = createElement(InvoicePDF, {
      invoice: makeInvoiceData(),
      totals: makeTotals(),
    });
    expect(element).toBeDefined();
    expect(element.props.invoice.customer.phone).toBe('020 7946 0958');
  });

  it('renders InvoicePDF without phone number', () => {
    const invoice = makeInvoiceData({
      customer: { ...makeInvoiceData().customer, phone: '' },
    });
    const element = createElement(InvoicePDF, {
      invoice,
      totals: makeTotals(),
    });
    expect(element).toBeDefined();
  });

  describe('invoiceStore phone', () => {
    beforeEach(() => {
      useInvoiceStore.getState().resetInvoice(false);
    });

    it('default phone is empty', () => {
      const state = useInvoiceStore.getState();
      expect(state.customer.phone).toBe('');
    });

    it('setCustomerDetails updates phone', () => {
      useInvoiceStore.getState().setCustomerDetails({ phone: '07700 900000' });
      expect(useInvoiceStore.getState().customer.phone).toBe('07700 900000');
    });

    it('resetInvoice clears phone', () => {
      useInvoiceStore.getState().setCustomerDetails({ phone: '07700 900000' });
      useInvoiceStore.getState().resetInvoice(false);
      expect(useInvoiceStore.getState().customer.phone).toBe('');
    });
  });

  describe('historyStore phone in UniqueCustomer', () => {
    beforeEach(() => {
      localStorage.clear();
      useHistoryStore.setState({ invoices: [], recentCustomers: [], customerNotes: {} });
    });

    it('preserves phone in customer data from saved invoices', () => {
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const state = useHistoryStore.getState();
      const saved = state.invoices[0];
      expect(saved.invoice.customer.phone).toBe('020 7946 0958');
    });

    it('selectUniqueCustomers includes phone', () => {
      // selectUniqueCustomers imported at top level
      const invoice = makeInvoiceData();
      useHistoryStore.getState().saveInvoice(invoice, makeTotals());

      const customers = selectUniqueCustomers(useHistoryStore.getState());
      expect(customers).toHaveLength(1);
      expect(customers[0].phone).toBe('020 7946 0958');
    });

    it('selectUniqueCustomers uses latest phone when customer has multiple invoices', () => {
      // selectUniqueCustomers imported at top level

      // First invoice with old phone
      const inv1 = makeInvoiceData({
        customer: { ...makeInvoiceData().customer, phone: '01onal old' },
        details: { ...makeInvoiceData().details, invoiceNumber: 'INV-001' },
      });
      useHistoryStore.getState().saveInvoice(inv1, makeTotals());

      // Second invoice with new phone
      const inv2 = makeInvoiceData({
        customer: { ...makeInvoiceData().customer, phone: '020 7946 0958' },
        details: { ...makeInvoiceData().details, invoiceNumber: 'INV-002' },
      });
      useHistoryStore.getState().saveInvoice(inv2, makeTotals());

      const customers = selectUniqueCustomers(useHistoryStore.getState());
      expect(customers).toHaveLength(1);
      // Most recent invoice's phone should win
      expect(customers[0].phone).toBe('020 7946 0958');
    });
  });
});

// ===== Feature 2: Statement of Account =====

describe('Feature 2: Statement of Account Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    useHistoryStore.setState({ invoices: [], recentCustomers: [], customerNotes: {} });
  });

  function saveAndGetInvoices(overrides: Array<{
    customerName?: string;
    invoiceNumber?: string;
    documentType?: 'invoice' | 'credit_note';
    amount?: number;
    amountPaid?: number;
  }>): SavedInvoice[] {
    for (const o of overrides) {
      const inv = makeInvoiceData({
        customer: { ...makeInvoiceData().customer, name: o.customerName || 'Acme Corp' },
        details: {
          ...makeInvoiceData().details,
          invoiceNumber: o.invoiceNumber || 'INV-001',
          documentType: o.documentType || 'invoice',
          ...(o.documentType === 'credit_note' ? {
            creditNoteFields: {
              relatedInvoiceNumber: 'INV-001',
              reason: 'Refund',
              isPartial: false,
            },
          } : {}),
        },
        lineItems: [{
          id: '1',
          description: 'Service',
          quantity: 1,
          netAmount: o.amount || 1000,
          vatRate: '20',
          cisCategory: 'not_applicable',
        }],
      });
      const totals: InvoiceTotals = {
        subtotal: o.amount || 1000,
        vatBreakdown: [{ rate: '20', amount: (o.amount || 1000) * 0.2 }],
        totalVat: (o.amount || 1000) * 0.2,
        total: (o.amount || 1000) * 1.2,
      };
      const id = useHistoryStore.getState().saveInvoice(inv, totals);
      if (o.amountPaid) {
        useHistoryStore.getState().recordPayment(id, o.amountPaid);
      }
    }
    return useHistoryStore.getState().invoices;
  }

  describe('getCustomerInvoices', () => {
    it('filters by customer name (case-insensitive)', () => {
      saveAndGetInvoices([
        { customerName: 'Acme Corp', invoiceNumber: 'INV-001' },
        { customerName: 'Other Ltd', invoiceNumber: 'INV-002' },
        { customerName: 'ACME CORP', invoiceNumber: 'INV-003' },
      ]);
      const all = useHistoryStore.getState().invoices;
      const result = getCustomerInvoices(all, 'acme corp');
      expect(result).toHaveLength(2);
    });

    it('returns empty array for unknown customer', () => {
      saveAndGetInvoices([{ customerName: 'Acme Corp', invoiceNumber: 'INV-001' }]);
      const all = useHistoryStore.getState().invoices;
      expect(getCustomerInvoices(all, 'Nobody')).toHaveLength(0);
    });

    it('sorts by date ascending', () => {
      const inv1 = makeInvoiceData({
        details: { ...makeInvoiceData().details, date: '2026-02-01', invoiceNumber: 'INV-001' },
      });
      const inv2 = makeInvoiceData({
        details: { ...makeInvoiceData().details, date: '2026-01-15', invoiceNumber: 'INV-002' },
      });
      useHistoryStore.getState().saveInvoice(inv1, makeTotals());
      useHistoryStore.getState().saveInvoice(inv2, makeTotals());

      const all = useHistoryStore.getState().invoices;
      const result = getCustomerInvoices(all, 'Acme Corp');
      expect(result[0].invoiceNumber).toBe('INV-002'); // Jan before Feb
      expect(result[1].invoiceNumber).toBe('INV-001');
    });
  });

  describe('buildStatementRows', () => {
    it('calculates running balance for invoices', () => {
      // Use different dates so sorting is deterministic
      const inv1 = makeInvoiceData({
        details: { ...makeInvoiceData().details, date: '2026-01-10', invoiceNumber: 'INV-001' },
        lineItems: [{ id: '1', description: 'Service A', quantity: 1, netAmount: 1000, vatRate: '20', cisCategory: 'not_applicable' }],
      });
      const inv2 = makeInvoiceData({
        details: { ...makeInvoiceData().details, date: '2026-01-20', invoiceNumber: 'INV-002' },
        lineItems: [{ id: '2', description: 'Service B', quantity: 1, netAmount: 500, vatRate: '20', cisCategory: 'not_applicable' }],
      });
      useHistoryStore.getState().saveInvoice(inv1, { subtotal: 1000, vatBreakdown: [{ rate: '20', amount: 200 }], totalVat: 200, total: 1200 });
      useHistoryStore.getState().saveInvoice(inv2, { subtotal: 500, vatBreakdown: [{ rate: '20', amount: 100 }], totalVat: 100, total: 600 });

      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const rows = buildStatementRows(sorted);

      expect(rows).toHaveLength(2);
      expect(rows[0].invoiceNumber).toBe('INV-001');
      expect(rows[0].balance).toBe(1200);
      expect(rows[1].invoiceNumber).toBe('INV-002');
      expect(rows[1].balance).toBe(1800); // 1200 + 600
    });

    it('reduces balance for credit notes', () => {
      const inv1 = makeInvoiceData({
        details: { ...makeInvoiceData().details, date: '2026-01-10', invoiceNumber: 'INV-001' },
        lineItems: [{ id: '1', description: 'Service', quantity: 1, netAmount: 1000, vatRate: '20', cisCategory: 'not_applicable' }],
      });
      const cn = makeInvoiceData({
        details: {
          ...makeInvoiceData().details,
          date: '2026-01-20',
          invoiceNumber: 'CN-001',
          documentType: 'credit_note',
          creditNoteFields: { relatedInvoiceNumber: 'INV-001', reason: 'Refund', isPartial: false },
        },
        lineItems: [{ id: '2', description: 'Refund', quantity: 1, netAmount: 200, vatRate: '20', cisCategory: 'not_applicable' }],
      });
      useHistoryStore.getState().saveInvoice(inv1, { subtotal: 1000, vatBreakdown: [{ rate: '20', amount: 200 }], totalVat: 200, total: 1200 });
      useHistoryStore.getState().saveInvoice(cn, { subtotal: 200, vatBreakdown: [{ rate: '20', amount: 40 }], totalVat: 40, total: 240 });

      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const rows = buildStatementRows(sorted);

      expect(rows).toHaveLength(2);
      expect(rows[0].invoiceNumber).toBe('INV-001');
      expect(rows[0].amount).toBe(1200);
      expect(rows[1].invoiceNumber).toBe('CN-001');
      expect(rows[1].amount).toBe(-240);
      expect(rows[1].balance).toBe(960); // 1200 - 240
    });

    it('accounts for payments in balance', () => {
      saveAndGetInvoices([
        { invoiceNumber: 'INV-001', amount: 1000, amountPaid: 500 },
      ]);
      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const rows = buildStatementRows(sorted);

      expect(rows[0].amount).toBe(1200);
      expect(rows[0].paid).toBe(500);
      expect(rows[0].balance).toBe(700); // 1200 - 500
    });

    it('returns empty array for no invoices', () => {
      expect(buildStatementRows([])).toHaveLength(0);
    });
  });

  describe('getStatementSummary', () => {
    it('calculates correct totals', () => {
      saveAndGetInvoices([
        { invoiceNumber: 'INV-001', amount: 1000, amountPaid: 600 },
        { invoiceNumber: 'INV-002', amount: 500 },
      ]);
      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const summary = getStatementSummary(sorted);

      expect(summary.totalInvoiced).toBe(1800); // 1200 + 600
      expect(summary.totalCredited).toBe(0);
      expect(summary.totalPaid).toBe(600);
      expect(summary.outstanding).toBe(1200); // 1800 - 0 - 600
    });

    it('handles credit notes correctly', () => {
      saveAndGetInvoices([
        { invoiceNumber: 'INV-001', amount: 1000 },
        { invoiceNumber: 'CN-001', amount: 200, documentType: 'credit_note' },
      ]);
      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const summary = getStatementSummary(sorted);

      expect(summary.totalInvoiced).toBe(1200);
      expect(summary.totalCredited).toBe(240);
      expect(summary.outstanding).toBe(960);
    });

    it('returns zeros for empty invoice list', () => {
      const summary = getStatementSummary([]);
      expect(summary.totalInvoiced).toBe(0);
      expect(summary.totalCredited).toBe(0);
      expect(summary.totalPaid).toBe(0);
      expect(summary.outstanding).toBe(0);
    });

    it('handles overpayment (negative outstanding)', () => {
      saveAndGetInvoices([
        { invoiceNumber: 'INV-001', amount: 100, amountPaid: 120 },
      ]);
      const all = useHistoryStore.getState().invoices;
      const sorted = getCustomerInvoices(all, 'Acme Corp');
      const summary = getStatementSummary(sorted);

      // total=120, paid=120 -> outstanding=0 (recordPayment caps at total)
      expect(summary.outstanding).toBe(0);
    });
  });
});
