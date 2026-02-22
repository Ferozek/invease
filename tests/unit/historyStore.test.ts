/**
 * History Store Unit Tests
 * Tests: saveInvoice, deleteInvoice, markAsPaid/markAsUnpaid,
 *        dashboard stats, overdue logic, credit note impact,
 *        customer management, search/filter selectors
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore, selectDashboardStats, searchInvoices, selectInvoicesOnly, selectCreditNotesOnly, selectOverdueInvoices, selectUnpaidInvoices, selectPaidInvoices, selectUniqueCustomers, type HistoryState } from '@/stores/historyStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

// ===== Test Helpers =====

function makeInvoiceData(overrides: {
  customerName?: string;
  invoiceNumber?: string;
  date?: string;
  paymentTerms?: string;
  documentType?: 'invoice' | 'credit_note';
  relatedInvoiceNumber?: string;
} = {}): InvoiceData {
  const docType = overrides.documentType || 'invoice';
  return {
    invoicer: {
      logo: null,
      logoFileName: null,
      companyName: 'Test Ltd',
      companyNumber: '',
      vatNumber: '',
      eoriNumber: '',
      address: '1 Test St',
      postCode: 'T1 1TT',
      cisStatus: 'not_applicable',
      cisUtr: '',
    },
    customer: {
      name: overrides.customerName || 'Acme Corp',
      email: 'test@acme.com',
      address: '2 Client Rd',
      postCode: 'C2 2CC',
    },
    details: {
      date: overrides.date || '2026-02-22',
      supplyDate: '',
      invoiceNumber: overrides.invoiceNumber || 'INV-0001',
      paymentTerms: overrides.paymentTerms || '30',
      notes: '',
      documentType: docType,
      creditNoteFields: docType === 'credit_note' ? {
        relatedInvoiceNumber: overrides.relatedInvoiceNumber || '',
        reason: 'Overcharge',
        isPartial: false,
      } : undefined,
    },
    lineItems: [{
      id: 'li-1',
      description: 'Service',
      quantity: 1,
      netAmount: 100,
      vatRate: '20',
      cisCategory: 'not_applicable',
    }],
    bankDetails: {
      accountNumber: '',
      sortCode: '',
      accountName: '',
      bankName: '',
      reference: '',
    },
  };
}

function makeTotals(total: number): InvoiceTotals {
  return {
    subtotal: total / 1.2,
    vatBreakdown: [{ rate: '20', amount: total - total / 1.2 }],
    totalVat: total - total / 1.2,
    total,
  };
}

// ===== Tests =====

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useHistoryStore.setState({ invoices: [], recentCustomers: [] });
    localStorage.clear();
  });

  // ----- Save & Retrieve -----

  describe('saveInvoice', () => {
    it('saves an invoice and returns an id', () => {
      const id = useHistoryStore.getState().saveInvoice(makeInvoiceData(), makeTotals(120));
      expect(id).toMatch(/^inv_/);
      expect(useHistoryStore.getState().invoices).toHaveLength(1);
    });

    it('saves credit notes with cn_ prefix', () => {
      const id = useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ documentType: 'credit_note' }),
        makeTotals(50)
      );
      expect(id).toMatch(/^cn_/);
    });

    it('stores denormalized fields for search', () => {
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ customerName: 'BigCo', invoiceNumber: 'INV-999' }),
        makeTotals(500)
      );
      const saved = useHistoryStore.getState().invoices[0];
      expect(saved.customerName).toBe('BigCo');
      expect(saved.invoiceNumber).toBe('INV-999');
      expect(saved.total).toBe(500);
      expect(saved.status).toBe('unpaid');
    });

    it('limits history to 50 invoices', () => {
      const store = useHistoryStore.getState();
      for (let i = 0; i < 55; i++) {
        store.saveInvoice(
          makeInvoiceData({ invoiceNumber: `INV-${i}` }),
          makeTotals(100)
        );
      }
      expect(useHistoryStore.getState().invoices).toHaveLength(50);
    });

    it('adds most recent invoice first', () => {
      const store = useHistoryStore.getState();
      store.saveInvoice(makeInvoiceData({ invoiceNumber: 'INV-FIRST' }), makeTotals(100));
      store.saveInvoice(makeInvoiceData({ invoiceNumber: 'INV-SECOND' }), makeTotals(200));
      expect(useHistoryStore.getState().invoices[0].invoiceNumber).toBe('INV-SECOND');
    });

    it('calculates due date from invoice date + payment terms', () => {
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ date: '2026-01-01', paymentTerms: '30' }),
        makeTotals(100)
      );
      expect(useHistoryStore.getState().invoices[0].dueDate).toBe('2026-01-31');
    });
  });

  // ----- Delete -----

  describe('deleteInvoice', () => {
    it('removes an invoice by id', () => {
      const id = useHistoryStore.getState().saveInvoice(makeInvoiceData(), makeTotals(100));
      useHistoryStore.getState().deleteInvoice(id);
      expect(useHistoryStore.getState().invoices).toHaveLength(0);
    });

    it('does not affect other invoices', () => {
      const store = useHistoryStore.getState();
      const id1 = store.saveInvoice(makeInvoiceData({ invoiceNumber: 'INV-1' }), makeTotals(100));
      store.saveInvoice(makeInvoiceData({ invoiceNumber: 'INV-2' }), makeTotals(200));
      useHistoryStore.getState().deleteInvoice(id1);
      expect(useHistoryStore.getState().invoices).toHaveLength(1);
      expect(useHistoryStore.getState().invoices[0].invoiceNumber).toBe('INV-2');
    });
  });

  // ----- Payment Tracking -----

  describe('markAsPaid / markAsUnpaid', () => {
    it('marks invoice as paid with timestamp', () => {
      const id = useHistoryStore.getState().saveInvoice(makeInvoiceData(), makeTotals(100));
      useHistoryStore.getState().markAsPaid(id);
      const inv = useHistoryStore.getState().invoices[0];
      expect(inv.status).toBe('paid');
      expect(inv.paidDate).toBeTruthy();
    });

    it('marks invoice back to unpaid and clears paidDate', () => {
      const id = useHistoryStore.getState().saveInvoice(makeInvoiceData(), makeTotals(100));
      useHistoryStore.getState().markAsPaid(id);
      useHistoryStore.getState().markAsUnpaid(id);
      const inv = useHistoryStore.getState().invoices[0];
      expect(inv.status).toBe('unpaid');
      expect(inv.paidDate).toBeUndefined();
    });
  });

  // ----- Dashboard Stats -----

  describe('selectDashboardStats', () => {
    it('returns zero stats for empty history', () => {
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.totalInvoiced).toBe(0);
      expect(stats.invoiceCount).toBe(0);
      expect(stats.totalCollected).toBe(0);
      expect(stats.totalOutstanding).toBe(0);
    });

    it('counts invoices in the current month', () => {
      // Use today's date so it falls within the current month
      const today = new Date().toISOString().split('T')[0];
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ date: today, invoiceNumber: 'INV-1' }),
        makeTotals(500)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.invoiceCount).toBe(1);
      expect(stats.totalInvoiced).toBe(500);
    });

    it('tracks collected (paid) vs outstanding (unpaid)', () => {
      const today = new Date().toISOString().split('T')[0];
      const store = useHistoryStore.getState();
      const id1 = store.saveInvoice(
        makeInvoiceData({ date: today, invoiceNumber: 'INV-1', paymentTerms: '90' }),
        makeTotals(300)
      );
      store.saveInvoice(
        makeInvoiceData({ date: today, invoiceNumber: 'INV-2', paymentTerms: '90' }),
        makeTotals(200)
      );
      useHistoryStore.getState().markAsPaid(id1);

      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.totalCollected).toBe(300);
      expect(stats.currentAmount).toBe(200);
    });

    it('detects overdue invoices (due date in the past)', () => {
      // Invoice from 60 days ago with 30-day terms = overdue
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ date: '2025-12-01', paymentTerms: '30', invoiceNumber: 'INV-OLD' }),
        makeTotals(400)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'year');
      expect(stats.overdueCount).toBe(1);
      expect(stats.overdueAmount).toBe(400);
    });

    it('credit notes reduce totalInvoiced in period', () => {
      const today = new Date().toISOString().split('T')[0];
      const store = useHistoryStore.getState();
      store.saveInvoice(
        makeInvoiceData({ date: today, invoiceNumber: 'INV-1' }),
        makeTotals(1000)
      );
      store.saveInvoice(
        makeInvoiceData({ date: today, documentType: 'credit_note', invoiceNumber: 'CN-1', relatedInvoiceNumber: 'INV-1' }),
        makeTotals(200)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.totalInvoiced).toBe(800); // 1000 - 200
    });

    it('credit notes reduce outstanding when related invoice is unpaid', () => {
      const store = useHistoryStore.getState();
      store.saveInvoice(
        makeInvoiceData({ date: '2026-02-01', invoiceNumber: 'INV-1', paymentTerms: '90' }),
        makeTotals(1000)
      );
      store.saveInvoice(
        makeInvoiceData({ date: '2026-02-01', documentType: 'credit_note', invoiceNumber: 'CN-1', relatedInvoiceNumber: 'INV-1' }),
        makeTotals(300)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.currentAmount).toBe(700); // 1000 - 300
    });

    it('credit notes do not reduce outstanding when related invoice is paid', () => {
      const store = useHistoryStore.getState();
      const invId = store.saveInvoice(
        makeInvoiceData({ date: '2026-02-01', invoiceNumber: 'INV-1', paymentTerms: '90' }),
        makeTotals(1000)
      );
      useHistoryStore.getState().markAsPaid(invId);
      store.saveInvoice(
        makeInvoiceData({ date: '2026-02-01', documentType: 'credit_note', invoiceNumber: 'CN-1', relatedInvoiceNumber: 'INV-1' }),
        makeTotals(300)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      // CN has no effect on outstanding since the related invoice is already paid
      expect(stats.currentAmount).toBe(0);
    });

    it('allows negative outstanding (prepayment/credit balance)', () => {
      const store = useHistoryStore.getState();
      // Only a credit note, no invoice — results in negative outstanding
      store.saveInvoice(
        makeInvoiceData({ date: '2026-02-01', documentType: 'credit_note', invoiceNumber: 'CN-1' }),
        makeTotals(500)
      );
      const stats = selectDashboardStats(useHistoryStore.getState(), 'month');
      expect(stats.totalOutstanding).toBe(-500);
    });
  });

  // ----- Filter Selectors -----

  describe('selectors', () => {
    beforeEach(() => {
      const store = useHistoryStore.getState();
      store.saveInvoice(makeInvoiceData({ invoiceNumber: 'INV-1' }), makeTotals(100));
      store.saveInvoice(
        makeInvoiceData({ documentType: 'credit_note', invoiceNumber: 'CN-1' }),
        makeTotals(50)
      );
    });

    it('selectInvoicesOnly excludes credit notes', () => {
      const invoices = selectInvoicesOnly(useHistoryStore.getState());
      expect(invoices).toHaveLength(1);
      expect(invoices[0].invoiceNumber).toBe('INV-1');
    });

    it('selectCreditNotesOnly excludes invoices', () => {
      const cns = selectCreditNotesOnly(useHistoryStore.getState());
      expect(cns).toHaveLength(1);
      expect(cns[0].invoiceNumber).toBe('CN-1');
    });

    it('searchInvoices filters by customer name', () => {
      const results = searchInvoices(useHistoryStore.getState(), 'acme');
      expect(results).toHaveLength(2);
    });

    it('searchInvoices filters by invoice number', () => {
      const results = searchInvoices(useHistoryStore.getState(), 'CN-1');
      expect(results).toHaveLength(1);
    });

    it('searchInvoices filters by document type', () => {
      const results = searchInvoices(useHistoryStore.getState(), '', 'credit_note');
      expect(results).toHaveLength(1);
    });

    it('selectOverdueInvoices only returns unpaid past-due invoices', () => {
      // Add an overdue invoice
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ date: '2025-01-01', paymentTerms: '7', invoiceNumber: 'INV-OVERDUE' }),
        makeTotals(999)
      );
      const overdue = selectOverdueInvoices(useHistoryStore.getState());
      expect(overdue.length).toBeGreaterThanOrEqual(1);
      expect(overdue.every(i => i.status === 'unpaid')).toBe(true);
    });

    it('selectPaidInvoices only returns paid invoices', () => {
      // invoices[0] is the credit note (most recent), invoices[1] is the invoice
      const invoice = useHistoryStore.getState().invoices.find(i => i.documentType === 'invoice')!;
      useHistoryStore.getState().markAsPaid(invoice.id);
      const paid = selectPaidInvoices(useHistoryStore.getState());
      expect(paid).toHaveLength(1);
      expect(paid[0].status).toBe('paid');
    });
  });

  // ----- Customer Management -----

  describe('customer management', () => {
    it('addRecentCustomer stores customer', () => {
      useHistoryStore.getState().saveInvoice(
        makeInvoiceData({ customerName: 'Fresh Ltd' }),
        makeTotals(100)
      );
      const customers = useHistoryStore.getState().recentCustomers;
      expect(customers).toHaveLength(1);
      expect(customers[0].name).toBe('Fresh Ltd');
    });

    it('deduplicates customers by name (case insensitive)', () => {
      const store = useHistoryStore.getState();
      store.saveInvoice(makeInvoiceData({ customerName: 'Acme Corp', invoiceNumber: 'INV-1' }), makeTotals(100));
      store.saveInvoice(makeInvoiceData({ customerName: 'acme corp', invoiceNumber: 'INV-2' }), makeTotals(200));
      expect(useHistoryStore.getState().recentCustomers).toHaveLength(1);
    });

    it('limits recent customers to 5', () => {
      const store = useHistoryStore.getState();
      for (let i = 0; i < 7; i++) {
        store.saveInvoice(
          makeInvoiceData({ customerName: `Customer ${i}`, invoiceNumber: `INV-${i}` }),
          makeTotals(100)
        );
      }
      expect(useHistoryStore.getState().recentCustomers).toHaveLength(5);
    });

    it('mergeCustomers renames customer across all invoices', () => {
      const store = useHistoryStore.getState();
      store.saveInvoice(makeInvoiceData({ customerName: 'Old Name', invoiceNumber: 'INV-1' }), makeTotals(100));
      store.saveInvoice(makeInvoiceData({ customerName: 'Old Name', invoiceNumber: 'INV-2' }), makeTotals(200));
      useHistoryStore.getState().mergeCustomers('Old Name', 'New Name');
      const state = useHistoryStore.getState();
      expect(state.invoices.every(i => i.customerName === 'New Name')).toBe(true);
      expect(state.invoices.every(i => i.invoice.customer.name === 'New Name')).toBe(true);
    });

    it('selectUniqueCustomers deduplicates and sorts by most recent', () => {
      const store = useHistoryStore.getState();
      store.saveInvoice(makeInvoiceData({ customerName: 'Alpha', invoiceNumber: 'INV-1' }), makeTotals(100));
      store.saveInvoice(makeInvoiceData({ customerName: 'Beta', invoiceNumber: 'INV-2' }), makeTotals(200));
      store.saveInvoice(makeInvoiceData({ customerName: 'Alpha', invoiceNumber: 'INV-3' }), makeTotals(300));
      const unique = selectUniqueCustomers(useHistoryStore.getState());
      expect(unique).toHaveLength(2);
      expect(unique[0].name).toBe('Alpha'); // most recent
      expect(unique[0].invoiceCount).toBe(2);
    });
  });

  // ----- Clear History -----

  describe('clearHistory', () => {
    it('clears all invoices and customers', () => {
      useHistoryStore.getState().saveInvoice(makeInvoiceData(), makeTotals(100));
      useHistoryStore.getState().clearHistory();
      const state = useHistoryStore.getState();
      expect(state.invoices).toHaveLength(0);
      expect(state.recentCustomers).toHaveLength(0);
    });
  });
});
