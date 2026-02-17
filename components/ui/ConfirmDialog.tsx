'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import FocusTrap from './FocusTrap';

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether confirm action is destructive (red button) */
  isDestructive?: boolean;
}

/**
 * ConfirmDialog - Apple-style confirmation dialog
 *
 * Features:
 * - Smooth fade + scale animation
 * - Focus trap for accessibility
 * - Escape key to close
 * - Click outside to close
 * - Keyboard navigation
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // FocusTrap handles initial focus, but we track the trigger element for restoration
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store the trigger element when dialog opens
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap active={isOpen} returnFocus initialFocus="[data-cancel-button]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
          >
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full max-w-sm bg-[var(--surface-card)] rounded-2xl shadow-2xl overflow-hidden"
            >
            {/* Content */}
            <div className="p-6 text-center">
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-[var(--text-primary)] mb-2"
              >
                {title}
              </h2>
              <p
                id="dialog-description"
                className="text-sm text-[var(--text-secondary)]"
              >
                {message}
              </p>
            </div>

            {/* Actions - Apple style: stacked on mobile, side by side on larger */}
            <div className="border-t border-[var(--surface-border)] flex">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onClose}
                data-cancel-button
                className="cursor-pointer flex-1 px-4 py-3 text-[var(--brand-blue)] font-medium hover:bg-[var(--surface-elevated)] transition-colors border-r border-[var(--surface-border)] focus:outline-none focus:bg-[var(--surface-elevated)]"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`cursor-pointer flex-1 px-4 py-3 font-semibold transition-colors focus:outline-none ${
                  isDestructive
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20'
                    : 'text-[var(--brand-blue)] hover:bg-[var(--surface-elevated)] focus:bg-[var(--surface-elevated)]'
                }`}
              >
                {confirmText}
              </button>
            </div>
            </motion.div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    message: '',
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
      setConfig(options);
      setIsOpen(true);
      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
  }, []);

  return {
    isOpen,
    config,
    confirm,
    onClose: handleClose,
    onConfirm: handleConfirm,
  };
}

// Need to import useState for the hook
import { useState } from 'react';
