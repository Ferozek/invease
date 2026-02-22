'use client';

import { useState, useCallback, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import InvoicePDF from '@/components/pdf/InvoicePDF';
import logger from '@/lib/logger';
import { getValidLineItems } from '@/lib/invoiceUtils';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface EmailInvoiceButtonProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Check if Web Share API supports sharing files
 */
function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }
  if (navigator.canShare) {
    const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [testFile] });
  }
  return false;
}

/**
 * EmailInvoiceButton - Email invoice via Web Share API or mailto: fallback
 *
 * - Mobile: Uses Web Share API to share PDF directly to email apps
 * - Desktop: Opens mailto: with pre-filled subject/body, prompts to attach PDF
 */
export default function EmailInvoiceButton({
  invoice,
  totals,
  variant = 'secondary',
  size = 'md',
  className = '',
}: EmailInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(canShareFiles());
  }, []);

  const customerEmail = invoice.customer.email?.trim() || '';
  const invoiceNumber = invoice.details.invoiceNumber || 'DRAFT';
  const companyName = invoice.invoicer.companyName || 'Your Company';

  // Generate email content
  const emailSubject = `Invoice ${invoiceNumber} from ${companyName}`;
  const emailBody = `Dear ${invoice.customer.name || 'Customer'},

Please find attached Invoice ${invoiceNumber} for £${totals.total.toFixed(2)}.

Payment is due within ${invoice.details.paymentTerms || '30'} days.

Bank Details for Payment:
${invoice.bankDetails.bankName}
Account: ${invoice.bankDetails.accountNumber}
Sort Code: ${invoice.bankDetails.sortCode}
Reference: ${invoiceNumber}

Thank you for your business.

Best regards,
${companyName}`;

  const handleEmail = useCallback(async () => {
    // Guard against double-tap while share dialog is open
    if (isLoading) return;

    // Validate we have line items
    const validLineItems = getValidLineItems(invoice.lineItems);
    if (validLineItems.length === 0) {
      toast.error('Add line items first', { description: 'Invoice needs at least one item' });
      return;
    }

    setIsLoading(true);

    try {
      // Generate PDF
      const cleanedInvoice: InvoiceData = {
        ...invoice,
        lineItems: validLineItems,
      };

      const blob = await pdf(
        <InvoicePDF invoice={cleanedInvoice} totals={totals} />
      ).toBlob();

      const fileName = `Invoice-${invoiceNumber}.pdf`;

      // Mobile: Use Web Share API
      if (canShare) {
        const file = new File([blob], fileName, { type: 'application/pdf' });

        await navigator.share({
          title: emailSubject,
          text: emailBody,
          files: [file],
        });

        toast.success('Shared successfully');
        return;
      }

      // Desktop: Download PDF + open mailto:
      // First, trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Then open mailto: with pre-filled content
      const mailtoUrl = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody + '\n\n[Please attach the downloaded PDF]')}`;

      window.open(mailtoUrl, '_blank');

      toast.success('PDF downloaded', {
        description: 'Attach it to the email that just opened',
      });

    } catch (error) {
      // User cancelled share
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      // Share dialog already open (double-tap)
      if (error instanceof Error && error.name === 'InvalidStateError') {
        return;
      }
      toast.error('Failed to email invoice');
      logger.error('Email invoice failed', error);
    } finally {
      setIsLoading(false);
    }
  }, [invoice, totals, canShare, isLoading, invoiceNumber, emailSubject, emailBody, customerEmail]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleEmail}
      loading={isLoading}
      className={className}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
      <span className="hidden sm:inline">Email Invoice</span>
      <span className="sm:hidden">Email</span>
    </Button>
  );
}
