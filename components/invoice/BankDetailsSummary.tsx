'use client';

import { useCompanyStore } from '@/stores/companyStore';

/**
 * BankDetailsSummary - Read-only display of saved bank details
 * Following Apple HIG: Show saved data as summary, not duplicate editable forms
 */
export default function BankDetailsSummary() {
  const { bankDetails } = useCompanyStore();

  const hasContent =
    bankDetails.accountNumber ||
    bankDetails.sortCode ||
    bankDetails.accountName ||
    bankDetails.bankName;

  if (!hasContent) {
    return (
      <div className="space-y-2">
        <p className="text-[var(--text-secondary)] text-sm">
          No bank details added — this is fine.
        </p>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          Your invoice will include a note asking the customer to contact you directly for payment details. This follows GDPR data minimisation principles and protects against invoice interception fraud.
        </p>
      </div>
    );
  }

  // Format sort code with dashes for display
  const formatSortCode = (code: string) => {
    const clean = code.replace(/\D/g, '');
    if (clean.length === 6) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}`;
    }
    return code;
  };

  return (
    <div className="space-y-3">
      {/* Bank Name Header */}
      {bankDetails.bankName && (
        <p className="font-semibold text-[var(--text-primary)]">{bankDetails.bankName}</p>
      )}

      {/* Account Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {bankDetails.accountName && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">Account Name</p>
            <p className="font-medium text-[var(--text-secondary)]">{bankDetails.accountName}</p>
          </div>
        )}
        {bankDetails.accountNumber && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">Account No.</p>
            <p className="font-medium text-[var(--text-secondary)] font-mono">
              {bankDetails.accountNumber}
            </p>
          </div>
        )}
        {bankDetails.sortCode && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">Sort Code</p>
            <p className="font-medium text-[var(--text-secondary)] font-mono">
              {formatSortCode(bankDetails.sortCode)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
