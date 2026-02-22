'use client';

import { useState, useCallback, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { ShareIcon } from '@/components/ui/icons';
import InvoicePDF from '@/components/pdf/InvoicePDF';
import logger from '@/lib/logger';
import { getValidLineItems } from '@/lib/invoiceUtils';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface ShareButtonProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
}

/**
 * ShareButton - Native sharing via Web Share API
 *
 * Apple-style share functionality:
 * - Uses native share sheet on iOS/Android
 * - Shares PDF file directly
 * - Falls back gracefully on unsupported browsers
 */
export default function ShareButton({ invoice, totals }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check Web Share API support on mount
  useEffect(() => {
    // Check if Web Share API with files is supported
    const checkShareSupport = async () => {
      if (typeof navigator === 'undefined') return;
      if (typeof navigator.share !== 'function') return;

      // Check if file sharing is supported
      if (typeof navigator.canShare === 'function') {
        // Test with a dummy file
        const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        const canShareFiles = navigator.canShare({ files: [testFile] });
        setCanShare(canShareFiles);
      } else {
        // Older browsers may support share but not canShare
        setCanShare(true);
      }
    };
    checkShareSupport();
  }, []);

  const handleShare = useCallback(async () => {
    // Guard against double-tap while share dialog is open
    if (isSharing) return;

    // Validate invoice has basic data
    const validLineItems = getValidLineItems(invoice.lineItems);
    if (validLineItems.length === 0) {
      toast.error('Add line items first', { description: 'Invoice needs at least one item to share' });
      return;
    }

    setIsSharing(true);

    try {
      // Generate PDF blob
      const cleanedInvoice: InvoiceData = {
        ...invoice,
        lineItems: validLineItems,
      };

      const blob = await pdf(
        <InvoicePDF invoice={cleanedInvoice} totals={totals} />
      ).toBlob();

      // Create file from blob
      const fileName = `Invoice-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // Share using Web Share API
      await navigator.share({
        title: `Invoice ${invoice.details.invoiceNumber || 'Draft'}`,
        text: `Invoice from ${invoice.invoicer.companyName || 'Your Company'}`,
        files: [file],
      });

      toast.success('Shared successfully');
    } catch (error) {
      // User cancelled share - not an error
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      // NotAllowedError - typically means user gesture required or permission denied
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Share not allowed', { description: 'Please try again' });
        return;
      }
      // InvalidStateError - share dialog already open (double-tap)
      if (error instanceof Error && error.name === 'InvalidStateError') {
        return;
      }
      // Fall back to download if share fails
      toast.error('Unable to share', { description: 'Try downloading the PDF instead' });
      logger.error('Share failed', error);
    } finally {
      setIsSharing(false);
    }
  }, [invoice, totals, isSharing]);

  // Don't render if Web Share API not supported
  if (!canShare) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className="cursor-pointer p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]
        hover:bg-[var(--surface-elevated)] transition-colors disabled:opacity-50"
      title="Share Invoice"
      aria-label="Share invoice"
    >
      {isSharing ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
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
        </svg>
      ) : (
        <ShareIcon />
      )}
    </button>
  );
}
