'use client';

import { useState, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  NUMBERING_PRESETS,
  validatePattern,
  previewPattern,
} from '@/lib/invoiceNumbering';

/**
 * Numbering Settings
 * Configure invoice number pattern
 *
 * Features:
 * - Preset patterns
 * - Custom pattern input
 * - Live preview
 * - Yearly reset option
 */
export default function NumberingSettings() {
  const numbering = useSettingsStore((state) => state.numbering);
  const setNumberingConfig = useSettingsStore((state) => state.setNumberingConfig);

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const match = NUMBERING_PRESETS.find((p) => p.pattern === numbering.pattern);
    return match?.id || 'custom';
  });

  // Live preview
  const preview = useMemo(() => {
    const validation = validatePattern(numbering.pattern);
    if (!validation.valid) return [];
    return previewPattern(numbering.pattern, numbering.prefix, 3);
  }, [numbering.pattern, numbering.prefix]);

  const validation = useMemo(
    () => validatePattern(numbering.pattern),
    [numbering.pattern]
  );

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = NUMBERING_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setNumberingConfig({ pattern: preset.pattern });
    }
  };

  return (
    <div className="space-y-4">
      <label className="form-label">Invoice Numbering</label>

      {/* Preset selector */}
      <div className="flex flex-wrap gap-2">
        {NUMBERING_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetChange(preset.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${selectedPreset === preset.id
                ? 'bg-[var(--brand-blue)] text-white'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--brand-blue-50)]'
              }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Prefix</label>
          <input
            type="text"
            value={numbering.prefix}
            onChange={(e) => setNumberingConfig({ prefix: e.target.value.toUpperCase() })}
            placeholder="INV"
            className="form-input text-sm"
            maxLength={10}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Start Number</label>
          <input
            type="number"
            value={numbering.startNumber}
            onChange={(e) => setNumberingConfig({ startNumber: parseInt(e.target.value) || 1 })}
            min={1}
            className="form-input text-sm"
          />
        </div>
      </div>

      {/* Pattern input (for custom) */}
      {selectedPreset === 'custom' && (
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Pattern</label>
          <input
            type="text"
            value={numbering.pattern}
            onChange={(e) => setNumberingConfig({ pattern: e.target.value })}
            placeholder="{PREFIX}-{SEQ:4}"
            className={`form-input text-sm font-mono ${!validation.valid ? 'form-input-error' : ''}`}
          />
          {!validation.valid && (
            <p className="text-xs text-red-500 mt-1">{validation.error}</p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Tokens: {'{PREFIX}'}, {'{YEAR}'}, {'{YY}'}, {'{MONTH}'}, {'{SEQ}'}, {'{SEQ:n}'}
          </p>
        </div>
      )}

      {/* Reset yearly toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={numbering.resetYearly}
          onChange={(e) => setNumberingConfig({ resetYearly: e.target.checked })}
          className="w-4 h-4 rounded border-[var(--input-border)] text-[var(--brand-blue)]
            focus:ring-[var(--brand-blue)]"
        />
        <span className="text-sm text-[var(--text-secondary)]">
          Reset sequence number each year
        </span>
      </label>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="p-3 rounded-lg bg-[var(--surface-elevated)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Preview (next 3):</p>
          <div className="flex flex-wrap gap-2">
            {preview.map((num, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded bg-[var(--surface-card)] text-sm font-mono
                  text-[var(--text-primary)] border border-[var(--surface-border)]"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
