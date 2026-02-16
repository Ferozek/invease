/**
 * UK-Specific Validation Patterns
 * Based on HMRC and UK government standards
 * Adapted from KR-Website with Apple HIG inline validation approach
 */

// ===== VALIDATION PATTERNS =====

/**
 * UK Postcode Pattern
 * Format: A1 1AA, A11 1AA, AA1 1AA, AA11 1AA, A1A 1AA, AA1A 1AA
 * Source: Royal Mail PAF specification
 */
export const postcodePattern = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/;

/**
 * UK VAT Number Pattern
 * Formats: GB123456789, GB123456789012, GBGD001, GBHA599
 * Source: HMRC VAT Notice 700/1
 */
export const vatNumberPattern = /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/i;

/**
 * EORI Number Pattern
 * Format: GB + 12 digits (e.g., GB123456789012)
 * Source: HMRC guidance on EORI numbers
 */
export const eoriNumberPattern = /^GB\d{12}$/i;

/**
 * UTR (Unique Taxpayer Reference) Pattern
 * Format: 10 digits
 * Source: HMRC Self Assessment
 */
export const utrPattern = /^\d{10}$/;

/**
 * UK Sort Code Pattern
 * Format: 6 digits, optionally with dashes (12-34-56 or 123456)
 */
export const sortCodePattern = /^\d{2}-?\d{2}-?\d{2}$/;

/**
 * UK Bank Account Number Pattern
 * Format: 8 digits
 */
export const accountNumberPattern = /^\d{8}$/;

/**
 * Company Number Pattern
 * Format: 8 digits or 2 letters + 6 digits (for Scottish/NI companies)
 * Source: Companies House
 */
export const companyNumberPattern = /^(\d{8}|[A-Z]{2}\d{6})$/i;

// ===== NORMALIZATION FUNCTIONS =====

/**
 * Normalizes UK postcode to standard format (e.g., "SW1A 1AA")
 * Adds space before last 3 characters if missing
 */
export function normalisePostcode(value: string): string {
  if (!value) return '';
  const cleaned = value.toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  // Insert space before last 3 characters (the inward code)
  const formatted = cleaned.replace(/^(.+)(\d[A-Z]{2})$/, '$1 $2');
  return formatted;
}

/**
 * Normalizes sort code to XX-XX-XX format
 */
export function normaliseSortCode(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 6) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
  }
  return value;
}

/**
 * Normalizes VAT number (uppercase, no spaces)
 */
export function normaliseVatNumber(value: string): string {
  if (!value) return '';
  return value.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normalizes EORI number (uppercase, no spaces)
 */
export function normaliseEoriNumber(value: string): string {
  if (!value) return '';
  return value.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normalizes UTR (digits only)
 */
export function normaliseUtr(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Normalizes company number (uppercase, no spaces)
 */
export function normaliseCompanyNumber(value: string): string {
  if (!value) return '';
  return value.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normalizes account number (digits only)
 */
export function normaliseAccountNumber(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

// ===== VALIDATION FUNCTIONS =====

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  normalizedValue?: string;
}

/**
 * Validates UK postcode
 */
export function validatePostcode(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'Postcode is required' : null,
    };
  }
  const normalized = normalisePostcode(value);
  const isValid = postcodePattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'Please enter a valid UK postcode',
    normalizedValue: normalized,
  };
}

/**
 * Validates VAT number
 */
export function validateVatNumber(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'VAT number is required' : null,
    };
  }
  const normalized = normaliseVatNumber(value);
  const isValid = vatNumberPattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'VAT number must be GB followed by 9 or 12 digits',
    normalizedValue: normalized,
  };
}

/**
 * Validates EORI number
 */
export function validateEoriNumber(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'EORI number is required' : null,
    };
  }
  const normalized = normaliseEoriNumber(value);
  const isValid = eoriNumberPattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'EORI must be GB followed by 12 digits',
    normalizedValue: normalized,
  };
}

/**
 * Validates UTR
 */
export function validateUtr(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'UTR is required' : null,
    };
  }
  const normalized = normaliseUtr(value);
  const isValid = utrPattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'UTR must be exactly 10 digits',
    normalizedValue: normalized,
  };
}

/**
 * Validates sort code
 */
export function validateSortCode(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'Sort code is required' : null,
    };
  }
  const normalized = normaliseSortCode(value);
  const isValid = sortCodePattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'Sort code must be 6 digits (XX-XX-XX)',
    normalizedValue: normalized,
  };
}

/**
 * Validates account number
 */
export function validateAccountNumber(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'Account number is required' : null,
    };
  }
  const normalized = normaliseAccountNumber(value);
  const isValid = accountNumberPattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'Account number must be 8 digits',
    normalizedValue: normalized,
  };
}

/**
 * Validates company number
 */
export function validateCompanyNumber(value: string, required = false): ValidationResult {
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'Company number is required' : null,
    };
  }
  const normalized = normaliseCompanyNumber(value);
  const isValid = companyNumberPattern.test(normalized);
  return {
    isValid,
    error: isValid ? null : 'Company number must be 8 characters',
    normalizedValue: normalized,
  };
}

/**
 * Validates required text field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const isValid = value.trim().length > 0;
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`,
  };
}

/**
 * Validates minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { isValid: true, error: null }; // Empty is handled by required
  }
  const isValid = value.trim().length >= minLength;
  return {
    isValid,
    error: isValid ? null : `${fieldName} must be at least ${minLength} characters`,
  };
}

/**
 * Validates positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): ValidationResult {
  const isValid = !isNaN(value) && value > 0;
  return {
    isValid,
    error: isValid ? null : `${fieldName} must be greater than 0`,
  };
}

/**
 * Validates non-negative number
 */
export function validateNonNegativeNumber(value: number, fieldName: string): ValidationResult {
  const isValid = !isNaN(value) && value >= 0;
  return {
    isValid,
    error: isValid ? null : `${fieldName} cannot be negative`,
  };
}
