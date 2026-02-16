'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  generateLineItemsCsv,
  generateSummaryCsv,
  downloadCsv,
} from '@/lib/export/csvExport';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface ExportMenuProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
}

/**
 * Export Menu
 * Apple-style dropdown for export options
 *
 * Features:
 * - Full keyboard navigation (Arrow keys, Home, End, Escape)
 * - 44px minimum touch targets
 * - Focus management
 *
 * Options:
 * - CSV (Line Items) - for accounting software import
 * - CSV (Summary) - single row summary
 */
export default function ExportMenu({ invoice, totals }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const menuItems = ['lineItems', 'summary'] as const;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus first item when menu opens
  useEffect(() => {
    if (isOpen && menuItemsRef.current[0]) {
      setFocusedIndex(0);
      menuItemsRef.current[0]?.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < menuItems.length - 1 ? prev + 1 : 0;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : menuItems.length - 1;
            menuItemsRef.current[next]?.focus();
            return next;
          });
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          menuItemsRef.current[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(menuItems.length - 1);
          menuItemsRef.current[menuItems.length - 1]?.focus();
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Tab':
          // Close menu on tab out
          setIsOpen(false);
          break;
      }
    },
    [isOpen, menuItems.length]
  );

  // Handle trigger keyboard
  const handleTriggerKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  }, []);

  const handleExportLineItems = () => {
    try {
      const csv = generateLineItemsCsv(invoice, totals);
      const filename = `invoice-${invoice.details.invoiceNumber}-line-items.csv`;
      downloadCsv(csv, filename);
      toast.success('CSV exported', {
        description: 'Line items exported successfully',
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Could not generate CSV file',
      });
    }
    setIsOpen(false);
  };

  const handleExportSummary = () => {
    try {
      const csv = generateSummaryCsv(invoice, totals);
      const filename = `invoice-${invoice.details.invoiceNumber}-summary.csv`;
      downloadCsv(csv, filename);
      toast.success('CSV exported', {
        description: 'Summary exported successfully',
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Could not generate CSV file',
      });
    }
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm font-medium
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          hover:bg-[var(--surface-elevated)] rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? 'export-menu' : undefined}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        Export
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          id="export-menu"
          className="absolute right-0 mt-1 w-56 z-50
            bg-[var(--surface-card)] border border-[var(--surface-border)]
            rounded-xl shadow-lg overflow-hidden"
          role="menu"
          aria-label="Export options"
        >
          <div className="px-3 py-2 border-b border-[var(--surface-border)]">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              Export As
            </p>
          </div>

          <div className="py-1">
            <button
              ref={(el) => { menuItemsRef.current[0] = el; }}
              type="button"
              onClick={handleExportLineItems}
              className="w-full px-3 py-3 min-h-[44px] text-left hover:bg-[var(--surface-elevated)]
                focus:bg-[var(--surface-elevated)] focus:outline-none
                flex items-center gap-3 transition-colors"
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30
                flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-sm text-[var(--text-primary)]">CSV (Line Items)</p>
                <p className="text-xs text-[var(--text-muted)]">Each line item as a row</p>
              </div>
            </button>

            <button
              ref={(el) => { menuItemsRef.current[1] = el; }}
              type="button"
              onClick={handleExportSummary}
              className="w-full px-3 py-3 min-h-[44px] text-left hover:bg-[var(--surface-elevated)]
                focus:bg-[var(--surface-elevated)] focus:outline-none
                flex items-center gap-3 transition-colors"
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30
                flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-sm text-[var(--text-primary)]">CSV (Summary)</p>
                <p className="text-xs text-[var(--text-muted)]">Single row with totals</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
