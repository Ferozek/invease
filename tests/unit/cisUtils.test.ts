import { describe, it, expect } from 'vitest';
import { getCisDeductionRate, getCisStatusLabel } from '@/lib/cisUtils';

describe('getCisDeductionRate', () => {
  it('returns 0 for gross_payment', () => {
    expect(getCisDeductionRate('gross_payment')).toBe(0);
  });

  it('returns 0.20 for standard (verified)', () => {
    expect(getCisDeductionRate('standard')).toBe(0.20);
  });

  it('returns 0.30 for unverified', () => {
    expect(getCisDeductionRate('unverified')).toBe(0.30);
  });

  it('returns 0 for not_applicable', () => {
    expect(getCisDeductionRate('not_applicable')).toBe(0);
  });
});

describe('getCisStatusLabel', () => {
  it('returns label for gross_payment', () => {
    expect(getCisStatusLabel('gross_payment')).toBe('Gross Payment (0%)');
  });

  it('returns label for standard', () => {
    expect(getCisStatusLabel('standard')).toBe('Verified (20%)');
  });

  it('returns label for unverified', () => {
    expect(getCisStatusLabel('unverified')).toBe('Unverified (30%)');
  });

  it('returns empty string for not_applicable', () => {
    expect(getCisStatusLabel('not_applicable')).toBe('');
  });
});
