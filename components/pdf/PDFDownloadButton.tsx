'use client';

import { useState, useCallback, useEffect, forwardRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import Button from '@/components/ui/Button';
import { analytics } from '@/lib/analytics';
import { showInvoiceSuccess, handlePDFError, handleValidationError } from '@/lib/errorHandler';
import { getValidLineItems } from '@/lib/invoiceUtils';
import { hasPartialBankDetails } from '@/lib/bankDetailsUtils';
import InvoicePDF from './InvoicePDF';
import { useSettingsStore } from '@/stores/settingsStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface PDFDownloadButtonProps {
  invoice: InvoiceData;
  totals: InvoiceTotals;
  disabled?: boolean;
  onSuccess?: () => void;
}

// Validation function
function validateInvoice(invoice: InvoiceData): string[] {
  const errors: string[] = [];

  // Company details
  if (!invoice.invoicer.companyName?.trim()) {
    errors.push('Company name is required');
  }
  if (!invoice.invoicer.address?.trim()) {
    errors.push('Company address is required');
  }
  if (!invoice.invoicer.postCode?.trim()) {
    errors.push('Company post code is required');
  }

  // Customer details
  if (!invoice.customer.name?.trim()) {
    errors.push('Customer name is required');
  }
  if (!invoice.customer.address?.trim()) {
    errors.push('Customer address is required');
  }
  if (!invoice.customer.postCode?.trim()) {
    errors.push('Customer post code is required');
  }

  // Invoice details
  if (!invoice.details.invoiceNumber?.trim()) {
    errors.push('Invoice number is required');
  }
  if (!invoice.details.date) {
    errors.push('Invoice date is required');
  }

  // Line items
  const validLineItems = getValidLineItems(invoice.lineItems);
  if (validLineItems.length === 0) {
    errors.push('At least one line item with description and amount is required');
  }

  // Credit note specific
  if (invoice.details.documentType === 'credit_note') {
    if (!invoice.details.creditNoteFields?.relatedInvoiceNumber?.trim()) {
      errors.push('Original invoice number is required for credit notes');
    }
  }

  // Bank details - fully optional (GDPR: data minimisation, fraud prevention)
  // If partially filled, validate completeness
  if (hasPartialBankDetails(invoice.bankDetails)) {
    if (!invoice.bankDetails.accountNumber?.trim()) {
      errors.push('Account number incomplete (or clear all bank details)');
    }
    if (!invoice.bankDetails.sortCode?.trim()) {
      errors.push('Sort code incomplete (or clear all bank details)');
    }
    if (!invoice.bankDetails.accountName?.trim()) {
      errors.push('Account name incomplete (or clear all bank details)');
    }
    if (!invoice.bankDetails.bankName?.trim()) {
      errors.push('Bank name incomplete (or clear all bank details)');
    }
  }

  return errors;
}

const PDFDownloadButton = forwardRef<HTMLButtonElement, PDFDownloadButtonProps>(
  function PDFDownloadButton({ invoice, totals, disabled = false, onSuccess }, ref) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const brandColor = useSettingsStore((s) => s.customPrimaryColor);

    // Only render on client
    useEffect(() => {
      setIsMounted(true);
    }, []);

    const isCreditNote = invoice.details.documentType === 'credit_note';
    const docLabel = isCreditNote ? 'Credit Note' : 'Invoice';
    const filePrefix = isCreditNote ? 'CreditNote' : 'Invoice';

    // Compute validation state for proactive feedback (Apple HIG: prevent before report)
    const validationErrors = validateInvoice(invoice);
    const isValid = validationErrors.length === 0;
    const hasNoLineItems = getValidLineItems(invoice.lineItems).length === 0;

    const handleDownload = useCallback(async () => {
      // Validate first
      const errors = validateInvoice(invoice);
      if (errors.length > 0) {
        handleValidationError(errors);
        return;
      }

      setIsGenerating(true);

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

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filePrefix}-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showInvoiceSuccess(invoice.details.documentType);
        analytics.invoiceDownloaded(invoice.details.documentType);
        onSuccess?.();
      } catch (error) {
        handlePDFError(error instanceof Error ? error : new Error('PDF generation failed'));
      } finally {
        setIsGenerating(false);
      }
    }, [invoice, totals, onSuccess]);

    // Show loading state while mounting on client
    if (!isMounted) {
      return (
        <Button variant="primary" fullWidth loading>
          Loading...
        </Button>
      );
    }

    // Determine button state and message
    const buttonDisabled = disabled || isGenerating || !isValid;
    const buttonText = isGenerating
      ? 'Generating PDF...'
      : `Download ${docLabel} PDF`;

    return (
      <div className="relative group">
        <Button
          ref={ref}
          variant="primary"
          fullWidth
          onClick={handleDownload}
          loading={isGenerating}
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
        {/* Tooltip showing missing fields on hover when disabled */}
        {!isValid && !isGenerating && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
            bg-[var(--text-primary)] text-[var(--surface-card)] text-xs rounded-lg
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
            whitespace-nowrap z-10 shadow-lg"
            role="tooltip"
          >
            {validationErrors.length <= 3
              ? validationErrors.join(' · ')
              : `${validationErrors.length} fields need completing`
            }
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-primary)]" />
          </div>
        )}
      </div>
    );
  }
);

export default PDFDownloadButton;
