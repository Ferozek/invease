/**
 * useInvoiceData Hook Unit Tests
 * Tests: data consolidation from companyStore + invoiceStore,
 *        totals calculation, CIS breakdown
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';

// ===== Setup =====

function resetStores() {
  useInvoiceStore.getState().resetInvoice(false);
  useCompanyStore.setState({
    logo: null,
    logoFileName: null,
    companyName: '',
    companyNumber: '',
    vatNumber: '',
    eoriNumber: '',
    address: '',
    postCode: '',
    cisStatus: 'not_applicable',
    cisUtr: '',
    bankDetails: {
      accountNumber: '',
      sortCode: '',
      accountName: '',
      bankName: '',
      reference: '',
    },
  });
  sessionStorage.clear();
  localStorage.clear();
}

// ===== Tests =====

describe('useInvoiceData', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('invoiceData consolidation', () => {
    it('returns empty invoice data by default', () => {
      const { result } = renderHook(() => useInvoiceData());
      const { invoiceData } = result.current;

      expect(invoiceData.invoicer.companyName).toBe('');
      expect(invoiceData.customer.name).toBe('');
      expect(invoiceData.lineItems).toHaveLength(1);
      expect(invoiceData.details.documentType).toBe('invoice');
    });

    it('reflects company store changes', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useCompanyStore.setState({
          companyName: 'K&R Accountants',
          vatNumber: 'GB123456789',
          address: '10 Downing Street',
          postCode: 'SW1A 2AA',
        });
      });

      expect(result.current.invoiceData.invoicer.companyName).toBe('K&R Accountants');
      expect(result.current.invoiceData.invoicer.vatNumber).toBe('GB123456789');
      expect(result.current.invoiceData.invoicer.address).toBe('10 Downing Street');
    });

    it('reflects invoice store changes', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useInvoiceStore.getState().setCustomerDetails({
          name: 'Acme Corp',
          email: 'billing@acme.com',
          address: '1 Client Rd',
          postCode: 'EC1A 1BB',
        });
        useInvoiceStore.getState().setInvoiceDetails({
          invoiceNumber: 'INV-0042',
          paymentTerms: '14',
        });
      });

      expect(result.current.invoiceData.customer.name).toBe('Acme Corp');
      expect(result.current.invoiceData.customer.email).toBe('billing@acme.com');
      expect(result.current.invoiceData.details.invoiceNumber).toBe('INV-0042');
    });

    it('includes bank details from memory', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useCompanyStore.getState().setBankDetails({
          accountNumber: '12345678',
          sortCode: '01-02-03',
          accountName: 'K&R Ltd',
          bankName: 'Barclays',
        });
      });

      expect(result.current.invoiceData.bankDetails.accountNumber).toBe('12345678');
      expect(result.current.invoiceData.bankDetails.sortCode).toBe('01-02-03');
    });
  });

  describe('totals calculation', () => {
    it('calculates totals for default 20% VAT', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        const items = useInvoiceStore.getState().lineItems;
        useInvoiceStore.getState().updateLineItem(items[0].id, {
          description: 'Consulting',
          netAmount: 1000,
          quantity: 1,
        });
      });

      const { totals } = result.current;
      expect(totals.subtotal).toBe(1000);
      expect(totals.totalVat).toBe(200);
      expect(totals.total).toBe(1200);
    });

    it('calculates CIS deductions when subcontractor', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useCompanyStore.setState({ cisStatus: 'standard' });
        const items = useInvoiceStore.getState().lineItems;
        useInvoiceStore.getState().updateLineItem(items[0].id, {
          description: 'Labour',
          netAmount: 1000,
          quantity: 1,
          cisCategory: 'labour',
        });
      });

      const { totals } = result.current;
      expect(totals.subtotal).toBe(1000);
      // Standard CIS deduction is 20% of labour
      expect(totals.cisBreakdown).toBeDefined();
      expect(totals.cisBreakdown!.deductionAmount).toBe(200);
    });

    it('exposes cisStatus convenience field', () => {
      const { result } = renderHook(() => useInvoiceData());
      expect(result.current.cisStatus).toBe('not_applicable');

      act(() => {
        useCompanyStore.setState({ cisStatus: 'gross_payment' });
      });

      expect(result.current.cisStatus).toBe('gross_payment');
    });
  });

  describe('convenience fields', () => {
    it('exposes lineItems directly', () => {
      const { result } = renderHook(() => useInvoiceData());
      expect(result.current.lineItems).toHaveLength(1);

      act(() => {
        useInvoiceStore.getState().addLineItem(false);
      });

      expect(result.current.lineItems).toHaveLength(2);
    });

    it('exposes customer directly', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useInvoiceStore.getState().setCustomerDetails({ name: 'Test Client' });
      });

      expect(result.current.customer.name).toBe('Test Client');
    });

    it('exposes details directly', () => {
      const { result } = renderHook(() => useInvoiceData());

      act(() => {
        useInvoiceStore.getState().setInvoiceDetails({ notes: 'Thank you' });
      });

      expect(result.current.details.notes).toBe('Thank you');
    });
  });
});
