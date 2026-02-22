import { describe, it, expect } from 'vitest';
import {
  generateInvoiceNumber,
  incrementNumber,
  validatePattern,
  previewPattern,
  extractSequence,
  DEFAULT_NUMBERING_CONFIG,
} from '@/lib/invoiceNumbering';
import type { NumberingConfig } from '@/lib/invoiceNumbering';

const testDate = new Date(2026, 1, 15); // Feb 15, 2026

describe('generateInvoiceNumber', () => {
  it('generates simple pattern', () => {
    const config: NumberingConfig = { ...DEFAULT_NUMBERING_CONFIG, currentNumber: 1 };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV-0001');
  });

  it('generates yearly pattern', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      pattern: 'INV-{YEAR}-{SEQ:3}',
      currentNumber: 42,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV-2026-042');
  });

  it('generates compact pattern with {YY} and {MONTH}', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      pattern: '{PREFIX}{YY}{MONTH}{SEQ:3}',
      currentNumber: 5,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV2602005');
  });

  it('generates with custom prefix', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      pattern: '{PREFIX}-{SEQ:4}',
      prefix: 'ACME',
      currentNumber: 1,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('ACME-0001');
  });

  it('handles {SEQ} without padding', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      pattern: 'INV-{SEQ}',
      currentNumber: 42,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV-42');
  });

  it('resets yearly when year changes', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      resetYearly: true,
      lastResetYear: 2025,
      currentNumber: 99,
      startNumber: 1,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV-0001');
  });

  it('does not reset when same year', () => {
    const config: NumberingConfig = {
      ...DEFAULT_NUMBERING_CONFIG,
      resetYearly: true,
      lastResetYear: 2026,
      currentNumber: 99,
    };
    expect(generateInvoiceNumber(config, testDate)).toBe('INV-0099');
  });
});

describe('incrementNumber', () => {
  it('increments current number by 1', () => {
    const config = { ...DEFAULT_NUMBERING_CONFIG, currentNumber: 5 };
    const result = incrementNumber(config);
    expect(result.currentNumber).toBe(6);
  });

  it('preserves other config values', () => {
    const config = { ...DEFAULT_NUMBERING_CONFIG, prefix: 'TEST', currentNumber: 5 };
    const result = incrementNumber(config);
    expect(result.prefix).toBe('TEST');
  });
});

describe('validatePattern', () => {
  it('accepts valid pattern with {SEQ}', () => {
    expect(validatePattern('INV-{SEQ}')).toEqual({ valid: true });
  });

  it('accepts pattern with {SEQ:4}', () => {
    expect(validatePattern('INV-{SEQ:4}')).toEqual({ valid: true });
  });

  it('accepts complex pattern', () => {
    expect(validatePattern('{PREFIX}/{YEAR}/{MONTH}/{SEQ:3}')).toEqual({ valid: true });
  });

  it('rejects empty pattern', () => {
    const result = validatePattern('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects pattern without {SEQ}', () => {
    const result = validatePattern('INV-{YEAR}');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('SEQ');
  });

  it('rejects pattern with invalid tokens', () => {
    const result = validatePattern('INV-{INVALID}-{SEQ}');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid');
  });
});

describe('previewPattern', () => {
  it('returns sequential preview numbers', () => {
    const previews = previewPattern('INV-{SEQ:4}', 'INV', 3);
    expect(previews).toEqual(['INV-0001', 'INV-0002', 'INV-0003']);
  });

  it('respects prefix', () => {
    const previews = previewPattern('{PREFIX}-{SEQ}', 'TEST', 2);
    expect(previews).toEqual(['TEST-1', 'TEST-2']);
  });
});

describe('extractSequence', () => {
  it('extracts number from simple pattern', () => {
    expect(extractSequence('INV-0042')).toBe(42);
  });

  it('extracts last number from complex pattern', () => {
    expect(extractSequence('INV-2026-003')).toBe(3);
  });

  it('returns null for no numbers', () => {
    expect(extractSequence('INVOICE')).toBeNull();
  });

  it('handles single digit', () => {
    expect(extractSequence('INV-5')).toBe(5);
  });
});
