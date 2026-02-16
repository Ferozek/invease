'use client';

import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase } from '@/lib/textFormatters';

export default function BankDetailsForm() {
  const { bankDetails, setBankDetails } = useCompanyStore();

  return (
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
  );
}
