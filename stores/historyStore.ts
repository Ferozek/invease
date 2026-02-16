/**
 * Invoice History Store
 * Manages saved invoices in localStorage
 *
 * Design: Separate from invoiceStore to maintain single responsibility
 * Persisted to localStorage with Zustand persist middleware
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

// ===== Types =====

export interface SavedInvoice {
  id: string;
  invoice: InvoiceData;
  totals: InvoiceTotals;
  savedAt: string;
  // Searchable fields (denormalized for performance)
  customerName: string;
  invoiceNumber: string;
  total: number;
}

export interface RecentCustomer {
  name: string;
  address: string;
  postCode: string;
  lastUsed: string;
}

interface HistoryState {
  // Saved invoices (most recent first)
  invoices: SavedInvoice[];

  // Recent customers (last 5)
  recentCustomers: RecentCustomer[];

  // Actions
  saveInvoice: (invoice: InvoiceData, totals: InvoiceTotals) => string;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => SavedInvoice | undefined;
  clearHistory: () => void;

  // Customer actions
  addRecentCustomer: (customer: RecentCustomer) => void;
  getRecentCustomers: () => RecentCustomer[];
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
        const id = generateId();
        const savedInvoice: SavedInvoice = {
          id,
          invoice,
          totals,
          savedAt: new Date().toISOString(),
          customerName: invoice.customer.name,
          invoiceNumber: invoice.details.invoiceNumber,
          total: totals.total,
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
    }),
    {
      name: 'invease-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ===== Helpers =====

function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ===== Selectors (for performance) =====

export const selectInvoiceCount = (state: HistoryState) => state.invoices.length;

export const selectRecentInvoices = (state: HistoryState, limit = 10) =>
  state.invoices.slice(0, limit);

export const searchInvoices = (state: HistoryState, query: string) => {
  const lowerQuery = query.toLowerCase();
  return state.invoices.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(lowerQuery) ||
      inv.invoiceNumber.toLowerCase().includes(lowerQuery)
  );
};
