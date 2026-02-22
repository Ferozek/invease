'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Period = 'month' | 'quarter' | 'year';

export const PERIOD_LABELS: Record<Period, string> = {
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
};

/**
 * PeriodSwitcher — dropdown for selecting time period
 * Apple-style dropdown with animated transitions.
 */
export default function PeriodSwitcher({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((p: Period) => {
    onChange(p);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--surface-elevated)]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {PERIOD_LABELS[period]}
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-50 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl shadow-lg overflow-hidden min-w-[140px] max-w-[calc(100vw-2rem)]"
              role="listbox"
            >
              {(['month', 'quarter', 'year'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="option"
                  aria-selected={period === p}
                  onClick={() => handleSelect(p)}
                  className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    period === p
                      ? 'bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] font-medium'
                      : 'text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
