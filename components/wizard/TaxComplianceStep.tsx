'use client';

import { useState, useCallback } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { CIS_STATUS_OPTIONS } from '@/config/constants';
import type { CisStatus } from '@/types/invoice';
import {
  validateVatNumber,
  validateEoriNumber,
  validateUtr,
  normaliseVatNumber,
  normaliseEoriNumber,
  normaliseUtr,
} from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';

/**
 * Step 3: Tax & Compliance (Optional)
 * Users can skip this entirely and add later
 * - VAT Registration
 * - EORI for imports/exports
 * - CIS for construction workers
 *
 * Features Apple-style inline validation
 */
export default function TaxComplianceStep() {
  const {
    vatNumber,
    eoriNumber,
    cisStatus,
    cisUtr,
    setCompanyDetails,
    setCisDetails,
  } = useCompanyStore();

  const isCisEnabled = cisStatus !== 'not_applicable';

  // Validation state
  const [errors, setErrors] = useState<Record<string, string | null>>({
    vatNumber: null,
    eoriNumber: null,
    cisUtr: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    vatNumber: false,
    eoriNumber: false,
    cisUtr: false,
  });

  // Validate field on blur
  const handleBlur = useCallback((field: string, value: string, required = false) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let result;
    switch (field) {
      case 'vatNumber':
        result = validateVatNumber(value, required);
        break;
      case 'eoriNumber':
        result = validateEoriNumber(value, required);
        break;
      case 'cisUtr':
        result = validateUtr(value, required);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.error }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Tax & Compliance
        </h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Optional — skip if none apply to you
        </p>
      </div>

      {/* VAT Registration */}
      <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">VAT Registered</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              If you're registered for VAT, enter your number
            </p>
          </div>
        </div>
        <div className="mt-3">
          <input
            id="vatNumber"
            type="text"
            className={`form-input ${touched.vatNumber && errors.vatNumber ? 'form-input-error' : ''}`}
            placeholder="e.g., GB123456789"
            value={vatNumber}
            onChange={(e) => setCompanyDetails({ vatNumber: normaliseVatNumber(e.target.value) })}
            onBlur={(e) => handleBlur('vatNumber', e.target.value, false)}
          />
          <FieldError error={touched.vatNumber ? errors.vatNumber : null} />
        </div>
      </div>

      {/* EORI */}
      <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">EORI Number</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              For importing or exporting goods
            </p>
          </div>
        </div>
        <div className="mt-3">
          <input
            id="eoriNumber"
            type="text"
            className={`form-input ${touched.eoriNumber && errors.eoriNumber ? 'form-input-error' : ''}`}
            placeholder="e.g., GB123456789000"
            value={eoriNumber}
            onChange={(e) => setCompanyDetails({ eoriNumber: normaliseEoriNumber(e.target.value) })}
            onBlur={(e) => handleBlur('eoriNumber', e.target.value, false)}
          />
          <FieldError error={touched.eoriNumber ? errors.eoriNumber : null} />
        </div>
      </div>

      {/* CIS Subcontractor */}
      <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded border-[var(--input-border)] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
            checked={isCisEnabled}
            onChange={(e) => {
              if (e.target.checked) {
                setCisDetails({ cisStatus: 'standard' });
              } else {
                setCisDetails({ cisStatus: 'not_applicable', cisUtr: '' });
              }
            }}
          />
          <div className="flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">CIS Subcontractor</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              I receive payments from contractors in the construction industry
            </p>
          </div>
        </label>

        {isCisEnabled && (
          <div className="mt-4 pt-4 border-t border-[var(--surface-border)] space-y-4">
            <div>
              <label htmlFor="cisUtr" className="form-label form-label-required">
                UTR Number
              </label>
              <input
                id="cisUtr"
                type="text"
                className={`form-input ${touched.cisUtr && errors.cisUtr ? 'form-input-error' : ''}`}
                placeholder="10 digit number"
                maxLength={10}
                value={cisUtr}
                onChange={(e) => {
                  const value = normaliseUtr(e.target.value);
                  setCisDetails({ cisUtr: value });
                }}
                onBlur={(e) => handleBlur('cisUtr', e.target.value, true)}
              />
              {touched.cisUtr && errors.cisUtr ? (
                <FieldError error={errors.cisUtr} />
              ) : (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Your Unique Taxpayer Reference from HMRC
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cisStatus" className="form-label form-label-required">
                CIS Deduction Rate
              </label>
              <select
                id="cisStatus"
                className="form-input"
                value={cisStatus}
                onChange={(e) => setCisDetails({ cisStatus: e.target.value as CisStatus })}
              >
                {CIS_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.rate})
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Check with HMRC or your contractor for your status
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Validation helper for TaxComplianceStep
 * This step is optional, but if CIS is enabled, UTR must be 10 digits
 */
export function isTaxComplianceStepValid(): boolean {
  const { cisStatus, cisUtr } = useCompanyStore.getState();
  const isCisEnabled = cisStatus !== 'not_applicable';

  // If CIS is enabled, UTR must be 10 digits
  if (isCisEnabled && cisUtr.trim().length !== 10) {
    return false;
  }

  return true;
}
