'use client';

import ExportMenu from './ExportMenu';
import ShareButton from './ShareButton';
import AutoSaveIndicator from '@/components/ui/AutoSaveIndicator';
import { ExpandIcon, HistoryIcon, SettingsIcon } from '@/components/ui/icons';
import { useInvoiceHistory } from '@/stores/invoiceStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  ariaLabel: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, title, ariaLabel, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center
        rounded-lg transition-colors ${
          disabled
            ? 'text-[var(--text-muted)] opacity-30 cursor-default'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
        }`}
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
 * InvoiceToolbar - Preview section header with document action buttons
 *
 * Actions (document-level only, per Apple HIG):
 * - Full Preview (Cmd+Shift+P)
 * - Export Menu (CSV)
 * - Share
 * - History Panel
 * - Settings Panel (Cmd+,)
 *
 * Note: "New Invoice" is app-level (⌘⇧N), not a document action.
 */
export default function InvoiceToolbar({
  invoice,
  totals,
  onOpenPreview,
  onOpenHistory,
  onOpenSettings,
}: InvoiceToolbarProps) {
  const isCreditNote = invoice.details.documentType === 'credit_note';
  const { canUndo, canRedo, undo, redo } = useInvoiceHistory();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {isCreditNote ? 'Credit Note' : 'Invoice'} Preview
        </h2>
        <AutoSaveIndicator />
      </div>
      <div className="flex items-center gap-1">
        {/* Undo/Redo — visible buttons for discoverability */}
        <ToolbarButton
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          ariaLabel="Undo last change"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          ariaLabel="Redo last change"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </ToolbarButton>
        <div className="w-px h-5 bg-[var(--surface-border)] mx-0.5" />
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
