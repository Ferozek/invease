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
import { useSettingsStore } from '@/stores/settingsStore';

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
  reorderLineItems: (newOrder: LineItem[]) => void;
  moveLineItem: (fromIndex: number, direction: 'up' | 'down') => void;

  // Actions - Reset
  resetInvoice: (isCis?: boolean) => void;

  // Helpers
  getTotals: (cisStatus?: CisStatus) => InvoiceTotals;
}

const createEmptyLineItem = (isCis: boolean = false, vatRate?: VatRate): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  netAmount: 0,
  vatRate: vatRate ?? ('20' as VatRate),
  cisCategory: isCis ? 'labour' : 'not_applicable' as CisCategory,
});

const defaultCustomer: CustomerDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postCode: '',
};

const defaultInvoiceDetails: InvoiceDetails = {
  date: getTodayISO(),
  supplyDate: '',
  invoiceNumber: '',
  poNumber: '',
  paymentTerms: '30', // Default to 30 days
  notes: '', // Optional notes/terms
  documentType: 'invoice',
  creditNoteFields: undefined,
};

/** Calculate post-discount net for a single line item */
const getLineNet = (item: LineItem): number => {
  const gross = item.netAmount * item.quantity;
  if (!item.discountType || !item.discountValue) return gross;
  const discount = item.discountType === 'percentage'
    ? gross * (item.discountValue / 100)
    : item.discountValue;
  return Math.max(0, gross - discount);
};

const calculateTotals = (lineItems: LineItem[], cisStatus: CisStatus = 'not_applicable'): InvoiceTotals => {
  const subtotal = lineItems.reduce((sum, item) => sum + getLineNet(item), 0);

  const vatBreakdown: { rate: VatRate; amount: number }[] = [];
  const vatRates: VatRate[] = ['0', '5', '20', 'exempt', 'reverse_charge'];

  vatRates.forEach((rate) => {
    const itemsWithRate = lineItems.filter((item) => item.vatRate === rate);
    if (itemsWithRate.length === 0) return;

    // Reverse charge & exempt = 0% VAT
    const vatPercent = (rate === 'reverse_charge' || rate === 'exempt') ? 0 : parseInt(rate);

    const vatAmount = itemsWithRate.reduce((sum, item) => {
      const lineNet = getLineNet(item);
      return sum + (lineNet * (vatPercent / 100));
    }, 0);

    // Always include reverse_charge/exempt in breakdown to show on invoice (even with 0 amount)
    if (rate === 'reverse_charge' || rate === 'exempt' || vatAmount > 0) {
      vatBreakdown.push({ rate, amount: vatAmount });
    }
  });

  const totalVat = vatBreakdown.reduce((sum, v) => sum + v.amount, 0);

  // Calculate CIS breakdown for subcontractors
  let cisBreakdown: InvoiceTotals['cisBreakdown'] = undefined;

  if (cisStatus !== 'not_applicable') {
    const labourTotal = lineItems
      .filter((item) => item.cisCategory === 'labour')
      .reduce((sum, item) => sum + getLineNet(item), 0);

    const materialsTotal = lineItems
      .filter((item) => item.cisCategory === 'materials')
      .reduce((sum, item) => sum + getLineNet(item), 0);

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

        addLineItem: (isCis = false) => {
          const { defaultVatRate } = useSettingsStore.getState();
          set((state) => ({
            lineItems: [...state.lineItems, createEmptyLineItem(isCis, defaultVatRate)],
          }));
        },

        removeLineItem: (id) => set((state) => ({
          lineItems: state.lineItems.filter((item) => item.id !== id),
        })),

        updateLineItem: (id, updates) => set((state) => ({
          lineItems: state.lineItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

        reorderLineItems: (newOrder) => set({ lineItems: newOrder }),

        moveLineItem: (fromIndex, direction) => set((state) => {
          const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
          if (toIndex < 0 || toIndex >= state.lineItems.length) return state;
          const items = [...state.lineItems];
          [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];
          return { lineItems: items };
        }),

        resetInvoice: (isCis = false) => {
          const settings = useSettingsStore.getState();
          set({
            customer: defaultCustomer,
            details: {
              ...defaultInvoiceDetails,
              date: getTodayISO(),
              paymentTerms: settings.defaultPaymentTerms || '30',
              notes: settings.defaultNotes || '',
              documentType: 'invoice',
              creditNoteFields: undefined,
            },
            lineItems: [createEmptyLineItem(isCis, settings.defaultVatRate)],
          });
        },

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
export const undo = () => {
  const { pastStates } = useInvoiceStore.temporal.getState();
  if (pastStates.length === 0) return;
  // Get current functions before undo (temporal only restores data fields)
  const currentState = useInvoiceStore.getState();
  useInvoiceStore.temporal.getState().undo();
  // Re-merge functions in case the state was replaced instead of merged
  const afterUndo = useInvoiceStore.getState();
  if (!afterUndo.setCustomerDetails) {
    useInvoiceStore.setState({
      ...currentState,
      customer: afterUndo.customer ?? currentState.customer,
      details: afterUndo.details ?? currentState.details,
      lineItems: afterUndo.lineItems ?? currentState.lineItems,
    });
  }
};
export const redo = () => {
  const { futureStates } = useInvoiceStore.temporal.getState();
  if (futureStates.length === 0) return;
  const currentState = useInvoiceStore.getState();
  useInvoiceStore.temporal.getState().redo();
  const afterRedo = useInvoiceStore.getState();
  if (!afterRedo.setCustomerDetails) {
    useInvoiceStore.setState({
      ...currentState,
      customer: afterRedo.customer ?? currentState.customer,
      details: afterRedo.details ?? currentState.details,
      lineItems: afterRedo.lineItems ?? currentState.lineItems,
    });
  }
};
export const clearHistory = () => useInvoiceStore.temporal.getState().clear();

// Hook for accessing temporal state (undo/redo availability)
export const useInvoiceHistory = () => {
  const pastLen = useStore(
    useInvoiceStore.temporal,
    (state) => state.pastStates.length
  );
  const futureLen = useStore(
    useInvoiceStore.temporal,
    (state) => state.futureStates.length
  );

  return {
    canUndo: pastLen > 0,
    canRedo: futureLen > 0,
    undo,
    redo,
  };
};
