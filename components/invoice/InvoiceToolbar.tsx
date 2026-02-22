'use client';

import ExportMenu from './ExportMenu';
import ShareButton from './ShareButton';
import AutoSaveIndicator from '@/components/ui/AutoSaveIndicator';
import { ExpandIcon, HistoryIcon, SettingsIcon } from '@/components/ui/icons';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, title, ariaLabel, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]
        hover:bg-[var(--surface-elevated)] transition-colors"
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

interface InvoiceToolbarProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
  onOpenPreview: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

/**
 * InvoiceToolbar - Preview section header with action buttons
 *
 * Actions:
 * - Full Preview (Cmd+Shift+P)
 * - Export Menu (CSV)
 * - History Panel
 * - Settings Panel (Cmd+,)
 */
export default function InvoiceToolbar({
  invoice,
  totals,
  onOpenPreview,
  onOpenHistory,
  onOpenSettings,
}: InvoiceToolbarProps) {
  const isCreditNote = invoice.details.documentType === 'credit_note';

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {isCreditNote ? 'Credit Note' : 'Invoice'} Preview
        </h2>
        <AutoSaveIndicator />
      </div>
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={onOpenPreview}
          title="Full Preview (⌘⇧P)"
          ariaLabel="Open full PDF preview"
        >
          <ExpandIcon />
        </ToolbarButton>
        <ExportMenu invoice={invoice} totals={totals} />
        <ShareButton invoice={invoice} totals={totals} />
        <ToolbarButton
          onClick={onOpenHistory}
          title="Invoice History"
          ariaLabel="Open invoice history"
        >
          <HistoryIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={onOpenSettings}
          title="Settings (⌘,)"
          ariaLabel="Open settings"
        >
          <SettingsIcon />
        </ToolbarButton>
      </div>
    </div>
  );
}
