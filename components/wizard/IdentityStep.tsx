'use client';

import { useState, useCallback } from 'react';
import LogoUpload from '@/components/shared/LogoUpload';
import CompanySearch from '@/components/shared/CompanySearch';
import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase } from '@/lib/textFormatters';
import type { BusinessType } from '@/types/invoice';
import {
  validateRequired,
  validatePostcode,
  validateCompanyNumber,
  normalisePostcode,
} from '@/lib/validationPatterns';
import { FieldError } from '@/components/ui/FormField';

interface IdentityStepProps {
  businessType: BusinessType;
}

/**
 * Step 2: Your Identity
 * Collects essential business identity information
 * - Logo (optional)
 * - Company name/trading name
 * - Address + Postcode
 * - Company number (Ltd only)
 *
 * Features Apple-style inline validation
 */
export default function IdentityStep({ businessType }: IdentityStepProps) {
  const {
    companyName,
    companyNumber,
    address,
    postCode,
    setCompanyDetails,
  } = useCompanyStore();

  // Validation state
  const [errors, setErrors] = useState<Record<string, string | null>>({
    companyName: null,
    address: null,
    postCode: null,
    companyNumber: null,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    companyName: false,
    address: false,
    postCode: false,
    companyNumber: false,
  });

  // Validate field
  const handleBlur = useCallback((field: string, value: string, required = false) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let result;
    switch (field) {
      case 'companyName':
        result = validateRequired(value, 'Business name');
        break;
      case 'address':
        result = validateRequired(value, 'Address');
        break;
      case 'postCode':
        result = validatePostcode(value, required);
        break;
      case 'companyNumber':
        result = validateCompanyNumber(value, false);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: result.error }));
  }, []);

  // Determine field labels based on business type
  const getNameLabel = () => {
    switch (businessType) {
      case 'sole_trader':
        return 'Trading Name';
      case 'partnership':
        return 'Partnership Name';
      case 'limited_company':
        return 'Company Name';
      default:
        return 'Business Name';
    }
  };

  const getNamePlaceholder = () => {
    switch (businessType) {
      case 'sole_trader':
        return 'e.g., John Smith Trading';
      case 'partnership':
        return 'e.g., Smith & Jones';
      case 'limited_company':
        return 'e.g., Acme Ltd';
      default:
        return 'Your business name';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Your {businessType === 'limited_company' ? 'Company' : 'Business'} Identity
        </h2>
        <p className="text-[var(--text-secondary)] mt-1">
          This information appears on your invoices
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex justify-center">
        <LogoUpload />
      </div>

      {/* Companies House Search - only for Ltd companies */}
      {businessType === 'limited_company' && <CompanySearch />}

      {/* Name Field */}
      <div>
        <label htmlFor="companyName" className="form-label form-label-required">
          {getNameLabel()}
        </label>
        <input
          id="companyName"
          type="text"
          className={`form-input ${touched.companyName && errors.companyName ? 'form-input-error' : ''}`}
          placeholder={getNamePlaceholder()}
          value={companyName}
          onChange={(e) => setCompanyDetails({ companyName: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setCompanyDetails({ companyName: formatted });
            handleBlur('companyName', formatted, true);
          }}
          autoFocus
        />
        <FieldError error={touched.companyName ? errors.companyName : null} />
      </div>

      {/* Company Number - only for Ltd */}
      {businessType === 'limited_company' && (
        <div>
          <label htmlFor="companyNumber" className="form-label">
            Company Number
          </label>
          <input
            id="companyNumber"
            type="text"
            className={`form-input ${touched.companyNumber && errors.companyNumber ? 'form-input-error' : ''}`}
            placeholder="8 digit company number"
            maxLength={8}
            value={companyNumber}
            onChange={(e) => setCompanyDetails({ companyNumber: e.target.value.toUpperCase() })}
            onBlur={(e) => handleBlur('companyNumber', e.target.value, false)}
          />
          {touched.companyNumber && errors.companyNumber ? (
            <FieldError error={errors.companyNumber} />
          ) : (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Found on your certificate of incorporation
            </p>
          )}
        </div>
      )}

      {/* Address */}
      <div>
        <label htmlFor="address" className="form-label form-label-required">
          Business Address
        </label>
        <textarea
          id="address"
          className={`form-input resize-none ${touched.address && errors.address ? 'form-input-error' : ''}`}
          rows={3}
          placeholder="Enter your business address"
          value={address}
          onChange={(e) => setCompanyDetails({ address: e.target.value })}
          onBlur={(e) => {
            const formatted = toTitleCase(e.target.value);
            setCompanyDetails({ address: formatted });
            handleBlur('address', formatted, true);
          }}
        />
        <FieldError error={touched.address ? errors.address : null} />
      </div>

      {/* Postcode */}
      <div>
        <label htmlFor="postCode" className="form-label form-label-required">
          Post Code
        </label>
        <input
          id="postCode"
          type="text"
          className={`form-input max-w-[200px] ${touched.postCode && errors.postCode ? 'form-input-error' : ''}`}
          placeholder="e.g., SW1A 1AA"
          value={postCode}
          onChange={(e) => setCompanyDetails({ postCode: e.target.value })}
          onBlur={(e) => {
            const formatted = normalisePostcode(e.target.value);
            setCompanyDetails({ postCode: formatted });
            handleBlur('postCode', formatted, true);
          }}
        />
        <FieldError error={touched.postCode ? errors.postCode : null} />
      </div>
    </div>
  );
}

/**
 * Validation helper for IdentityStep
 */
export function isIdentityStepValid(): boolean {
  const { companyName, address, postCode } = useCompanyStore.getState();
  return (
    companyName.trim() !== '' &&
    address.trim() !== '' &&
    postCode.trim() !== ''
  );
}
