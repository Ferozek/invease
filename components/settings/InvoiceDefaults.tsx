'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import type { VatRate } from '@/types/invoice';

const VAT_OPTIONS: { value: VatRate; label: string }[] = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '20', label: '20%' },
  { value: 'reverse_charge', label: 'RC' },
];

/**
 * Invoice Defaults Settings
 * Configure default payment terms, VAT rate, and notes for new invoices
 * Apple HIG: grouped settings with segmented control for VAT rate
 */
export default function InvoiceDefaults() {
  const defaultPaymentTerms = useSettingsStore((s) => s.defaultPaymentTerms);
  const defaultVatRate = useSettingsStore((s) => s.defaultVatRate);
  const defaultNotes = useSettingsStore((s) => s.defaultNotes);
  const setDefaultPaymentTerms = useSettingsStore((s) => s.setDefaultPaymentTerms);
  const setDefaultVatRate = useSettingsStore((s) => s.setDefaultVatRate);
  const setDefaultNotes = useSettingsStore((s) => s.setDefaultNotes);

  return (
    <div className="space-y-4">
      {/* Payment Terms */}
      <div>
        <label
          htmlFor="default-payment-terms"
          className="block text-sm font-medium text-[var(--text-primary)] mb-1"
        >
          Payment Terms
        </label>
        <div className="flex items-center gap-2">
          <input
            id="default-payment-terms"
            type="number"
            min="0"
            max="365"
            value={defaultPaymentTerms}
            onChange={(e) => setDefaultPaymentTerms(e.target.value)}
            className="w-20 min-h-[44px] px-3 rounded-lg border border-[var(--surface-border)]
              bg-[var(--surface-card)] text-[var(--text-primary)] text-sm text-center
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/30"
          />
          <span className="text-sm text-[var(--text-secondary)]">days</span>
        </div>
      </div>

      {/* Default VAT Rate — Segmented Control (Apple style) */}
      <div>
        <span className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Default VAT Rate
        </span>
        <div
          className="inline-flex rounded-lg bg-[var(--surface-bg)] p-0.5"
          role="radiogroup"
          aria-label="Default VAT rate"
        >
          {VAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={defaultVatRate === opt.value}
              onClick={() => setDefaultVatRate(opt.value)}
              className={`min-h-[36px] min-w-[48px] px-3 rounded-md text-sm font-medium transition-all duration-150
                ${
                  defaultVatRate === opt.value
                    ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Default Notes */}
      <div>
        <label
          htmlFor="default-notes"
          className="block text-sm font-medium text-[var(--text-primary)] mb-1"
        >
          Default Notes
        </label>
        <textarea
          id="default-notes"
          value={defaultNotes}
          onChange={(e) => setDefaultNotes(e.target.value.slice(0, 2000))}
          placeholder="e.g. Thank you for your business"
          rows={3}
          maxLength={2000}
          className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[var(--surface-border)]
            bg-[var(--surface-card)] text-[var(--text-primary)] text-sm
            placeholder:text-[var(--text-muted)] resize-none
            focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/30"
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Added to every new invoice. {defaultNotes.length}/2000
        </p>
      </div>
    </div>
  );
}
