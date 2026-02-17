'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstRunHintProps {
  /** Unique key for this hint (stored in localStorage) */
  id: string;
  /** Title of the hint */
  title: string;
  /** Description text */
  description: string;
  /** Position relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (ms) */
  delay?: number;
  /** Auto-dismiss after (ms), 0 = manual dismiss only */
  autoDismiss?: number;
}

/**
 * FirstRunHint Component
 * Apple HIG: Onboarding callouts that appear once for new users
 * - Only shows once per user (stored in localStorage)
 * - Can be dismissed with click or auto-dismiss
 * - Subtle pulse animation to draw attention
 */
export default function FirstRunHint({
  id,
  title,
  description,
  position = 'bottom',
  delay = 500,
  autoDismiss = 0,
}: FirstRunHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `invease-hint-${id}`;

  // Define handleDismiss before it's used in useEffect
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  // Show hint after delay if not already shown
   
  useEffect(() => {
    // Check if hint was already shown
    const wasShown = localStorage.getItem(storageKey);
    if (wasShown) return;

    // Show after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(showTimer);
  }, [storageKey, delay]);

  // Auto-dismiss after specified time
  useEffect(() => {
    if (!isVisible || autoDismiss === 0) return;

    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismiss);

    return () => clearTimeout(dismissTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, autoDismiss]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--brand-blue)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--brand-blue)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--brand-blue)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--brand-blue)] border-y-transparent border-l-transparent',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-50 ${positionClasses[position]}`}
        >
          <div
            className="relative px-4 py-3 bg-[var(--brand-blue)] text-white rounded-xl shadow-lg max-w-xs cursor-pointer"
            onClick={handleDismiss}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleDismiss()}
          >
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-xl bg-[var(--brand-blue)] animate-ping opacity-20" />

            <p className="font-medium text-sm relative z-10">{title}</p>
            <p className="text-xs text-white/80 mt-1 relative z-10">{description}</p>
            <p className="text-[10px] text-white/60 mt-2 relative z-10">Click to dismiss</p>

            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Reset all hints (for testing)
 */
export function resetAllHints() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('invease-hint-'))
    .forEach((key) => localStorage.removeItem(key));
}
