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
