import { describe, it, expect } from 'vitest';
import {
  // Patterns
  postcodePattern,
  vatNumberPattern,
  eoriNumberPattern,
  utrPattern,
  sortCodePattern,
  accountNumberPattern,
  companyNumberPattern,
  // Normalisers
  normalisePostcode,
  normaliseSortCode,
  normaliseVatNumber,
  normaliseEoriNumber,
  normaliseUtr,
  normaliseCompanyNumber,
  normaliseAccountNumber,
  // Validators
  validatePostcode,
  validateVatNumber,
  validateEoriNumber,
  validateUtr,
  validateSortCode,
  validateAccountNumber,
  validateCompanyNumber,
  validateRequired,
  validateMinLength,
  validatePositiveNumber,
  validateNonNegativeNumber,
} from '@/lib/validationPatterns';

// ===== REGEX PATTERNS =====

describe('postcodePattern', () => {
  it.each([
    'SW1A 1AA', // Westminster
    'EC1A 1BB', // City of London
    'M1 1AA',   // Manchester
    'B1 1AA',   // Birmingham
    'W1A 0AX',  // BBC
    'LS1 4AP',  // Leeds
    'EH1 1YZ',  // Edinburgh
    'CF10 1AA', // Cardiff
    'BT1 1AA',  // Belfast
    'SW1A1AA',  // No space
    'sw1a 1aa', // Lowercase
  ])('matches valid UK postcode: %s', (postcode) => {
    expect(postcodePattern.test(postcode)).toBe(true);
  });

  it.each([
    '',
    '1234',
    'AAAA AAA',
    '123 456',
    'SW1A 1A',    // Too short inward code
    'SW1A 1AAA',  // Too long inward code
    'SW1A',       // Missing inward code
  ])('rejects invalid postcode: %s', (postcode) => {
    expect(postcodePattern.test(postcode)).toBe(false);
  });
});

describe('vatNumberPattern', () => {
  it.each([
    'GB123456789',      // 9-digit standard
    'GB123456789012',   // 12-digit branch trader
    'GBGD001',          // Government department
    'GBGD999',
    'GBHA500',          // Health authority
    'GBHA599',
    'gb123456789',      // Lowercase prefix
  ])('matches valid VAT number: %s', (vat) => {
    expect(vatNumberPattern.test(vat)).toBe(true);
  });

  it.each([
    '',
    '123456789',        // Missing GB prefix
    'GB12345678',       // 8 digits (too short)
    'GB1234567890',     // 10 digits (between 9 and 12)
    'GB12345678901',    // 11 digits
    'GBGD1234',         // GD + 4 digits
    'GBHA1234',         // HA + 4 digits
    'FR123456789',      // Wrong country prefix
    'GB',               // Just prefix
  ])('rejects invalid VAT number: %s', (vat) => {
    expect(vatNumberPattern.test(vat)).toBe(false);
  });
});

describe('eoriNumberPattern', () => {
  it.each([
    'GB123456789012',
    'gb123456789012',
  ])('matches valid EORI number: %s', (eori) => {
    expect(eoriNumberPattern.test(eori)).toBe(true);
  });

  it.each([
    '',
    'GB12345678901',     // 11 digits
    'GB1234567890123',   // 13 digits
    'FR123456789012',    // Wrong prefix
    '123456789012',      // No prefix
  ])('rejects invalid EORI number: %s', (eori) => {
    expect(eoriNumberPattern.test(eori)).toBe(false);
  });
});

describe('utrPattern', () => {
  it.each([
    '1234567890',
    '0000000000',
    '9999999999',
  ])('matches valid UTR: %s', (utr) => {
    expect(utrPattern.test(utr)).toBe(true);
  });

  it.each([
    '',
    '123456789',    // 9 digits
    '12345678901',  // 11 digits
    '12345ABCDE',   // Contains letters
    '12-34-56-78',  // Contains dashes
  ])('rejects invalid UTR: %s', (utr) => {
    expect(utrPattern.test(utr)).toBe(false);
  });
});

describe('sortCodePattern', () => {
  it.each([
    '12-34-56',   // With dashes
    '123456',     // Without dashes
  ])('matches valid sort code: %s', (sc) => {
    expect(sortCodePattern.test(sc)).toBe(true);
  });

  it.each([
    '',
    '12345',       // 5 digits
    '1234567',     // 7 digits
    '12-34-5',     // Incomplete with dashes
    'AB-CD-EF',    // Letters
    '12 34 56',    // Spaces instead of dashes
  ])('rejects invalid sort code: %s', (sc) => {
    expect(sortCodePattern.test(sc)).toBe(false);
  });
});

describe('accountNumberPattern', () => {
  it.each([
    '12345678',
    '00000000',
    '99999999',
  ])('matches valid account number: %s', (an) => {
    expect(accountNumberPattern.test(an)).toBe(true);
  });

  it.each([
    '',
    '1234567',     // 7 digits
    '123456789',   // 9 digits
    '1234ABCD',    // Contains letters
    '12-34-56-78', // Contains dashes
  ])('rejects invalid account number: %s', (an) => {
    expect(accountNumberPattern.test(an)).toBe(false);
  });
});

