'use client';

import { useCompanyStore } from '@/stores/companyStore';
import type { BusinessType } from '@/types/invoice';

interface ReviewStepProps {
  businessType: BusinessType;
  onEditStep: (step: number) => void;
}

// Business type labels
const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  sole_trader: 'Sole Trader',
  partnership: 'Partnership',
  limited_company: 'Limited Company',
};

// CIS status labels
const CIS_STATUS_LABELS: Record<string, string> = {
  gross_payment: 'Gross Payment (0%)',
  standard: 'Verified (20%)',
  unverified: 'Unverified (30%)',
};

/**
 * Step 5: Review & Confirm
 * Apple-style summary with edit links for each section
 */
export default function ReviewStep({ businessType, onEditStep }: ReviewStepProps) {
  const {
    logo,
    companyName,
    companyNumber,
    address,
    postCode,
    vatNumber,
    eoriNumber,
    cisStatus,
    cisUtr,
    bankDetails,
  } = useCompanyStore();

  const isCisEnabled = cisStatus !== 'not_applicable';
  const hasTaxDetails = vatNumber || eoriNumber || isCisEnabled;

  // Format sort code for display
  const formatSortCode = (code: string) => {
    const clean = code.replace(/-/g, '');
    if (clean.length === 6) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}`;
    }
    return code;
  };

  // Mask account number for display (show last 4)
  const maskAccountNumber = (num: string) => {
    if (num.length >= 4) {
      return `••••${num.slice(-4)}`;
    }
    return num;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Review Your Details
        </h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Make sure everything looks correct
        </p>
      </div>

      {/* Business Type */}
      <ReviewSection title="Business Type" onEdit={() => onEditStep(1)}>
        <p className="text-[var(--text-primary)]">{BUSINESS_TYPE_LABELS[businessType]}</p>
      </ReviewSection>

      {/* Identity */}
      <ReviewSection title="Business Identity" onEdit={() => onEditStep(2)}>
        <div className="flex items-start gap-3">
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain rounded border border-[var(--surface-border)]"
            />
          )}
          <div>
            <p className="font-medium text-[var(--text-primary)]">{companyName}</p>
            {companyNumber && (
              <p className="text-sm text-[var(--text-secondary)]">Company No: {companyNumber}</p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mt-1 whitespace-pre-line">{address}</p>
            <p className="text-sm text-[var(--text-secondary)]">{postCode}</p>
          </div>
        </div>
      </ReviewSection>

      {/* Tax & Compliance */}
      <ReviewSection
        title="Tax & Compliance"
        onEdit={() => onEditStep(3)}
        empty={!hasTaxDetails}
        emptyText="None specified"
      >
        {hasTaxDetails && (
          <div className="space-y-1">
            {vatNumber && (
              <p className="text-sm text-[var(--text-primary)]">
                <span className="text-[var(--text-muted)]">VAT:</span> {vatNumber}
              </p>
            )}
            {eoriNumber && (
              <p className="text-sm text-[var(--text-primary)]">
                <span className="text-[var(--text-muted)]">EORI:</span> {eoriNumber}
              </p>
            )}
            {isCisEnabled && (
              <>
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)]">CIS UTR:</span> {cisUtr}
                </p>
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)]">CIS Status:</span> {CIS_STATUS_LABELS[cisStatus]}
                </p>
              </>
            )}
          </div>
        )}
      </ReviewSection>

      {/* Bank Details */}
      <ReviewSection title="Bank Details" onEdit={() => onEditStep(4)}>
        <div className="space-y-1">
          <p className="font-medium text-[var(--text-primary)]">{bankDetails.bankName}</p>
          <p className="text-sm text-[var(--text-secondary)]">{bankDetails.accountName}</p>
          <p className="text-sm text-[var(--text-secondary)] font-mono">
            {maskAccountNumber(bankDetails.accountNumber)} | {formatSortCode(bankDetails.sortCode)}
          </p>
        </div>
      </ReviewSection>
    </div>
  );
}

/**
 * Reusable section component for review
 */
interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children?: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
}

function ReviewSection({ title, onEdit, children, empty, emptyText }: ReviewSectionProps) {
  return (
    <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--text-muted)]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer text-sm text-[var(--brand-blue)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 rounded"
        >
          Edit
        </button>
      </div>
      {empty ? (
        <p className="text-sm text-[var(--text-muted)] italic">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  );
}
