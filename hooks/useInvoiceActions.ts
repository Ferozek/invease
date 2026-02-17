'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface UseInvoiceActionsProps {
  invoiceData: InvoiceData;
  totals: InvoiceTotals;
  setShowSuccess: (show: boolean) => void;
  setShowNewInvoiceConfirm: (show: boolean) => void;
  setShowResetAllConfirm: (show: boolean) => void;
  setShowHistoryPanel: (show: boolean) => void;
}

/**
 * useInvoiceActions - Consolidates invoice action handlers
 *
 * Handles:
 * - PDF success flow
 * - New invoice creation
 * - Invoice duplication
 * - Reset functionality
 */
export function useInvoiceActions({
  invoiceData,
  totals,
  setShowSuccess,
  setShowNewInvoiceConfirm,
  setShowResetAllConfirm,
  setShowHistoryPanel,
}: UseInvoiceActionsProps) {
  // Store actions
  const { customer, details, lineItems, resetInvoice, setCustomerDetails, setInvoiceDetails, addLineItem, updateLineItem } =
    useInvoiceStore();
  const { isCisSubcontractor, resetOnboarding } = useCompanyStore();
  const saveInvoice = useHistoryStore((state) => state.saveInvoice);
  const consumeNextInvoiceNumber = useSettingsStore((state) => state.consumeNextInvoiceNumber);

  // Helper: Reset and auto-fill invoice number
  const resetWithNewNumber = useCallback(() => {
    resetInvoice(isCisSubcontractor());
    const nextNumber = consumeNextInvoiceNumber();
    setInvoiceDetails({ invoiceNumber: nextNumber });
  }, [resetInvoice, isCisSubcontractor, consumeNextInvoiceNumber, setInvoiceDetails]);

  // Helper: Check if form has data
  const hasFormData = useCallback(() => {
    return (
      customer.name ||
      customer.address ||
      details.invoiceNumber ||
      lineItems.some((item) => item.description)
    );
  }, [customer.name, customer.address, details.invoiceNumber, lineItems]);

  // Handle PDF download success
  const handlePDFSuccess = useCallback(() => {
    saveInvoice(invoiceData, totals);
    setShowSuccess(true);
  }, [saveInvoice, invoiceData, totals, setShowSuccess]);

  // Handle creating another invoice (after PDF success)
  const handleCreateAnother = useCallback(() => {
    resetWithNewNumber();
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetWithNewNumber, setShowSuccess]);

  // Handle staying on current invoice
  const handleStayHere = useCallback(() => {
    setShowSuccess(false);
  }, [setShowSuccess]);

  // Handle new invoice request (with confirmation if needed)
  const handleNewInvoice = useCallback(() => {
    if (hasFormData()) {
      setShowNewInvoiceConfirm(true);
    } else {
      resetWithNewNumber();
    }
  }, [hasFormData, setShowNewInvoiceConfirm, resetWithNewNumber]);

  // Confirm new invoice creation
  const handleConfirmNewInvoice = useCallback(() => {
    resetWithNewNumber();
    setShowNewInvoiceConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetWithNewNumber, setShowNewInvoiceConfirm]);

  // Handle reset all data
  const handleResetAllData = useCallback(() => {
    resetInvoice(false);
    sessionStorage.removeItem('invease-invoice-draft');
    resetOnboarding();
    setShowResetAllConfirm(false);
  }, [resetInvoice, resetOnboarding, setShowResetAllConfirm]);

  // Handle duplicate invoice from history
  const handleDuplicateInvoice = useCallback(
    (saved: SavedInvoice) => {
      // Copy customer details
      setCustomerDetails({
        name: saved.invoice.customer.name,
        address: saved.invoice.customer.address,
        postCode: saved.invoice.customer.postCode,
      });

      // Set new invoice number and today's date
      setInvoiceDetails({
        invoiceNumber: consumeNextInvoiceNumber(),
        date: new Date().toISOString().split('T')[0],
        paymentTerms: saved.invoice.details.paymentTerms,
        notes: saved.invoice.details.notes || '',
      });

      // Reset line items and copy from saved invoice
      resetInvoice(isCisSubcontractor());

      // Copy line items
      saved.invoice.lineItems.forEach((item, index) => {
        if (index === 0) {
          // Update the first line item (already exists after reset)
          const currentLineItems = useInvoiceStore.getState().lineItems;
          if (currentLineItems[0]) {
            updateLineItem(currentLineItems[0].id, {
              description: item.description,
              quantity: item.quantity,
              netAmount: item.netAmount,
              vatRate: item.vatRate,
              cisCategory: item.cisCategory,
            });
          }
        } else {
          addLineItem(isCisSubcontractor());
          const currentLineItems = useInvoiceStore.getState().lineItems;
          const lastItem = currentLineItems[currentLineItems.length - 1];
          if (lastItem) {
            updateLineItem(lastItem.id, {
              description: item.description,
              quantity: item.quantity,
              netAmount: item.netAmount,
              vatRate: item.vatRate,
              cisCategory: item.cisCategory,
            });
          }
        }
      });

      // Close panel and show toast
      setShowHistoryPanel(false);
      toast.success('Invoice duplicated', {
        description: `Created from ${saved.invoiceNumber}`,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [
      setCustomerDetails,
      setInvoiceDetails,
      resetInvoice,
      addLineItem,
      updateLineItem,
      consumeNextInvoiceNumber,
      isCisSubcontractor,
      setShowHistoryPanel,
    ]
  );

  return {
    handlePDFSuccess,
    handleCreateAnother,
    handleStayHere,
    handleNewInvoice,
    handleConfirmNewInvoice,
    handleResetAllData,
    handleDuplicateInvoice,
  };
}
