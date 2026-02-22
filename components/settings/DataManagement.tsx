'use client';

import { useCallback } from 'react';
import { downloadDataExport } from '@/lib/export/dataExport';
import { resetAllHints } from '@/components/ui/FirstRunHint';
import { PEEK_HINT_KEY } from '@/components/invoice/InvoiceHistoryItem';
import { toast } from 'sonner';

/**
 * Data Management Settings
 * Export all data (GDPR portability) from the Settings panel
 * Apple HIG: grouped section with clear action descriptions
 */
export default function DataManagement() {
  const handleExport = useCallback(() => {
    try {
      downloadDataExport();
      toast.success('Data exported', {
        description: 'Your data has been downloaded as JSON.',
      });
    } catch {
      toast.error('Export failed', {
        description: 'Could not export your data. Please try again.',
      });
    }
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)]">
        Download all your data including company details, invoice history, and settings.
        Bank details are excluded for security.
      </p>

      <button
        type="button"
        onClick={handleExport}
        className="cursor-pointer w-full min-h-[44px] rounded-xl border border-[var(--cta-ghost-border)]
          text-[var(--brand-blue)] text-sm font-semibold
          hover:bg-[var(--cta-muted-bg)] active:scale-[0.98]
          transition-all duration-150"
      >
        Export All Data (JSON)
      </button>

      <button
        type="button"
        onClick={() => {
          resetAllHints();
          try { localStorage.removeItem(PEEK_HINT_KEY); } catch { /* noop */ }
          toast.success('Hints reset', { description: 'Tutorial hints will show again.' });
        }}
        className="cursor-pointer w-full min-h-[44px] rounded-xl border border-[var(--surface-border)]
          text-[var(--text-secondary)] text-sm font-medium
          hover:bg-[var(--surface-elevated)] active:scale-[0.98]
          transition-all duration-150"
      >
        Reset Tutorial Hints
      </button>
    </div>
  );
}
