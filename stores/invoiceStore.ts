/**
 * Invoice Store
 * Zustand store for current invoice state
 * Features:
 * - Persisted to sessionStorage for autosave (survives refresh, not tab close)
 * - Undo/Redo support via temporal middleware (Cmd+Z / Cmd+Shift+Z)
 */

import { create } from 'zustand';
import { useStore } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal, type TemporalState } from 'zundo';
import type { CustomerDetails, InvoiceDetails, LineItem, VatRate, InvoiceTotals, CisStatus, CisCategory } from '@/types/invoice';
import { getTodayISO } from '@/lib/dateUtils';
import { getCisDeductionRate } from '@/lib/cisUtils';

interface InvoiceState {
  // Customer details
  customer: CustomerDetails;

  // Invoice details
  details: InvoiceDetails;

  // Line items
  lineItems: LineItem[];

  // Actions - Customer
  setCustomerDetails: (details: Partial<CustomerDetails>) => void;

  // Actions - Invoice details
  setInvoiceDetails: (details: Partial<InvoiceDetails>) => void;

  // Actions - Line items
  addLineItem: (isCis?: boolean) => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (id: string, updates: Partial<Omit<LineItem, 'id'>>) => void;

  // Actions - Reset
  resetInvoice: (isCis?: boolean) => void;

  // Helpers
  getTotals: (cisStatus?: CisStatus) => InvoiceTotals;
}

const createEmptyLineItem = (isCis: boolean = false): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  netAmount: 0,
  vatRate: '20' as VatRate,
  cisCategory: isCis ? 'labour' : 'not_applicable' as CisCategory,
});

const defaultCustomer: CustomerDetails = {
  name: '',
  email: '',
  address: '',
  postCode: '',
};

const defaultInvoiceDetails: InvoiceDetails = {
  date: getTodayISO(),
  invoiceNumber: '',
  paymentTerms: '30', // Default to 30 days
  notes: '', // Optional notes/terms
  documentType: 'invoice',
  creditNoteFields: undefined,
};

const calculateTotals = (lineItems: LineItem[], cisStatus: CisStatus = 'not_applicable'): InvoiceTotals => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.netAmount * item.quantity), 0);

  const vatBreakdown: { rate: VatRate; amount: number }[] = [];
  const vatRates: VatRate[] = ['0', '5', '20', 'reverse_charge'];

  vatRates.forEach((rate) => {
    const itemsWithRate = lineItems.filter((item) => item.vatRate === rate);
    if (itemsWithRate.length === 0) return;

    // Reverse charge = 0% VAT (buyer accounts for VAT, not seller)
    const vatPercent = rate === 'reverse_charge' ? 0 : parseInt(rate);

    const vatAmount = itemsWithRate.reduce((sum, item) => {
      const netTotal = item.netAmount * item.quantity;
      return sum + (netTotal * (vatPercent / 100));
    }, 0);

    // Always include reverse_charge in breakdown to show on invoice (even with 0 amount)
    if (rate === 'reverse_charge' || vatAmount > 0) {
      vatBreakdown.push({ rate, amount: vatAmount });
    }
  });

  const totalVat = vatBreakdown.reduce((sum, v) => sum + v.amount, 0);

  // Calculate CIS breakdown for subcontractors
  let cisBreakdown: InvoiceTotals['cisBreakdown'] = undefined;

  if (cisStatus !== 'not_applicable') {
    const labourTotal = lineItems
      .filter((item) => item.cisCategory === 'labour')
      .reduce((sum, item) => sum + item.netAmount * item.quantity, 0);

    const materialsTotal = lineItems
      .filter((item) => item.cisCategory === 'materials')
      .reduce((sum, item) => sum + item.netAmount * item.quantity, 0);

    const deductionRate = getCisDeductionRate(cisStatus);
    const deductionAmount = labourTotal * deductionRate;

    cisBreakdown = {
      labourTotal,
      materialsTotal,
      deductionRate,
      deductionAmount,
      netPayable: subtotal + totalVat - deductionAmount,
    };
  }

  return {
    subtotal,
    vatBreakdown,
    totalVat,
    total: subtotal + totalVat,
    cisBreakdown,
  };
};

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    temporal(
      (set, get) => ({
        customer: defaultCustomer,
        details: defaultInvoiceDetails,
        lineItems: [createEmptyLineItem()],

        setCustomerDetails: (details) => set((state) => ({
          customer: { ...state.customer, ...details },
        })),

        setInvoiceDetails: (details) => set((state) => ({
          details: { ...state.details, ...details },
        })),

        addLineItem: (isCis = false) => set((state) => ({
          lineItems: [...state.lineItems, createEmptyLineItem(isCis)],
        })),

        removeLineItem: (id) => set((state) => ({
          lineItems: state.lineItems.filter((item) => item.id !== id),
        })),

        updateLineItem: (id, updates) => set((state) => ({
          lineItems: state.lineItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

        resetInvoice: (isCis = false) => set({
          customer: defaultCustomer,
          details: {
            ...defaultInvoiceDetails,
            date: getTodayISO(),
            paymentTerms: '30',
            notes: '',
            documentType: 'invoice',
            creditNoteFields: undefined,
          },
          lineItems: [createEmptyLineItem(isCis)],
        }),

        getTotals: (cisStatus = 'not_applicable') => calculateTotals(get().lineItems, cisStatus),
      }),
      {
        // Limit history to 50 states to prevent memory issues
        limit: 50,
        // Only track meaningful data changes
        partialize: (state) => ({
          customer: state.customer,
          details: state.details,
          lineItems: state.lineItems,
        }),
        // Equality function to avoid tracking trivial changes
        equality: (pastState, currentState) =>
          JSON.stringify(pastState) === JSON.stringify(currentState),
      }
    ),
    {
      name: 'invease-invoice-draft',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist data fields, not functions
      partialize: (state) => ({
        customer: state.customer,
        details: state.details,
        lineItems: state.lineItems,
      }),
    }
  )
);

// Type for the temporal store
type InvoiceTemporalState = TemporalState<{
  customer: CustomerDetails;
  details: InvoiceDetails;
  lineItems: LineItem[];
}>;

// Export undo/redo functions for keyboard shortcuts
export const undo = () => useInvoiceStore.temporal.getState().undo();
export const redo = () => useInvoiceStore.temporal.getState().redo();
export const clearHistory = () => useInvoiceStore.temporal.getState().clear();

// Hook for accessing temporal state (undo/redo availability)
export const useInvoiceHistory = () => {
  const temporal = useStore(useInvoiceStore.temporal);

  return {
    canUndo: temporal.pastStates.length > 0,
    canRedo: temporal.futureStates.length > 0,
    undo: temporal.undo,
    redo: temporal.redo,
  };
};
