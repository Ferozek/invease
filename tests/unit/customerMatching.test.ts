import { describe, it, expect } from 'vitest';
import { findDuplicateCustomers } from '@/lib/customerMatching';

describe('findDuplicateCustomers', () => {
  it('detects Ltd vs Limited as same name', () => {
    const result = findDuplicateCustomers(['ABC Ltd', 'ABC Limited']);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe('Same name (different formatting)');
  });

  it('detects case-insensitive duplicates', () => {
    const result = findDuplicateCustomers(['John Smith Builders', 'john smith builders']);
    expect(result).toHaveLength(1);
  });

  it('detects & vs and after regex fix', () => {
    const result = findDuplicateCustomers(['Smith & Son', 'Smith and Son']);
    expect(result).toHaveLength(1);
  });

  it('detects substring containment', () => {
    const result = findDuplicateCustomers(['John Smith', 'John Smith Builders']);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe('Similar names');
  });

  it('does not match unrelated names', () => {
    const result = findDuplicateCustomers(['ABC Ltd', 'XYZ Ltd']);
    expect(result).toHaveLength(0);
  });

  it('ignores very short names for substring matching', () => {
    const result = findDuplicateCustomers(['ABC', 'ABCDEF']);
    expect(result).toHaveLength(0);
  });

  it('returns empty for single name', () => {
    expect(findDuplicateCustomers(['Only One'])).toEqual([]);
  });

  it('returns empty for empty input', () => {
    expect(findDuplicateCustomers([])).toEqual([]);
  });

  it('handles multiple duplicate pairs', () => {
    const result = findDuplicateCustomers([
      'ABC Ltd',
      'ABC Limited',
      'XYZ Plc',
      'XYZ PLC',
    ]);
    expect(result).toHaveLength(2);
  });
});
