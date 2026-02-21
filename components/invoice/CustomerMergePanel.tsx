'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore, selectUniqueCustomers, type HistoryState } from '@/stores/historyStore';
import { findDuplicateCustomers, type MergeSuggestion } from '@/lib/customerMatching';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface CustomerMergePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Customer Merge Panel — Apple Contacts "merge duplicates" pattern
 *
 * Shows:
 * 1. Auto-detected duplicates with "Merge" button
 * 2. Full customer list with manual merge (select two → merge)
 *
 * All client-side — updates customerName across all invoices in localStorage.
 */
export default function CustomerMergePanel({ isOpen, onClose }: CustomerMergePanelProps) {
  const invoices = useHistoryStore((state) => state.invoices);
  const mergeCustomers = useHistoryStore((state) => state.mergeCustomers);
  const [mergeConfirm, setMergeConfirm] = useState<{ from: string; to: string } | null>(null);
  const [manualFrom, setManualFrom] = useState<string | null>(null);

  // All unique customers
  const customers = useMemo(
    () => selectUniqueCustomers({ invoices } as HistoryState),
    [invoices]
  );

  // Auto-detected duplicates
  const suggestions = useMemo(
    () => findDuplicateCustomers(customers.map((c) => c.name)),
    [customers]
  );

  const handleMerge = useCallback(() => {
    if (mergeConfirm) {
      mergeCustomers(mergeConfirm.from, mergeConfirm.to);
      setMergeConfirm(null);
      setManualFrom(null);
    }
  }, [mergeConfirm, mergeCustomers]);

  const handleManualSelect = useCallback((name: string) => {
    if (!manualFrom) {
      setManualFrom(name);
    } else if (manualFrom === name) {
      setManualFrom(null);
    } else {
      // Second selection — show merge confirmation (keep the one with more invoices)
      const fromCustomer = customers.find((c) => c.name === manualFrom);
      const toCustomer = customers.find((c) => c.name === name);
      const keepName = (toCustomer?.invoiceCount || 0) >= (fromCustomer?.invoiceCount || 0) ? name : manualFrom;
      const removeName = keepName === name ? manualFrom : name;
      setMergeConfirm({ from: removeName, to: keepName });
    }
  }, [manualFrom, customers]);

  // Count invoices for a given name
  const invoiceCountFor = useCallback((name: string) => {
    return customers.find((c) => c.name === name)?.invoiceCount || 0;
  }, [customers]);

  if (customers.length < 2) return null; // Need at least 2 customers to merge

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md
              bg-[var(--surface-card)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Customers</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Auto-detected duplicates */}
              {suggestions.length > 0 && (
                <div className="p-4 border-b border-[var(--surface-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#FF9500]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Possible duplicates
                    </p>
                  </div>

                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <DuplicateSuggestion
                        key={`${s.nameA}|${s.nameB}`}
                        suggestion={s}
                        countA={invoiceCountFor(s.nameA)}
                        countB={invoiceCountFor(s.nameB)}
                        onMerge={(from, to) => setMergeConfirm({ from, to })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Manual merge — tap to select, tap another to merge */}
              <div className="p-4">
                {manualFrom && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[var(--brand-blue-50)] border border-[var(--brand-blue)]/20">
                    <p className="text-xs text-[var(--brand-blue)]">
                      Merging <strong>{manualFrom}</strong> — tap another customer to merge into
                    </p>
                    <button
                      type="button"
                      onClick={() => setManualFrom(null)}
                      className="cursor-pointer text-xs text-[var(--text-muted)] mt-1 hover:text-[var(--text-secondary)]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!manualFrom && !suggestions.length && (
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Tap a customer to start merging, then tap another to combine them.
                  </p>
                )}

                <ul className="space-y-1">
                  {customers.map((c) => (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => handleManualSelect(c.name)}
                        className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                          manualFrom === c.name
                            ? 'bg-[var(--brand-blue)] text-white shadow-sm'
                            : manualFrom
                              ? 'bg-[var(--surface-elevated)] hover:bg-[var(--brand-blue-50)] border border-transparent hover:border-[var(--brand-blue)]/20'
                              : 'hover:bg-[var(--surface-elevated)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${
                            manualFrom === c.name ? 'text-white' : 'text-[var(--text-primary)]'
                          }`}>
                            {c.name}
                          </p>
                          <span className={`text-xs ${
                            manualFrom === c.name ? 'text-white/70' : 'text-[var(--text-muted)]'
                          }`}>
                            {c.invoiceCount} {c.invoiceCount === 1 ? 'invoice' : 'invoices'}
                          </span>
                        </div>
                        {c.postCode && (
                          <p className={`text-xs mt-0.5 ${
                            manualFrom === c.name ? 'text-white/60' : 'text-[var(--text-muted)]'
                          }`}>
                            {c.postCode}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Merge Confirmation */}
          <ConfirmDialog
            isOpen={!!mergeConfirm}
            onClose={() => { setMergeConfirm(null); setManualFrom(null); }}
            onConfirm={handleMerge}
            title="Merge Customers?"
            message={mergeConfirm
              ? `All invoices for "${mergeConfirm.from}" will be renamed to "${mergeConfirm.to}". This updates ${invoiceCountFor(mergeConfirm.from)} invoice${invoiceCountFor(mergeConfirm.from) === 1 ? '' : 's'}.`
              : ''}
            confirmText="Merge"
            cancelText="Cancel"
          />
        </>
      )}
    </AnimatePresence>
  );
}

// ===== Duplicate Suggestion Card =====

function DuplicateSuggestion({
  suggestion,
  countA,
  countB,
  onMerge,
}: {
  suggestion: MergeSuggestion;
  countA: number;
  countB: number;
  onMerge: (from: string, to: string) => void;
}) {
  // Keep the name with more invoices by default
  const keepName = countA >= countB ? suggestion.nameA : suggestion.nameB;
  const removeName = keepName === suggestion.nameA ? suggestion.nameB : suggestion.nameA;

  return (
    <div className="rounded-xl bg-[var(--surface-elevated)] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
        {suggestion.reason}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--text-primary)]">{suggestion.nameA}</span>
        <span className="text-xs text-[var(--text-muted)]">({countA})</span>
        <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        <span className="font-medium text-[var(--text-primary)]">{suggestion.nameB}</span>
        <span className="text-xs text-[var(--text-muted)]">({countB})</span>
      </div>
      <button
        type="button"
        onClick={() => onMerge(removeName, keepName)}
        className="cursor-pointer mt-2 text-xs font-medium text-[var(--brand-blue)] hover:text-[var(--cta-secondary-hover)] transition-colors"
      >
        Merge into &ldquo;{keepName}&rdquo;
      </button>
    </div>
  );
}