describe('companyNumberPattern', () => {
  it.each([
    '12345678',   // 8 digits
    '00000001',
    'SC123456',   // Scottish company
    'NI123456',   // Northern Ireland
    'sc123456',   // Lowercase letters
  ])('matches valid company number: %s', (cn) => {
    expect(companyNumberPattern.test(cn)).toBe(true);
  });

  it.each([
    '',
    '1234567',     // 7 digits
    '123456789',   // 9 digits
    'S1234567',    // 1 letter + 7 digits
    'ABC12345',    // 3 letters + 5 digits
    'SC12345',     // 2 letters + 5 digits
  ])('rejects invalid company number: %s', (cn) => {
    expect(companyNumberPattern.test(cn)).toBe(false);
  });
});

// ===== NORMALISATION FUNCTIONS =====

describe('normalisePostcode', () => {
  it('adds space before inward code', () => {
    expect(normalisePostcode('SW1A1AA')).toBe('SW1A 1AA');
  });

  it('uppercases lowercase input', () => {
    expect(normalisePostcode('sw1a 1aa')).toBe('SW1A 1AA');
  });

  it('strips extra spaces', () => {
    expect(normalisePostcode('SW1A  1AA')).toBe('SW1A 1AA');
  });

  it('handles already-formatted postcode', () => {
    expect(normalisePostcode('EC1A 1BB')).toBe('EC1A 1BB');
  });

  it('returns empty string for empty input', () => {
    expect(normalisePostcode('')).toBe('');
  });

  it('handles short postcodes', () => {
    expect(normalisePostcode('M11AA')).toBe('M1 1AA');
  });
});

describe('normaliseSortCode', () => {
  it('formats 6 digits to XX-XX-XX', () => {
    expect(normaliseSortCode('123456')).toBe('12-34-56');
  });

  it('strips existing dashes and reformats', () => {
    expect(normaliseSortCode('12-34-56')).toBe('12-34-56');
  });

  it('returns original for non-6-digit input', () => {
    expect(normaliseSortCode('12345')).toBe('12345');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseSortCode('')).toBe('');
  });

  it('strips non-digit characters and formats', () => {
    expect(normaliseSortCode('12 34 56')).toBe('12-34-56');
  });
});

describe('normaliseVatNumber', () => {
  it('uppercases and strips spaces', () => {
    expect(normaliseVatNumber('gb 123 456 789')).toBe('GB123456789');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseVatNumber('')).toBe('');
  });
});

describe('normaliseEoriNumber', () => {
  it('uppercases and strips spaces', () => {
    expect(normaliseEoriNumber('gb 123456789012')).toBe('GB123456789012');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseEoriNumber('')).toBe('');
  });
});

describe('normaliseUtr', () => {
  it('strips non-digit characters', () => {
    expect(normaliseUtr('12-34-567-890')).toBe('1234567890');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseUtr('')).toBe('');
  });
});

describe('normaliseCompanyNumber', () => {
  it('uppercases and strips spaces', () => {
    expect(normaliseCompanyNumber('sc 123456')).toBe('SC123456');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseCompanyNumber('')).toBe('');
  });
});

describe('normaliseAccountNumber', () => {
  it('strips non-digit characters', () => {
    expect(normaliseAccountNumber('1234-5678')).toBe('12345678');
  });

  it('returns empty string for empty input', () => {
    expect(normaliseAccountNumber('')).toBe('');
  });
});

// ===== VALIDATION FUNCTIONS =====

