/**
 * Invoice Store Unit Tests
 * Tests: line items, VAT calculations, CIS deductions,
 *        reset, customer/details updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useInvoiceStore } from '@/stores/invoiceStore';

// ===== Tests =====

describe('invoiceStore', () => {
  beforeEach(() => {
    // Reset store to defaults
    useInvoiceStore.getState().resetInvoice(false);
    sessionStorage.clear();
  });

  // ----- Initial State -----

  describe('initial state', () => {
    it('starts with one empty line item', () => {
      const { lineItems } = useInvoiceStore.getState();
      expect(lineItems).toHaveLength(1);
      expect(lineItems[0].description).toBe('');
      expect(lineItems[0].netAmount).toBe(0);
      expect(lineItems[0].vatRate).toBe('20');
    });

    it('starts with empty customer', () => {
      const { customer } = useInvoiceStore.getState();
      expect(customer.name).toBe('');
      expect(customer.email).toBe('');
    });

    it('starts with default invoice details', () => {
      const { details } = useInvoiceStore.getState();
      expect(details.paymentTerms).toBe('30');
      expect(details.documentType).toBe('invoice');
      expect(details.creditNoteFields).toBeUndefined();
    });
  });

  // ----- Customer Details -----

  describe('setCustomerDetails', () => {
    it('partially updates customer', () => {
      useInvoiceStore.getState().setCustomerDetails({ name: 'Acme Corp' });
      expect(useInvoiceStore.getState().customer.name).toBe('Acme Corp');
      expect(useInvoiceStore.getState().customer.email).toBe(''); // unchanged
    });
  });

  // ----- Invoice Details -----

  describe('setInvoiceDetails', () => {
    it('updates invoice details', () => {
      useInvoiceStore.getState().setInvoiceDetails({
        invoiceNumber: 'INV-0042',
        paymentTerms: '14',
      });
      const { details } = useInvoiceStore.getState();
      expect(details.invoiceNumber).toBe('INV-0042');
      expect(details.paymentTerms).toBe('14');
    });

    it('switches to credit note mode', () => {
      useInvoiceStore.getState().setInvoiceDetails({
        documentType: 'credit_note',
        creditNoteFields: {
          relatedInvoiceNumber: 'INV-001',
          reason: 'Overcharge',
          isPartial: false,
        },
      });
      const { details } = useInvoiceStore.getState();
      expect(details.documentType).toBe('credit_note');
      expect(details.creditNoteFields?.relatedInvoiceNumber).toBe('INV-001');
    });
  });

  // ----- Line Items -----

  describe('line items', () => {
    it('adds a line item', () => {
      useInvoiceStore.getState().addLineItem();
      expect(useInvoiceStore.getState().lineItems).toHaveLength(2);
    });

    it('removes a line item by id', () => {
      useInvoiceStore.getState().addLineItem();
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().removeLineItem(items[0].id);
      expect(useInvoiceStore.getState().lineItems).toHaveLength(1);
      expect(useInvoiceStore.getState().lineItems[0].id).toBe(items[1].id);
    });

    it('updates a line item', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        description: 'Web Development',
        netAmount: 500,
        quantity: 2,
      });
      const updated = useInvoiceStore.getState().lineItems[0];
      expect(updated.description).toBe('Web Development');
      expect(updated.netAmount).toBe(500);
      expect(updated.quantity).toBe(2);
    });

    it('creates CIS line items with labour category', () => {
      useInvoiceStore.getState().addLineItem(true);
      const items = useInvoiceStore.getState().lineItems;
      expect(items[items.length - 1].cisCategory).toBe('labour');
    });
  });

  // ----- VAT Calculations -----

  describe('getTotals — VAT', () => {
    it('calculates 20% VAT correctly', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        netAmount: 100,
        quantity: 1,
        vatRate: '20',
      });
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.subtotal).toBe(100);
      expect(totals.totalVat).toBe(20);
      expect(totals.total).toBe(120);
    });

    it('calculates 5% VAT correctly', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        netAmount: 200,
        quantity: 1,
        vatRate: '5',
      });
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.totalVat).toBe(10);
      expect(totals.total).toBe(210);
    });

    it('calculates 0% VAT (zero-rated)', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        netAmount: 300,
        quantity: 1,
        vatRate: '0',
      });
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.totalVat).toBe(0);
      expect(totals.total).toBe(300);
    });

    it('handles reverse charge (0% VAT but shown in breakdown)', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        netAmount: 1000,
        quantity: 1,
        vatRate: 'reverse_charge',
      });
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.totalVat).toBe(0);
      expect(totals.total).toBe(1000);
      // Reverse charge should appear in breakdown
      expect(totals.vatBreakdown.find(v => v.rate === 'reverse_charge')).toBeTruthy();
    });

    it('handles mixed VAT rates across items', () => {
      const store = useInvoiceStore.getState();
      const items = store.lineItems;
      store.updateLineItem(items[0].id, { netAmount: 100, vatRate: '20' });
      store.addLineItem();
      const items2 = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items2[1].id, { netAmount: 200, vatRate: '5' });

      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.subtotal).toBe(300);
      expect(totals.totalVat).toBe(30); // 20 + 10
      expect(totals.total).toBe(330);
      expect(totals.vatBreakdown).toHaveLength(2);
    });

    it('handles quantity > 1', () => {
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        netAmount: 50,
        quantity: 3,
        vatRate: '20',
      });
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.subtotal).toBe(150);
      expect(totals.totalVat).toBe(30);
      expect(totals.total).toBe(180);
    });

    it('handles zero amount items', () => {
      const totals = useInvoiceStore.getState().getTotals();
      expect(totals.subtotal).toBe(0);
      expect(totals.total).toBe(0);
    });
  });

  // ----- CIS Calculations -----

  describe('getTotals — CIS', () => {
    beforeEach(() => {
      // Set up a CIS scenario: labour + materials
      const store = useInvoiceStore.getState();
      store.resetInvoice(true); // CIS mode
      const items = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items[0].id, {
        description: 'Labour',
        netAmount: 1000,
        quantity: 1,
        vatRate: '20',
        cisCategory: 'labour',
      });
      useInvoiceStore.getState().addLineItem(true);
      const items2 = useInvoiceStore.getState().lineItems;
      useInvoiceStore.getState().updateLineItem(items2[1].id, {
        description: 'Materials',
        netAmount: 500,
        quantity: 1,
        vatRate: '20',
        cisCategory: 'materials',
      });
    });

    it('standard CIS: 20% deduction on labour only', () => {
      const totals = useInvoiceStore.getState().getTotals('standard');
      expect(totals.cisBreakdown).toBeTruthy();
      expect(totals.cisBreakdown!.labourTotal).toBe(1000);
      expect(totals.cisBreakdown!.materialsTotal).toBe(500);
      expect(totals.cisBreakdown!.deductionRate).toBe(0.20);
      expect(totals.cisBreakdown!.deductionAmount).toBe(200); // 20% of 1000
      // netPayable = subtotal(1500) + VAT(300) - CIS(200) = 1600
      expect(totals.cisBreakdown!.netPayable).toBe(1600);
    });

    it('unverified CIS: 30% deduction on labour', () => {
      const totals = useInvoiceStore.getState().getTotals('unverified');
      expect(totals.cisBreakdown!.deductionRate).toBe(0.30);
      expect(totals.cisBreakdown!.deductionAmount).toBe(300); // 30% of 1000
    });

    it('gross payment CIS: 0% deduction', () => {
      const totals = useInvoiceStore.getState().getTotals('gross_payment');
      expect(totals.cisBreakdown!.deductionRate).toBe(0);
      expect(totals.cisBreakdown!.deductionAmount).toBe(0);
    });

    it('non-CIS: no cisBreakdown', () => {
      const totals = useInvoiceStore.getState().getTotals('not_applicable');
      expect(totals.cisBreakdown).toBeUndefined();
    });
  });

  // ----- Reset -----

  describe('resetInvoice', () => {
    it('resets all fields to defaults', () => {
      const store = useInvoiceStore.getState();
      store.setCustomerDetails({ name: 'TestCo' });
      store.setInvoiceDetails({ invoiceNumber: 'INV-999' });
      store.updateLineItem(store.lineItems[0].id, { description: 'Work', netAmount: 500 });

      useInvoiceStore.getState().resetInvoice(false);

      const state = useInvoiceStore.getState();
      expect(state.customer.name).toBe('');
      expect(state.details.invoiceNumber).toBe('');
      expect(state.lineItems).toHaveLength(1);
      expect(state.lineItems[0].description).toBe('');
    });

    it('resets with CIS creates labour line item', () => {
      useInvoiceStore.getState().resetInvoice(true);
      expect(useInvoiceStore.getState().lineItems[0].cisCategory).toBe('labour');
    });

    it('resets without CIS creates not_applicable line item', () => {
      useInvoiceStore.getState().resetInvoice(false);
      expect(useInvoiceStore.getState().lineItems[0].cisCategory).toBe('not_applicable');
    });
  });
});
