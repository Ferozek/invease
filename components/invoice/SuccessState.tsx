'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface SuccessStateProps {
  invoiceNumber: string;
  onCreateAnother: () => void;
  onStayHere: () => void;
}

/**
 * SuccessState - Apple-style success animation after PDF download
 *
 * Features:
 * - Animated checkmark with spring physics
 * - Clear next actions
 * - Smooth transitions
 */
export default function SuccessState({
  invoiceNumber,
  onCreateAnother,
  onStayHere,
}: SuccessStateProps) {
  return (
    <div className="text-center py-8">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6"
      >
        <svg
          className="w-10 h-10 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </motion.div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        Invoice Created!
      </h2>
      <p className="text-[var(--text-secondary)] mb-8">
        Invoice #{invoiceNumber || 'DRAFT'} has been downloaded
      </p>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="primary" fullWidth onClick={onCreateAnother}>
          Create Another Invoice
        </Button>
        <button
          type="button"
          onClick={onStayHere}
          className="cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors"
        >
          Stay on this invoice
        </button>
      </div>
    </div>
  );
}
