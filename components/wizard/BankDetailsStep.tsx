'use client';

import { useState, useCallback } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase } from '@/lib/textFormatters';
import {
  validateRequired,
  validateAccountNumber,
  validateSortCode,
} from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';
import { hapticFeedback } from '@/lib/haptics';

/**
 * Step 4: Bank Details
 * Payment information that appears on invoices
 * Features Apple-style inline validation (red border + shake on blur)
 *
 * SECURITY: Bank details are never saved to localStorage.
 * They exist only in memory and must be re-entered each session.
 */
export default function BankDetailsStep() {
  const { bankDetails, setBankDetails } = useCompanyStore();

  // Validation state for each field
  const [errors, setErrors] = useState<Record<string, string | null>>({
    bankName: null,
    accountName: null,
    accountNumber: null,
    sortCode: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    bankName: false,
    accountName: false,
    accountNumber: false,
    sortCode: false,
  });

  // Validate individual field
  const validateField = useCallback((field: string, value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'bankName':
        error = validateRequired(value, 'Bank name').error;
        break;
      case 'accountName':
        error = validateRequired(value, 'Account name').error;
        break;
      case 'accountNumber':
        error = validateAccountNumber(value, true).error;
        break;
      case 'sortCode':
        error = validateSortCode(value, true).error;
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Trigger haptic feedback on validation error
    if (error) {
      hapticFeedback.error();
    }

    return error === null;
  }, []);

  // Handle blur for each field
  const handleBlur = (field: string, value: string, transform?: (v: string) => string) => {
    const transformedValue = transform ? transform(value) : value;
    validateField(field, transformedValue);
  };

  // Format sort code as user types (XX-XX-XX)
  const handleSortCodeChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Format with dashes
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
    }
    setBankDetails({ sortCode: formatted });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Bank Details
        </h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Where customers should send payments
        </p>
      </div>

      {/* Bank Name */}
      <div>
        <label htmlFor="bankName" className="form-label form-label-required">
          Bank Name
        </label>
        <input
          id="bankName"
          type="text"
          autoComplete="organization"
          className={`form-input ${touched.bankName && errors.bankName ? 'form-input-error' : ''}`}
          placeholder="e.g., Barclays, HSBC, Lloyds"
          value={bankDetails.bankName}
          onChange={(e) => setBankDetails({ bankName: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setBankDetails({ bankName: formatted });
            handleBlur('bankName', formatted);
          }}
          autoFocus
        />
        <FieldError error={touched.bankName ? errors.bankName : null} />
      </div>

      {/* Account Name */}
      <div>
        <label htmlFor="accountName" className="form-label form-label-required">
          Account Name
        </label>
        <input
          id="accountName"
          type="text"
          autoComplete="name"
          className={`form-input ${touched.accountName && errors.accountName ? 'form-input-error' : ''}`}
          placeholder="Name on the account"
          value={bankDetails.accountName}
          onChange={(e) => setBankDetails({ accountName: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setBankDetails({ accountName: formatted });
            handleBlur('accountName', formatted);
          }}
        />
        {touched.accountName && errors.accountName ? (
          <FieldError error={errors.accountName} />
        ) : (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            As it appears on your bank statements
          </p>
        )}
      </div>

      {/* Account Number & Sort Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="accountNumber" className="form-label form-label-required">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            inputMode="numeric"
            className={`form-input font-mono ${touched.accountNumber && errors.accountNumber ? 'form-input-error' : ''}`}
            placeholder="12345678"
            maxLength={8}
            value={bankDetails.accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setBankDetails({ accountNumber: value });
            }}
            onBlur={(e) => handleBlur('accountNumber', e.target.value)}
          />
          {touched.accountNumber && errors.accountNumber ? (
            <FieldError error={errors.accountNumber} />
          ) : (
            <p className="text-xs text-[var(--text-muted)] mt-1">8 digits</p>
          )}
        </div>

        <div>
          <label htmlFor="sortCode" className="form-label form-label-required">
            Sort Code
          </label>
          <input
            id="sortCode"
            type="text"
            inputMode="numeric"
            className={`form-input font-mono ${touched.sortCode && errors.sortCode ? 'form-input-error' : ''}`}
            placeholder="00-00-00"
            maxLength={8}
            value={bankDetails.sortCode}
            onChange={(e) => handleSortCodeChange(e.target.value)}
            onBlur={(e) => handleBlur('sortCode', e.target.value)}
          />
          {touched.sortCode && errors.sortCode ? (
            <FieldError error={errors.sortCode} />
          ) : (
            <p className="text-xs text-[var(--text-muted)] mt-1">6 digits</p>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-[var(--surface-elevated)] rounded-xl">
        <div className="flex items-start gap-2 text-sm">
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <p className="text-[var(--text-muted)]">
            Your bank details are never saved. They exist only during this session for security.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Validation helper for BankDetailsStep
 */
export function isBankDetailsStepValid(): boolean {
  const { bankDetails } = useCompanyStore.getState();
  return (
    bankDetails.bankName.trim() !== '' &&
    bankDetails.accountName.trim() !== '' &&
    bankDetails.accountNumber.trim().length === 8 &&
    bankDetails.sortCode.replace(/-/g, '').length === 6
  );
}
