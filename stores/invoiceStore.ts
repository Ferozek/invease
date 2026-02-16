/**
 * Invoice Store
 * Zustand store for current invoice state
 * Now persisted to sessionStorage for autosave (survives refresh, not tab close)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CustomerDetails, InvoiceDetails, LineItem, VatRate, InvoiceTotals, CisStatus, CisCategory } from '@/types/invoice';

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
  address: '',
  postCode: '',
};

const defaultInvoiceDetails: InvoiceDetails = {
  date: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  paymentTerms: '30', // Default to 30 days
  notes: '', // Optional notes/terms
};

// CIS deduction rates: 0% (gross), 20% (verified/standard), 30% (unverified)
const getCisDeductionRate = (status: CisStatus): number => {
  switch (status) {
    case 'gross_payment': return 0;
    case 'standard': return 0.20;
    case 'unverified': return 0.30;
    default: return 0;
  }
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
          date: new Date().toISOString().split('T')[0],
          paymentTerms: '30',
          notes: '',
        },
        lineItems: [createEmptyLineItem(isCis)],
      }),

      getTotals: (cisStatus = 'not_applicable') => calculateTotals(get().lineItems, cisStatus),
    }),
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
