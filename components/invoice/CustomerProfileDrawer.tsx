'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import { formatCurrency } from '@/lib/formatters';

interface CustomerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  customerName: string;
  onDuplicate?: (invoice: SavedInvoice) => void;
}

/**
 * CustomerProfileDrawer — slide-out panel showing all invoices + stats for a customer
 *
 * Apple Contacts style: name at top, stats summary, then a chronological list of invoices.
 */
export default function CustomerProfileDrawer({
  isOpen,
  onClose,
  onBack,
  customerName,
  onDuplicate,
}: CustomerProfileDrawerProps) {
  const invoices = useHistoryStore((state) => state.invoices);
  const getCustomerNote = useHistoryStore((state) => state.getCustomerNote);
  const setCustomerNote = useHistoryStore((state) => state.setCustomerNote);

  // Sync note text when customer changes (React "derive state from props" pattern)
  const [noteText, setNoteText] = useState('');
  const [prevCustomer, setPrevCustomer] = useState(customerName);
  if (customerName !== prevCustomer) {
    setPrevCustomer(customerName);
    setNoteText(customerName ? getCustomerNote(customerName) : '');
  }

  // All invoices for this customer (case-insensitive match)
  const customerInvoices = useMemo(() => {
    if (!customerName) return [];
    const lowerName = customerName.toLowerCase().trim();
    return invoices.filter(
      (inv) => inv.customerName.toLowerCase().trim() === lowerName
    );
  }, [invoices, customerName]);

  // Stats
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let invoiceCount = 0;
    let creditNoteCount = 0;

    for (const inv of customerInvoices) {
      if (inv.documentType === 'credit_note') {
        totalInvoiced -= inv.total;
        creditNoteCount++;
      } else {
        totalInvoiced += inv.total;
        totalPaid += inv.amountPaid || 0;
        invoiceCount++;
      }
    }

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      invoiceCount,
      creditNoteCount,
    };
  }, [customerInvoices]);

  // Customer details from most recent invoice
  const latestInvoice = customerInvoices[0];
  const customerAddress = latestInvoice?.invoice.customer.address || '';
  const customerPostCode = latestInvoice?.invoice.customer.postCode || '';
  const customerEmail = latestInvoice?.invoice.customer.email || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md
              bg-[var(--surface-card)] shadow-2xl z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <div className="flex items-center gap-2 min-w-0">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="cursor-pointer flex items-center gap-0.5 -ml-1 px-1 py-1 rounded-lg
                      hover:bg-[var(--surface-elevated)] transition-colors shrink-0
                      min-w-[44px] min-h-[44px] justify-center"
                    aria-label="Back to Customers"
                  >
                    <svg className="w-5 h-5 text-[var(--brand-blue)]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    <span className="text-[var(--brand-blue)] text-sm font-normal">Customers</span>
                  </button>
                )}
                <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                  {customerName}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-4 border-b border-[var(--surface-border)]">
              <div className="text-sm text-[var(--text-secondary)] space-y-0.5">
                {customerAddress && <p>{customerAddress}</p>}
                {customerPostCode && <p>{customerPostCode}</p>}
                {customerEmail && (
                  <p className="text-[var(--brand-blue)]">{customerEmail}</p>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 border-b border-[var(--surface-border)]">
              <div className="bg-[var(--surface-elevated)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)]">Total Invoiced</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {formatCurrency(stats.totalInvoiced)}
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)]">Total Paid</p>
                <p className="text-lg font-semibold text-[#34C759]">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)]">Outstanding</p>
                <p className={`text-lg font-semibold ${
                  stats.outstanding < 0
                    ? 'text-[#34C759]'
                    : stats.outstanding > 0
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]'
                }`}>
                  {stats.outstanding < 0
                    ? `${formatCurrency(Math.abs(stats.outstanding))} credit`
                    : formatCurrency(stats.outstanding)
                  }
                </p>
              </div>
              <div className="bg-[var(--surface-elevated)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)]">Documents</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {stats.invoiceCount}
                  {stats.creditNoteCount > 0 && (
                    <span className="text-xs font-normal text-[var(--text-muted)]"> + {stats.creditNoteCount} CN</span>
                  )}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="px-4 py-3 border-b border-[var(--surface-border)]">
              <label className="text-xs font-medium text-[var(--text-muted)] block mb-1.5">
                Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 500);
                  setNoteText(val);
                  setCustomerNote(customerName, val);
                }}
                placeholder="Add a note about this customer..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm
                  bg-[var(--surface-elevated)] border border-[var(--surface-border)]
                  text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                  focus:outline-none focus:border-[var(--brand-blue)]
                  focus:ring-2 focus:ring-[var(--brand-blue)]/40
                  resize-none"
              />
            </div>

            {/* Invoice List */}
            <div className="flex-1 overflow-y-auto">
              {customerInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-[var(--text-muted)]">No invoices found</p>
                </div>
              ) : (
                customerInvoices.map((inv) => {
                  const isCreditNote = inv.documentType === 'credit_note';
                  const isFullyPaid = (inv.amountPaid || 0) >= inv.total;
                  const isOverdue = !isFullyPaid && !isCreditNote && inv.dueDate && inv.dueDate < new Date().toISOString().split('T')[0];
                  const isPartial = !isCreditNote && (inv.amountPaid || 0) > 0 && !isFullyPaid;

                  return (
                    <div
                      key={inv.id}
                      className="px-4 py-3 border-b border-[var(--surface-border)] hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              #{inv.invoiceNumber}
                            </span>
                            {isCreditNote && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                                CN
                              </span>
                            )}
                            {!isCreditNote && isFullyPaid && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                                Paid
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                                Overdue
                              </span>
                            )}
                            {isPartial && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                                Partial
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {new Date(inv.savedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatCurrency(inv.total)}
                          </span>
                          {onDuplicate && (
                            <button
                              type="button"
                              onClick={() => onDuplicate(inv)}
                              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg
                                hover:bg-[var(--brand-blue-50)] text-[var(--brand-blue)] transition-colors"
                              aria-label={`Duplicate ${inv.invoiceNumber}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
