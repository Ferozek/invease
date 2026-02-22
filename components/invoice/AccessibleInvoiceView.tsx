'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusTrap from '@/components/ui/FocusTrap';
import { formatCurrency, calculateLineNet, formatDateUK, calculateDueDate, getPaymentTermsText, getVatRateLabel } from '@/lib/formatters';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

interface AccessibleInvoiceViewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  totals: InvoiceTotals;
}

/**
 * AccessibleInvoiceView — semantic HTML invoice for screen readers
 *
 * @react-pdf/renderer cannot create tagged PDFs (PDF/UA), so this
 * provides an accessible alternative using proper headings, tables,
 * ARIA landmarks, and description lists that screen readers can
 * navigate structurally.
 */
export default function AccessibleInvoiceView({
  isOpen,
  onClose,
  invoice,
  totals,
}: AccessibleInvoiceViewProps) {
  const { invoicer, customer, details, lineItems, bankDetails } = invoice;
  const isCreditNote = details.documentType === 'credit_note';
  const docType = isCreditNote ? 'Credit Note' : 'Invoice';
  const dueDate = calculateDueDate(details.date, details.paymentTerms);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap active={isOpen} returnFocus>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-[var(--surface-bg)] overflow-y-auto print:static print:bg-white"
            role="dialog"
            aria-modal="true"
            aria-label={`Accessible ${docType} view`}
          >
            {/* Toolbar — hidden when printing */}
            <div className="sticky top-0 z-10 bg-[var(--surface-card)] border-b border-[var(--surface-border)] px-6 py-3 flex items-center justify-between print:hidden">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Screen Reader View
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="cursor-pointer px-4 py-2 min-h-[44px] text-sm font-medium text-[var(--brand-blue)] hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer px-4 py-2 min-h-[44px] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
                  aria-label="Close accessible view"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Invoice content — semantic HTML */}
            <article
              role="document"
              aria-label={`${docType} ${details.invoiceNumber}`}
              className="max-w-3xl mx-auto px-6 py-8 print:max-w-none print:px-12 print:py-8"
            >
              {/* Header: Company + Document Info */}
              <header className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 print:text-black">
                  {docType}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From */}
                  <section aria-label="From">
                    <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 print:text-gray-500">
                      From
                    </h2>
                    <address className="not-italic text-sm text-[var(--text-primary)] print:text-black">
                      <strong>{invoicer.companyName}</strong>
                      {invoicer.address && <><br />{invoicer.address}</>}
                      {invoicer.postCode && <><br />{invoicer.postCode}</>}
                      {invoicer.companyNumber && <><br />Company No: {invoicer.companyNumber}</>}
                      {invoicer.vatNumber && <><br />VAT No: {invoicer.vatNumber}</>}
                    </address>
                  </section>

                  {/* To */}
                  <section aria-label="Bill to">
                    <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 print:text-gray-500">
                      Bill To
                    </h2>
                    <address className="not-italic text-sm text-[var(--text-primary)] print:text-black">
                      <strong>{customer.name || 'Customer name'}</strong>
                      {customer.email && <><br />{customer.email}</>}
                      {customer.phone && <><br />{customer.phone}</>}
                      {customer.address && <><br />{customer.address}</>}
                      {customer.postCode && <><br />{customer.postCode}</>}
                    </address>
                  </section>
                </div>

                {/* Document details */}
                <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)] print:text-gray-500">{docType} Number</dt>
                    <dd className="font-medium text-[var(--text-primary)] print:text-black">{details.invoiceNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] print:text-gray-500">Date</dt>
                    <dd className="font-medium text-[var(--text-primary)] print:text-black">{formatDateUK(details.date)}</dd>
                  </div>
                  {details.poNumber && (
                    <div>
                      <dt className="text-[var(--text-muted)] print:text-gray-500">PO Number</dt>
                      <dd className="font-medium text-[var(--text-primary)] print:text-black">{details.poNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[var(--text-muted)] print:text-gray-500">Payment Terms</dt>
                    <dd className="font-medium text-[var(--text-primary)] print:text-black">{getPaymentTermsText(details.paymentTerms)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] print:text-gray-500">Due Date</dt>
                    <dd className="font-medium text-[var(--text-primary)] print:text-black">{formatDateUK(dueDate.toISOString())}</dd>
                  </div>
                </dl>
              </header>

              {/* Line Items Table */}
              <section aria-label="Line items" className="mb-8">
                <h2 className="sr-only">Line Items</h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[var(--surface-border)] print:border-gray-300">
                      <th scope="col" className="text-left py-2 pr-4 font-semibold text-[var(--text-secondary)] print:text-gray-600">Description</th>
                      <th scope="col" className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)] print:text-gray-600">Qty</th>
                      <th scope="col" className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)] print:text-gray-600">Net</th>
                      <th scope="col" className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)] print:text-gray-600">VAT</th>
                      <th scope="col" className="text-right py-2 pl-2 font-semibold text-[var(--text-secondary)] print:text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => {
                      const lineNet = calculateLineNet(item.quantity, item.netAmount, item.discountType, item.discountValue);
                      const vatPercent = (item.vatRate === 'reverse_charge' || item.vatRate === 'exempt') ? 0 : parseInt(item.vatRate);
                      const vatAmount = lineNet * (vatPercent / 100);

                      return (
                        <tr key={item.id} className="border-b border-[var(--surface-border)] print:border-gray-200">
                          <td className="py-2 pr-4 text-[var(--text-primary)] print:text-black">{item.description || '—'}</td>
                          <td className="py-2 px-2 text-right text-[var(--text-primary)] print:text-black">{item.quantity}</td>
                          <td className="py-2 px-2 text-right text-[var(--text-primary)] print:text-black">{formatCurrency(lineNet)}</td>
                          <td className="py-2 px-2 text-right text-[var(--text-secondary)] print:text-gray-600">{getVatRateLabel(item.vatRate)}</td>
                          <td className="py-2 pl-2 text-right font-medium text-[var(--text-primary)] print:text-black">{formatCurrency(lineNet + vatAmount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--surface-border)] print:border-gray-300">
                      <td colSpan={3} />
                      <td className="py-2 px-2 text-right font-semibold text-[var(--text-secondary)] print:text-gray-600">Subtotal</td>
                      <td className="py-2 pl-2 text-right font-semibold text-[var(--text-primary)] print:text-black">{formatCurrency(totals.subtotal)}</td>
                    </tr>
                    {totals.vatBreakdown.map((v) => (
                      <tr key={v.rate}>
                        <td colSpan={3} />
                        <td className="py-1 px-2 text-right text-[var(--text-secondary)] print:text-gray-600">VAT ({getVatRateLabel(v.rate)})</td>
                        <td className="py-1 pl-2 text-right text-[var(--text-primary)] print:text-black">{formatCurrency(v.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-[var(--surface-border)] print:border-gray-300">
                      <td colSpan={3} />
                      <td className="py-2 px-2 text-right text-lg font-bold text-[var(--text-primary)] print:text-black">Total</td>
                      <td className="py-2 pl-2 text-right text-lg font-bold text-[var(--text-primary)] print:text-black">{formatCurrency(totals.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </section>

              {/* Payment Details */}
              {(bankDetails.accountNumber || bankDetails.sortCode) && (
                <section aria-label="Payment details" className="mb-8">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2 print:text-black">
                    Payment Details
                  </h2>
                  <dl className="text-sm grid grid-cols-2 gap-x-8 gap-y-1">
                    {bankDetails.bankName && (
                      <>
                        <dt className="text-[var(--text-muted)] print:text-gray-500">Bank</dt>
                        <dd className="text-[var(--text-primary)] print:text-black">{bankDetails.bankName}</dd>
                      </>
                    )}
                    {bankDetails.accountName && (
                      <>
                        <dt className="text-[var(--text-muted)] print:text-gray-500">Account Name</dt>
                        <dd className="text-[var(--text-primary)] print:text-black">{bankDetails.accountName}</dd>
                      </>
                    )}
                    <dt className="text-[var(--text-muted)] print:text-gray-500">Sort Code</dt>
                    <dd className="text-[var(--text-primary)] print:text-black">{bankDetails.sortCode}</dd>
                    <dt className="text-[var(--text-muted)] print:text-gray-500">Account Number</dt>
                    <dd className="text-[var(--text-primary)] print:text-black">{bankDetails.accountNumber}</dd>
                    {bankDetails.reference && (
                      <>
                        <dt className="text-[var(--text-muted)] print:text-gray-500">Reference</dt>
                        <dd className="text-[var(--text-primary)] print:text-black">{bankDetails.reference}</dd>
                      </>
                    )}
                  </dl>
                </section>
              )}

              {/* Notes */}
              {details.notes && (
                <section aria-label="Notes" className="mb-8">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1 print:text-black">Notes</h2>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line print:text-gray-600">{details.notes}</p>
                </section>
              )}
            </article>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}
