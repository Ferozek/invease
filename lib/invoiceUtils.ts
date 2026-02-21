/**
 * Invoice Utilities
 * Shared functions for invoice processing
 */

import type { LineItem } from '@/types/invoice';

/**
 * Filter line items to only include valid entries
 * A valid line item has a non-empty description and positive net amount
 */
export function getValidLineItems(items: LineItem[]): LineItem[] {
  return items.filter(
    (item) => item.description?.trim() && item.netAmount > 0
  );
}

/**
 * Check if an invoice has any valid line items
 */
export function hasValidLineItems(items: LineItem[]): boolean {
  return getValidLineItems(items).length > 0;
}

/**
 * Calculate the total net amount for all valid line items
 */
export function calculateNetTotal(items: LineItem[]): number {
  return getValidLineItems(items).reduce(
    (sum, item) => sum + item.netAmount * item.quantity,
    0
  );
}

/**
 * Copy line items from a source list into the invoice store.
 * Handles the first-item-update + subsequent-add pattern used when
 * duplicating invoices or creating credit notes from history.
 */
export function copyLineItemsToStore(
  sourceItems: LineItem[],
  getLineItems: () => LineItem[],
  updateLineItem: (id: string, updates: Partial<Omit<LineItem, 'id'>>) => void,
  addLineItem: (isCis?: boolean) => void,
  isCis: boolean = false,
): void {
  sourceItems.forEach((item, index) => {
    const currentItems = getLineItems();
    if (index === 0 && currentItems[0]) {
      updateLineItem(currentItems[0].id, {
        description: item.description,
        quantity: item.quantity,
        netAmount: item.netAmount,
        vatRate: item.vatRate,
        cisCategory: item.cisCategory,
      });
    } else {
      addLineItem(isCis);
      const items = getLineItems();
      const lastItem = items[items.length - 1];
      if (lastItem) {
        updateLineItem(lastItem.id, {
          description: item.description,
          quantity: item.quantity,
          netAmount: item.netAmount,
          vatRate: item.vatRate,
          cisCategory: item.cisCategory,
        });
      }
    }
  });
}
