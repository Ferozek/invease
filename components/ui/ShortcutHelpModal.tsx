'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import KeyboardHint from './KeyboardHint';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    label: 'Document',
    shortcuts: [
      { keys: ['⌘', '⇧', 'D'], action: 'Download PDF' },
      { keys: ['⌘', '⇧', 'P'], action: 'Preview PDF' },
      { keys: ['⌘', '⇧', 'N'], action: 'New Invoice' },
    ],
  },
  {
    label: 'Edit',
    shortcuts: [
      { keys: ['⌘', 'Z'], action: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], action: 'Redo' },
    ],
  },
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['⌘', ','], action: 'Open Settings' },
      { keys: ['?'], action: 'Show Shortcuts' },
    ],
  },
];

/**
 * ShortcutHelpModal — Full-screen overlay showing all keyboard shortcuts
 * Apple HIG: Clean list grouped by category, dismiss on Escape or backdrop click
 */
export default function ShortcutHelpModal({ isOpen, onClose }: ShortcutHelpModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus when open
  const [isMac, setIsMac] = useState(true);
  // Detect platform - setState is intentional for client detection
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-[var(--surface-card)] border border-[var(--surface-border)]
              rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full
                  text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] transition-colors"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>

            {/* Shortcut Groups */}
            <div className="px-5 pb-5 space-y-4">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.action}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-[var(--text-primary)]">
                          {shortcut.action}
                        </span>
                        <KeyboardHint
                          keys={shortcut.keys}
                          action=""
                          showOnMobile
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-[var(--surface-border)] bg-[var(--surface-elevated)]">
              <p className="text-xs text-[var(--text-muted)] text-center">
                {isMac ? '⌘' : 'Ctrl'} = {isMac ? 'Command' : 'Control'} key
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
