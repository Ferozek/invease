'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { BUSINESS_TYPE_LABELS } from '@/config/constants';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FormAccordionSection } from '@/components/ui/FormAccordion';
import FormAccordion from '@/components/ui/FormAccordion';
import { InvoiceIcon } from '@/components/ui/icons';
import ErrorBoundary, { PDFErrorBoundary } from '@/components/ui/ErrorBoundary';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore, undo, redo } from '@/stores/invoiceStore';
import { useHistoryStore, type SavedInvoice } from '@/stores/historyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useAccordion } from '@/hooks/useAccordion';
import { useFormCompletion } from '@/hooks/useFormCompletion';
import WelcomeSlides from '@/components/onboarding/WelcomeSlides';
import OnboardingWizard from '@/components/wizard/OnboardingWizard';
import { SAMPLE_COMPANY, SAMPLE_BANK_DETAILS, SAMPLE_CUSTOMER, SAMPLE_LINE_ITEM } from '@/config/sampleData';
import {
  CompanyDetailsSummary,
  CustomerDetailsForm,
  InvoiceDetailsForm,
  LineItemsTable,
  BankDetailsSummary,
  InvoicePreview,
  InvoiceTotalsSection,
  SuccessState,
  type SuccessContext,
  InvoiceToolbar,
  DocumentTypeSelector,
} from '@/components/invoice';
import { getTodayISO } from '@/lib/dateUtils';
import { copyLineItemsToStore } from '@/lib/invoiceUtils';
import type { DocumentType } from '@/types/invoice';
import InvoiceHistoryPanel, { type StatusFilter } from '@/components/invoice/InvoiceHistoryPanel';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import SettingsPanel from '@/components/settings/SettingsPanel';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Footer from '@/components/shared/Footer';
import ShortcutHelpModal from '@/components/ui/ShortcutHelpModal';
import FirstRunHint from '@/components/ui/FirstRunHint';

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadButton = dynamic(
  () => import('@/components/pdf/PDFDownloadButton'),
  {
    ssr: false,
    loading: () => (
      <Button variant="primary" fullWidth loading>
        Loading...
      </Button>
    ),
  }
);

const PDFPreviewModal = dynamic(
  () => import('@/components/pdf/PDFPreviewModal'),
  { ssr: false }
);

