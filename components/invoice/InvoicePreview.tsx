'use client';

import { motion } from 'framer-motion';
import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import {
  formatCurrency,
  calculateLineTotal,
  formatDateUK,
  calculateDueDate,
  getPaymentTermsText,
  getVatRateLabel,
} from '@/lib/formatters';
import { getCisStatusLabel } from '@/lib/cisUtils';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import type { InvoiceTotals } from '@/types/invoice';

interface InvoicePreviewProps {
  totals: InvoiceTotals;
}

export default function InvoicePreview({ totals }: InvoicePreviewProps) {
  const { logo, companyName, vatNumber, address, postCode, cisStatus, cisUtr } = useCompanyStore();
  const { customer, details, lineItems } = useInvoiceStore();

  const isCis = cisStatus !== 'not_applicable';
  const isCreditNote = details.documentType === 'credit_note';

  const hasContent =
    companyName || logo || customer.name || lineItems.some((item) => item.description);

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {/* Floating invoice illustration */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
            isCreditNote ? 'bg-red-50' : 'bg-[var(--brand-blue-50)]'
          }`}
        >
          <svg
            className={`w-10 h-10 ${isCreditNote ? 'text-red-500' : 'text-[var(--brand-blue)]'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </motion.div>
        <p className="text-[var(--text-secondary)] font-medium">
          Your {isCreditNote ? 'credit note' : 'invoice'} preview
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Fill in the form to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Credit Note Badge */}
      {isCreditNote && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            CREDIT NOTE
          </span>
          {details.creditNoteFields?.relatedInvoiceNumber && (
            <span className="text-xs text-[var(--text-muted)]">
              Ref: Invoice #{details.creditNoteFields.relatedInvoiceNumber}
            </span>
          )}
        </div>
      )}

      {/* Company Info */}
      {(companyName || logo) && (
        <div>
          {logo && (
            <img
              src={logo}
              alt="Company logo"
              className="h-10 w-auto max-w-[100px] object-contain mb-2"
            />
          )}
          <p className={`font-bold ${isCreditNote ? 'text-red-600' : 'text-[var(--brand-blue)]'}`}>{companyName}</p>
          {address && (
            <p className="text-[var(--text-secondary)] whitespace-pre-line text-xs">{address}</p>
          )}
          {postCode && <p className="text-[var(--text-secondary)] text-xs">{postCode}</p>}
          {vatNumber && <p className="text-[var(--text-muted)] text-xs">VAT: {vatNumber}</p>}
          {isCis && cisUtr && <p className="text-[var(--text-muted)] text-xs">UTR: {cisUtr}</p>}
        </div>
      )}

      {/* Invoice Details */}
      {(details.invoiceNumber || details.date) && (
        <div className="border-t pt-3">
          {details.invoiceNumber && (
            <p className="font-semibold">
              {isCreditNote ? 'Credit Note' : 'Invoice'} #{details.invoiceNumber}
            </p>
          )}
          {details.date && (
            <>
              <p className="text-[var(--text-secondary)] text-xs">
                Date: {formatDateUK(details.date)}
              </p>
              <p className="text-[var(--text-secondary)] text-xs">
                Due: {formatDateUK(calculateDueDate(details.date, details.paymentTerms).toISOString())}
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                Terms: {getPaymentTermsText(details.paymentTerms)}
              </p>
            </>
          )}
        </div>
      )}

      {/* Customer */}
      {customer.name && (
        <div className="border-t pt-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Bill To:</p>
          <p className="font-medium">{customer.name}</p>
          {customer.address && (
            <p className="text-[var(--text-secondary)] whitespace-pre-line text-xs">
              {customer.address}
            </p>
          )}
          {customer.postCode && (
            <p className="text-[var(--text-secondary)] text-xs">{customer.postCode}</p>
          )}
        </div>
      )}

      {/* Line Items */}
      {lineItems.some((item) => item.description) && (
        <div className="border-t pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems
                .filter((item) => item.description)
                .map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-1">
                      {item.description}
                      <span className="text-slate-400 ml-1">x{item.quantity}</span>
                    </td>
                    <td className="text-right py-1">
                      {formatCurrency(
                        calculateLineTotal(item.quantity, item.netAmount, item.vatRate)
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes/Terms */}
      {details.notes && (
        <div className="border-t pt-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Notes:</p>
          <p className="text-xs text-[var(--text-secondary)] whitespace-pre-line">{details.notes}</p>
        </div>
      )}
    </div>
  );
}

interface InvoiceTotalsSectionProps {
  totals: InvoiceTotals;
}

export function InvoiceTotalsSection({ totals }: InvoiceTotalsSectionProps) {
  const { cisStatus } = useCompanyStore();
  const { details } = useInvoiceStore();
  const isCis = cisStatus !== 'not_applicable';
  const hasCisBreakdown = isCis && totals.cisBreakdown;
  const isCreditNote = details.documentType === 'credit_note';

  return (
    <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
      {/* CIS Breakdown - shown for CIS subcontractors */}
      {hasCisBreakdown && totals.cisBreakdown && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
          <p className="text-xs font-semibold text-amber-800 mb-2">
            CIS Breakdown ({getCisStatusLabel(cisStatus)})
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-amber-700">Labour</span>
            <span className="font-medium text-amber-800">
              <AnimatedNumber value={totals.cisBreakdown.labourTotal} formatFn={formatCurrency} />
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-amber-700">Materials</span>
            <span className="font-medium text-amber-800">
              <AnimatedNumber value={totals.cisBreakdown.materialsTotal} formatFn={formatCurrency} />
            </span>
          </div>
          {totals.cisBreakdown.deductionAmount > 0 && (
            <div className="flex justify-between text-xs border-t border-amber-200 pt-1 mt-1">
              <span className="text-amber-700">CIS Deduction ({Math.round(totals.cisBreakdown.deductionRate * 100)}%)</span>
              <span className="font-medium text-red-600">
                -<AnimatedNumber value={totals.cisBreakdown.deductionAmount} formatFn={formatCurrency} />
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Subtotal</span>
        <span className="font-medium">
          <AnimatedNumber value={totals.subtotal} formatFn={formatCurrency} />
        </span>
      </div>
      {totals.vatBreakdown.map((vat) => (
        <div key={vat.rate} className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">{getVatRateLabel(vat.rate)}</span>
          <span className="font-medium">
            <AnimatedNumber value={vat.amount} formatFn={formatCurrency} />
          </span>
        </div>
      ))}
      {totals.vatBreakdown.length === 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">VAT</span>
          <span className="font-medium">{formatCurrency(0)}</span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
        <span>{isCreditNote ? 'Credit Total' : 'Total'}</span>
        <span className={isCreditNote ? 'text-red-600' : 'text-[var(--brand-blue)]'}>
          <AnimatedNumber value={totals.total} formatFn={formatCurrency} />
        </span>
      </div>

      {/* Net Payable after CIS deduction */}
      {hasCisBreakdown && totals.cisBreakdown && totals.cisBreakdown.deductionAmount > 0 && (
        <div className="flex justify-between text-lg font-bold text-green-700 bg-green-50 rounded-md p-2 -mx-2">
          <span>Net Payable</span>
          <span>
            <AnimatedNumber value={totals.cisBreakdown.netPayable} formatFn={formatCurrency} />
          </span>
        </div>
      )}
    </div>
  );
}
