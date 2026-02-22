'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistoryStore, selectDashboardStats, type HistoryState } from '@/stores/historyStore';
import { formatCurrency } from '@/lib/formatters';
import Card from '@/components/ui/Card';
import CollectionRing from './CollectionRing';
import PeriodSwitcher, { type Period } from './PeriodSwitcher';

interface DashboardSummaryProps {
  onViewAll: () => void;
  onViewOverdue: () => void;
}

export default function DashboardSummary({ onViewAll, onViewOverdue }: DashboardSummaryProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('invease-dashboard-collapsed') === 'true';
  });

  const invoices = useHistoryStore((state) => state.invoices);
  const stats = useMemo(
    () => selectDashboardStats({ invoices } as HistoryState, period),
    [invoices, period]
  );

  // Don't render if no history
  if (invoices.length === 0) return null;

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('invease-dashboard-collapsed', String(next));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card variant="plain" className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="cursor-pointer flex items-center gap-2 group"
            aria-expanded={!isCollapsed}
            aria-controls="dashboard-content"
          >
            <svg
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                isCollapsed ? '-rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-blue)] transition-colors">
              Dashboard
            </h2>
          </button>

          {!isCollapsed && (
            <PeriodSwitcher period={period} onChange={setPeriod} />
          )}
        </div>

        {/* Content */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              id="dashboard-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Empty period state */}
              {stats.invoiceCount === 0 && stats.totalOutstanding <= 0 ? (
                <div className="text-center py-6">
                  <p className="text-base font-medium text-[var(--text-secondary)]">
                    No invoices {period === 'month' ? 'this month' : period === 'quarter' ? 'this quarter' : 'this year'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Create an invoice to see your stats here
                  </p>
                </div>
              ) : (
              <>
              {/* Collection Ring + Stat Cards */}
              <div className="flex items-start gap-4 mb-4">
                {stats.totalInvoiced > 0 && (
                  <CollectionRing
                    collected={stats.totalCollected}
                    invoiced={stats.totalInvoiced}
                  />
                )}

                {/* Stat Cards */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Invoiced Card */}
                  <div className="rounded-xl bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-[var(--text-muted)]">Invoiced</span>
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]" data-testid="invoiced-amount">
                      {formatCurrency(stats.totalInvoiced)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {stats.invoiceCount} {stats.invoiceCount === 1 ? 'invoice' : 'invoices'}
                    </p>
                  </div>

                  {/* Outstanding Card */}
                  <div className="rounded-xl bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        stats.totalOutstanding < 0
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : stats.overdueCount > 0
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {stats.totalOutstanding < 0 ? (
                          <svg className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        ) : (
                          <svg className={`w-3.5 h-3.5 ${
                            stats.overdueCount > 0
                              ? 'text-[#FF3B30] dark:text-[#FF453A]'
                              : 'text-[#FF9500] dark:text-[#FF9F0A]'
                          }`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {stats.totalOutstanding < 0 ? 'Credit Balance' : 'Outstanding'}
                      </span>
                    </div>
                    <p className={`text-xl font-bold ${
                      stats.totalOutstanding < 0
                        ? 'text-[#34C759] dark:text-[#30D158]'
                        : 'text-[var(--text-primary)]'
                    }`} data-testid="outstanding-amount">
                      {stats.totalOutstanding < 0
                        ? formatCurrency(Math.abs(stats.totalOutstanding))
                        : formatCurrency(stats.totalOutstanding)}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {stats.totalOutstanding < 0 && (
                        <p className="text-xs text-[#34C759] dark:text-[#30D158]" data-testid="credit-balance">
                          Customer has prepaid
                        </p>
                      )}
                      {stats.currentAmount > 0 && (
                        <p className="text-xs text-[#FF9500] dark:text-[#FF9F0A]" data-testid="current-amount">
                          {formatCurrency(stats.currentAmount)} current
                        </p>
                      )}
                      {stats.overdueAmount > 0 && (
                        <p className="text-xs font-medium text-[#FF3B30] dark:text-[#FF453A]" data-testid="overdue-amount">
                          {formatCurrency(stats.overdueAmount)} overdue
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onViewAll}
                  className="cursor-pointer flex-1 text-sm font-medium text-[var(--brand-blue)] hover:text-[var(--cta-secondary-hover)] transition-colors py-2 rounded-lg hover:bg-[var(--surface-elevated)]"
                >
                  View All
                </button>
                {stats.overdueCount > 0 && (
                  <button
                    type="button"
                    onClick={onViewOverdue}
                    className="cursor-pointer flex-1 text-sm font-medium text-[#FF3B30] dark:text-[#FF453A] hover:opacity-80 transition-opacity py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    data-testid="view-overdue-button"
                  >
                    View Overdue ({stats.overdueCount})
                  </button>
                )}
              </div>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
