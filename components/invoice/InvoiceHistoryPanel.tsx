'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { formatCurrency } from '@/lib/formatters';
import Button from '@/components/ui/Button';

interface InvoiceHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (invoice: SavedInvoice) => void;
}

/**
 * Invoice History Panel
 * Slide-out panel showing saved invoices with search
 *
 * Apple-style design:
 * - Slide from right
 * - Search with instant filtering
 * - Grouped by date
 */
export default function InvoiceHistoryPanel({
  isOpen,
  onClose,
  onDuplicate,
}: InvoiceHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const invoices = useHistoryStore((state) => state.invoices);
  const deleteInvoice = useHistoryStore((state) => state.deleteInvoice);

  // Filter invoices by search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.customerName.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  // Group by month
  const groupedInvoices = useMemo(() => {
    const groups: Record<string, SavedInvoice[]> = {};
    for (const inv of filteredInvoices) {
      const date = new Date(inv.savedAt);
      const key = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(inv);
    }
    return groups;
  }, [filteredInvoices]);

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
              bg-[var(--surface-card)] shadow-2xl z-50
              flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Invoice History
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[var(--surface-border)]">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl
                    bg-[var(--surface-elevated)] border border-[var(--surface-border)]
                    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                    focus:outline-none focus:border-[var(--brand-blue)]
                    focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                />
              </div>
            </div>

            {/* Invoice List */}
            <div className="flex-1 overflow-y-auto">
              {Object.keys(groupedInvoices).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {/* Floating animation for empty state icon */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: 'easeInOut',
                    }}
                    className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-4"
                  >
                    <svg
                      className="w-8 h-8 text-[var(--text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </motion.div>
                  <p className="text-[var(--text-secondary)] font-medium">No invoices yet</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {searchQuery ? 'Try a different search' : 'Save an invoice to see it here'}
                  </p>
                </div>
              ) : (
                Object.entries(groupedInvoices).map(([month, invoices]) => (
                  <div key={month}>
                    {/* Month header */}
                    <div className="px-4 py-2 bg-[var(--surface-elevated)] sticky top-0">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                        {month}
                      </p>
                    </div>

                    {/* Invoices in month - staggered animation */}
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                    >
                      {invoices.map((inv, index) => (
                        <motion.div
                          key={inv.id}
                          variants={{
                            hidden: { opacity: 0, x: 20 },
                            visible: { opacity: 1, x: 0 },
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <InvoiceHistoryItem
                            invoice={inv}
                            onDuplicate={() => onDuplicate(inv)}
                            onDelete={() => deleteInvoice(inv.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ===== Invoice Item Component =====

interface InvoiceHistoryItemProps {
  invoice: SavedInvoice;
  onDuplicate: () => void;
  onDelete: () => void;
}

function InvoiceHistoryItem({ invoice, onDuplicate, onDelete }: InvoiceHistoryItemProps) {
  const [showActions, setShowActions] = useState(false);

  const formattedDate = new Date(invoice.savedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      className="px-4 py-3 border-b border-[var(--surface-border)] hover:bg-[var(--surface-elevated)]
        transition-colors relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {invoice.customerName}
            </p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
              #{invoice.invoiceNumber}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {formattedDate} · {formatCurrency(invoice.total)}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-[var(--brand-blue-50)] text-[var(--brand-blue)]
              transition-colors"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500
              transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
