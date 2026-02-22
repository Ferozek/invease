import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodayISO,
  formatDateUK,
  calculateDueDate,
  isOverdue,
  daysFromDue,
  isWithinPeriod,
} from '@/lib/dateUtils';

describe('getTodayISO', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns today\'s date', () => {
    const today = new Date();
    const expected = today.toISOString().split('T')[0];
    expect(getTodayISO()).toBe(expected);
  });
});

describe('formatDateUK', () => {
  it('formats ISO date to DD/MM/YYYY', () => {
    expect(formatDateUK('2026-01-15')).toBe('15/01/2026');
  });

  it('formats another date correctly', () => {
    expect(formatDateUK('2025-12-25')).toBe('25/12/2025');
  });

  it('returns empty string for empty input', () => {
    expect(formatDateUK('')).toBe('');
  });
});

describe('calculateDueDate', () => {
  it('adds 30 days to invoice date', () => {
    expect(calculateDueDate('2026-01-01', '30')).toBe('2026-01-31');
  });

  it('defaults to 30 days when payment terms is "0"', () => {
    // "0" is falsy after parseInt, so falls through to default 30
    expect(calculateDueDate('2026-02-15', '0')).toBe('2026-03-17');
  });

  it('crosses month boundary', () => {
    expect(calculateDueDate('2026-01-20', '30')).toBe('2026-02-19');
  });

  it('crosses year boundary', () => {
    expect(calculateDueDate('2025-12-15', '30')).toBe('2026-01-14');
  });

  it('defaults to 30 days for non-numeric input', () => {
    expect(calculateDueDate('2026-01-01', 'invalid')).toBe('2026-01-31');
  });

  it('adds 60 days', () => {
    expect(calculateDueDate('2026-01-01', '60')).toBe('2026-03-02');
  });
});

describe('isOverdue', () => {
  it('returns true for past date', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isOverdue('2099-12-31')).toBe(false);
  });
});

describe('daysFromDue', () => {
  it('returns positive for overdue invoices', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    const dueDate = yesterday.toISOString().split('T')[0];
    expect(daysFromDue(dueDate)).toBe(3);
  });

  it('returns 0 for due today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(daysFromDue(today)).toBe(0);
  });

  it('returns negative for future due dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const dueDate = future.toISOString().split('T')[0];
    expect(daysFromDue(dueDate)).toBe(-5);
  });
});

describe('isWithinPeriod', () => {
  // Mock dates to ensure deterministic tests
  const RealDate = global.Date;

  beforeEach(() => {
    // Fix "today" to 2026-02-22 for predictable tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-22T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('month', () => {
    it('returns true for date in current month', () => {
      expect(isWithinPeriod('2026-02-01', 'month')).toBe(true);
      expect(isWithinPeriod('2026-02-28', 'month')).toBe(true);
    });

    it('returns false for date in previous month', () => {
      expect(isWithinPeriod('2026-01-31', 'month')).toBe(false);
    });

    it('returns false for date in next month', () => {
      expect(isWithinPeriod('2026-03-01', 'month')).toBe(false);
    });
  });

  describe('quarter', () => {
    it('returns true for date in current quarter (Q1: Jan-Mar)', () => {
      expect(isWithinPeriod('2026-01-01', 'quarter')).toBe(true);
      expect(isWithinPeriod('2026-02-15', 'quarter')).toBe(true);
      expect(isWithinPeriod('2026-03-31', 'quarter')).toBe(true);
    });

    it('returns false for date in previous quarter (Q4 previous year)', () => {
      expect(isWithinPeriod('2025-12-31', 'quarter')).toBe(false);
    });

    it('returns false for date in next quarter (Q2)', () => {
      expect(isWithinPeriod('2026-04-01', 'quarter')).toBe(false);
    });
  });

  describe('year', () => {
    it('returns true for date in current year', () => {
      expect(isWithinPeriod('2026-01-01', 'year')).toBe(true);
      expect(isWithinPeriod('2026-12-31', 'year')).toBe(true);
    });

    it('returns false for date in previous year', () => {
      expect(isWithinPeriod('2025-12-31', 'year')).toBe(false);
    });

    it('returns false for date in next year', () => {
      expect(isWithinPeriod('2027-01-01', 'year')).toBe(false);
    });
  });
});
