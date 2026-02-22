/**
 * useInvoiceActions Hook Unit Tests
 * Tests: PDF success flow, new invoice creation, duplication,
 *        reset functionality, form data detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInvoiceActions } from '@/hooks/useInvoiceActions';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

// ===== Helpers =====

function makeInvoiceData(overrides: Partial<InvoiceData> = {}): InvoiceData {
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
      name: 'Acme Corp',
      email: 'test@acme.com',
      address: '2 Client Rd',
      postCode: 'C2 2CC',
    },
    details: {
      date: '2026-02-22',
      supplyDate: '',
      invoiceNumber: 'INV-0001',
      paymentTerms: '30',
      notes: '',
      documentType: 'invoice',
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
    ...overrides,
  };
}

function makeTotals(total = 120): InvoiceTotals {
  return {
    subtotal: total / 1.2,
    vatBreakdown: [{ rate: '20', amount: total - total / 1.2 }],
    totalVat: total - total / 1.2,
    total,
  };
}

function makeSavedInvoice(overrides: Partial<SavedInvoice> = {}): SavedInvoice {
  const data = makeInvoiceData();
  return {
    id: 'inv_test_123',
    invoice: data,
    totals: makeTotals(),
    savedAt: '2026-02-22T10:00:00.000Z',
    customerName: data.customer.name,
    invoiceNumber: data.details.invoiceNumber,
    total: 120,
    documentType: 'invoice',
    status: 'unpaid',
    dueDate: '2026-03-24',
    amountPaid: 0,
    ...overrides,
  };
}

// Mock scrollTo
window.scrollTo = vi.fn();

function resetStores() {
  useInvoiceStore.getState().resetInvoice(false);
  useCompanyStore.setState({
    isOnboarded: true,
    companyName: 'Test Ltd',
    cisStatus: 'not_applicable',
  });
  useHistoryStore.setState({ invoices: [], recentCustomers: [] });
  useSettingsStore.getState().resetNumberingSequence();
  sessionStorage.clear();
  localStorage.clear();
}

function renderActions() {
  const mocks = {
    setShowSuccess: vi.fn<(show: boolean) => void>(),
    setShowNewInvoiceConfirm: vi.fn<(show: boolean) => void>(),
    setShowResetAllConfirm: vi.fn<(show: boolean) => void>(),
    setShowHistoryPanel: vi.fn<(show: boolean) => void>(),
  };

  const props = {
    invoiceData: makeInvoiceData(),
    totals: makeTotals(),
    ...mocks,
  };

  const hook = renderHook(() => useInvoiceActions(props));

  return { ...hook, mocks };
}

// ===== Tests =====

describe('useInvoiceActions', () => {
  beforeEach(() => {
    resetStores();
    vi.clearAllMocks();
  });

  describe('handlePDFSuccess', () => {
    it('saves invoice to history and shows success', () => {
      const { result, mocks } = renderActions();

      act(() => {
        result.current.handlePDFSuccess();
      });

      expect(useHistoryStore.getState().invoices).toHaveLength(1);
      expect(mocks.setShowSuccess).toHaveBeenCalledWith(true);
    });
  });

  describe('handleCreateAnother', () => {
    it('resets form and hides success', () => {
      const { result, mocks } = renderActions();

      // First fill some data
      act(() => {
        useInvoiceStore.getState().setCustomerDetails({ name: 'Client' });
      });

      act(() => {
        result.current.handleCreateAnother();
      });

      expect(mocks.setShowSuccess).toHaveBeenCalledWith(false);
      // Form should be reset
      expect(useInvoiceStore.getState().customer.name).toBe('');
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('handleStayHere', () => {
    it('just hides success modal', () => {
      const { result, mocks } = renderActions();

      act(() => {
        result.current.handleStayHere();
      });

      expect(mocks.setShowSuccess).toHaveBeenCalledWith(false);
    });
  });

  describe('handleNewInvoice', () => {
    it('shows confirmation when form has data', () => {
      const { result, mocks } = renderActions();

      act(() => {
        useInvoiceStore.getState().setCustomerDetails({ name: 'Filled' });
      });

      act(() => {
        result.current.handleNewInvoice();
      });

      expect(mocks.setShowNewInvoiceConfirm).toHaveBeenCalledWith(true);
    });

    it('resets immediately when form is empty', () => {
      const { result, mocks } = renderActions();

      act(() => {
        result.current.handleNewInvoice();
      });

      // No confirmation needed — direct reset
      expect(mocks.setShowNewInvoiceConfirm).not.toHaveBeenCalled();
    });
  });

  describe('handleConfirmNewInvoice', () => {
    it('resets form and hides confirmation', () => {
      const { result, mocks } = renderActions();

      act(() => {
        useInvoiceStore.getState().setCustomerDetails({ name: 'Old Client' });
      });

      act(() => {
        result.current.handleConfirmNewInvoice();
      });

      expect(useInvoiceStore.getState().customer.name).toBe('');
      expect(mocks.setShowNewInvoiceConfirm).toHaveBeenCalledWith(false);
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('handleResetAllData', () => {
    it('resets invoice and goes back to onboarding', () => {
      const { result, mocks } = renderActions();

      act(() => {
        useInvoiceStore.getState().setCustomerDetails({ name: 'Client' });
        useCompanyStore.setState({ isOnboarded: true });
      });

      act(() => {
        result.current.handleResetAllData();
      });

      expect(useInvoiceStore.getState().customer.name).toBe('');
      expect(useCompanyStore.getState().isOnboarded).toBe(false);
      expect(mocks.setShowResetAllConfirm).toHaveBeenCalledWith(false);
    });
  });

  describe('handleDuplicateInvoice', () => {
    it('closes history panel and scrolls to top', () => {
      const { result, mocks } = renderActions();
      const saved = makeSavedInvoice();

      act(() => {
        result.current.handleDuplicateInvoice(saved);
      });

      expect(mocks.setShowHistoryPanel).toHaveBeenCalledWith(false);
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('sets today as date and consumes next invoice number', () => {
      const { result } = renderActions();
      const saved = makeSavedInvoice();

      act(() => {
        result.current.handleDuplicateInvoice(saved);
      });

      const { details } = useInvoiceStore.getState();
      // Should have a new invoice number (not the saved one)
      expect(details.invoiceNumber).not.toBe('INV-0001');
      // Date should be today
      expect(details.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
