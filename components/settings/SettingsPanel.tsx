'use client';

import { motion, AnimatePresence } from 'framer-motion';
import TemplateSelector from './TemplateSelector';
import ColorPicker from './ColorPicker';
import NumberingSettings from './NumberingSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings Panel
 * Slide-out panel for invoice settings
 *
 * Contains:
 * - Template selection
 * - Brand color customization
 * - Invoice numbering
 */
export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md
              bg-[var(--surface-card)] shadow-2xl z-50
              flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Settings
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content — Apple iOS Settings grouped list style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* PDF Template */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                  PDF Appearance
                </h3>
                <div className="bg-[var(--surface-elevated)] rounded-xl p-4 space-y-6">
                  <TemplateSelector />
                  <ColorPicker />
                </div>
              </section>

              {/* Invoice Numbering */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                  Invoice Numbering
                </h3>
                <div className="bg-[var(--surface-elevated)] rounded-xl p-4">
                  <NumberingSettings />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--surface-border)]">
              <p className="text-xs text-[var(--text-muted)] text-center">
                Settings are saved automatically
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
