import { describe, it, expect, vi } from 'vitest';
import { getValidLineItems, hasValidLineItems, calculateNetTotal, copyLineItemsToStore } from '@/lib/invoiceUtils';
import type { LineItem } from '@/types/invoice';

const makeItem = (overrides: Partial<LineItem> = {}): LineItem => ({
  id: '1',
  description: 'Web Development',
  quantity: 2,
  netAmount: 500,
  vatRate: '20',
  cisCategory: 'not_applicable',
  ...overrides,
});

describe('getValidLineItems', () => {
  it('filters out items with empty description', () => {
    const items = [makeItem(), makeItem({ id: '2', description: '' })];
    expect(getValidLineItems(items)).toHaveLength(1);
  });

  it('filters out items with whitespace-only description', () => {
    const items = [makeItem({ description: '   ' })];
    expect(getValidLineItems(items)).toHaveLength(0);
  });

  it('filters out items with zero net amount', () => {
    const items = [makeItem({ netAmount: 0 })];
    expect(getValidLineItems(items)).toHaveLength(0);
  });

  it('filters out items with negative net amount', () => {
    const items = [makeItem({ netAmount: -10 })];
    expect(getValidLineItems(items)).toHaveLength(0);
  });

  it('keeps valid items', () => {
    const items = [makeItem(), makeItem({ id: '2', description: 'Design', netAmount: 100 })];
    expect(getValidLineItems(items)).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(getValidLineItems([])).toEqual([]);
  });
});

describe('hasValidLineItems', () => {
  it('returns true when valid items exist', () => {
    expect(hasValidLineItems([makeItem()])).toBe(true);
  });

  it('returns false when no valid items exist', () => {
    expect(hasValidLineItems([makeItem({ description: '' })])).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(hasValidLineItems([])).toBe(false);
  });
});

describe('calculateNetTotal', () => {
  it('calculates total as quantity * netAmount', () => {
    const items = [makeItem({ quantity: 2, netAmount: 500 })];
    expect(calculateNetTotal(items)).toBe(1000);
  });

  it('sums multiple items', () => {
    const items = [
      makeItem({ quantity: 2, netAmount: 500 }),
      makeItem({ id: '2', quantity: 1, netAmount: 200 }),
    ];
    expect(calculateNetTotal(items)).toBe(1200);
  });

  it('ignores invalid items in calculation', () => {
    const items = [
      makeItem({ quantity: 2, netAmount: 500 }),
      makeItem({ id: '2', description: '', netAmount: 999 }),
    ];
    expect(calculateNetTotal(items)).toBe(1000);
  });

  it('returns 0 for empty array', () => {
    expect(calculateNetTotal([])).toBe(0);
  });
});

describe('copyLineItemsToStore', () => {
  it('updates first item and adds subsequent items', () => {
    const existingItems: LineItem[] = [makeItem({ id: 'existing-1' })];
    const sourceItems = [
      makeItem({ description: 'Item A' }),
      makeItem({ id: '2', description: 'Item B' }),
    ];

    const getLineItems = vi.fn()
      .mockReturnValueOnce(existingItems) // first call: update existing
      .mockReturnValueOnce(existingItems) // second call: after addLineItem
      .mockReturnValueOnce([...existingItems, makeItem({ id: 'new-1' })]); // after add

    const updateLineItem = vi.fn();
    const addLineItem = vi.fn();

    copyLineItemsToStore(sourceItems, getLineItems, updateLineItem, addLineItem);

    // First item should update existing
    expect(updateLineItem).toHaveBeenCalledWith('existing-1', expect.objectContaining({
      description: 'Item A',
    }));

    // Second item should add then update
    expect(addLineItem).toHaveBeenCalledTimes(1);
  });

  it('handles empty source items', () => {
    const getLineItems = vi.fn();
    const updateLineItem = vi.fn();
    const addLineItem = vi.fn();

    copyLineItemsToStore([], getLineItems, updateLineItem, addLineItem);

    expect(updateLineItem).not.toHaveBeenCalled();
    expect(addLineItem).not.toHaveBeenCalled();
  });
});
