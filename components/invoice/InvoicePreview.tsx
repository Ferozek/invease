'use client';

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
import type { InvoiceTotals } from '@/types/invoice';

interface InvoicePreviewProps {
  totals: InvoiceTotals;
}

export default function InvoicePreview({ totals }: InvoicePreviewProps) {
  const { logo, companyName, vatNumber, address, postCode, cisStatus, cisUtr } = useCompanyStore();
  const { customer, details, lineItems } = useInvoiceStore();

  const isCis = cisStatus !== 'not_applicable';

  const hasContent =
    companyName || logo || customer.name || lineItems.some((item) => item.description);

  if (!hasContent) {
    return (
      <p className="text-slate-500 text-center py-8">
        Fill in the form to see your invoice preview
      </p>
    );
  }

  return (
    <div className="space-y-4">
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
          <p className="font-bold text-[var(--brand-blue)]">{companyName}</p>
          {address && (
            <p className="text-slate-600 whitespace-pre-line text-xs">{address}</p>
          )}
          {postCode && <p className="text-slate-600 text-xs">{postCode}</p>}
          {vatNumber && <p className="text-slate-500 text-xs">VAT: {vatNumber}</p>}
          {isCis && cisUtr && <p className="text-slate-500 text-xs">UTR: {cisUtr}</p>}
        </div>
      )}

      {/* Invoice Details */}
      {(details.invoiceNumber || details.date) && (
        <div className="border-t pt-3">
          {details.invoiceNumber && (
            <p className="font-semibold">Invoice #{details.invoiceNumber}</p>
          )}
          {details.date && (
            <>
              <p className="text-slate-600 text-xs">
                Date: {formatDateUK(details.date)}
              </p>
              <p className="text-slate-600 text-xs">
                Due: {formatDateUK(calculateDueDate(details.date, details.paymentTerms).toISOString())}
              </p>
              <p className="text-slate-500 text-xs">
                Terms: {getPaymentTermsText(details.paymentTerms)}
              </p>
            </>
          )}
        </div>
      )}

      {/* Customer */}
      {customer.name && (
        <div className="border-t pt-3">
          <p className="text-xs text-slate-500 mb-1">Bill To:</p>
          <p className="font-medium">{customer.name}</p>
          {customer.address && (
            <p className="text-slate-600 whitespace-pre-line text-xs">
              {customer.address}
            </p>
          )}
          {customer.postCode && (
            <p className="text-slate-600 text-xs">{customer.postCode}</p>
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
          <p className="text-xs text-slate-500 mb-1">Notes:</p>
          <p className="text-xs text-slate-600 whitespace-pre-line">{details.notes}</p>
        </div>
      )}
    </div>
  );
}

interface InvoiceTotalsSectionProps {
  totals: InvoiceTotals;
}

// Helper to get CIS status label
const getCisStatusLabel = (status: string): string => {
  switch (status) {
    case 'gross_payment': return 'Gross Payment (0%)';
    case 'standard': return 'Verified (20%)';
    case 'unverified': return 'Unverified (30%)';
    default: return '';
  }
};

export function InvoiceTotalsSection({ totals }: InvoiceTotalsSectionProps) {
  const { cisStatus } = useCompanyStore();
  const isCis = cisStatus !== 'not_applicable';
  const hasCisBreakdown = isCis && totals.cisBreakdown;

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
            <span className="font-medium text-amber-800">{formatCurrency(totals.cisBreakdown.labourTotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-amber-700">Materials</span>
            <span className="font-medium text-amber-800">{formatCurrency(totals.cisBreakdown.materialsTotal)}</span>
          </div>
          {totals.cisBreakdown.deductionAmount > 0 && (
            <div className="flex justify-between text-xs border-t border-amber-200 pt-1 mt-1">
              <span className="text-amber-700">CIS Deduction ({Math.round(totals.cisBreakdown.deductionRate * 100)}%)</span>
              <span className="font-medium text-red-600">-{formatCurrency(totals.cisBreakdown.deductionAmount)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
      </div>
      {totals.vatBreakdown.map((vat) => (
        <div key={vat.rate} className="flex justify-between text-sm">
          <span className="text-slate-600">{getVatRateLabel(vat.rate)}</span>
          <span className="font-medium">{formatCurrency(vat.amount)}</span>
        </div>
      ))}
      {totals.vatBreakdown.length === 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">VAT</span>
          <span className="font-medium">{formatCurrency(0)}</span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
        <span>Total</span>
        <span className="text-[var(--brand-blue)]">{formatCurrency(totals.total)}</span>
      </div>

      {/* Net Payable after CIS deduction */}
      {hasCisBreakdown && totals.cisBreakdown && totals.cisBreakdown.deductionAmount > 0 && (
        <div className="flex justify-between text-lg font-bold text-green-700 bg-green-50 rounded-md p-2 -mx-2">
          <span>Net Payable</span>
          <span>{formatCurrency(totals.cisBreakdown.netPayable)}</span>
        </div>
      )}
    </div>
  );
}
