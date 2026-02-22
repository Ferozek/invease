'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import type { DocumentType } from '@/types/invoice';

export interface SuccessContext {
  documentType: DocumentType;
  invoiceNumber: string;
  customerName: string;
}

interface SuccessStateProps {
  successContext: SuccessContext;
  onCreateAnother: () => void;
  onStayHere: () => void;
  onCreateCreditNote?: () => void;
}

/**
 * SuccessState - Apple-style success animation after PDF download
 *
 * Features:
 * - Animated checkmark with spring physics
 * - Document-type-aware messaging (Invoice vs Credit Note)
 * - Contextual next actions (Xero pattern: offer credit note from invoice)
 * - Snapshot-based: displays what was created, not live form state
 */
export default function SuccessState({
  successContext,
  onCreateAnother,
  onStayHere,
  onCreateCreditNote,
}: SuccessStateProps) {
  const isCreditNote = successContext.documentType === 'credit_note';
  const docLabel = isCreditNote ? 'Credit Note' : 'Invoice';

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
        {docLabel} Created!
      </h2>
      <p className="text-[var(--text-secondary)] mb-1">
        {docLabel} #{successContext.invoiceNumber || 'DRAFT'} has been downloaded.
      </p>
      {successContext.customerName && (
        <p className="text-sm text-[var(--text-muted)] mb-8">
          For <span className="font-medium text-[var(--text-secondary)]">{successContext.customerName}</span>
        </p>
      )}
      {!successContext.customerName && <div className="mb-8" />}

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="primary" fullWidth onClick={onCreateAnother}>
          New {docLabel}
        </Button>

        {/* Contextual CTA: offer credit note creation for invoices (Xero pattern) */}
        {!isCreditNote && onCreateCreditNote && (
          <Button variant="ghost" fullWidth onClick={onCreateCreditNote}>
            Create Credit Note
          </Button>
        )}

        <button
          type="button"
          onClick={onStayHere}
          className="cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors"
        >
          Stay on this {docLabel.toLowerCase()}
        </button>
      </div>
    </div>
  );
}