export default function Home() {
  // UI state
  const [successContext, setSuccessContext] = useState<SuccessContext | null>(null);
  const showSuccess = successContext !== null;
  const [showNewInvoiceConfirm, setShowNewInvoiceConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [pendingDocType, setPendingDocType] = useState<DocumentType | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<StatusFilter | undefined>(undefined);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Ref for triggering PDF download via keyboard shortcut
  const pdfButtonRef = useRef<HTMLButtonElement>(null);

  // Consolidated invoice data (from useInvoiceData hook)
  const { invoiceData, totals, customer, details, lineItems } = useInvoiceData();

  // Company store - only what's not in useInvoiceData
  const hasSeenWelcome = useCompanyStore((state) => state.hasSeenWelcome);
  const isOnboarded = useCompanyStore((state) => state.isOnboarded);
  const businessType = useCompanyStore((state) => state.businessType);
  const companyName = useCompanyStore((state) => state.companyName);
  const markWelcomeSeen = useCompanyStore((state) => state.markWelcomeSeen);
  const setCompanyDetails = useCompanyStore((state) => state.setCompanyDetails);
  const setBankDetails = useCompanyStore((state) => state.setBankDetails);
  const resetOnboarding = useCompanyStore((state) => state.resetOnboarding);
  const startOver = useCompanyStore((state) => state.startOver);
  const isCisSubcontractor = useCompanyStore((state) => state.isCisSubcontractor);

  // Invoice store - actions only
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const setCustomerDetails = useInvoiceStore((state) => state.setCustomerDetails);
  const setInvoiceDetails = useInvoiceStore((state) => state.setInvoiceDetails);
  const addLineItem = useInvoiceStore((state) => state.addLineItem);
  const updateLineItem = useInvoiceStore((state) => state.updateLineItem);

  // History store
  const saveInvoice = useHistoryStore((state) => state.saveInvoice);

  // Settings store
  const consumeNextInvoiceNumber = useSettingsStore((state) => state.consumeNextInvoiceNumber);
  const consumeNextCreditNoteNumber = useSettingsStore((state) => state.consumeNextCreditNoteNumber);

  // Auto-fill invoice number on initial load (when empty and onboarded)
  useEffect(() => {
    if (isOnboarded && !details.invoiceNumber) {
      const nextNumber = consumeNextInvoiceNumber();
      setInvoiceDetails({ invoiceNumber: nextNumber });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarded]);

  // Handle welcome completion - pre-fill with sample data
  const handleWelcomeComplete = useCallback(() => {
    // Set default business type
    useCompanyStore.getState().setBusinessType('sole_trader');

    // Pre-fill sample company data if empty
    if (!companyName) {
      setCompanyDetails({
        companyName: SAMPLE_COMPANY.companyName,
        address: SAMPLE_COMPANY.address,
        postCode: SAMPLE_COMPANY.postCode,
      });
      setBankDetails(SAMPLE_BANK_DETAILS);
    }

    // Pre-fill sample customer and line item if empty
    if (!customer.name) {
      setCustomerDetails(SAMPLE_CUSTOMER);
    }

    // Pre-fill sample line item if empty
    const currentItems = useInvoiceStore.getState().lineItems;
    if (currentItems.length > 0 && !currentItems[0].description) {
      updateLineItem(currentItems[0].id, SAMPLE_LINE_ITEM);
    }

    // Auto-fill invoice number
    const nextNumber = consumeNextInvoiceNumber();
    setInvoiceDetails({
      invoiceNumber: nextNumber,
      date: getTodayISO(),
      paymentTerms: '30',
      notes: 'Thank you for your business.',
    });

    markWelcomeSeen();
    analytics.quickStartUsed();
  }, [companyName, customer.name, setCompanyDetails, setBankDetails, setCustomerDetails, setInvoiceDetails, updateLineItem, consumeNextInvoiceNumber, markWelcomeSeen]);

  // ===== Action Handlers =====

  // Helper: Reset invoice and auto-fill next number
  const resetWithNewNumber = useCallback(() => {
    resetInvoice(isCisSubcontractor());
    const nextNumber = consumeNextInvoiceNumber();
    setInvoiceDetails({ invoiceNumber: nextNumber });
  }, [resetInvoice, isCisSubcontractor, consumeNextInvoiceNumber, setInvoiceDetails]);

  // Perform the actual document type switch
  const performDocumentTypeSwitch = useCallback((type: DocumentType) => {
    // Dismiss stale success state if showing
    if (successContext) setSuccessContext(null);

    if (type === 'credit_note') {
      analytics.creditNoteCreated();
      const nextCnNumber = consumeNextCreditNoteNumber();
      setInvoiceDetails({
        documentType: 'credit_note',
        invoiceNumber: nextCnNumber,
        creditNoteFields: {
          relatedInvoiceNumber: '',
          reason: '',
          isPartial: false,
        },
      });
    } else {
      const nextInvNumber = consumeNextInvoiceNumber();
      setInvoiceDetails({
        documentType: 'invoice',
        invoiceNumber: nextInvNumber,
        creditNoteFields: undefined,
      });
    }
  }, [successContext, consumeNextCreditNoteNumber, consumeNextInvoiceNumber, setInvoiceDetails]);

  // Handle document type toggle (Invoice <-> Credit Note) — with confirmation if data exists
  const handleDocumentTypeChange = useCallback((type: DocumentType) => {
    const hasData = customer.name?.trim() ||
      lineItems.some((item) => item.description?.trim() && item.netAmount > 0);

    if (hasData) {
      setPendingDocType(type);
      return;
    }

    performDocumentTypeSwitch(type);
  }, [customer.name, lineItems, performDocumentTypeSwitch]);

  // Create credit note from a saved invoice in history
  const handleCreateCreditNote = useCallback((saved: SavedInvoice) => {
    // Reset first, then populate
    resetInvoice(isCisSubcontractor());

    // Set customer from the original invoice
    setCustomerDetails({
      name: saved.invoice.customer.name,
      address: saved.invoice.customer.address,
      postCode: saved.invoice.customer.postCode,
      email: saved.invoice.customer.email,
    });

    // Set credit note details referencing the original
    const cnNumber = consumeNextCreditNoteNumber();
    setInvoiceDetails({
      documentType: 'credit_note',
      invoiceNumber: cnNumber,
      date: getTodayISO(),
      paymentTerms: saved.invoice.details.paymentTerms,
      notes: saved.invoice.details.notes || '',
      creditNoteFields: {
        relatedInvoiceNumber: saved.invoice.details.invoiceNumber,
        reason: '',
        isPartial: false,
      },
    });

    // Copy line items from the original invoice
    copyLineItemsToStore(
      saved.invoice.lineItems,
      () => useInvoiceStore.getState().lineItems,
      updateLineItem,
      addLineItem,
      isCisSubcontractor(),
    );

    setShowHistoryPanel(false);
    toast.success('Credit note started', {
      description: `Based on Invoice #${saved.invoice.details.invoiceNumber}`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCustomerDetails, setInvoiceDetails, resetInvoice, addLineItem, updateLineItem, consumeNextCreditNoteNumber, isCisSubcontractor]);

  const handlePDFSuccess = useCallback(() => {
    saveInvoice(invoiceData, totals);
    analytics.invoiceSaved(details.documentType);
    setSuccessContext({
      documentType: details.documentType,
      invoiceNumber: details.invoiceNumber,
      customerName: customer.name,
    });
  }, [saveInvoice, invoiceData, totals, details.documentType, details.invoiceNumber, customer.name]);

  const handleCreateAnother = useCallback(() => {
    resetWithNewNumber();
    setSuccessContext(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetWithNewNumber]);

  const handleStayHere = useCallback(() => {
    setSuccessContext(null);
  }, []);

  // Create credit note from the just-saved invoice (Xero pattern)
  const handleCreateCreditNoteFromSuccess = useCallback(() => {
    if (!successContext) return;

    const historyInvoices = useHistoryStore.getState().invoices;
    const saved = historyInvoices.find(
      (inv) => inv.invoiceNumber === successContext.invoiceNumber
    );

    if (saved) {
      handleCreateCreditNote(saved);
    } else {
      // Fallback: just switch to credit note mode
      performDocumentTypeSwitch('credit_note');
    }

    setSuccessContext(null);
  }, [successContext, handleCreateCreditNote, performDocumentTypeSwitch]);

  const handleNewInvoice = useCallback(() => {
    const hasData = customer.name || customer.address || details.invoiceNumber || lineItems.some((item) => item.description);
    if (hasData) {
      setShowNewInvoiceConfirm(true);
    } else {
      resetWithNewNumber();
    }
  }, [customer.name, customer.address, details.invoiceNumber, lineItems, resetWithNewNumber]);

  const handleConfirmNewInvoice = useCallback(() => {
    resetWithNewNumber();
    setShowNewInvoiceConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetWithNewNumber]);

  const handleResetAllData = useCallback(() => {
    resetInvoice(false);
    sessionStorage.removeItem('invease-invoice-draft');
    startOver();
    setShowResetAllConfirm(false);
  }, [resetInvoice, startOver]);

  const handleDuplicateInvoice = useCallback(
    (saved: SavedInvoice) => {
      setCustomerDetails({
        name: saved.invoice.customer.name,
        address: saved.invoice.customer.address,
        postCode: saved.invoice.customer.postCode,
      });

      setInvoiceDetails({
        invoiceNumber: consumeNextInvoiceNumber(),
        date: getTodayISO(),
        paymentTerms: saved.invoice.details.paymentTerms,
        notes: saved.invoice.details.notes || '',
      });

      resetInvoice(isCisSubcontractor());

      copyLineItemsToStore(
        saved.invoice.lineItems,
        () => useInvoiceStore.getState().lineItems,
        updateLineItem,
        addLineItem,
        isCisSubcontractor(),
      );

      setShowHistoryPanel(false);
      toast.success('Invoice duplicated', { description: `Created from ${saved.invoiceNumber}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setCustomerDetails, setInvoiceDetails, resetInvoice, addLineItem, updateLineItem, consumeNextInvoiceNumber, isCisSubcontractor]
  );

  // ===== Keyboard Shortcuts =====
  useKeyboardShortcuts([
    { ...APP_SHORTCUTS.DOWNLOAD_PDF, action: () => pdfButtonRef.current?.click() },
    { ...APP_SHORTCUTS.NEW_INVOICE, action: handleNewInvoice },
    { ...APP_SHORTCUTS.OPEN_SETTINGS, action: () => setShowSettingsPanel(true) },
    { ...APP_SHORTCUTS.OPEN_PREVIEW, action: () => setShowPDFPreview(true) },
    { ...APP_SHORTCUTS.UNDO, action: undo },
    { ...APP_SHORTCUTS.REDO, action: redo },
    { key: '?', action: () => setShowShortcuts(true), description: 'Show Shortcuts' },
  ]);

  // ===== Accordion + Completion State =====
  const completion = useFormCompletion();
  const accordion = useAccordion({
    sectionIds: ['customer', 'invoiceDetails', 'lineItems', 'bankDetails'],
  });

  // ===== Render =====

  // Show welcome slides for first-time users
  if (!hasSeenWelcome) {
    return (
      <main id="main-content" className="min-h-screen bg-[var(--surface-page)]">
        <ErrorBoundary errorMessage="Something went wrong. Please refresh the page." showRetry>
          <WelcomeSlides onComplete={handleWelcomeComplete} />
        </ErrorBoundary>
      </main>
    );
  }

  // Show onboarding wizard if not yet completed (or editing details)
  if (!isOnboarded) {
    return (
      <main id="main-content" className="min-h-screen bg-[var(--surface-page)]">
        <ErrorBoundary errorMessage="Something went wrong. Please refresh the page." showRetry>
          <OnboardingWizard />
        </ErrorBoundary>
      </main>
    );
  }

  const businessTypeLabel = businessType ? BUSINESS_TYPE_LABELS[businessType] : 'Business';

  return (
    <>
      {/* Header landmark */}
      <header role="banner">
        <PageHeader
          gradient
          title={siteConfig.name}
          description={siteConfig.tagline}
          icon={<InvoiceIcon />}
          actions={<ThemeToggle />}
        />
      </header>

      {/* Main content landmark */}
      <main id="main-content" className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column - primary content */}
            <section aria-label="Invoice form" className="lg:col-span-2 space-y-6">
              {/* Dashboard Summary - above the form (Apple Wallet style) */}
              {siteConfig.features.dashboard && (
                <DashboardSummary
                  onViewAll={() => {
                    setHistoryStatusFilter(undefined);
                    setShowHistoryPanel(true);
                  }}
                  onViewOverdue={() => {
                    setHistoryStatusFilter('overdue');
                    setShowHistoryPanel(true);
                  }}
                />
              )}

              {/* Company Details — static card (read-only, not in accordion) */}
              <Card variant="accent" className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h2 id="company-details-heading" className="text-base font-semibold text-[var(--text-primary)]">
                      Your {businessTypeLabel} Details
                    </h2>
                    <Badge variant="info" size="sm">Saved</Badge>
                  </div>
                  <button
                    type="button"
                    onClick={resetOnboarding}
                    className="cursor-pointer text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
                <CompanyDetailsSummary />
              </Card>

              {/* Accordion form — progressive disclosure (Apple HIG) */}
              <div className="relative">
                <FirstRunHint
                  id="accordion-hint"
                  title="Expandable Sections"
                  description="Click section headers to expand and collapse them."
                  position="top"
                  delay={1000}
                  autoDismiss={8000}
                />
              </div>
              <FormAccordion activeSection={accordion.activeSection} onToggle={accordion.toggleSection}>
                <FormAccordionSection
                  id="customer"
                  title="Customer Details"
                  isOpen={accordion.activeSection === 'customer'}
                  isComplete={completion.customer.isComplete}
                  summary={completion.customer.summary}
                  onToggle={accordion.toggleSection}
                >
                  <CustomerDetailsForm />
                </FormAccordionSection>

                <FormAccordionSection
                  id="invoiceDetails"
                  title={details.documentType === 'credit_note' ? 'Credit Note Details' : 'Invoice Details'}
                  isOpen={accordion.activeSection === 'invoiceDetails'}
                  isComplete={completion.invoiceDetails.isComplete}
                  summary={completion.invoiceDetails.summary}
                  onToggle={accordion.toggleSection}
                >
                  <DocumentTypeSelector
                    documentType={details.documentType}
                    onTypeChange={handleDocumentTypeChange}
                  />
                  <InvoiceDetailsForm />
                </FormAccordionSection>

                <FormAccordionSection
                  id="lineItems"
                  title="Line Items"
                  isOpen={accordion.activeSection === 'lineItems'}
                  isComplete={completion.lineItems.isComplete}
                  summary={completion.lineItems.summary}
                  onToggle={accordion.toggleSection}
                >
                  <LineItemsTable />
                </FormAccordionSection>

                <FormAccordionSection
                  id="bankDetails"
                  title="Bank Details"
                  isOpen={accordion.activeSection === 'bankDetails'}
                  isComplete={completion.bankDetails.isComplete}
                  summary={completion.bankDetails.summary}
                  variant="optional"
                  onToggle={accordion.toggleSection}
                >
                  <BankDetailsSummary />
                  <button
                    type="button"
                    onClick={resetOnboarding}
                    className="mt-3 cursor-pointer text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors"
                  >
                    Edit Bank Details
                  </button>
                </FormAccordionSection>
              </FormAccordion>
            </section>

            {/* Preview Column - complementary content */}
            <aside aria-label="Invoice preview" className="lg:col-span-1">
            <div className="sticky top-6">
              <Card variant="accent" className="p-6 overflow-hidden">
                {/* Toolbar — always visible (Apple: never hide navigation) */}
                <div className="relative">
                  <FirstRunHint
                    id="shortcuts-hint"
                    title="Keyboard Shortcuts"
                    description="Press ? to see all available shortcuts."
                    position="bottom"
                    delay={3000}
                    autoDismiss={8000}
                  />
                </div>
                <InvoiceToolbar
                  invoice={invoiceData}
                  totals={totals}
                  onOpenPreview={() => setShowPDFPreview(true)}
                  onOpenHistory={() => setShowHistoryPanel(true)}
                  onOpenSettings={() => setShowSettingsPanel(true)}
                  onNewInvoice={handleNewInvoice}
                />

                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <SuccessState
                        successContext={successContext!}
                        onCreateAnother={handleCreateAnother}
                        onStayHere={handleStayHere}
                        onCreateCreditNote={handleCreateCreditNoteFromSuccess}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="invoice-preview text-sm">
                        <InvoicePreview totals={totals} />
                      </div>
                      <InvoiceTotalsSection totals={totals} />

                      {/* Download CTA */}
                      <div className="mt-6 relative">
                        <FirstRunHint
                          id="download-hint"
                          title="Download Your Invoice"
                          description="Fill in the form, then download as a professional PDF."
                          position="top"
                          delay={2000}
                          autoDismiss={8000}
                        />
                        <PDFErrorBoundary>
                          <PDFDownloadButton
                            ref={pdfButtonRef}
                            invoice={invoiceData}
                            totals={totals}
                            onSuccess={handlePDFSuccess}
                          />
                        </PDFErrorBoundary>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Start Over — destructive, kept subtle */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowResetAllConfirm(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-colors cursor-pointer"
                >
                  Start Over
                </button>
              </div>
            </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Panels */}
      <ConfirmDialog
        isOpen={showNewInvoiceConfirm}
        onClose={() => setShowNewInvoiceConfirm(false)}
        onConfirm={handleConfirmNewInvoice}
        title={details.documentType === 'credit_note' ? 'Start New Credit Note?' : 'Start New Invoice?'}
        message="This will clear all current data. Your company and bank details will be preserved."
        confirmText="Clear & Start New"
        cancelText="Keep Current"
        isDestructive
      />

      <ConfirmDialog
        isOpen={pendingDocType !== null}
        onClose={() => setPendingDocType(null)}
        onConfirm={() => {
          if (pendingDocType) performDocumentTypeSwitch(pendingDocType);
          setPendingDocType(null);
        }}
        title={pendingDocType === 'credit_note' ? 'Switch to Credit Note?' : 'Switch to Invoice?'}
        message="Your customer details and line items will be preserved, but the document number will change."
        confirmText="Switch"
        cancelText="Stay"
      />

      <ConfirmDialog
        isOpen={showResetAllConfirm}
        onClose={() => setShowResetAllConfirm(false)}
        onConfirm={handleResetAllData}
        title="Start Over?"
        message="This will clear ALL saved data including your company details, bank details, and current invoice. You'll need to complete setup again."
        confirmText="Clear Everything"
        cancelText="Cancel"
        isDestructive
      />

      <InvoiceHistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => {
          setShowHistoryPanel(false);
          setHistoryStatusFilter(undefined);
        }}
        onDuplicate={handleDuplicateInvoice}
        onCreateCreditNote={handleCreateCreditNote}
        initialStatusFilter={historyStatusFilter}
      />

      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoiceData}
        totals={totals}
        onDownload={handlePDFSuccess}
      />

      <ShortcutHelpModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}
