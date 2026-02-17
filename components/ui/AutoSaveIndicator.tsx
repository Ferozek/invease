'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoiceStore } from '@/stores/invoiceStore';

type SaveStatus = 'idle' | 'saving' | 'saved';

/**
 * AutoSaveIndicator - Apple-style save status indicator
 *
 * Shows subtle feedback for auto-save operations:
 * - "Saving..." briefly when data changes
 * - "Saved" with checkmark when persisted
 * - Fades out after a delay
 *
 * Follows Apple HIG principles:
 * - Non-intrusive status feedback
 * - Smooth, subtle animations
 * - Clear iconography
 */
export default function AutoSaveIndicator() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track when invoice data changes
  const handleStateChange = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    // Show saving state
    setStatus('saving');
    setVisible(true);

    // After 300ms, show saved state
    timeoutRef.current = setTimeout(() => {
      setStatus('saved');

      // Hide after 2 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        // Reset to idle after fade out
        setTimeout(() => setStatus('idle'), 300);
      }, 2000);
    }, 300);
  }, []);

  useEffect(() => {
    // Subscribe to invoice store changes
    const unsubscribe = useInvoiceStore.subscribe(handleStateChange);

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [handleStateChange]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          role="status"
          aria-live="polite"
        >
          {status === 'saving' ? (
            <>
              {/* Spinning indicator */}
              <motion.svg
                className="w-3.5 h-3.5 text-[var(--text-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="31.4 31.4"
                  strokeDashoffset="10"
                />
              </motion.svg>
              <span className="text-[var(--text-muted)]">Saving...</span>
            </>
          ) : (
            <>
              {/* Checkmark with pop-in animation */}
              <motion.svg
                className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </motion.svg>
              <span className="text-green-600 dark:text-green-400">Saved</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
