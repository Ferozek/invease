'use client';

import { useEffect, useState } from 'react';

interface KeyboardHintProps {
  /** Keyboard shortcut keys (e.g., ['⌘', 'Enter']) */
  keys: string[];
  /** Action description */
  action: string;
  /** Show on mobile? */
  showOnMobile?: boolean;
}

/**
 * KeyboardHint Component
 * Apple HIG: Show keyboard shortcuts to power users
 * - Only shows on devices with keyboards
 * - Uses platform-appropriate symbols (⌘ on Mac, Ctrl on Windows)
 */
export default function KeyboardHint({
  keys,
  action,
  showOnMobile = false,
}: KeyboardHintProps) {
  const [isMac, setIsMac] = useState(true);
  const [hasKeyboard, setHasKeyboard] = useState(true);

  // Detect platform and keyboard - setState is intentional for client detection
  useEffect(() => {
    // Detect platform
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(navigator.platform.toLowerCase().includes('mac'));

    // Detect if device likely has keyboard (not touch-only)
    const hasMouse = window.matchMedia('(hover: hover)').matches;
     
    setHasKeyboard(hasMouse);
  }, []);

  // Don't show on mobile unless explicitly enabled
  if (!hasKeyboard && !showOnMobile) {
    return null;
  }

  // Convert keys to platform-appropriate symbols
  const platformKeys = keys.map((key) => {
    if (key === '⌘' || key === 'Cmd') return isMac ? '⌘' : 'Ctrl';
    if (key === '⌥' || key === 'Alt' || key === 'Option') return isMac ? '⌥' : 'Alt';
    if (key === '⇧' || key === 'Shift') return '⇧';
    return key;
  });

  return (
    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
      <span className="inline-flex items-center gap-0.5">
        {platformKeys.map((key, index) => (
          <kbd
            key={index}
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-medium bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </span>
      <span>{action}</span>
    </span>
  );
}

/**
 * Common keyboard shortcuts for the app
 */
export const SHORTCUTS = {
  downloadPdf: { keys: ['⌘', 'D'], action: 'to download PDF' },
  newInvoice: { keys: ['⌘', 'N'], action: 'for new invoice' },
  save: { keys: ['⌘', 'S'], action: 'to save' },
  addLineItem: { keys: ['⌘', 'Enter'], action: 'to add line item' },
};
