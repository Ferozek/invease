'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InvoiceHistoryItem, { PEEK_HINT_KEY } from './InvoiceHistoryItem';
import CustomerMergePanel from './CustomerMergePanel';

type FilterTab = 'all' | 'invoice' | 'credit_note';
export type StatusFilter = 'all' | 'unpaid' | 'overdue' | 'paid';

interface InvoiceHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (invoice: SavedInvoice) => void;
  onCreateCreditNote?: (invoice: SavedInvoice) => void;
  initialStatusFilter?: StatusFilter;
}

/**
 * Invoice History Panel — slide-out panel showing saved invoices with search
 *
 * Orchestrates: search, filtering, grouping, delete confirmation
 * Delegates: item rendering → InvoiceHistoryItem, payment UI → PaymentStatusRow
 */
export default function InvoiceHistoryPanel({
  isOpen,
  onClose,
  onDuplicate,
  onCreateCreditNote,
  initialStatusFilter,
}: InvoiceHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter || 'all');
  const [invoiceToDelete, setInvoiceToDelete] = useState<SavedInvoice | null>(null);
  const [showMergePanel, setShowMergePanel] = useState(false);
  const invoices = useHistoryStore((state) => state.invoices);
  const deleteInvoice = useHistoryStore((state) => state.deleteInvoice);
  const markAsPaid = useHistoryStore((state) => state.markAsPaid);
  const markAsUnpaid = useHistoryStore((state) => state.markAsUnpaid);

  // Derive state from props — official React pattern for adjusting state when props change
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
    if (!isOpen) {
      setSearchQuery('');
      setStatusFilter(initialStatusFilter || 'all');
    }
  }

  const handleDeleteRequest = useCallback((invoice: SavedInvoice) => {
    setInvoiceToDelete(invoice);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
    }
  }, [invoiceToDelete, deleteInvoice]);

  // Count badges for document type tabs
  const docTypeCounts = useMemo(() => {
    let invoiceCount = 0;
    let creditNoteCount = 0;
    for (const inv of invoices) {
      if (inv.documentType === 'credit_note') creditNoteCount++;
      else invoiceCount++;
    }
    return { all: invoices.length, invoice: invoiceCount, credit_note: creditNoteCount };
  }, [invoices]);

  // Count badges for status tabs
  const statusCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let docFiltered = invoices;
    if (filterTab === 'invoice') {
      docFiltered = invoices.filter((inv) => (inv.documentType || 'invoice') === 'invoice');
    } else if (filterTab === 'credit_note') {
      docFiltered = invoices.filter((inv) => inv.documentType === 'credit_note');
    }

    let unpaid = 0, overdue = 0, paid = 0;
    for (const inv of docFiltered) {
      if (inv.documentType === 'credit_note') continue;
      if (inv.status === 'paid') paid++;
      else if (inv.dueDate && inv.dueDate < today) { overdue++; unpaid++; }
      else unpaid++;
    }
    return { all: docFiltered.length, unpaid, overdue, paid };
  }, [invoices, filterTab]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let results = invoices;

    if (filterTab === 'invoice') {
      results = results.filter((inv) => (inv.documentType || 'invoice') === 'invoice');
    } else if (filterTab === 'credit_note') {
      results = results.filter((inv) => inv.documentType === 'credit_note');
    }

    if (statusFilter !== 'all') {
      results = results.filter((inv) => {
        if (inv.documentType === 'credit_note') return false;
        if (statusFilter === 'paid') return inv.status === 'paid';
        if (statusFilter === 'overdue') return (inv.status || 'unpaid') === 'unpaid' && inv.dueDate && inv.dueDate < today;
        if (statusFilter === 'unpaid') return (inv.status || 'unpaid') === 'unpaid';
        return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (inv) =>
          inv.customerName.toLowerCase().includes(query) ||
          inv.invoiceNumber.toLowerCase().includes(query)
      );
    }

    return results;
  }, [invoices, searchQuery, filterTab, statusFilter]);

  // Peek hint for first unpaid invoice
  const peekHintId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (localStorage.getItem(PEEK_HINT_KEY) === 'true') return null;
    } catch { return null; }
    const firstUnpaid = filteredInvoices.find(
      (inv) => (inv.documentType || 'invoice') !== 'credit_note' && (inv.status || 'unpaid') === 'unpaid'
    );
    return firstUnpaid?.id ?? null;
  }, [filteredInvoices]);

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
              bg-[var(--surface-card)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">History</h2>
              <div className="flex items-center gap-1">
                {/* Customers / Merge button */}
                {invoices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMergePanel(true)}
                    className="cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                    aria-label="Manage customers"
                    title="Customers"
                  >
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </button>
                )}
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
            </div>

            {/* Search + Filters */}
            <div className="p-4 border-b border-[var(--surface-border)] space-y-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl
                    bg-[var(--surface-elevated)] border border-[var(--surface-border)]
                    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                    focus:outline-none focus:border-[var(--brand-blue)]
                    focus:ring-2 focus:ring-[var(--brand-blue)]/40"
                />
              </div>

              {/* Document type filter tabs */}
              <div className="flex rounded-lg bg-[var(--surface-elevated)] p-0.5" role="tablist" aria-label="Document type">
                {([
                  { id: 'all' as FilterTab, label: 'All' },
                  { id: 'invoice' as FilterTab, label: 'Invoices' },
                  { id: 'credit_note' as FilterTab, label: 'Credit Notes' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={filterTab === tab.id}
                    onClick={() => {
                      setFilterTab(tab.id);
                      if (tab.id === 'credit_note') setStatusFilter('all');
                    }}
                    className={`cursor-pointer flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filterTab === tab.id
                        ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {tab.label}
                    {docTypeCounts[tab.id] > 0 && (
                      <span className={`ml-1 ${filterTab === tab.id ? 'text-[var(--text-muted)]' : ''}`}>
                        ({docTypeCounts[tab.id]})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Status filter tabs — hidden for credit notes */}
              {filterTab !== 'credit_note' && (
                <div className="flex rounded-lg bg-[var(--surface-elevated)] p-0.5" role="tablist" aria-label="Payment status">
                  {([
                    { id: 'all' as StatusFilter, label: 'All' },
                    { id: 'unpaid' as StatusFilter, label: 'Unpaid' },
                    { id: 'overdue' as StatusFilter, label: 'Overdue' },
                    { id: 'paid' as StatusFilter, label: 'Paid' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`cursor-pointer flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                        statusFilter === tab.id
                          ? tab.id === 'overdue'
                            ? 'bg-[var(--surface-card)] text-[var(--destructive-text)] shadow-sm'
                            : 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab.label}
                      {tab.id !== 'all' && statusCounts[tab.id] > 0 && (
                        <span className={`ml-1 ${
                          statusFilter === tab.id
                            ? tab.id === 'overdue' ? 'opacity-70' : 'text-[var(--text-muted)]'
                            : ''
                        }`}>
                          ({statusCounts[tab.id]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice List */}
            <div className="flex-1 overflow-y-auto">
              {Object.keys(groupedInvoices).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-4"
                  >
                    <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </motion.div>
                  <p className="text-[var(--text-secondary)] font-medium">No invoices yet</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {searchQuery ? 'Try a different search' : 'Save an invoice to see it here'}
                  </p>
                </div>
              ) : (
                Object.entries(groupedInvoices).map(([month, monthInvoices]) => (
                  <div key={month}>
                    <div className="px-4 py-2 bg-[var(--surface-elevated)] sticky top-0">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                        {month}
                      </p>
                    </div>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    >
                      {monthInvoices.map((inv) => (
                        <motion.div
                          key={inv.id}
                          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                          transition={{ duration: 0.2 }}
                        >
                          <InvoiceHistoryItem
                            invoice={inv}
                            onDuplicate={() => onDuplicate(inv)}
                            onDelete={() => handleDeleteRequest(inv)}
                            onMarkAsPaid={() => markAsPaid(inv.id)}
                            onMarkAsUnpaid={() => markAsUnpaid(inv.id)}
                            onCreateCreditNote={
                              onCreateCreditNote && (inv.documentType || 'invoice') === 'invoice'
                                ? () => onCreateCreditNote(inv)
                                : undefined
                            }
                            showPeekHint={inv.id === peekHintId}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={!!invoiceToDelete}
            onClose={() => setInvoiceToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Delete Invoice?"
            message={invoiceToDelete ? `This will permanently delete invoice #${invoiceToDelete.invoiceNumber} for ${invoiceToDelete.customerName}. This cannot be undone.` : ''}
            confirmText="Delete"
            cancelText="Keep"
            isDestructive
          />

          {/* Customer Merge Panel */}
          <CustomerMergePanel
            isOpen={showMergePanel}
            onClose={() => setShowMergePanel(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
