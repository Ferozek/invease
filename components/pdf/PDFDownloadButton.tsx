'use client';

import { useState, useCallback, useEffect, forwardRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import Button from '@/components/ui/Button';
import { showInvoiceSuccess, handlePDFError, handleValidationError } from '@/lib/errorHandler';
import InvoicePDF from './InvoicePDF';
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
  const validLineItems = invoice.lineItems.filter(
    (item) => item.description?.trim() && item.netAmount > 0
  );
  if (validLineItems.length === 0) {
    errors.push('At least one line item with description and amount is required');
  }

  // Bank details
  if (!invoice.bankDetails.accountNumber?.trim()) {
    errors.push('Account number is required');
  }
  if (!invoice.bankDetails.sortCode?.trim()) {
    errors.push('Sort code is required');
  }
  if (!invoice.bankDetails.accountName?.trim()) {
    errors.push('Account name is required');
  }
  if (!invoice.bankDetails.bankName?.trim()) {
    errors.push('Bank name is required');
  }

  return errors;
}

const PDFDownloadButton = forwardRef<HTMLButtonElement, PDFDownloadButtonProps>(
  function PDFDownloadButton({ invoice, totals, disabled = false, onSuccess }, ref) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Only render on client
    useEffect(() => {
      setIsMounted(true);
    }, []);

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
          lineItems: invoice.lineItems.filter(
            (item) => item.description?.trim() && item.netAmount > 0
          ),
        };

        // Generate PDF blob
        const blob = await pdf(
          <InvoicePDF invoice={cleanedInvoice} totals={totals} />
        ).toBlob();

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoice.details.invoiceNumber || 'DRAFT'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showInvoiceSuccess();
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

    return (
      <Button
        ref={ref}
        variant="primary"
        fullWidth
        onClick={handleDownload}
        loading={isGenerating}
        disabled={disabled || isGenerating}
      >
        {isGenerating ? 'Generating PDF...' : 'Download Invoice PDF'}
      </Button>
    );
  }
);

export default PDFDownloadButton;
