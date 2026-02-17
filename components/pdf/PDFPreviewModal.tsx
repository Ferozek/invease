'use client';

import { useState, useEffect, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import InvoicePDF from './InvoicePDF';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  totals: InvoiceTotals;
  onDownload?: () => void;
}

/**
 * Check if Web Share API supports sharing files
 * Works on iOS Safari 14.5+, Android Chrome, Android Firefox
 */
function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }
  // Check if canShare exists and can share files
  if (navigator.canShare) {
    const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [testFile] });
  }
  return false;
}

/**
 * PDFPreviewModal - Full-screen PDF preview
 *
 * Features:
 * - Renders PDF in iframe for accurate preview
 * - Download button integrated
 * - Keyboard accessible (Escape to close)
 * - Loading state while generating
 */
export default function PDFPreviewModal({
  isOpen,
  onClose,
  invoice,
  totals,
  onDownload,
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  // Check if sharing is supported on mount
  useEffect(() => {
    setCanShare(canShareFiles());
  }, []);

  // Generate PDF when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Clean up URL when modal closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setPdfBlob(null);
      }
      return;
    }

    const generatePDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Filter out empty line items
        const cleanedInvoice: InvoiceData = {
          ...invoice,
          lineItems: invoice.lineItems.filter(
            (item) => item.description?.trim() && item.netAmount > 0
          ),
        };

        // Generate PDF blob
        const blob = await pdf(
          <InvoicePDF invoice={cleanedInvoice} totals={totals} />
        ).toBlob();

        // Store blob for sharing
        setPdfBlob(blob);

        // Create URL for iframe
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError('Failed to generate PDF preview');
        console.error('PDF preview error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generatePDF();

    // Cleanup on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, invoice, totals]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Invoice-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onDownload?.();
  }, [pdfUrl, invoice.details.invoiceNumber, onDownload]);

  // Handle share via Web Share API
  const handleShare = useCallback(async () => {
    if (!pdfBlob) return;

    const filename = `Invoice-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    try {
      await navigator.share({
        title: `Invoice ${invoice.details.invoiceNumber || 'DRAFT'}`,
        text: `Invoice from ${invoice.invoicer.companyName || 'Your Company'}`,
        files: [file],
      });
      toast.success('Shared successfully');
    } catch (err) {
      // User cancelled or share failed
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Share failed', {
          description: 'Could not share the invoice',
        });
        console.error('Share error:', err);
      }
    }
  }, [pdfBlob, invoice.details.invoiceNumber, invoice.invoicer.companyName]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 z-50 flex flex-col
              bg-[var(--surface-card)] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Invoice Preview
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Share button - only shown on devices that support file sharing */}
                {canShare && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    disabled={!pdfBlob || isLoading}
                    aria-label="Share invoice"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!pdfUrl || isLoading}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">Download</span>
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                  aria-label="Close preview"
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
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#525659] overflow-auto flex items-center justify-center p-4">
              {isLoading && (
                <div className="text-white text-center">
                  <svg
                    className="animate-spin h-8 w-8 mx-auto mb-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p>Generating preview...</p>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-center">
                  <svg
                    className="w-8 h-8 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {pdfUrl && !isLoading && !error && (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full max-w-[800px] bg-white rounded shadow-lg"
                  title="Invoice PDF Preview"
                />
              )}
            </div>

            {/* Footer hint */}
            <div className="p-2 border-t border-[var(--surface-border)] text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)]">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
