'use client';

import { useCompanyStore } from '@/stores/companyStore';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { toTitleCase } from '@/lib/textFormatters';
import PaymentQRCode from './PaymentQRCode';

export default function BankDetailsForm() {
  const { bankDetails, setBankDetails } = useCompanyStore();
  const totals = useInvoiceStore((s) => s.getTotals());
  const reference = useInvoiceStore((s) => s.details.invoiceNumber);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-green-700 dark:text-green-300">
          Bank details are stored in memory only and never saved to your device. They clear when you close this tab.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="form-label form-label-required">Account Number</label>
        <input
          type="text"
          className="form-input"
          placeholder="8 digits"
          value={bankDetails.accountNumber}
          onChange={(e) => setBankDetails({ accountNumber: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label form-label-required">Sort Code</label>
        <input
          type="text"
          className="form-input"
          placeholder="XX-XX-XX"
          value={bankDetails.sortCode}
          onChange={(e) => setBankDetails({ sortCode: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label form-label-required">Account Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Account holder name"
          value={bankDetails.accountName}
          onChange={(e) => setBankDetails({ accountName: e.target.value })}
          onBlur={(e) => setBankDetails({ accountName: toTitleCase(e.target.value) })}
        />
      </div>
      <div>
        <label className="form-label form-label-required">Bank Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Barclays"
          value={bankDetails.bankName}
          onChange={(e) => setBankDetails({ bankName: e.target.value })}
          onBlur={(e) => setBankDetails({ bankName: toTitleCase(e.target.value) })}
        />
      </div>
      <div className="md:col-span-2">
        <label className="form-label">Reference</label>
        <input
          type="text"
          className="form-input"
          placeholder="Payment reference (optional)"
          value={bankDetails.reference}
          onChange={(e) => setBankDetails({ reference: e.target.value })}
        />
      </div>
    </div>

      {/* QR Code preview — shows when bank details are filled */}
      <PaymentQRCode
        bankDetails={bankDetails}
        amount={totals.total}
        reference={reference}
        size={120}
      />
    </div>
  );
}
