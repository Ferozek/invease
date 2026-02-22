import { describe, it, expect } from 'vitest';
import { hasBankDetails, hasPartialBankDetails } from '@/lib/bankDetailsUtils';
import type { BankDetails } from '@/types/invoice';

const fullDetails: BankDetails = {
  accountNumber: '12345678',
  sortCode: '12-34-56',
  accountName: 'John Smith',
  bankName: 'Barclays',
  reference: 'INV-0001',
};

const emptyDetails: BankDetails = {
  accountNumber: '',
  sortCode: '',
  accountName: '',
  bankName: '',
  reference: '',
};

describe('hasBankDetails', () => {
  it('returns true when all fields are filled', () => {
    expect(hasBankDetails(fullDetails)).toBe(true);
  });

  it('returns false when all fields are empty', () => {
    expect(hasBankDetails(emptyDetails)).toBe(false);
  });

  it('returns false when any field is missing', () => {
    expect(hasBankDetails({ ...fullDetails, accountNumber: '' })).toBe(false);
    expect(hasBankDetails({ ...fullDetails, sortCode: '' })).toBe(false);
    expect(hasBankDetails({ ...fullDetails, accountName: '' })).toBe(false);
    expect(hasBankDetails({ ...fullDetails, bankName: '' })).toBe(false);
  });

  it('returns false for whitespace-only values', () => {
    expect(hasBankDetails({ ...fullDetails, bankName: '   ' })).toBe(false);
  });
});

describe('hasPartialBankDetails', () => {
  it('returns true when any single field is filled', () => {
    expect(hasPartialBankDetails({ ...emptyDetails, accountNumber: '12345678' })).toBe(true);
    expect(hasPartialBankDetails({ ...emptyDetails, sortCode: '12-34-56' })).toBe(true);
    expect(hasPartialBankDetails({ ...emptyDetails, accountName: 'John' })).toBe(true);
    expect(hasPartialBankDetails({ ...emptyDetails, bankName: 'Barclays' })).toBe(true);
  });

  it('returns false when all fields are empty', () => {
    expect(hasPartialBankDetails(emptyDetails)).toBe(false);
  });

  it('returns true when all fields are filled', () => {
    expect(hasPartialBankDetails(fullDetails)).toBe(true);
  });

  it('returns false for whitespace-only values', () => {
    expect(hasPartialBankDetails({ ...emptyDetails, bankName: '   ' })).toBe(false);
  });
});
