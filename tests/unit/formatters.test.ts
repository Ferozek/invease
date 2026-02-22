import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateLineNet,
  calculateLineDiscount,
  calculateLineGross,
  getVatPercent,
  formatDateUK,
  calculateDueDate,
  getPaymentTermsText,
  getVatRateDisplay,
  getVatRateLabel,
} from '@/lib/formatters';

describe('formatCurrency', () => {
  it('formats positive amounts as GBP', () => {
    expect(formatCurrency(100)).toBe('£100.00');
    expect(formatCurrency(1234.56)).toBe('£1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('£0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-£50.00');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('£1,000,000.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('£11.00');
    expect(formatCurrency(10.005)).toBe('£10.01');
  });
});

describe('calculateLineNet', () => {
  it('calculates basic qty × price', () => {
    expect(calculateLineNet(2, 500)).toBe(1000);
    expect(calculateLineNet(1, 100)).toBe(100);
  });

  it('returns 0 for zero quantity', () => {
    expect(calculateLineNet(0, 500)).toBe(0);
  });

  it('returns 0 for zero price', () => {
    expect(calculateLineNet(5, 0)).toBe(0);
  });

  it('ignores discount when type is undefined', () => {
    expect(calculateLineNet(2, 500, undefined, 10)).toBe(1000);
  });

  it('ignores discount when value is undefined', () => {
    expect(calculateLineNet(2, 500, 'percentage', undefined)).toBe(1000);
  });

  it('applies percentage discount', () => {
    expect(calculateLineNet(2, 500, 'percentage', 10)).toBe(900); // 1000 - 10%
  });

  it('applies fixed discount', () => {
    expect(calculateLineNet(2, 500, 'fixed', 200)).toBe(800); // 1000 - 200
  });

  it('clamps to zero (100% discount)', () => {
    expect(calculateLineNet(1, 100, 'percentage', 100)).toBe(0);
  });

  it('clamps to zero (fixed exceeds gross)', () => {
    expect(calculateLineNet(1, 100, 'fixed', 999)).toBe(0);
  });

  it('handles 50% discount', () => {
    expect(calculateLineNet(4, 25, 'percentage', 50)).toBe(50); // 100 - 50%
  });
});

describe('calculateLineDiscount', () => {
  it('returns 0 when no discount', () => {
    expect(calculateLineDiscount(2, 500)).toBe(0);
    expect(calculateLineDiscount(2, 500, undefined, undefined)).toBe(0);
  });

  it('calculates percentage discount amount', () => {
    expect(calculateLineDiscount(2, 500, 'percentage', 10)).toBe(100); // 10% of 1000
  });

  it('returns fixed discount amount', () => {
    expect(calculateLineDiscount(2, 500, 'fixed', 200)).toBe(200);
  });

  it('caps fixed discount at gross amount', () => {
    expect(calculateLineDiscount(1, 100, 'fixed', 999)).toBe(100); // capped at gross
  });

  it('handles 100% discount', () => {
    expect(calculateLineDiscount(1, 100, 'percentage', 100)).toBe(100);
  });

  it('handles 0% discount', () => {
    expect(calculateLineDiscount(1, 100, 'percentage', 0)).toBe(0);
  });
});

describe('calculateLineGross', () => {
  it('calculates gross with 20% VAT', () => {
    expect(calculateLineGross(1, 100, '20')).toBe(120);
  });

  it('calculates gross with 5% VAT', () => {
    expect(calculateLineGross(1, 100, '5')).toBe(105);
  });

  it('calculates gross with 0% VAT', () => {
    expect(calculateLineGross(1, 100, '0')).toBe(100);
  });

  it('calculates gross with reverse charge (0% VAT)', () => {
    expect(calculateLineGross(1, 100, 'reverse_charge')).toBe(100);
  });

  it('calculates gross with exempt (0% VAT)', () => {
    expect(calculateLineGross(1, 100, 'exempt')).toBe(100);
  });

  it('handles multiple quantity', () => {
    expect(calculateLineGross(3, 100, '20')).toBe(360); // 300 + 60
  });
});

describe('getVatPercent', () => {
  it('returns numeric percentage for standard rates', () => {
    expect(getVatPercent('0')).toBe(0);
    expect(getVatPercent('5')).toBe(5);
    expect(getVatPercent('20')).toBe(20);
  });

  it('returns 0 for reverse charge', () => {
    expect(getVatPercent('reverse_charge')).toBe(0);
  });

  it('returns 0 for exempt', () => {
    expect(getVatPercent('exempt')).toBe(0);
  });
});

describe('formatDateUK', () => {
  it('formats ISO date to DD/MM/YYYY', () => {
    const result = formatDateUK('2026-02-15');
    expect(result).toBe('15/02/2026');
  });
});

describe('calculateDueDate', () => {
  it('adds payment terms days to invoice date', () => {
    const result = calculateDueDate('2026-02-01', '30');
    expect(result.toISOString().startsWith('2026-03-03')).toBe(true);
  });

  it('handles 0 days (due on receipt)', () => {
    const result = calculateDueDate('2026-02-15', '0');
    expect(result.toISOString().startsWith('2026-02-15')).toBe(true);
  });
});

describe('getPaymentTermsText', () => {
  it('returns "Due on receipt" for 0 days', () => {
    expect(getPaymentTermsText('0')).toBe('Due on receipt');
  });

  it('returns "X days" for other values', () => {
    expect(getPaymentTermsText('30')).toBe('30 days');
    expect(getPaymentTermsText('60')).toBe('60 days');
  });
});

describe('getVatRateDisplay', () => {
  it('returns percentage for standard rates', () => {
    expect(getVatRateDisplay('0')).toBe('0%');
    expect(getVatRateDisplay('5')).toBe('5%');
    expect(getVatRateDisplay('20')).toBe('20%');
  });

  it('returns RC for reverse charge', () => {
    expect(getVatRateDisplay('reverse_charge')).toBe('RC');
  });

  it('returns Exempt for exempt rate', () => {
    expect(getVatRateDisplay('exempt')).toBe('Exempt');
  });
});

describe('getVatRateLabel', () => {
  it('returns descriptive label for standard rates', () => {
    expect(getVatRateLabel('20')).toBe('VAT (20%)');
    expect(getVatRateLabel('5')).toBe('VAT (5%)');
  });

  it('returns Reverse Charge label', () => {
    expect(getVatRateLabel('reverse_charge')).toBe('Reverse Charge (0%)');
  });

  it('returns VAT Exempt label', () => {
    expect(getVatRateLabel('exempt')).toBe('VAT Exempt');
  });
});
