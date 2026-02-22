import { describe, it, expect } from 'vitest';
import { toTitleCase, formatPostcode, formatOnBlurTitleCase, formatOnBlurPostcode } from '@/lib/textFormatters';

describe('toTitleCase', () => {
  it('capitalizes first letter of each word', () => {
    expect(toTitleCase('john smith builders')).toBe('John Smith Builders');
  });

  it('handles single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });

  it('lowercases all-caps input first', () => {
    expect(toTitleCase('JOHN SMITH')).toBe('John Smith');
  });

  it('handles hyphenated words', () => {
    expect(toTitleCase('smith-jones builders')).toBe('Smith-Jones Builders');
  });

  it('handles slash-separated words', () => {
    expect(toTitleCase('north/south builders')).toBe('North/South Builders');
  });

  it('returns empty string for empty input', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('handles null-ish input', () => {
    expect(toTitleCase(undefined as unknown as string)).toBeUndefined();
  });
});

describe('formatPostcode', () => {
  it('converts to uppercase', () => {
    expect(formatPostcode('sw1a 1aa')).toBe('SW1A 1AA');
  });

  it('trims whitespace', () => {
    expect(formatPostcode('  M1 1AA  ')).toBe('M1 1AA');
  });

  it('returns empty string for empty input', () => {
    expect(formatPostcode('')).toBe('');
  });
});

describe('formatOnBlurTitleCase', () => {
  it('trims and title cases', () => {
    expect(formatOnBlurTitleCase('  john smith  ')).toBe('John Smith');
  });
});

describe('formatOnBlurPostcode', () => {
  it('uppercases postcode', () => {
    expect(formatOnBlurPostcode('ec1a 1bb')).toBe('EC1A 1BB');
  });
});