describe('validatePostcode', () => {
  it('accepts valid postcode', () => {
    const result = validatePostcode('SW1A 1AA');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.normalizedValue).toBe('SW1A 1AA');
  });

  it('accepts valid postcode without space', () => {
    const result = validatePostcode('SW1A1AA');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('SW1A 1AA');
  });

  it('rejects invalid postcode', () => {
    const result = validatePostcode('INVALID');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid UK postcode');
  });

  it('allows empty when not required', () => {
    const result = validatePostcode('');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('rejects empty when required', () => {
    const result = validatePostcode('', true);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Postcode is required');
  });

  it('treats whitespace-only as empty', () => {
    const result = validatePostcode('   ', true);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Postcode is required');
  });
});

describe('validateVatNumber', () => {
  it('accepts valid 9-digit VAT number', () => {
    const result = validateVatNumber('GB123456789');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('accepts valid 12-digit VAT number', () => {
    const result = validateVatNumber('GB123456789012');
    expect(result.isValid).toBe(true);
  });

  it('accepts government department VAT', () => {
    const result = validateVatNumber('GBGD001');
    expect(result.isValid).toBe(true);
  });

  it('normalises lowercase input', () => {
    const result = validateVatNumber('gb123456789');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('GB123456789');
  });

  it('rejects invalid VAT number', () => {
    const result = validateVatNumber('12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VAT number must be GB followed by 9 or 12 digits');
  });

  it('allows empty when not required', () => {
    expect(validateVatNumber('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    const result = validateVatNumber('', true);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VAT number is required');
  });
});

describe('validateEoriNumber', () => {
  it('accepts valid EORI', () => {
    const result = validateEoriNumber('GB123456789012');
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid EORI', () => {
    const result = validateEoriNumber('GB12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('EORI must be GB followed by 12 digits');
  });

  it('allows empty when not required', () => {
    expect(validateEoriNumber('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    expect(validateEoriNumber('', true).isValid).toBe(false);
    expect(validateEoriNumber('', true).error).toBe('EORI number is required');
  });
});

describe('validateUtr', () => {
  it('accepts valid UTR', () => {
    const result = validateUtr('1234567890');
    expect(result.isValid).toBe(true);
  });

  it('normalises input with non-digit chars', () => {
    const result = validateUtr('12-34-567-890');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('1234567890');
  });

  it('rejects too short UTR', () => {
    const result = validateUtr('123456789');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('UTR must be exactly 10 digits');
  });

  it('allows empty when not required', () => {
    expect(validateUtr('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    expect(validateUtr('', true).error).toBe('UTR is required');
  });
});

describe('validateSortCode', () => {
  it('accepts valid sort code with dashes', () => {
    const result = validateSortCode('12-34-56');
    expect(result.isValid).toBe(true);
  });

  it('accepts and normalises raw digits', () => {
    const result = validateSortCode('123456');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('12-34-56');
  });

  it('rejects invalid sort code', () => {
    const result = validateSortCode('12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Sort code must be 6 digits (XX-XX-XX)');
  });

  it('allows empty when not required', () => {
    expect(validateSortCode('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    expect(validateSortCode('', true).error).toBe('Sort code is required');
  });
});

describe('validateAccountNumber', () => {
  it('accepts valid 8-digit account number', () => {
    const result = validateAccountNumber('12345678');
    expect(result.isValid).toBe(true);
  });

  it('normalises input with non-digit chars', () => {
    const result = validateAccountNumber('1234-5678');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('12345678');
  });

  it('rejects too short account number', () => {
    const result = validateAccountNumber('1234567');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Account number must be 8 digits');
  });

  it('allows empty when not required', () => {
    expect(validateAccountNumber('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    expect(validateAccountNumber('', true).error).toBe('Account number is required');
  });
});

describe('validateCompanyNumber', () => {
  it('accepts valid 8-digit company number', () => {
    const result = validateCompanyNumber('12345678');
    expect(result.isValid).toBe(true);
  });

  it('accepts Scottish company number', () => {
    const result = validateCompanyNumber('SC123456');
    expect(result.isValid).toBe(true);
  });

  it('normalises lowercase input', () => {
    const result = validateCompanyNumber('sc123456');
    expect(result.isValid).toBe(true);
    expect(result.normalizedValue).toBe('SC123456');
  });

  it('rejects invalid company number', () => {
    const result = validateCompanyNumber('1234');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Company number must be 8 characters');
  });

  it('allows empty when not required', () => {
    expect(validateCompanyNumber('').isValid).toBe(true);
  });

  it('rejects empty when required', () => {
    expect(validateCompanyNumber('', true).error).toBe('Company number is required');
  });
});

// ===== GENERIC VALIDATORS =====

describe('validateRequired', () => {
  it('passes for non-empty string', () => {
    const result = validateRequired('hello', 'Name');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fails for empty string', () => {
    const result = validateRequired('', 'Name');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name is required');
  });

  it('fails for whitespace-only string', () => {
    const result = validateRequired('   ', 'Name');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name is required');
  });
});

describe('validateMinLength', () => {
  it('passes when value meets minimum length', () => {
    const result = validateMinLength('hello', 3, 'Name');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fails when value is too short', () => {
    const result = validateMinLength('hi', 3, 'Name');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Name must be at least 3 characters');
  });

  it('passes for empty string (handled by required)', () => {
    const result = validateMinLength('', 3, 'Name');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('passes when value exactly meets minimum', () => {
    const result = validateMinLength('abc', 3, 'Name');
    expect(result.isValid).toBe(true);
  });
});

describe('validatePositiveNumber', () => {
  it('passes for positive number', () => {
    const result = validatePositiveNumber(5, 'Quantity');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('passes for decimal', () => {
    expect(validatePositiveNumber(0.01, 'Rate').isValid).toBe(true);
  });

  it('fails for zero', () => {
    const result = validatePositiveNumber(0, 'Quantity');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Quantity must be greater than 0');
  });

  it('fails for negative number', () => {
    expect(validatePositiveNumber(-1, 'Quantity').isValid).toBe(false);
  });

  it('fails for NaN', () => {
    expect(validatePositiveNumber(NaN, 'Quantity').isValid).toBe(false);
  });
});

describe('validateNonNegativeNumber', () => {
  it('passes for positive number', () => {
    expect(validateNonNegativeNumber(5, 'Discount').isValid).toBe(true);
  });

  it('passes for zero', () => {
    const result = validateNonNegativeNumber(0, 'Discount');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fails for negative number', () => {
    const result = validateNonNegativeNumber(-1, 'Discount');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Discount cannot be negative');
  });

  it('fails for NaN', () => {
    expect(validateNonNegativeNumber(NaN, 'Discount').isValid).toBe(false);
  });
});
