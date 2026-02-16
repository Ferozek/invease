'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  /** Key to listen for (e.g., 'p', 'n', 's') */
  key: string;
  /** Require Cmd/Ctrl modifier */
  meta?: boolean;
  /** Require Shift modifier */
  shift?: boolean;
  /** Require Alt/Option modifier */
  alt?: boolean;
  /** Callback when shortcut is triggered */
  action: () => void;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /** Description for help display */
  description?: string;
}

/**
 * useKeyboardShortcuts - Global keyboard shortcut handler
 *
 * Follows Apple HIG:
 * - Cmd+key for primary shortcuts (Mac)
 * - Ctrl+key for Windows/Linux
 * - Doesn't interfere with text input
 * - Avoids browser-reserved shortcuts (Cmd+P, Cmd+S, etc.)
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'd', meta: true, shift: true, action: handleDownload, description: 'Download PDF' },
 *   { key: 'n', meta: true, shift: true, action: handleNew, description: 'New Invoice' },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta
          ? event.metaKey || event.ctrlKey
          : !event.metaKey && !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (metaMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Keyboard shortcut definitions for the app
 *
 * Note: Avoids browser-reserved shortcuts:
 * - Cmd+P = Print (browser)
 * - Cmd+S = Save (browser)
 * - Cmd+N = New Window (browser)
 *
 * Uses Shift modifier to avoid conflicts:
 * - Cmd+Shift+D = Download PDF
 * - Cmd+Shift+N = New Invoice
 */
export const APP_SHORTCUTS = {
  DOWNLOAD_PDF: { key: 'd', meta: true, shift: true, description: 'Download PDF' },
  NEW_INVOICE: { key: 'n', meta: true, shift: true, description: 'New Invoice' },
  TOGGLE_THEME: { key: 't', meta: true, shift: true, description: 'Toggle Theme' },
  OPEN_SETTINGS: { key: ',', meta: true, description: 'Open Settings' },
  OPEN_PREVIEW: { key: 'p', meta: true, shift: true, description: 'Preview PDF' },
} as const;

export default useKeyboardShortcuts;
