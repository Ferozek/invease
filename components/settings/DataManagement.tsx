'use client';

import { useState, useCallback } from 'react';
import { downloadDataExport } from '@/lib/export/dataExport';
import { resetAllHints } from '@/components/ui/FirstRunHint';
import { PEEK_HINT_KEY } from '@/components/invoice/InvoiceHistoryItem';
import { toast } from 'sonner';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

/**
 * Data Management Settings
 * Export all data (GDPR portability), reset hints, and erase all data.
 * Apple HIG: grouped section with destructive action separated at bottom.
 */
export default function DataManagement() {
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);

  // Store actions for full erase
  const startOver = useCompanyStore((state) => state.startOver);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

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

  const handleEraseAllData = useCallback(() => {
    resetInvoice(false);
    sessionStorage.removeItem('invease-invoice-draft');
    clearHistory();
    resetSettings();
    startOver();
    setShowEraseConfirm(false);
    toast.success('All data erased', {
      description: 'The app has been reset to its initial state.',
    });
  }, [resetInvoice, clearHistory, resetSettings, startOver]);

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

      {/* Danger Zone — Apple HIG: destructive actions visually separated */}
      <div className="pt-3 border-t border-[var(--surface-border)]">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Permanently erase all data including company details, invoices, and settings.
          This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setShowEraseConfirm(true)}
          className="cursor-pointer w-full min-h-[44px] rounded-xl border border-[var(--brand-red)]/30
            text-[var(--brand-red)] text-sm font-semibold
            hover:bg-[var(--brand-red)]/10 active:scale-[0.98]
            transition-all duration-150"
        >
          Erase All Data
        </button>
      </div>

      <ConfirmDialog
        isOpen={showEraseConfirm}
        onClose={() => setShowEraseConfirm(false)}
        onConfirm={handleEraseAllData}
        title="Erase All Data?"
        message="This will permanently erase all your invoices, company details, settings, and numbering sequences. This action cannot be undone."
        confirmText="Erase Everything"
        cancelText="Cancel"
        isDestructive
        typeToConfirm="DELETE"
      />
    </div>
  );
}
