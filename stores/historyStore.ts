/**
 * Invoice History Store
 * Manages saved invoices in localStorage
 *
 * Design: Separate from invoiceStore to maintain single responsibility
 * Persisted to localStorage with Zustand persist middleware
 */

import { useMemo } from 'react';
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
  // Payment tracking
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  amountPaid: number;
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

  // Customer notes (keyed by normalised lowercase name)
  customerNotes: Record<string, string>;

  // Actions
  saveInvoice: (invoice: InvoiceData, totals: InvoiceTotals) => string;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => SavedInvoice | undefined;
  clearHistory: () => void;

  // Payment actions
  markAsPaid: (id: string) => void;
  markAsUnpaid: (id: string) => void;
  recordPayment: (id: string, amount: number) => void;

  // Bulk actions
  bulkMarkAsPaid: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;

  // Customer actions
  addRecentCustomer: (customer: RecentCustomer) => void;
  getRecentCustomers: () => RecentCustomer[];
  mergeCustomers: (fromName: string, toName: string) => void;
  setCustomerNote: (customerName: string, note: string) => void;
  getCustomerNote: (customerName: string) => string;
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
      customerNotes: {},

      saveInvoice: (invoice, totals) => {
        const docType = invoice.details.documentType || 'invoice';
        const id = generateId(docType);
        const now = new Date().toISOString();
        const dueDate = calculateDueDate(invoice.details.date, invoice.details.paymentTerms);
        const savedInvoice: SavedInvoice = {
          id,
          invoice,
          totals,
          savedAt: now,
          customerName: invoice.customer.name,
          invoiceNumber: invoice.details.invoiceNumber,
          total: totals.total,
          documentType: docType,
          status: 'unpaid',
          dueDate,
          amountPaid: 0,
        };

        const recentCustomer: RecentCustomer = {
          name: invoice.customer.name,
          address: invoice.customer.address,
          postCode: invoice.customer.postCode,
          lastUsed: now,
        };

        // Single atomic state update — invoices + recent customer together
        set((state) => {
          const invoices = [savedInvoice, ...state.invoices].slice(0, MAX_INVOICES);
          const filtered = state.recentCustomers.filter(
            (c) => c.name.toLowerCase() !== recentCustomer.name.toLowerCase()
          );
          const recentCustomers = [recentCustomer, ...filtered].slice(0, MAX_RECENT_CUSTOMERS);
          return { invoices, recentCustomers };
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
        set({ invoices: [], recentCustomers: [], customerNotes: {} });
      },

      markAsPaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'paid' as PaymentStatus, paidDate: new Date().toISOString(), amountPaid: inv.total }
              : inv
          ),
        }));
      },

      markAsUnpaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: 'unpaid' as PaymentStatus, paidDate: undefined, amountPaid: 0 }
              : inv
          ),
        }));
      },

      bulkMarkAsPaid: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            idSet.has(inv.id)
              ? { ...inv, status: 'paid' as PaymentStatus, paidDate: new Date().toISOString(), amountPaid: inv.total }
              : inv
          ),
        }));
      },

      bulkDelete: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          invoices: state.invoices.filter((inv) => !idSet.has(inv.id)),
        }));
      },

      recordPayment: (id, amount) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const newAmountPaid = Math.min(inv.total, Math.max(0, (inv.amountPaid || 0) + amount));
            const isFullyPaid = newAmountPaid >= inv.total;
            return {
              ...inv,
              amountPaid: newAmountPaid,
              status: (isFullyPaid ? 'paid' : 'unpaid') as PaymentStatus,
              paidDate: isFullyPaid ? new Date().toISOString() : inv.paidDate,
            };
          }),
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

      setCustomerNote: (customerName, note) => {
        const key = customerName.toLowerCase().trim();
        if (!key) return;
        set((state) => ({
          customerNotes: { ...state.customerNotes, [key]: note },
        }));
      },

      getCustomerNote: (customerName) => {
        const key = customerName.toLowerCase().trim();
        return get().customerNotes[key] || '';
      },
    }),
    {
      name: 'invease-history',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState, version) => {
        const state = persistedState as { invoices?: SavedInvoice[]; customerNotes?: Record<string, string> };
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
        if (version < 4 && state.invoices) {
          // v3 → v4: Add amountPaid for partial payments
          state.invoices = state.invoices.map((inv) => ({
            ...inv,
            amountPaid: inv.status === 'paid' ? inv.total : 0,
          }));
        }
        if (version < 5) {
          // v4 → v5: Add customerNotes
          state.customerNotes = state.customerNotes || {};
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

// ===== Hook-based Selectors (React 19 safe) =====
// These wrap computed selectors so consumers don't need useMemo.
// See: "Zustand + React 19: selectors that return new objects cause infinite loops"

export function useDashboardStats(period: 'month' | 'quarter' | 'year' = 'month'): DashboardStats {
  const invoices = useHistoryStore((state) => state.invoices);
  return useMemo(() => selectDashboardStats({ invoices } as HistoryState, period), [invoices, period]);
}

export function useUniqueCustomers(): UniqueCustomer[] {
  const invoices = useHistoryStore((state) => state.invoices);
  return useMemo(() => selectUniqueCustomers({ invoices } as HistoryState), [invoices]);
}

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
    const paid = inv.amountPaid || 0;

    // Period stats (invoiced this month/quarter/year)
    if (inPeriod) {
      if (isCreditNote) {
        totalInvoiced -= inv.total;
      } else {
        totalInvoiced += inv.total;
        invoiceCount++;
        // Collection stats: use actual amount paid (supports partial payments)
        totalCollected += paid;
      }
    }

    // Outstanding stats (all time, split current vs overdue)
    // Credit notes only reduce outstanding if the related invoice is still unpaid.
    // If the related invoice is paid, the CN represents a refund — net effect is zero.
    if (isCreditNote) {
      const relatedInvNum = inv.invoice.details.creditNoteFields?.relatedInvoiceNumber;
      const relatedInvoice = relatedInvNum
        ? state.invoices.find((i) => i.invoiceNumber === relatedInvNum)
        : undefined;
      const relatedIsPaid = relatedInvoice?.status === 'paid';
      if (!relatedIsPaid) {
        currentAmount -= inv.total;
      }
    } else {
      const outstanding = inv.total - paid;
      if (outstanding > 0) {
        if (inv.dueDate && inv.dueDate < today) {
          overdueAmount += outstanding;
          overdueCount++;
        } else {
          currentAmount += outstanding;
          currentCount++;
        }
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
      (inv.amountPaid || 0) < inv.total &&
      inv.dueDate &&
      inv.dueDate < today
  );
};

export const selectUnpaidInvoices = (state: HistoryState) =>
  state.invoices.filter(
    (inv) =>
      (inv.documentType || 'invoice') !== 'credit_note' &&
      (inv.amountPaid || 0) < inv.total
  );

export const selectPaidInvoices = (state: HistoryState) =>
  state.invoices.filter(
    (inv) =>
      (inv.documentType || 'invoice') !== 'credit_note' &&
      (inv.amountPaid || 0) >= inv.total
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
