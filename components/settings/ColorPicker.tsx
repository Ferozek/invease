'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCompanyStore } from '@/stores/companyStore';

/**
 * Color Picker
 * Brand color customization for PDF header
 *
 * Features:
 * - Preset brand colors
 * - Custom hex input
 * - Live preview
 */

const PRESET_COLORS = [
  { name: 'K&R Blue', value: '#0b4f7a' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Forest', value: '#166534' },
  { name: 'Slate', value: '#475569' },
  { name: 'Purple', value: '#6b21a8' },
  { name: 'Burgundy', value: '#7f1d1d' },
];

export default function ColorPicker() {
  const customColor = useSettingsStore((state) => state.customPrimaryColor);
  const setCustomPrimaryColor = useSettingsStore((state) => state.setCustomPrimaryColor);
  const companyName = useCompanyStore((state) => state.companyName);
  const [inputValue, setInputValue] = useState(customColor || '#0b4f7a');

  const handleColorChange = (color: string) => {
    setInputValue(color);
    setCustomPrimaryColor(color);
  };

  const handleReset = () => {
    setInputValue('#0b4f7a');
    setCustomPrimaryColor(null);
  };

  const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue);
  const activeColor = isValidHex ? inputValue : '#0b4f7a';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="form-label">Brand Color</label>
        {customColor && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Reset to default
          </button>
        )}
      </div>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handleColorChange(color.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all
              ${inputValue === color.value
                ? 'border-[var(--text-primary)] scale-110'
                : 'border-transparent hover:scale-105'
              }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={color.name}
          />
        ))}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                setCustomPrimaryColor(value);
              }
            }}
            placeholder="#0b4f7a"
            className={`form-input pl-10 font-mono text-sm uppercase
              ${!isValidHex && inputValue.length > 0 ? 'form-input-error' : ''}`}
            maxLength={7}
          />
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-[var(--surface-border)]"
            style={{ backgroundColor: isValidHex ? inputValue : '#ccc' }}
          />
        </div>

        {/* Native color picker */}
        <label className="relative">
          <input
            type="color"
            value={isValidHex ? inputValue : '#0b4f7a'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sr-only"
          />
          <div className="w-10 h-10 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-elevated)]
            flex items-center justify-center cursor-pointer hover:bg-[var(--surface-card)] transition-colors">
            <svg
              className="w-5 h-5 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
              />
            </svg>
          </div>
        </label>
      </div>

      {/* Live mini PDF preview */}
      <div
        className="rounded-lg border border-[var(--surface-border)] overflow-hidden bg-white"
        aria-label="Invoice header preview"
      >
        {/* Header area */}
        <div className="px-3 pt-3 pb-2 flex items-start justify-between"
          style={{ borderBottom: `2px solid ${activeColor}` }}
        >
          <div>
            <p className="text-[11px] font-bold leading-tight" style={{ color: activeColor }}>
              {companyName || 'Your Company'}
            </p>
            <p className="text-[8px] text-gray-400 mt-0.5">123 Business St, London</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold leading-tight" style={{ color: activeColor }}>
              INVOICE
            </p>
            <p className="text-[8px] text-gray-500 mt-0.5">#INV-001</p>
          </div>
        </div>
        {/* Mini table header */}
        <div className="mx-3 mt-2 mb-3 rounded-sm flex gap-2 px-2 py-1"
          style={{ backgroundColor: activeColor }}
        >
          <span className="text-[7px] text-white font-medium flex-1">DESCRIPTION</span>
          <span className="text-[7px] text-white font-medium">QTY</span>
          <span className="text-[7px] text-white font-medium">TOTAL</span>
        </div>
      </div>
    </div>
  );
}
