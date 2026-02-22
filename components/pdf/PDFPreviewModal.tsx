'use client';

import { useState, useEffect, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import InvoicePDF from './InvoicePDF';
import { useSettingsStore } from '@/stores/settingsStore';
import logger from '@/lib/logger';
import { getValidLineItems } from '@/lib/invoiceUtils';
import { hasBankDetails } from '@/lib/bankDetailsUtils';
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
  const [isSharePending, setIsSharePending] = useState(false);
  const brandColor = useSettingsStore((s) => s.customPrimaryColor);

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
          lineItems: getValidLineItems(invoice.lineItems),
        };

        // Generate PDF blob
        const blob = await pdf(
          <InvoicePDF invoice={cleanedInvoice} totals={totals} brandColor={brandColor ?? undefined} />
        ).toBlob();

        // Store blob for sharing
        setPdfBlob(blob);

        // Create URL for iframe
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError('Failed to generate PDF preview');
        logger.error('PDF preview generation failed', err);
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
  }, [isOpen, invoice, totals, brandColor]);

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

  const filePrefix = invoice.details.documentType === 'credit_note' ? 'CreditNote' : 'Invoice';
  const docLabel = invoice.details.documentType === 'credit_note' ? 'Credit Note' : 'Invoice';

  // Handle download
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${filePrefix}-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onDownload?.();
  }, [pdfUrl, invoice.details.invoiceNumber, onDownload, filePrefix]);

  // Handle share via Web Share API
  const handleShare = useCallback(async () => {
    if (!pdfBlob || isSharePending) return;

    const filename = `${filePrefix}-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    setIsSharePending(true);
    try {
      await navigator.share({
        title: `${docLabel} ${invoice.details.invoiceNumber || 'DRAFT'}`,
        text: `${docLabel} from ${invoice.invoicer.companyName || 'Your Company'}`,
        files: [file],
      });
      toast.success('Shared successfully');
    } catch (err) {
      // User cancelled, double-tap, or share failed
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'InvalidStateError')) {
        return;
      }
      toast.error('Share failed', {
        description: 'Could not share the invoice',
      });
      logger.error('Invoice share failed', err);
    } finally {
      setIsSharePending(false);
    }
  }, [pdfBlob, isSharePending, invoice.details.invoiceNumber, invoice.invoicer.companyName]);

  // Handle email - uses Web Share on mobile, mailto: on desktop
  const handleEmail = useCallback(async () => {
    if (!pdfBlob || isSharePending) return;
    setIsSharePending(true);

    const invoiceNumber = invoice.details.invoiceNumber || 'DRAFT';
    const companyName = invoice.invoicer.companyName || 'Your Company';
    const customerEmail = invoice.customer.email?.trim() || '';

    const emailSubject = `${docLabel} ${invoiceNumber} from ${companyName}`;

    const bankDetailsPresent = hasBankDetails(invoice.bankDetails);

    const bankSection = bankDetailsPresent
      ? `\nBank Details for Payment:\n${invoice.bankDetails.bankName}\nAccount: ${invoice.bankDetails.accountNumber}\nSort Code: ${invoice.bankDetails.sortCode}\nReference: ${invoiceNumber}\n`
      : '\nPlease contact us directly for payment details.\n';

    const emailBody = `Dear ${invoice.customer.name || 'Customer'},

Please find attached ${docLabel} ${invoiceNumber} for £${totals.total.toFixed(2)}.

Payment is due within ${invoice.details.paymentTerms || '30'} days.
${bankSection}
Thank you for your business.

Best regards,
${companyName}`;

    // Mobile: Use Web Share API with file
    if (canShare) {
      const filename = `Invoice-${invoiceNumber}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      try {
        await navigator.share({
          title: emailSubject,
          text: emailBody,
          files: [file],
        });
        toast.success('Shared successfully');
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'InvalidStateError')) {
          // User cancelled or double-tap — not an error
        } else {
          toast.error('Share failed');
        }
      } finally {
        setIsSharePending(false);
      }
      return;
    }

    // Desktop: Download PDF + open mailto:
    // First download
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${filePrefix}-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    // Then open mailto:
    const mailtoUrl = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody + '\n\n[Please attach the downloaded PDF]')}`;
    window.open(mailtoUrl, '_blank');

    toast.success('PDF downloaded', {
      description: 'Attach it to the email that opened',
    });
    setIsSharePending(false);
  }, [pdfBlob, isSharePending, invoice, totals, canShare]);

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
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col
              bg-[var(--surface-card)] rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {invoice.details.documentType === 'credit_note' ? 'Credit Note Preview' : 'Invoice Preview'}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Email button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEmail}
                  disabled={!pdfBlob || isLoading}
                  aria-label="Email invoice"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="hidden sm:inline">Email</span>
                </Button>
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
                <div className="w-full max-w-[800px] mx-auto">
                  <div
                    className="bg-white rounded shadow-lg overflow-hidden"
                    style={{ aspectRatio: '1/1.414' }}
                  >
                    <div className="p-8 animate-pulse space-y-6">
                      {/* Header skeleton */}
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-3 w-48 bg-gray-100 rounded" />
                          <div className="h-3 w-40 bg-gray-100 rounded" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
                          <div className="h-3 w-20 bg-gray-100 rounded ml-auto" />
                        </div>
                      </div>
                      {/* Bill to skeleton */}
                      <div className="bg-gray-50 rounded p-4 space-y-2">
                        <div className="h-2 w-12 bg-gray-200 rounded" />
                        <div className="h-4 w-36 bg-gray-200 rounded" />
                        <div className="h-3 w-48 bg-gray-100 rounded" />
                      </div>
                      {/* Table skeleton */}
                      <div className="space-y-2">
                        <div className="h-8 w-full bg-[#0b4f7a]/20 rounded-t" />
                        <div className="h-6 w-full bg-gray-100 rounded" />
                        <div className="h-6 w-full bg-gray-50 rounded" />
                        <div className="h-6 w-full bg-gray-100 rounded" />
                      </div>
                      {/* Totals skeleton */}
                      <div className="flex justify-end">
                        <div className="w-48 space-y-2">
                          <div className="h-4 w-full bg-gray-100 rounded" />
                          <div className="h-4 w-full bg-gray-100 rounded" />
                          <div className="h-6 w-full bg-[#0b4f7a]/20 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white text-center text-sm mt-3">Generating preview...</p>
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
