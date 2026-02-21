/**
 * Invoice History Store
 * Manages saved invoices in localStorage
 *
 * Design: Separate from invoiceStore to maintain single responsibility
 * Persisted to localStorage with Zustand persist middleware
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DocumentType, InvoiceData, InvoiceTotals } from '@/types/invoice';
import { calculateDueDate, getTodayISO, isWithinPeriod } from '@/lib/dateUtils';

// ===== Types =====

export type PaymentStatus = 'unpaid' | 'paid';

export interface SavedInvoice {
  id: string;
  invoice: InvoiceData;
  totals: InvoiceTotals;
  savedAt: string;
  // Searchable fields (denormalized for performance)
  customerName: string;
  invoiceNumber: string;
  total: number;
  documentType: DocumentType;
  // Payment tracking (Phase 2.5)
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
}

export interface RecentCustomer {
  name: string;
  address: string;
  postCode: string;
  lastUsed: string;
}

export interface DashboardStats {
  totalInvoiced: number;
  invoiceCount: number;
  totalCollected: number;
  totalOutstanding: number;
  currentAmount: number;
  currentCount: number;
  overdueAmount: number;
  overdueCount: number;
}

export interface HistoryState {
  // Saved invoices (most recent first)
  invoices: SavedInvoice[];

  // Recent customers (last 5)
  recentCustomers: RecentCustomer[];

  // Actions
  saveInvoice: (invoice: InvoiceData, totals: InvoiceTotals) => string;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => SavedInvoice | undefined;
  clearHistory: () => void;

  // Payment actions
  markAsPaid: (id: string) => void;
  markAsUnpaid: (id: string) => void;

  // Customer actions
  addRecentCustomer: (customer: RecentCustomer) => void;
  getRecentCustomers: () => RecentCustomer[];
  mergeCustomers: (fromName: string, toName: string) => void;
}

// ===== Constants =====

const MAX_INVOICES = 50;
const MAX_RECENT_CUSTOMERS = 5;

// ===== Store =====

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      invoices: [],
      recentCustomers: [],

      saveInvoice: (invoice, totals) => {
        const docType = invoice.details.documentType || 'invoice';
        const id = generateId(docType);
        const dueDate = calculateDueDate(invoice.details.date, invoice.details.paymentTerms);
        const savedInvoice: SavedInvoice = {
          id,
          invoice,
          totals,
          savedAt: new Date().toISOString(),
          customerName: invoice.customer.name,
          invoiceNumber: invoice.details.invoiceNumber,
          total: totals.total,
          documentType: docType,
          status: 'unpaid',
          dueDate,
        };

        set((state) => {
          // Add to front, limit to MAX_INVOICES
          const updated = [savedInvoice, ...state.invoices].slice(0, MAX_INVOICES);
          return { invoices: updated };
        });

        // Also save customer to recent
        get().addRecentCustomer({
          name: invoice.customer.name,
          address: invoice.customer.address,
          postCode: invoice.customer.postCode,
          lastUsed: new Date().toISOString(),
        });

        return id;
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },

      getInvoice: (id) => {
        return get().invoices.find((inv) => inv.id === id);
      },

      clearHistory: () => {
        set({ invoices: [], recentCustomers: [] });
      },

      markAsPaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'paid' as PaymentStatus, paidDate: new Date().toISOString() }
              : inv
          ),
        }));
      },

      markAsUnpaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'unpaid' as PaymentStatus, paidDate: undefined }
              : inv
          ),
        }));
      },

      addRecentCustomer: (customer) => {
        set((state) => {
          // Remove existing entry for same customer (by name)
          const filtered = state.recentCustomers.filter(
            (c) => c.name.toLowerCase() !== customer.name.toLowerCase()
          );
          // Add to front, limit to MAX_RECENT_CUSTOMERS
          const updated = [customer, ...filtered].slice(0, MAX_RECENT_CUSTOMERS);
          return { recentCustomers: updated };
        });
      },

      getRecentCustomers: () => {
        return get().recentCustomers;
      },

      mergeCustomers: (fromName, toName) => {
        set((state) => {
          const fromLower = fromName.toLowerCase();
          // Update all invoices: rename customer in both denormalized + nested fields
          const invoices = state.invoices.map((inv) => {
            if (inv.customerName.toLowerCase() !== fromLower) return inv;
            return {
              ...inv,
              customerName: toName,
              invoice: {
                ...inv.invoice,
                customer: {
                  ...inv.invoice.customer,
                  name: toName,
                },
              },
            };
          });
          // Remove the old name from recent customers
          const recentCustomers = state.recentCustomers.filter(
            (c) => c.name.toLowerCase() !== fromLower
          );
          return { invoices, recentCustomers };
        });
      },
    }),
    {
      name: 'invease-history',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as { invoices?: SavedInvoice[] };
        if (version < 2 && state.invoices) {
          // v1 → v2: Add documentType to existing entries
          state.invoices = state.invoices.map((inv) => ({
            ...inv,
            documentType: inv.documentType || 'invoice' as DocumentType,
          }));
        }
        if (version < 3 && state.invoices) {
          // v2 → v3: Add payment tracking fields
          state.invoices = state.invoices.map((inv) => ({
            ...inv,
            status: inv.status || 'unpaid' as PaymentStatus,
            dueDate: inv.dueDate || calculateDueDate(
              inv.invoice?.details?.date || getTodayISO(),
              inv.invoice?.details?.paymentTerms || '30'
            ),
          }));
        }
        return state as HistoryState;
      },
    }
  )
);

// ===== Helpers =====

function generateId(docType: DocumentType = 'invoice'): string {
  const prefix = docType === 'credit_note' ? 'cn' : 'inv';
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ===== Selectors (for performance) =====

export const selectInvoiceCount = (state: HistoryState) => state.invoices.length;

export const selectRecentInvoices = (state: HistoryState, limit = 10) =>
  state.invoices.slice(0, limit);

export const searchInvoices = (state: HistoryState, query: string, docType?: DocumentType) => {
  const lowerQuery = query.toLowerCase();
  let results = state.invoices;
  if (docType) {
    results = results.filter((inv) => (inv.documentType || 'invoice') === docType);
  }
  return results.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(lowerQuery) ||
      inv.invoiceNumber.toLowerCase().includes(lowerQuery)
  );
};

export const selectInvoicesOnly = (state: HistoryState) =>
  state.invoices.filter((inv) => (inv.documentType || 'invoice') === 'invoice');

export const selectCreditNotesOnly = (state: HistoryState) =>
  state.invoices.filter((inv) => inv.documentType === 'credit_note');

// ===== Dashboard Selectors (Phase 2.5) =====

export const selectDashboardStats = (
  state: HistoryState,
  period: 'month' | 'quarter' | 'year' = 'month'
): DashboardStats => {
  const today = getTodayISO();

  let totalInvoiced = 0;
  let invoiceCount = 0;
  let totalCollected = 0;
  let currentAmount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let currentCount = 0;

  for (const inv of state.invoices) {
    const inPeriod = isWithinPeriod(inv.invoice.details.date, period);
    const isCreditNote = inv.documentType === 'credit_note';

    // Period stats (invoiced this month/quarter/year)
    if (inPeriod) {
      if (isCreditNote) {
        totalInvoiced -= inv.total;
      } else {
        totalInvoiced += inv.total;
        invoiceCount++;
        // Collection stats for the ring
        if (inv.status === 'paid') {
          totalCollected += inv.total;
        }
      }
    }

    // Outstanding stats (all time, split current vs overdue)
    if (isCreditNote) {
      currentAmount -= inv.total;
    } else if ((inv.status || 'unpaid') === 'unpaid') {
      if (inv.dueDate && inv.dueDate < today) {
        overdueAmount += inv.total;
        overdueCount++;
      } else {
        currentAmount += inv.total;
        currentCount++;
      }
    }
  }

  // Outstanding can be negative (prepayments / credit notes exceeding invoices — valid scenario)
  const totalOutstanding = currentAmount + overdueAmount;

  return {
    totalInvoiced,
    invoiceCount,
    totalCollected,
    totalOutstanding,
    currentAmount,
    currentCount,
    overdueAmount,
    overdueCount,
  };
};

export const selectOverdueInvoices = (state: HistoryState) => {
  const today = getTodayISO();
  return state.invoices.filter(
    (inv) =>
      (inv.documentType || 'invoice') !== 'credit_note' &&
      (inv.status || 'unpaid') === 'unpaid' &&
      inv.dueDate &&
      inv.dueDate < today
  );
};

export const selectUnpaidInvoices = (state: HistoryState) =>
  state.invoices.filter(
    (inv) =>
      (inv.documentType || 'invoice') !== 'credit_note' &&
      (inv.status || 'unpaid') === 'unpaid'
  );

export const selectPaidInvoices = (state: HistoryState) =>
  state.invoices.filter(
    (inv) =>
      (inv.documentType || 'invoice') !== 'credit_note' &&
      inv.status === 'paid'
  );

// ===== Customer Selectors =====

export interface UniqueCustomer {
  name: string;
  email: string;
  address: string;
  postCode: string;
  invoiceCount: number;
  lastUsed: string;
}

/** All unique customers from invoice history, deduped by lowercase name, most recent wins */
export const selectUniqueCustomers = (state: HistoryState): UniqueCustomer[] => {
  const map = new Map<string, UniqueCustomer>();
  // Iterate oldest→newest so most recent entry overwrites
  for (let i = state.invoices.length - 1; i >= 0; i--) {
    const inv = state.invoices[i];
    const key = inv.customerName.toLowerCase().trim();
    if (!key) continue;
    const existing = map.get(key);
    map.set(key, {
      name: inv.invoice.customer.name,
      email: inv.invoice.customer.email || existing?.email || '',
      address: inv.invoice.customer.address,
      postCode: inv.invoice.customer.postCode,
      invoiceCount: (existing?.invoiceCount || 0) + 1,
      lastUsed: inv.savedAt,
    });
  }
  // Sort by most recently used
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
  );
};
